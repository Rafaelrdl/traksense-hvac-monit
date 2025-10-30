# 🚀 FASE 3: TELEMETRIA REAL - IMPLEMENTAÇÃO

**Data**: 19 de outubro de 2025  
**Status**: ✅ DIA 1-2 BACKEND COMPLETO

---

## ✅ **O QUE FOI IMPLEMENTADO**

### **Backend - Novos Endpoints**

#### **1. Latest Readings** ✅

**Endpoint**: `GET /api/telemetry/latest/{device_id}/`

**Arquivo**: `apps/ingest/api_views_extended.py` - `LatestReadingsView`

**Funcionalidade**:
- Retorna última leitura de cada sensor do device
- Usa `DISTINCT ON` do PostgreSQL para eficiência
- Suporta filtro opcional por `sensor_id`

**Exemplo de uso**:
```bash
# Todas as leituras mais recentes do device
GET http://umc.localhost:8000/api/telemetry/latest/device_001/

# Apenas sensor específico
GET http://umc.localhost:8000/api/telemetry/latest/device_001/?sensor_id=temp_sensor_01
```

**Resposta**:
```json
{
  "device_id": "device_001",
  "last_update": "2025-10-19T20:30:00Z",
  "count": 3,
  "readings": [
    {
      "id": 12345,
      "device_id": "device_001",
      "sensor_id": "temp_sensor_01",
      "value": 22.5,
      "labels": {
        "unit": "°C",
        "sensor_name": "Temperatura Ambiente"
      },
      "ts": "2025-10-19T20:30:00Z",
      "created_at": "2025-10-19T20:30:01Z"
    },
    // ... mais sensores
  ]
}
```

---

#### **2. Device History** ✅

**Endpoint**: `GET /api/telemetry/history/{device_id}/`

**Arquivo**: `apps/ingest/api_views_extended.py` - `DeviceHistoryView`

**Funcionalidade**:
- Retorna série temporal de leituras
- **Auto-agregação inteligente** baseada no range:
  - Range < 1h → `raw` (sem agregação)
  - Range 1h-6h → `1m` (buckets de 1 minuto)
  - Range 6h-24h → `5m` (buckets de 5 minutos)
  - Range > 24h → `1h` (buckets de 1 hora)
- Usa `time_bucket()` do TimescaleDB
- Suporta paginação (max 5000 pontos)

**Parâmetros**:
- `sensor_id` (query, opcional) - Filtrar sensor
- `from` (query, opcional) - Início (ISO-8601), default: 24h atrás
- `to` (query, opcional) - Fim (ISO-8601), default: agora
- `interval` (query, opcional) - `raw`, `1m`, `5m`, `1h`, `auto` (default)
- `limit` (query, opcional) - Max resultados (default: 500, max: 5000)

**Exemplo de uso**:
```bash
# Últimas 24h (auto-agregação 5m)
GET http://umc.localhost:8000/api/telemetry/history/device_001/

# Últimas 6h com agregação 1m
GET http://umc.localhost:8000/api/telemetry/history/device_001/?from=2025-10-19T14:00:00Z&interval=1m

# Sensor específico, últimas 1h, dados brutos
GET http://umc.localhost:8000/api/telemetry/history/device_001/?sensor_id=temp_01&interval=raw&from=2025-10-19T19:00:00Z
```

**Resposta (agregada)**:
```json
{
  "device_id": "device_001",
  "sensor_id": "temp_sensor_01",
  "interval": "5m",
  "from": "2025-10-18T20:30:00Z",
  "to": "2025-10-19T20:30:00Z",
  "count": 288,
  "data": [
    {
      "bucket": "2025-10-19T20:25:00Z",
      "sensor_id": "temp_sensor_01",
      "avg_value": 22.45,
      "min_value": 22.1,
      "max_value": 22.8,
      "last_value": 22.5,
      "count": 5
    },
    // ... mais buckets
  ]
}
```

**Resposta (raw)**:
```json
{
  "device_id": "device_001",
  "sensor_id": "temp_sensor_01",
  "interval": "raw",
  "from": "2025-10-19T19:30:00Z",
  "to": "2025-10-19T20:30:00Z",
  "count": 60,
  "data": [
    {
      "ts": "2025-10-19T20:30:00Z",
      "sensor_id": "temp_sensor_01",
      "value": 22.5
    },
    // ... mais pontos
  ]
}
```

---

#### **3. Device Summary** ✅

