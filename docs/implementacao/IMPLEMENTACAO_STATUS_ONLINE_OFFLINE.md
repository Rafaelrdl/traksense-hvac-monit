# 🔄 Sistema de Verificação Automática de Status Online/Offline

## 📋 Visão Geral

Sistema implementado para monitorar automaticamente o status de **Sensores** e **Devices** baseado na última comunicação MQTT recebida.

---

## ⚙️ Funcionamento

### 🎯 Regras de Negócio

#### **Sensores:**
- ✅ **ONLINE:** `last_reading_at` está dentro das **últimas 1 hora**
- ❌ **OFFLINE:** `last_reading_at` é **anterior a 1 hora** ou `NULL`

#### **Devices:**
- ✅ **ONLINE:** Possui **pelo menos 1 sensor online**
- ❌ **OFFLINE:** **Todos os sensores offline** ou **sem sensores**

---

## 🕐 Execução Automática

### Celery Beat Schedule

**Frequência:** A cada **1 hora** (3600 segundos)

**Tarefas programadas:**
1. `check_sensors_online_status` - Atualiza status dos sensores
2. `update_device_online_status` - Atualiza status dos devices

**Configuração:** `config/settings/base.py`

```python
CELERY_BEAT_SCHEDULE = {
    'check-sensors-online-status': {
        'task': 'assets.check_sensors_online_status',
        'schedule': 3600.0,  # 1 hora
    },
    'update-device-online-status': {
        'task': 'assets.update_device_online_status',
        'schedule': 3600.0,  # 1 hora
    },
}
```

---

## 📁 Arquivos Criados/Modificados

### 1. `apps/assets/tasks.py` (NOVO)

**Tarefas Celery:**

#### `check_sensors_online_status()`
```python
@shared_task(name='assets.check_sensors_online_status')
def check_sensors_online_status():
    """
    Verifica status de todos os sensores em todos os tenants.
    
    - Marca como OFFLINE se last_reading_at < 1 hora atrás
    - Marca como ONLINE se last_reading_at >= 1 hora atrás
    """
```

**Lógica:**
```python
threshold = timezone.now() - timedelta(hours=1)

# Atualizar para OFFLINE
sensors.filter(
    last_reading_at__lt=threshold,
    is_online=True
).update(is_online=False)

# Atualizar para ONLINE
sensors.filter(
    last_reading_at__gte=threshold,
    is_online=False
).update(is_online=True)
```

#### `update_device_online_status()`
```python
@shared_task(name='assets.update_device_online_status')
def update_device_online_status():
    """
    Atualiza status de devices baseado nos sensores.
    
    - ONLINE se tem pelo menos 1 sensor online
    - OFFLINE se todos sensores offline ou sem sensores
    """
```

**Lógica:**
```python
# Subquery: devices com pelo menos 1 sensor online
online_sensors_exist = Sensor.objects.filter(
    device=OuterRef('pk'),
    is_online=True,
    is_active=True
)

# Devices para ONLINE
devices.filter(status='OFFLINE').annotate(
    has_online_sensors=Exists(online_sensors_exist)
).filter(has_online_sensors=True).update(
    status='ONLINE',
    last_seen=timezone.now()
)

# Devices para OFFLINE
devices.filter(status='ONLINE').annotate(
    has_online_sensors=Exists(online_sensors_exist)
).filter(has_online_sensors=False).update(
    status='OFFLINE'
)
```

---

### 2. `apps/assets/management/commands/check_online_status.py` (NOVO)

**Comando Django para testes manuais:**

```bash
docker exec traksense-api python manage.py check_online_status
```

**Output:**
```
🔍 Executando: check_sensors_online_status
  ✅ umc: 4 sensores | Online: 4 (+0) | Offline: 0 (+0)
  
🔍 Executando: update_device_online_status
  ✅ umc: 1 devices | Online: 1 (+1) | Offline: 0 (+0)
```

---

### 3. `config/settings/base.py` (MODIFICADO)

**Adicionado:**
```python
CELERY_BEAT_SCHEDULE = {
    'check-sensors-online-status': {
        'task': 'assets.check_sensors_online_status',
        'schedule': 3600.0,
    },
    'update-device-online-status': {
        'task': 'assets.update_device_online_status',
        'schedule': 3600.0,
    },
}
```

---

## 🧪 Teste e Validação

### ✅ Teste Realizado

```bash
docker exec traksense-api python manage.py check_online_status
```

**Resultado:**
- ✅ 4 sensores verificados (todos ONLINE)
- ✅ 1 device atualizado de OFFLINE → ONLINE
- ✅ Multi-tenant funcionando (tenant: umc)
- ✅ Sem erros

---

## 🔄 Fluxo Completo

### Recebimento de Dados MQTT

1. **MQTT Message** → EMQX Webhook → `/api/ingest/emqx/`
2. **KhompSenMLParser** processa payload
3. **Auto-vinculação** cria/atualiza:
   - Site
   - Asset
   - Device
   - Sensors
4. **Sensors.update_last_reading()** é chamado:
   ```python
   sensor.last_value = value
   sensor.last_reading_at = timezone.now()
   sensor.is_online = True  # ✅ Marcado como ONLINE
   sensor.save()
   ```

### Verificação Periódica (A cada 1 hora)

5. **Celery Beat** dispara tarefas:
   - `check_sensors_online_status()` → Verifica threshold de 1 hora
   - `update_device_online_status()` → Atualiza devices baseado nos sensores

