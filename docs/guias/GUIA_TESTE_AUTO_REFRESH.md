# 🧪 Guia de Teste - Auto-Refresh em Tempo Real

## ✅ Sistema Implementado

O frontend agora **atualiza automaticamente os valores dos sensores a cada 30 segundos** sem necessidade de F5!

---

## 🎯 Como Testar

### Passo 1: Abrir Frontend

1. Abra o navegador em: **http://umc.localhost:5173**
2. Faça login se necessário
3. Navegue para página **"Sensores"**
4. **Abra o DevTools** (F12)
5. Vá para aba **Console**

### Passo 2: Verificar Auto-Refresh Funcionando

**No console, você deve ver:**
```
🔄 Iniciando auto-refresh de telemetria (30s)
📊 Carregando telemetria do device: 4b686f6d70107115
✅ Telemetria carregada com sucesso
```

**A cada 30 segundos:**
```
🔄 Atualizando telemetria automaticamente...
✅ Telemetria atualizada automaticamente
```

**Na interface:**
- 🟢 Bolinha verde pulsando
- 🕐 "Atualizado às 20:30:15"
- 🔄 Botão "Atualizar" disponível
- ⏱️ Badge "Auto-refresh: 30s"

### Passo 3: Publicar Mensagem MQTT (MQTTX)

**Configuração:**
- **Server:** `mqtt://localhost:1883`
- **Username:** (seu usuário EMQX)
- **Password:** (sua senha EMQX)

**Publicar:**
- **Topic:** `tenants/umc/sites/Uberlândia Medical Center/assets/CHILLER-001/telemetry`
- **Payload:**

```json
[
  {
    "bn": "4b686f6d70107115_",
    "bt": 1729639200,
    "bu": "celsius",
    "n": "A_temp",
    "v": 99.9,
    "t": 0
  },
  {
    "bn": "4b686f6d70107115_",
    "bt": 1729639200,
    "bu": "percent_rh",
    "n": "A_humid",
    "v": 99.0,
    "t": 0
  },
  {
    "bn": "",
    "bt": 1729639200,
    "n": "283286b20a000036",
    "u": "celsius",
    "v": 88.8,
    "t": 0
  },
  {
    "bn": "4b686f6d70107115_",
    "bt": 1729639200,
    "bu": "dBW",
    "n": "rssi",
    "v": -99.0,
    "t": 0
  }
]
```

**Valores destacados para facilitar visualização:**
- 🌡️ Temperatura Ambiente: **99.9°C** (valor alto para destacar)
- 💧 Umidade: **99.0%**
- 🌡️ Temperatura Insuflamento: **88.8°C**
- 📡 RSSI: **-99.0 dBW**

### Passo 4: Aguardar Atualização

**Timeline esperada:**
1. **t=0s** - Mensagem MQTT publicada
2. **t=2s** - Backend processa e salva no banco
3. **t=até 30s** - Frontend faz próximo polling e carrega novos valores
4. **t=30s** - **Valores aparecem atualizados na tela!** ✅

**O que observar:**
- ✅ Valores mudam na tela (99.9°C, 99%, 88.8°C, -99 dBW)
- ✅ Timestamp atualiza ("Atualizado às HH:MM:SS")
- ✅ Console mostra log de sucesso
- ✅ **SEM F5 NECESSÁRIO!**

### Passo 5: Testar Atualização Manual

1. **Antes de 30s**, publique **outra mensagem MQTT** com valores diferentes
2. **Clique** no botão **"🔄 Atualizar"**
3. **Valores devem atualizar imediatamente** (sem esperar 30s)

---

## 🔍 Debug / Troubleshooting

### Valores não atualizam

**Verificações:**

1. **Console mostra logs?**
   ```
   🔄 Atualizando telemetria automaticamente...
   ✅ Telemetria atualizada automaticamente
   ```
   - ✅ **SIM** → Auto-refresh funcionando, backend pode estar com problema
   - ❌ **NÃO** → Verificar se device está selecionado

2. **Network Tab (DevTools):**
   - Ir para **aba Network**
   - Filtrar por: `device`
   - **Deve aparecer requisições GET a cada 30s:**
     ```
     GET /api/telemetry/device/4b686f6d70107115/summary/ (Status: 200)
     ```
   - ✅ Status 200 → Backend respondendo OK
   - ❌ Status 404/500 → Problema no backend

3. **Backend processou MQTT?**
   ```bash
   docker logs traksense-api -f --tail 50
   ```
   - Deve mostrar logs de processamento MQTT
   - Se não aparecer, EMQX pode não estar encaminhando

