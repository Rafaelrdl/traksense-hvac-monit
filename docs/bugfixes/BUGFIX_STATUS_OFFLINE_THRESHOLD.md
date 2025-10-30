# 🐛 BUGFIX - Status Offline Incorreto (Frontend)

## ❌ Problema Identificado

**Sintoma:**
- Sensores apareciam como **OFFLINE** após apenas **12 minutos** sem dados
- Deveria ser **OFFLINE** apenas após **1 hora** (60 minutos) sem dados

**Exemplo:**
```
Última leitura: 22/10, 20:42
Hora atual: 20:55 (13 minutos depois)
Status mostrado: OFFLINE ❌
Status esperado: ONLINE ✅
```

---

## 🔍 Causa Raiz

### Inconsistência Frontend vs Backend

**Backend (CORRETO):**
```python
# apps/assets/tasks.py
threshold = timezone.now() - timedelta(hours=1)  # 1 HORA

sensors.filter(
    last_reading_at__lt=threshold,  # < 1 hora
    is_online=True
).update(is_online=False)
```

**Frontend (INCORRETO):**
```typescript
// types/telemetry.ts
export function isSensorOnline(lastReadingAt: string | null | undefined): boolean {
  const diffMinutes = (now.getTime() - lastReading.getTime()) / (1000 * 60);
  return diffMinutes < 5; // ❌ 5 MINUTOS (ERRADO!)
}
```

**Resultado:** Frontend usava threshold de **5 minutos**, criando inconsistência com backend (1 hora).

---

## ✅ Correção Aplicada

### Arquivo: `src/types/telemetry.ts`

**ANTES:**
```typescript
/**
 * Helper para determinar se um sensor está online.
 * Considera online se última leitura < 5 minutos.
 */
export function isSensorOnline(lastReadingAt: string | null | undefined): boolean {
  // ...
  return diffMinutes < 5; // ❌ 5 minutos
}
```

**DEPOIS:**
```typescript
/**
 * Helper para determinar se um sensor está online.
 * Considera online se última leitura < 60 minutos (1 hora).
 * 
 * IMPORTANTE: Deve estar alinhado com a regra do backend (1 hora).
 */
export function isSensorOnline(lastReadingAt: string | null | undefined): boolean {
  // ...
  return diffMinutes < 60; // ✅ 60 minutos (1 hora)
}
```

---

## 📊 Comportamento Corrigido

### Antes da Correção:
```
00:00 - Sensor publica dados
00:01 - Status: ONLINE ✅
00:04 - Status: ONLINE ✅
00:05 - Status: ONLINE ✅
00:06 - Status: OFFLINE ❌ (ERRADO! Apenas 6 min)
```

### Depois da Correção:
```
00:00 - Sensor publica dados
00:01 - Status: ONLINE ✅
00:30 - Status: ONLINE ✅
00:59 - Status: ONLINE ✅
01:00 - Status: ONLINE ✅ (exatamente 1h)
01:01 - Status: OFFLINE ❌ (CORRETO! Mais de 1h)
```

---

## 🎯 Validação

### Cenário de Teste:

1. **Publicar MQTT** às 20:42
2. **Verificar às 20:55** (13 minutos depois)
3. **Status esperado:** ONLINE ✅
4. **Status anterior:** OFFLINE ❌
5. **Status agora:** ONLINE ✅ (CORRIGIDO!)

### Comando de Teste:

```bash
# Verificar status no backend
cd "c:\Users\Rafael Ribeiro\TrakSense\traksense-backend"
docker exec traksense-api python check_sensor_status.py
```

**Resultado esperado:**
```
🟢 283286b20a000036
   Last Reading: 2025-10-22 23:42:00
   Há 13.0 minutos (0.22 horas)
   is_online: True ✅
   Deveria ser ONLINE? True ✅
   Status correto? True ✅
```

---

## 🔄 Onde a Função é Usada

### 1. `store/sensors.ts`
```typescript
// Conversão de SensorSummary para EnhancedSensor
const isOnline = isSensorOnline(sensor.lastReadingAt);

return {
  status: isOnline ? 'online' : 'offline', // ✅ Agora correto
  // ...
};
```