**Endpoint**: `GET /api/telemetry/device/{device_id}/summary/`

**Arquivo**: `apps/ingest/api_views_extended.py` - `DeviceSummaryView`

**Funcionalidade**:
- Resumo completo do device
- Status (online se leitura < 5 min)
- Lista todos sensores com última leitura
- Estatísticas 24h (total readings, avg interval)

**Exemplo de uso**:
```bash
GET http://umc.localhost:8000/api/telemetry/device/device_001/summary/
```

**Resposta**:
```json
{
  "device_id": "device_001",
  "status": "online",
  "last_seen": "2025-10-19T20:30:00Z",
  "sensors": [
    {
      "sensor_id": "temp_sensor_01",
      "last_value": 22.5,
      "last_reading": "2025-10-19T20:30:00Z",
      "unit": "°C",
      "status": "ok"
    },
    {
      "sensor_id": "humidity_sensor_01",
      "last_value": 65.0,
      "last_reading": "2025-10-19T20:29:55Z",
      "unit": "%",
      "status": "ok"
    }
  ],
  "statistics": {
    "total_readings_24h": 1440,
    "sensor_count": 2,
    "avg_interval": "60s"
  }
}
```

---

### **URLs Atualizadas** ✅

**Arquivo**: `apps/ingest/api_urls.py`

**Novos endpoints adicionados**:
```python
# Device-centric endpoints (FASE 3)
path('latest/<str:device_id>/', LatestReadingsView.as_view(), name='latest-readings'),
path('history/<str:device_id>/', DeviceHistoryView.as_view(), name='device-history'),
path('device/<str:device_id>/summary/', DeviceSummaryView.as_view(), name='device-summary'),
```

**Endpoints completos da API Telemetry**:

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/telemetry/raw/` | Dados MQTT brutos |
| GET | `/api/telemetry/readings/` | Leituras estruturadas |
| GET | `/api/telemetry/series/` | Agregações manuais (1m, 5m, 1h) |
| GET | `/api/telemetry/latest/{device_id}/` | ✨ Última leitura por sensor |
| GET | `/api/telemetry/history/{device_id}/` | ✨ Série temporal com auto-agregação |
| GET | `/api/telemetry/device/{device_id}/summary/` | ✨ Resumo completo do device |

---

### **Script de Dados de Teste** ✅

**Arquivo**: `test_generate_telemetry.py`

**Funcionalidade**:
- Gera dados realistas de telemetria
- Suporta múltiplos tipos de sensores
- Valores com continuidade (não aleatórios puros)
- Bulk insert para performance

**Tipos de sensores suportados**:
- `TEMPERATURE` (18-26°C com variação ±0.5°C)
- `HUMIDITY` (40-70% com variação ±2%)
- `PRESSURE` (980-1020 Pa com variação ±5 Pa)
- `POWER` (1000-5000 W com variação ±100 W)
- `FLOW` (10-100 L/min com variação ±5 L/min)
- `CURRENT` (5-20 A com variação ±0.5 A)
- `VOLTAGE` (200-240 V com variação ±5 V)

**Uso**:
```bash
# Gerar 24h de dados (intervalo 60s)
docker exec -it traksense-api python test_generate_telemetry.py

# Gerar 48h com intervalo de 30s
docker exec -it traksense-api python test_generate_telemetry.py --hours 48 --interval 30

# Limpar dados existentes e gerar novos
docker exec -it traksense-api python test_generate_telemetry.py --clear

# Outro tenant
docker exec -it traksense-api python test_generate_telemetry.py --tenant outro_tenant
```

**Output esperado**:
```
🚀 Gerando telemetria fake para tenant 'umc'...
   Período: últimas 24 horas
   Intervalo: 60 segundos

📱 Encontrados 2 devices com sensores:
   - Device 001 (SN12345): 3 sensores
   - Device 002 (SN67890): 2 sensores

⏱️  Gerando 1440 pontos por sensor...

   ✅ Temperatura (TEMPERATURE): 1440 readings
   ✅ Umidade (HUMIDITY): 1440 readings
   ✅ Pressão (PRESSURE): 1440 readings
      Total device Device 001: 4320 readings

   ✅ Corrente (CURRENT): 1440 readings
   ✅ Tensão (VOLTAGE): 1440 readings
      Total device Device 002: 2880 readings

🎉 Total: 7200 readings criados com sucesso!
   Tenant: umc
   Período: 2025-10-18 20:30 até 2025-10-19 20:30