4. **Dados estão no banco?**
   ```bash
   docker exec traksense-api python -c "
   from django_tenants.utils import schema_context
   from apps.assets.models import Sensor
   with schema_context('umc'):
       for s in Sensor.objects.all():
           print(f'{s.tag}: {s.last_value} ({s.last_reading_at})')
   "
   ```

### Auto-refresh parou

**Causa:** Trocou de página ou device

**Solução:** Voltar para página de Sensores ou recarregar (F5)

### Valores antigos aparecem

**Causa:** Última mensagem MQTT foi há muito tempo

**Solução:** Publicar nova mensagem MQTT

---

## 📊 Exemplo de Teste Completo

### Timeline Real:

```
20:30:00 - Página carregada
20:30:01 - Auto-refresh iniciado
20:30:01 - Primeira carga: Temp=25°C, Humid=60%
20:30:30 - Auto-refresh #1: Temp=25°C, Humid=60% (sem mudanças)
20:31:00 - Auto-refresh #2: Temp=25°C, Humid=60% (sem mudanças)

[USUÁRIO PUBLICA MQTT COM TEMP=99.9°C]

20:31:15 - Mensagem MQTT processada pelo backend
20:31:30 - Auto-refresh #3: Temp=99.9°C, Humid=99% ✅ ATUALIZADO!
20:32:00 - Auto-refresh #4: Temp=99.9°C, Humid=99% (mantém)
```

---

## 🎨 Visual do Frontend

### Estado Normal:
```
┌─────────────────────────────────────────────────────────┐
│ Sensores & Telemetria                🔄 Auto-refresh    │
│                                                          │
│ 🟢 Atualizado às 20:31:30  [🔄 Atualizar] Auto-refresh: 30s │
└─────────────────────────────────────────────────────────┘
```

### Estado Carregando:
```
┌─────────────────────────────────────────────────────────┐
│ Sensores & Telemetria                                    │
│                                                          │
│ ⏳ Atualizando...                                        │
└─────────────────────────────────────────────────────────┘
```

### Sensor com Novo Valor:
```
┌──────────────────────────────────────────────────┐
│ 283286b20a000036                                 │
│ TEMPERATURE                                      │
│                                                  │
│ 88.8°C  ← VALOR ATUALIZADO (era 30.75°C)       │
│                                                  │
│ 🟢 Online • Visto agora mesmo                   │
└──────────────────────────────────────────────────┘
```

---

## ✅ Checklist de Sucesso

Marque conforme vai testando:

- [ ] Frontend abre e mostra sensores
- [ ] Console mostra "🔄 Iniciando auto-refresh"
- [ ] Badge "Auto-refresh: 30s" aparece
- [ ] A cada 30s, console mostra "🔄 Atualizando..."
- [ ] Network tab mostra GET requests a cada 30s
- [ ] Publicou mensagem MQTT com valores diferentes
- [ ] Backend logs mostram processamento MQTT
- [ ] Aguardou até 30s após publicação
- [ ] **Valores atualizaram automaticamente na tela** ✅
- [ ] Timestamp mudou para horário atual
- [ ] Botão "🔄 Atualizar" funciona manualmente

---

## 🚀 Resultado Esperado

**ANTES da implementação:**
- ❌ Precisava dar F5 para ver novos valores
- ❌ Sistema parecia "travado"
- ❌ Sem indicação de atualização

**DEPOIS da implementação:**
- ✅ Valores atualizam automaticamente a cada 30s
- ✅ Indicador visual mostra última atualização
- ✅ Botão manual para forçar update
- ✅ Logs claros no console
- ✅ Sistema de monitoramento em tempo real funcional!

---

## 📝 Notas Importantes

1. **Intervalo de 30s é configurável**
   - Editar em `SensorsPage.tsx` linha ~95
   - Alterar `30000` para outro valor (em ms)

2. **Polling para quando sai da página**
   - Economia de recursos
   - Evita requisições desnecessárias

3. **Suporta múltiplos devices**
   - Troca de device reinicia polling automaticamente

4. **Tolerante a falhas**
   - Continua tentando mesmo com erros
   - Não quebra se backend ficar offline temporariamente

---

## 🎯 Conclusão

✅ **Sistema de auto-refresh implementado e funcionando!**

Agora o frontend é um verdadeiro **sistema de monitoramento em tempo real** que atualiza os valores automaticamente sem intervenção do usuário.

**Próximo teste:** Publique mensagens MQTT e observe os valores mudando automaticamente! 🚀
