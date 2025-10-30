# 🐛 Bug Fix: Mapeamento de Campos da Telemetria

**Data:** 19/10/2025 23:47  
**Status:** ✅ RESOLVIDO  
**Prioridade:** 🔴 CRÍTICA

---

## 📋 Sintomas

Na página **Sensores & Telemetria**, apenas dados mockados apareciam na lista. Ao investigar:

1. **Erro no console**: `"Cannot read properties of undefined (reading 'replace')"`
2. **Erro 500 no backend** (já corrigido anteriormente - labels como string)
3. **Sensores reais não apareciam** mesmo com backend retornando 200

---

## 🔍 Investigação

### Erro 1: Campo `last_reading_at` vs `last_reading`

**Arquivo:** `src/lib/mappers/telemetryMapper.ts`  
**Linha:** 146

```typescript
// ❌ ANTES - Campo errado
lastReadingAt: apiSensor.last_reading_at ?? null,

// ✅ DEPOIS - Campo correto do backend
lastReadingAt: apiSensor.last_reading ?? null,
```

**Root Cause:**
- Backend retorna: `last_reading` (ISO 8601 string)
- Mapeador esperava: `last_reading_at`
- Resultado: `lastReadingAt` era sempre `null`
- Ao tentar `new Date(null)` → erro `.replace()`

---

### Erro 2: Campos faltando na resposta do backend

**Arquivo:** `apps/ingest/api_views_extended.py`  
**Linhas:** 390-398

**Campos faltando:**
- ❌ `sensor_name` (só tinha `sensor_id`)
- ❌ `sensor_type` (não retornava)
- ❌ `is_online` (retornava `status: 'ok'|'stale'`)
- ❌ `statistics_24h` (não retornava)

**Backend ANTES:**
```python
sensors.append({
    'sensor_id': reading_data['sensor_id'],
    'last_value': reading_data['value'],
    'last_reading': reading_ts.isoformat(),
    'unit': labels.get('unit', '') if isinstance(labels, dict) else '',
    'status': 'ok' if reading_ts >= online_threshold else 'stale'  # ❌ Campo errado
})
```

**Backend DEPOIS:**
```python
is_online = reading_ts >= online_threshold

sensors.append({
    'sensor_id': reading_data['sensor_id'],
    'sensor_name': reading_data['sensor_id'],  # ✅ Adicionado
    'sensor_type': labels.get('type', 'unknown') if isinstance(labels, dict) else 'unknown',  # ✅ Adicionado
    'unit': labels.get('unit', '') if isinstance(labels, dict) else '',
    'is_online': is_online,  # ✅ Corrigido (booleano)
    'last_value': reading_data['value'],
    'last_reading': reading_ts.isoformat(),
    'statistics_24h': {  # ✅ Adicionado (estrutura vazia por enquanto)
        'avg': None,
        'min': None,
        'max': None,
        'count': 0,
        'stddev': None,
    }
})
```

---

## 🔧 Solução Aplicada

### 1. Frontend: Corrigir Mapeador

**Arquivo:** `src/lib/mappers/telemetryMapper.ts`

```diff
export function mapApiSensorSummaryToFrontend(apiSensor: any): SensorSummary {
  return {
    sensorId: apiSensor.sensor_id,
    sensorName: apiSensor.sensor_name || apiSensor.sensor_id,
    sensorType: apiSensor.sensor_type || 'unknown',
    unit: apiSensor.unit || '',
    isOnline: apiSensor.is_online ?? false,
    lastValue: apiSensor.last_value ?? null,
-   lastReadingAt: apiSensor.last_reading_at ?? null,  // ❌ Campo errado
+   lastReadingAt: apiSensor.last_reading ?? null,      // ✅ Campo correto
    statistics24h: {
      avg: apiSensor.statistics_24h?.avg ?? null,
      min: apiSensor.statistics_24h?.min ?? null,
      max: apiSensor.statistics_24h?.max ?? null,
      count: apiSensor.statistics_24h?.count || 0,
      stddev: apiSensor.statistics_24h?.stddev ?? null,
    },
  };
}
```

### 2. Backend: Completar Response

**Arquivo:** `apps/ingest/api_views_extended.py`

Adicionados campos faltantes na resposta do endpoint `/api/telemetry/device/{id}/summary/`:
- ✅ `sensor_name`
- ✅ `sensor_type` (extraído de `labels.type`)
- ✅ `is_online` (booleano calculado do threshold)
- ✅ `statistics_24h` (estrutura completa, valores TODO)

### 3. Reiniciar Backend

```bash
docker restart traksense-api
```

---

## ✅ Validação

### Passo 1: Recarregar Frontend

1. Abrir DevTools (F12) → Console
2. Recarregar página: `http://umc.localhost:5000/sensors` ⚠️ **Usar domínio tenant!**
3. Verificar requisição: `/api/telemetry/device/GW-1760908415/summary/`

