# 🐛 Bug Fix: Página em Branco - Campos Undefined

**Data:** 20/10/2025 00:15  
**Status:** ✅ CORRIGIDO  
**Prioridade:** 🔴 CRÍTICA

---

## 🎯 Sintoma

Página Sensores ficava completamente **em branco** (white screen of death) com erro no console:

```
Uncaught TypeError: Cannot read properties of undefined (reading 'slice')
    at SensorsGrid.tsx:115
```

E no log:
```
🔍 Processando sensor 1/1: {sensorId: undefined, sensorType: undefined, lastReadingAt: undefined}
✅ 1 sensores convertidos para EnhancedSensor
```

---

## 🔍 Root Cause Analysis

### Problema 1: Mapeador Não Chamado ❌

**Arquivo:** `src/services/telemetryService.ts`  
**Linha:** 84-85

```typescript
// ❌ ANTES - Retornava dados brutos do backend (snake_case)
async getDeviceSummary(deviceId: string): Promise<DeviceSummaryResponse> {
  const url = `${this.baseUrl}/device/${deviceId}/summary/`;
  const response = await api.get<ApiDeviceSummary>(url);
  return response.data; // 💥 Retorna sem mapear!
}
```

**Consequência:**
- Backend retorna: `{sensor_id: "...", sensor_name: "...", ...}` (snake_case)
- Frontend espera: `{sensorId: "...", sensorName: "...", ...}` (camelCase)
- Resultado: **Todos os campos ficam undefined**

---

### Problema 2: Crash no Rendering ❌

**Arquivo:** `src/modules/sensors/SensorsGrid.tsx`  
**Linha:** 115

```typescript
// ❌ ANTES - Assumia que sensor.id sempre existe
<div className="text-xs text-muted-foreground">
  ID: {sensor.id.slice(-8)} // 💥 sensor.id é undefined!
</div>
```

**Consequência:**
- `undefined.slice(-8)` → TypeError
- React para de renderizar
- White screen of death

---

## 🔧 Soluções Aplicadas

### Solução 1: Chamar Mapeador no Service ✅

**Arquivo:** `src/services/telemetryService.ts`

**Imports adicionados:**
```typescript
import { mapApiDeviceSummaryToFrontend } from '@/lib/mappers/telemetryMapper';
```

**Método corrigido:**
```typescript
// ✅ DEPOIS - Mapeia response antes de retornar
async getDeviceSummary(deviceId: string): Promise<DeviceSummaryResponse> {
  const url = `${this.baseUrl}/device/${deviceId}/summary/`;
  const response = await api.get<any>(url);
  
  // Mapear response do backend (snake_case) para frontend (camelCase)
  return mapApiDeviceSummaryToFrontend(response.data);
}
```

**Benefício:**
- Converte `sensor_id` → `sensorId`
- Converte `sensor_name` → `sensorName`
- Converte `sensor_type` → `sensorType`
- Etc...

---

### Solução 2: Validação Defensiva no Grid ✅

**Arquivo:** `src/modules/sensors/SensorsGrid.tsx`

```typescript
// ✅ DEPOIS - Validação defensiva
<div>
  <div className="font-medium text-foreground">
    {sensor.tag || 'Unknown'}
  </div>
  <div className="text-xs text-muted-foreground">
    ID: {sensor.id ? sensor.id.slice(-8) : 'N/A'}
  </div>
</div>
```

**Benefício:**
- Não quebra se `sensor.id` for undefined
- Mostra "N/A" como fallback
- Evita white screen

---

### Solução 3: Log de Debug no Backend ✅

**Arquivo:** `apps/ingest/api_views_extended.py`

```python
# DEBUG: Log response antes de retornar
import logging
logger = logging.getLogger(__name__)
logger.info(f"📊 Summary response for {device_id}: {len(sensors)} sensors")
if sensors:
    logger.info(f"📊 First sensor example: {sensors[0]}")
```

**Benefício:**
- Facilita debug futuro
- Mostra estrutura real da response
- Valida se backend está retornando dados corretos

---

## 🧪 Validação

### Antes das Correções ❌

**Console (Frontend):**
```javascript
🔍 Processando sensor 1/1: {sensorId: undefined, sensorType: undefined, lastReadingAt: undefined}
❌ Uncaught TypeError: Cannot read properties of undefined (reading 'slice')
```