6. **Sensors sem dados recentes:**
   ```python
   # Se last_reading_at < 1 hora atrás
   sensor.is_online = False  # ❌ Marcado como OFFLINE
   ```

7. **Device atualizado:**
   ```python
   # Se todos sensores OFFLINE
   device.status = 'OFFLINE'
   
   # Se pelo menos 1 sensor ONLINE
   device.status = 'ONLINE'
   device.last_seen = timezone.now()
   ```

---

## 📊 Exemplo Prático

### Cenário 1: Sensor publicando regularmente
```
10:00 - Sensor publica temperatura → is_online=True
11:00 - Celery verifica → is_online=True (dentro de 1h)
12:00 - Celery verifica → is_online=True (ainda dentro de 1h)
```

### Cenário 2: Sensor parou de publicar
```
10:00 - Sensor publica temperatura → is_online=True
11:00 - Celery verifica → is_online=True
12:00 - Celery verifica → is_online=False ❌ (>1h sem dados)
```

### Cenário 3: Device com múltiplos sensores
```
Device: CHILLER-001
├─ Sensor 1 (temp): last_reading_at = 10:00 → OFFLINE
├─ Sensor 2 (humid): last_reading_at = 11:50 → ONLINE ✅
├─ Sensor 3 (pressure): last_reading_at = 09:00 → OFFLINE
└─ Device Status: ONLINE (pelo menos 1 sensor online)
```

---

## 🚀 Monitoramento

### Verificar Logs do Celery Beat

```bash
# Logs do scheduler
docker logs traksense-scheduler -f

# Logs do worker
docker logs traksense-worker -f
```

**Saída esperada a cada 1 hora:**
```
[2025-10-22 20:05:33] Task assets.check_sensors_online_status succeeded
[2025-10-22 20:05:33] Task assets.update_device_online_status succeeded
```

### Verificar Tarefas Registradas

```bash
docker exec traksense-scheduler celery -A config inspect registered
```

**Deve listar:**
- `assets.check_sensors_online_status`
- `assets.update_device_online_status`

### Verificar Schedule

```bash
docker exec traksense-scheduler celery -A config inspect scheduled
```

---

## ⚡ Performance

### Otimizações Implementadas

1. **Bulk Updates:** Usa `.update()` ao invés de loops
2. **Indexes:** Campos `is_online` e `last_reading_at` indexados
3. **Subqueries:** Usa `Exists()` para verificar sensores online
4. **Schema Context:** Processa cada tenant isoladamente
5. **Soft Time Limit:** 300s para evitar travamentos

### Escalabilidade

- ✅ **Multi-tenant:** Processa todos os tenants automaticamente
- ✅ **Tolerante a falhas:** Max 3 retries por tarefa
- ✅ **Non-blocking:** Executa em background (Celery)
- ✅ **Stateless:** Não mantém estado entre execuções

---

## 🛠️ Troubleshooting

### Tarefa não está executando

1. **Verificar containers:**
   ```bash
   docker ps | grep traksense
   ```
   Deve mostrar: `traksense-scheduler` e `traksense-worker`

2. **Verificar logs do scheduler:**
   ```bash
   docker logs traksense-scheduler --tail 50
   ```

3. **Testar manualmente:**
   ```bash
   docker exec traksense-api python manage.py check_online_status
   ```

### Sensores não estão sendo marcados como OFFLINE

1. **Verificar threshold:**
   ```python
   # Em tasks.py
   threshold = timezone.now() - timedelta(hours=1)
   ```

2. **Verificar timezone:**
   ```bash
   docker exec traksense-api python -c "from django.utils import timezone; print(timezone.now())"
   ```

3. **Verificar last_reading_at:**
   ```bash
   docker exec traksense-api python manage.py shell
   >>> from django_tenants.utils import schema_context
   >>> from apps.assets.models import Sensor
   >>> with schema_context('umc'):
   ...     for s in Sensor.objects.all():
   ...         print(f"{s.tag}: {s.last_reading_at} | Online: {s.is_online}")
   ```

---

## 📅 Próximas Melhorias (Opcionais)

### 1. Threshold Configurável
Permitir configurar o tempo de timeout por tipo de sensor:
```python
# models.py
class Sensor:
    online_threshold_minutes = models.IntegerField(default=60)
```

### 2. Notificações
Enviar alerta quando sensor ficar offline:
```python
if sensor.is_online and should_be_offline:
    send_notification(f"Sensor {sensor.tag} offline")
```

### 3. Métricas de Disponibilidade
Calcular uptime percentual:
```python
sensor.availability = (online_time / total_time) * 100
```

### 4. Dashboard de Status
Adicionar view para mostrar sensores offline em tempo real.

---

## ✅ Resumo

### O que foi implementado:
1. ✅ Task Celery para verificar sensores (a cada 1h)
2. ✅ Task Celery para atualizar devices (a cada 1h)
3. ✅ Comando Django para testes manuais
4. ✅ Configuração Celery Beat Schedule
5. ✅ Multi-tenant support
6. ✅ Logs detalhados
7. ✅ Tolerância a falhas

### Como funciona:
- 🕐 **Automático:** Roda a cada 1 hora
- 📊 **Multi-tenant:** Processa todos os tenants
- ⚡ **Performático:** Bulk updates
- 🔍 **Observável:** Logs detalhados
- 🛡️ **Robusto:** Max 3 retries

### Status:
- ✅ **Testado e funcionando**
- ✅ **Containers reiniciados**
- ✅ **Próxima execução:** Em 1 hora