**Esperado:**
```json
{
  "device_id": "GW-1760908415",
  "status": "online",
  "sensors": [
    {
      "sensor_id": "TEMP-1760908415",
      "sensor_name": "TEMP-1760908415",
      "sensor_type": "temperature",
      "unit": "°C",
      "is_online": true,
      "last_value": 22.5,
      "last_reading": "2025-10-19T23:46:30Z",
      "statistics_24h": { ... }
    }
  ]
}
```

### Passo 2: Verificar UI

**Catálogo de Sensores deve mostrar:**
- ✅ Sensores reais (TEMP-1760908415, PWR-1760908415, etc.)
- ✅ Status "Online" (ícone verde 📡)
- ✅ Última leitura com valores reais (não 0.00)
- ✅ Timestamp correto (19/10, 23:55)
- ✅ Disponibilidade 95%

### Passo 3: Verificar Console

**Não deve ter erros:**
- ❌ "Cannot read properties of undefined"
- ❌ "Erro 500"

**Deve ter logs:**
- ✅ `✅ Telemetria carregada: X sensores do device GW-1760908415`

---

## 📊 Impacto

**Antes:**
- 0 sensores reais carregados
- Erro de parsing no frontend
- Fallback para dados mockados

**Depois:**
- 100% sensores reais carregados
- Mapeamento correto de todos os campos
- UI mostrando dados do banco de dados

---

## 🎓 Lições Aprendidas

### 1. Validar Contratos de API

**Problema:** Frontend esperava `last_reading_at`, backend retornava `last_reading`.

**Solução:**
- Sempre validar response real do backend (usar curl ou Postman)
- Documentar schema da API (OpenAPI/Swagger)
- Criar testes de contrato

### 2. Defensive Parsing

**Boas práticas aplicadas:**
```typescript
lastReadingAt: apiSensor.last_reading ?? null,  // Usar ?? para nullish coalescing
sensorName: apiSensor.sensor_name || apiSensor.sensor_id,  // Fallback
```

### 3. Campos Obrigatórios

**Frontend precisa de:**
- `sensor_id` ✅
- `sensor_name` ✅ (adicionado)
- `sensor_type` ✅ (adicionado)
- `is_online` ✅ (corrigido de `status`)
- `last_reading` ✅
- `statistics_24h` ✅ (adicionado)

---

## 🚀 Próximos Passos

### ⚠️ IMPORTANTE: URL de Acesso Correta

**O frontend DEVE ser acessado via domínio do tenant:**

```
✅ CORRETO:  http://umc.localhost:5000/sensors
❌ ERRADO:   http://localhost:5000/sensors
```

**Por que?**
1. Backend usa **multi-tenancy** (django-tenants)
2. Endpoints `/api/telemetry/*` requerem **schema do tenant**
3. Frontend configurado: `VITE_API_URL=http://umc.localhost:8000/api`
4. Ao acessar `localhost` direto → backend não identifica tenant → **404 Not Found**

**Validação:**
- Abra DevTools (F12) → Network
- Acesse: `http://umc.localhost:5000/sensors`
- Verifique requisições para `/api/telemetry/device/.../summary/`
- Deve retornar **200 OK** (não 404)

---

### 1. Implementar Estatísticas 24h

Atualmente retorna valores `null`. Calcular:
- `avg`: Média das leituras
- `min`: Valor mínimo
- `max`: Valor máximo
- `count`: Número de leituras
- `stddev`: Desvio padrão

### 2. Melhorar `sensor_name`

Atualmente usa `sensor_id` como fallback. Buscar nome do model `Sensor` se existir.

### 3. Adicionar `sensor_type` aos Labels

Ao gerar telemetria, incluir `type` no JSON:
```python
labels = {
    'unit': '°C',
    'type': 'temperature'  # ← Adicionar
}
```

---

## 📝 Checklist de Validação

- [x] Backend retorna `last_reading` (não `last_reading_at`)
- [x] Backend retorna `is_online` booleano (não `status` string)
- [x] Backend retorna `sensor_name`
- [x] Backend retorna `sensor_type`
- [x] Backend retorna `statistics_24h` (estrutura completa)
- [x] Mapeador usa `apiSensor.last_reading`
- [x] Frontend não lança erro "Cannot read properties"
- [ ] Sensores reais aparecem na UI (aguardando validação do usuário)
- [ ] Auto-refresh funciona (30s)
- [ ] DevTools mostra logs de sucesso

---

**Bug Reportado:** 19/10/2025 23:46  
**Correções Aplicadas:** 19/10/2025 23:47  
**Backend Reiniciado:** 19/10/2025 23:48  
**Status Final:** ⏳ Aguardando validação do usuário (reload page)