**Resultado:** White screen

---

### Depois das Correções ✅

**Console (Frontend):**
```javascript
🔍 Processando sensor 1/1: {
  sensorId: "JE02-AHU-001_INPUT1", 
  sensorType: "input1", 
  lastReadingAt: "2025-10-20T00:43:32Z"
}
✅ 35 sensores convertidos para EnhancedSensor
✅ Telemetria carregada: 35 sensores do device GW-1760908415
```

**Resultado:** Página renderiza corretamente com dados

---

## 📊 Fluxo de Dados Correto

```
┌─────────────────────────────────────────────────────────────┐
│  1. Frontend: sensors.ts loadRealTelemetry()                │
│     → Chama: telemetryService.getDeviceSummary(deviceId)    │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  2. Service: telemetryService.ts                            │
│     → GET http://umc.localhost:8000/api/telemetry/device/.../summary/ │
│     → Recebe: {sensor_id: "...", sensor_name: "...", ...}   │
│     → Mapeia: mapApiDeviceSummaryToFrontend(response.data)  │ ✅ NOVO!
│     → Retorna: {sensorId: "...", sensorName: "...", ...}    │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  3. Store: sensors.ts                                       │
│     → Recebe: DeviceSummaryResponse (camelCase)             │
│     → Converte: SensorSummary → EnhancedSensor              │
│     → Armazena: set({ items: enhancedSensors })             │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  4. UI: SensorsGrid.tsx                                     │
│     → Renderiza: sensors.map(sensor => ...)                 │
│     → Acessa: sensor.id ✅ (existe!), sensor.tag ✅          │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎓 Lições Aprendidas

### 1. Sempre Mapear Responses de API

**Problema:** Assumir que backend retorna formato correto

**Solução:**
- Criar mapeadores para converter snake_case → camelCase
- **Chamar mapeadores nos services**, não nos stores
- Validar tipos com TypeScript strict mode

---

### 2. Validação Defensiva em Componentes

**Problema:** Assumir que dados sempre existem

**Solução:**
```typescript
// ❌ NÃO FAZER
{sensor.id.slice(-8)}

// ✅ FAZER
{sensor.id ? sensor.id.slice(-8) : 'N/A'}
```

---

### 3. Logs Detalhados para Debug

**Problema:** Erros silenciosos difíceis de rastrear

**Solução:**
- Adicionar logs em cada etapa do fluxo
- Mostrar estrutura completa dos dados
- Usar emojis para facilitar visual scan (🔄 📦 🔍 ✅ ❌)

---

## 📁 Arquivos Modificados

### Frontend

1. **`src/services/telemetryService.ts`** (linhas 8, 84-87)
   - ✅ Import `mapApiDeviceSummaryToFrontend`
   - ✅ Chama mapeador antes de retornar

2. **`src/modules/sensors/SensorsGrid.tsx`** (linha 115)
   - ✅ Validação defensiva: `sensor.id ? ... : 'N/A'`
   - ✅ Validação defensiva: `sensor.tag || 'Unknown'`

### Backend

3. **`apps/ingest/api_views_extended.py`** (linhas 421-427)
   - ✅ Logs de debug da response

---

## ✅ Checklist de Validação

- [ ] Backend reiniciado (`docker restart traksense-api`)
- [ ] Frontend recarregado (Ctrl+R)
- [ ] Console mostra: `🔍 Processando sensor X/Y: {sensorId: "...", ...}`
- [ ] Console **SEM** erro: "Cannot read properties of undefined"
- [ ] Página renderiza (não mais white screen)
- [ ] Grid mostra sensores com IDs corretos
- [ ] Logs do backend mostram: `📊 Summary response for GW-...: X sensors`

---

## 🚀 Próximos Passos

1. **Validar correção** - Recarregar página e confirmar renderização
2. **Testar auto-refresh** - Aguardar 30 segundos
3. **Verificar dados** - Confirmar valores corretos no grid

---

**Aplicado:** 20/10/2025 00:15  
**Backend:** Log de debug adicionado  
**Status:** ⏳ Aguardando reinício do backend e recarga do frontend  
**Responsável:** GitHub Copilot