```

---

## 📊 **EXEMPLOS DE USO**

### **1. Dashboard em Tempo Real**

```typescript
// Carregar últimas leituras de todos sensores
const response = await fetch('http://umc.localhost:8000/api/telemetry/latest/device_001/');
const data = await response.json();

data.readings.forEach(reading => {
  console.log(`${reading.sensor_id}: ${reading.value} ${reading.labels.unit}`);
});
```

### **2. Gráfico de 24 Horas**

```typescript
// Carregar histórico com auto-agregação
const response = await fetch(
  'http://umc.localhost:8000/api/telemetry/history/device_001/?sensor_id=temp_sensor_01'
);
const data = await response.json();

// data.data contém array de pontos agregados
const chartData = data.data.map(point => ({
  time: point.bucket,
  value: point.avg_value
}));
```

### **3. Card de Status**

```typescript
// Carregar resumo do device
const response = await fetch(
  'http://umc.localhost:8000/api/telemetry/device/device_001/summary/'
);
const data = await response.json();

console.log(`Device: ${data.device_id}`);
console.log(`Status: ${data.status}`);
console.log(`Sensores: ${data.sensors.length}`);
console.log(`Leituras 24h: ${data.statistics.total_readings_24h}`);
```

---

## 🧪 **TESTES**

### **Testar Endpoints Manualmente**

**1. Latest Readings**:
```bash
curl http://umc.localhost:8000/api/telemetry/latest/device_001/
```

**2. History (últimas 1h, raw)**:
```bash
curl "http://umc.localhost:8000/api/telemetry/history/device_001/?interval=raw&from=$(date -u -d '1 hour ago' +%Y-%m-%dT%H:%M:%SZ)"
```

**3. Device Summary**:
```bash
curl http://umc.localhost:8000/api/telemetry/device/device_001/summary/
```

### **Gerar Dados de Teste**

```bash
# Conectar ao container
docker exec -it traksense-api bash

# Gerar telemetria
python test_generate_telemetry.py

# Verificar no banco
python manage.py shell
>>> from django_tenants.utils import schema_context
>>> from apps.ingest.models import Reading
>>> with schema_context('umc'):
...     print(Reading.objects.count())
7200
```

---

## 📚 **DOCUMENTAÇÃO DA API**

### **OpenAPI/Swagger**

Acesse: `http://umc.localhost:8000/api/docs/`

Os novos endpoints estão documentados com:
- ✅ Descrições detalhadas
- ✅ Parâmetros com validação
- ✅ Exemplos de request/response
- ✅ Schemas TypeScript-ready

### **ReDoc**

Alternativa: `http://umc.localhost:8000/api/redoc/`

---

## 🔄 **PRÓXIMOS PASSOS (DIA 3-4)**

### **Frontend - Services e Types**

1. **Criar types** (`src/types/telemetry.ts`)
   ```typescript
   interface TelemetryReading {
     id: number;
     deviceId: string;
     sensorId: string;
     value: number;
     timestamp: Date;
     unit?: string;
   }
   ```

2. **Criar service** (`src/services/telemetryService.ts`)
   ```typescript
   const telemetryService = {
     getLatest(deviceId: string): Promise<TelemetryReading[]>,
     getHistory(deviceId, options): Promise<TimeSeriesPoint[]>,
     getDeviceSummary(deviceId): Promise<DeviceSummary>
   }
   ```

3. **Criar mappers** (`src/lib/mappers/telemetryMapper.ts`)
   - API → Frontend (snake_case → camelCase)
   - Conversão de timestamps
   - Formatação de unidades

---

## ✅ **CHECKLIST DIA 1-2**

- [x] Endpoint `latest/{device_id}/`
- [x] Endpoint `history/{device_id}/`
- [x] Endpoint `device/{device_id}/summary/`
- [x] URLs configuradas
- [x] Documentação OpenAPI
- [x] Script de dados de teste
- [x] Auto-agregação inteligente
- [x] Validação de parâmetros
- [x] Error handling

---

## 🎉 **RESULTADO DIA 1-2**

**Backend da FASE 3 está completo e funcional!**

✅ 3 novos endpoints criados  
✅ Auto-agregação inteligente implementada  
✅ Script de dados de teste funcionando  
✅ Documentação OpenAPI gerada  
✅ Pronto para integração frontend  

**Próxima etapa**: Criar services TypeScript e integrar com React!