### 2. Qualquer componente que importa
```typescript
import { isSensorOnline } from '@/types/telemetry';

const status = isSensorOnline(lastReadingAt); // ✅ Agora usa 1h
```

---

## ⚙️ Regra Unificada (Backend + Frontend)

### Threshold: **1 hora (60 minutos)**

**Backend (Python):**
```python
threshold = timezone.now() - timedelta(hours=1)
is_online = last_reading_at >= threshold
```

**Frontend (TypeScript):**
```typescript
const diffMinutes = (now - lastReading) / (1000 * 60);
const isOnline = diffMinutes < 60; // 1 hora
```

**Resultado:** ✅ **Consistência total entre backend e frontend**

---

## 📝 Documentação Atualizada

### `STATUS_ONLINE_OFFLINE_EXPLICACAO.md`

Atualizado para refletir que:
- ✅ Backend usa **1 hora**
- ✅ Frontend usa **1 hora** (corrigido)
- ✅ Ambos estão **alinhados**

---

## 🧪 Como Testar Agora

### Passo 1: Recarregar Frontend
```
http://umc.localhost:5173
```
- Pressione **Ctrl + Shift + R** para limpar cache

### Passo 2: Verificar Sensores
Na página de Sensores:
- **Última leitura:** 22/10, 20:42
- **Hora atual:** 20:55
- **Diferença:** 13 minutos
- **Status esperado:** 🟢 **ONLINE** ✅

### Passo 3: Aguardar 1 Hora
Depois de **1 hora sem dados**:
- **Última leitura:** 22/10, 20:42
- **Hora atual:** 21:43+
- **Diferença:** > 60 minutos
- **Status esperado:** 🔴 **OFFLINE** ✅

---

## ✅ Checklist de Validação

- [x] Função `isSensorOnline()` atualizada de 5min → 60min
- [x] Comentário atualizado com explicação
- [x] Nota de alinhamento com backend adicionada
- [ ] Frontend recarregado (aguardando usuário)
- [ ] Sensores verificados (aguardando usuário)
- [ ] Status ONLINE confirmado para dados < 1h
- [ ] Status OFFLINE confirmado para dados > 1h

---

## 🎯 Resultado Final

**ANTES:**
- ❌ Frontend: 5 minutos
- ✅ Backend: 60 minutos
- ❌ **INCONSISTENTE**

**DEPOIS:**
- ✅ Frontend: 60 minutos
- ✅ Backend: 60 minutos
- ✅ **CONSISTENTE E CORRETO**

---

## 💡 Lições Aprendidas

1. **Sempre alinhar thresholds** entre frontend e backend
2. **Documentar constantes** importantes
3. **Usar variáveis configuráveis** ao invés de magic numbers
4. **Testes end-to-end** para validar comportamento completo

---

## 🚀 Próximos Passos (Melhorias Futuras)

### 1. Configuração Centralizada
```typescript
// config/constants.ts
export const SENSOR_ONLINE_THRESHOLD_MINUTES = 60; // 1 hora

// types/telemetry.ts
import { SENSOR_ONLINE_THRESHOLD_MINUTES } from '@/config/constants';

return diffMinutes < SENSOR_ONLINE_THRESHOLD_MINUTES;
```

### 2. Sincronizar com Backend via API
```typescript
// Buscar threshold do backend
const config = await api.get('/api/config/sensor-threshold');
const threshold = config.data.threshold_minutes;
```

### 3. Threshold Configurável por Tipo de Sensor
```typescript
interface SensorConfig {
  type: string;
  thresholdMinutes: number;
}

const configs = {
  TEMPERATURE: 60,
  HUMIDITY: 60,
  SIGNAL_STRENGTH: 120, // 2 horas
};
```

---

## ✅ Status

**BUG CORRIGIDO!** ✅

- ✅ Função `isSensorOnline()` atualizada
- ✅ Threshold agora é **60 minutos** (1 hora)
- ✅ Alinhado com backend
- ✅ Comentários atualizados
- ✅ Pronto para uso

**Aguardando:** Reload do frontend pelo usuário para aplicar mudanças.
