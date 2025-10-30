# 📊 FASE 3: TELEMETRIA REAL - PLANEJAMENTO COMPLETO

**Data Início**: 19 de outubro de 2025  
**Duração Estimada**: 1 semana  
**Status**: 🚀 INICIANDO

---

## 🎯 **OBJETIVO GERAL**

Implementar fluxo completo de telemetria:
- **MQTT → Backend → PostgreSQL/TimescaleDB**
- **Backend → REST API → Frontend React**
- **Gráficos e dashboards com dados reais**

---

## 📋 **SITUAÇÃO ATUAL (ANÁLISE)**

### **✅ O QUE JÁ EXISTE NO BACKEND**

#### **1. Models (`apps/ingest/models.py`)**
- ✅ `Telemetry` - Dados brutos MQTT (hypertable TimescaleDB)
- ✅ `Reading` - Leituras estruturadas de sensores (hypertable TimescaleDB)

#### **2. API REST (`apps/ingest/api_views.py`)**
- ✅ `TelemetryListView` - GET /api/telemetry/raw/
- ✅ `ReadingListView` - GET /api/telemetry/readings/
- ✅ `TimeSeriesAggregateView` - GET /api/telemetry/series/

#### **3. Serializers**
- ✅ `TelemetrySerializer`
- ✅ `ReadingSerializer`
- ✅ `TimeSeriesPointSerializer`

#### **4. Filtros**
- ✅ `TelemetryFilter` (device_id, topic, timestamp)
- ✅ `ReadingFilter` (device_id, sensor_id, ts, value)

#### **5. URLs**
- ✅ `/api/telemetry/raw/` - Dados MQTT brutos
- ✅ `/api/telemetry/readings/` - Leituras de sensores
- ✅ `/api/telemetry/series/` - Agregações (1m, 5m, 1h)

#### **6. MQTT Ingest**
- ✅ EMQX Rule Engine configurado (FASE 0.7)
- ✅ Webhook para `/ingest/mqtt/` funcionando

### **❌ O QUE FALTA IMPLEMENTAR**

#### **Backend**
- [ ] Endpoints específicos por device/sensor:
  - GET /api/telemetry/latest/{device_id}
  - GET /api/telemetry/history/{device_id}
  - GET /api/telemetry/device/{device_id}/sensors/
- [ ] Validação de permissões (device pertence ao tenant)
- [ ] Paginação otimizada para séries temporais
- [ ] Cache de últimas leituras (Redis - opcional)
- [ ] WebSocket para real-time (opcional)

#### **Frontend**
- [ ] Services para telemetria (`telemetryService.ts`)
- [ ] Types TypeScript para telemetria (`telemetry.ts`)
- [ ] Mappers API ↔ Frontend (`telemetryMapper.ts`)
- [ ] Integração na página Sensors
- [ ] Gráficos com Chart.js/Recharts
- [ ] Auto-refresh (polling ou WebSocket)
- [ ] Filtros de tempo (1h, 6h, 24h, 7d)

#### **Dados de Teste**
- [ ] Script para gerar telemetria fake
- [ ] Publicação MQTT simulada
- [ ] Dados históricos para gráficos

---

## 🗓️ **CRONOGRAMA SEMANAL**

### **DIA 1-2: Backend - Endpoints Específicos** 

**Objetivo**: Criar endpoints otimizados para frontend

#### **Tarefas**:

1. **Endpoint: Latest Readings**
   ```python
   GET /api/telemetry/latest/{device_id}/
   GET /api/telemetry/latest/{device_id}/{sensor_id}/
   ```
   - Retorna última leitura de cada sensor
   - Cache de 30 segundos
   - Filtro por device_id e sensor_id

2. **Endpoint: History**
   ```python
   GET /api/telemetry/history/{device_id}/
   GET /api/telemetry/history/{device_id}/{sensor_id}/
   ```
   - Retorna série temporal
   - Parâmetros: from, to, interval
   - Agregação automática se intervalo > 1h

3. **Endpoint: Device Summary**
   ```python
   GET /api/telemetry/device/{device_id}/summary/
   ```
   - Lista sensores com última leitura
   - Status (online/offline)
   - Timestamp última atualização

4. **Testes**
   - `test_telemetry_api.py`
   - Cobertura > 80%

**Entregáveis**:
- ✅ 3 novos endpoints funcionando
- ✅ Testes automatizados
- ✅ Documentação OpenAPI

---

### **DIA 3-4: Frontend - Services e Types**

**Objetivo**: Criar camada de serviços para telemetria

#### **Tarefas**:

1. **Types TypeScript** (`src/types/telemetry.ts`)
   ```typescript
   interface TelemetryReading {
     id: number;
     deviceId: string;
     sensorId: string;
     value: number;
     timestamp: Date;
     unit?: string;
   }
   
   interface TimeSeriesPoint {
     timestamp: Date;
     value: number;
     avg?: number;
     min?: number;
     max?: number;
   }
   
   interface DeviceSummary {
     deviceId: string;
     sensors: SensorReading[];
     lastUpdate: Date;
     status: 'online' | 'offline';
   }
   ```

2. **API Types** (`src/types/api.ts`)
   ```typescript
   interface ApiTelemetryReading { ... }
   interface ApiTimeSeriesPoint { ... }
   interface ApiDeviceSummary { ... }
   ```

3. **Service** (`src/services/telemetryService.ts`)
   ```typescript
   const telemetryService = {
     getLatest(deviceId: string): Promise<TelemetryReading[]>,
     getHistory(deviceId, from, to, interval): Promise<TimeSeriesPoint[]>,
     getDeviceSummary(deviceId): Promise<DeviceSummary>,
     getSensorHistory(deviceId, sensorId, ...): Promise<TimeSeriesPoint[]>
   }
   ```

4. **Mappers** (`src/lib/mappers/telemetryMapper.ts`)
   ```typescript
   mapApiReadingToFrontend(apiReading: ApiTelemetryReading): TelemetryReading
   mapApiTimeSeriesPointToFrontend(...): TimeSeriesPoint
   ```

**Entregáveis**:
- ✅ Types completos
- ✅ Service com 4+ métodos
- ✅ Mappers bidirecionais
- ✅ Sem erros de compilação

---

### **DIA 5: Frontend - Integração Sensors Page**

**Objetivo**: Mostrar dados reais na página Sensors

#### **Tarefas**:

1. **Atualizar Store** (`src/store/app.ts`)
   ```typescript
   interface AppState {
     telemetry: TelemetryReading[];
     isLoadingTelemetry: boolean;
     selectedDeviceId: string | null;
     
     loadTelemetryForDevice(deviceId: string): Promise<void>;
     refreshTelemetry(): Promise<void>;
   }
   ```

2. **Componente SensorCard**
   - Exibir última leitura
   - Indicador de status (online/offline)
   - Timestamp formatado
   - Loading state

3. **Lista de Sensores**
   - Carregar sensores do device selecionado
   - Auto-refresh a cada 30 segundos
   - Loading spinner
   - Empty state

4. **Filtros**
   - Por device
   - Por tipo de sensor
   - Range de tempo

**Entregáveis**:
- ✅ Sensors page com dados reais
- ✅ Auto-refresh funcional
- ✅ Loading/error states

---

### **DIA 6: Frontend - Gráficos**

**Objetivo**: Visualizar séries temporais

#### **Tarefas**:

1. **Componente ChartContainer**
   - Wrapper para Chart.js ou Recharts
   - Props: data, type (line/bar), options
   - Responsive
   - Loading skeleton

2. **TelemetryChart Component**
   ```tsx
   <TelemetryChart
     deviceId="device_001"
     sensorId="temp_sensor_01"
     timeRange="24h"
     aggregation="5m"
   />
   ```

3. **Tipos de Gráficos**
   - Line chart (temperatura ao longo do tempo)
   - Bar chart (consumo por hora)
   - Area chart (trend)

4. **Interatividade**
   - Zoom
   - Pan
   - Tooltip com valores
   - Legenda

**Entregáveis**:
- ✅ 3 tipos de gráficos funcionando
- ✅ Dados carregados da API
- ✅ Interatividade básica

---

### **DIA 7: Dados de Teste e Refinamento**

**Objetivo**: Popular banco com dados e ajustar UX

#### **Tarefas**:

1. **Script de Dados Fake** (`test_generate_telemetry.py`)
   ```python
   # Gerar 1000 leituras últimas 24h
   # Múltiplos devices
   # Múltiplos sensores
   # Valores realistas
   ```

2. **MQTT Publisher Simulado**
   ```python
   # Publicar leituras via MQTT
   # Simular sensores reais
   # Intervalo configurável
   ```

3. **Testes End-to-End**
   - Criar sensor → Publicar MQTT → Ver no frontend
   - Verificar agregações
   - Testar filtros

4. **Ajustes de Performance**
   - Otimizar queries
   - Adicionar índices
   - Cache de 30s

5. **Documentação**
   - README atualizado
   - Guia de teste
   - Troubleshooting

**Entregáveis**:
- ✅ 1000+ leituras no banco
- ✅ MQTT publisher funcionando
- ✅ Testes E2E passando
- ✅ Documentação completa

---

## 📊 **ENDPOINTS DETALHADOS**

### **1. Latest Readings**

**Endpoint**: `GET /api/telemetry/latest/{device_id}/`

**Parâmetros**:
- `device_id` (path) - ID do device
- `sensor_id` (query, optional) - Filtrar por sensor

**Resposta**:
```json
{
  "device_id": "device_001",
  "last_update": "2025-10-19T15:30:00Z",
  "readings": [
    {
      "sensor_id": "temp_sensor_01",
      "value": 22.5,
      "unit": "°C",
      "timestamp": "2025-10-19T15:30:00Z"
    },
    {
      "sensor_id": "humidity_sensor_01",
      "value": 65.0,
      "unit": "%",
      "timestamp": "2025-10-19T15:29:55Z"
    }
  ]
}
```

---

### **2. History**

**Endpoint**: `GET /api/telemetry/history/{device_id}/`

**Parâmetros**:
- `device_id` (path) - ID do device
- `sensor_id` (query, optional) - Filtrar por sensor
- `from` (query) - ISO-8601 timestamp
- `to` (query) - ISO-8601 timestamp
- `interval` (query) - `1m`, `5m`, `1h` (default: auto)

**Resposta**:
```json
{
  "device_id": "device_001",
  "sensor_id": "temp_sensor_01",
  "interval": "5m",
  "count": 288,
  "data": [
    {
      "timestamp": "2025-10-19T15:25:00Z",
      "value": 22.5,
      "avg": 22.4,
      "min": 22.1,
      "max": 22.8
    },
    // ... mais pontos
  ]
}
```

---

### **3. Device Summary**

**Endpoint**: `GET /api/telemetry/device/{device_id}/summary/`

**Resposta**:
```json
{
  "device_id": "device_001",
  "status": "online",
  "last_seen": "2025-10-19T15:30:00Z",
  "sensors": [
    {
      "sensor_id": "temp_sensor_01",
      "type": "temperature",
      "last_value": 22.5,
      "last_reading": "2025-10-19T15:30:00Z",
      "status": "ok"
    },
    {
      "sensor_id": "humidity_sensor_01",
      "type": "humidity",
      "last_value": 65.0,
      "last_reading": "2025-10-19T15:29:55Z",
      "status": "ok"
    }
  ],
  "statistics": {
    "total_readings_24h": 1440,
    "avg_interval": "60s"
  }
}
```

---

## 🔄 **FLUXO DE DADOS COMPLETO**

```
┌──────────────────┐
│ IoT Device       │
│ (Sensor físico)  │
└────────┬─────────┘
         │ MQTT Publish
         ▼
┌──────────────────┐
│ EMQX Broker      │
│ (Port 1883)      │
└────────┬─────────┘
         │ Rule Engine
         ▼
┌──────────────────┐
│ Django Webhook   │
│ POST /ingest/mqtt│
└────────┬─────────┘
         │ Save to DB
         ▼
┌──────────────────┐
│ PostgreSQL       │
│ + TimescaleDB    │
│ (Telemetry table)│
└────────┬─────────┘
         │ REST API
         ▼
┌──────────────────┐
│ GET /api/        │
│ telemetry/       │
└────────┬─────────┘
         │ JSON Response
         ▼
┌──────────────────┐
│ React Frontend   │
│ (telemetryService)│
└────────┬─────────┘
         │ Render
         ▼
┌──────────────────┐
│ Sensors Page     │
│ + Charts         │
└──────────────────┘
```

---

## ✅ **CHECKLIST DE IMPLEMENTAÇÃO**

### **Backend**

- [ ] Criar endpoint `latest/`
- [ ] Criar endpoint `history/`
- [ ] Criar endpoint `device/{id}/summary/`
- [ ] Adicionar cache (Redis ou in-memory)
- [ ] Adicionar validação de permissões
- [ ] Testes unitários (> 80% coverage)
- [ ] Documentação OpenAPI
- [ ] Otimização de queries (EXPLAIN ANALYZE)

### **Frontend - Types**

- [ ] `src/types/telemetry.ts`
- [ ] `src/types/api.ts` (telemetry interfaces)
- [ ] Validação TypeScript (sem erros)

### **Frontend - Services**

- [ ] `src/services/telemetryService.ts`
- [ ] `src/lib/mappers/telemetryMapper.ts`
- [ ] Testes unitários (Jest)

### **Frontend - Store**

- [ ] Adicionar estado `telemetry` no Zustand
- [ ] Métodos `loadTelemetry()`, `refreshTelemetry()`
- [ ] Loading/error states

### **Frontend - Components**

- [ ] `SensorCard.tsx` (última leitura)
- [ ] `TelemetryChart.tsx` (gráfico série temporal)
- [ ] `DeviceSummary.tsx` (resumo device)
- [ ] Loading skeletons
- [ ] Empty states
- [ ] Error boundaries

### **Frontend - Pages**

- [ ] Atualizar `SensorsPage.tsx`
- [ ] Integrar com API real
- [ ] Auto-refresh (30s)
- [ ] Filtros funcionando

### **Dados de Teste**

- [ ] Script Python gerar telemetria
- [ ] MQTT publisher simulado
- [ ] 1000+ readings no banco
- [ ] Múltiplos devices/sensors

### **Documentação**

- [ ] `FASE_3_IMPLEMENTACAO.md`
- [ ] `GUIA_TESTE_TELEMETRIA.md`
- [ ] `README.md` atualizado
- [ ] Changelog

---

## 🎯 **CRITÉRIOS DE SUCESSO**

### **Must Have** ✅

- [ ] Dados MQTT chegando no backend
- [ ] API retornando telemetria real
- [ ] Frontend exibindo últimas leituras
- [ ] Gráfico básico funcionando
- [ ] Auto-refresh ativo

### **Should Have** ⭐

- [ ] 3 endpoints específicos
- [ ] Agregações (1m, 5m, 1h)
- [ ] Filtros de tempo
- [ ] Loading states elegantes
- [ ] Testes automatizados

### **Nice to Have** 🌟

- [ ] WebSocket real-time
- [ ] Cache Redis
- [ ] Gráficos interativos (zoom, pan)
- [ ] Exportar CSV
- [ ] Alertas baseados em threshold

---

## 📚 **RECURSOS NECESSÁRIOS**

### **Backend**
- Django 5.0+
- PostgreSQL com TimescaleDB
- DRF (Django REST Framework)
- django-filters
- EMQX (já configurado)

### **Frontend**
- React 18+
- TypeScript
- Zustand (state management)
- Axios (HTTP client)
- Chart.js ou Recharts
- date-fns (formatação)

### **Ferramentas**
- Postman (teste API)
- MQTT Explorer (debug MQTT)
- pgAdmin (queries SQL)
- Chrome DevTools

---

## 🚨 **RISCOS E MITIGAÇÕES**

### **Risco 1: Performance com muitos dados**
- **Impacto**: Queries lentas, UI travada
- **Mitigação**: Agregações TimescaleDB, paginação, cache

### **Risco 2: MQTT não funcionando**
- **Impacto**: Sem dados para testar
- **Mitigação**: Script simulador, dados fake

### **Risco 3: Frontend não atualiza**
- **Impacto**: Dados desatualizados
- **Mitigação**: Auto-refresh, WebSocket (futuro)

### **Risco 4: Complexidade de mappers**
- **Impacto**: Bugs de conversão
- **Mitigação**: Testes unitários, validação TypeScript

---

## 📈 **MÉTRICAS DE SUCESSO**

- ✅ **Cobertura de testes**: > 80%
- ✅ **Response time API**: < 200ms
- ✅ **Erros de compilação**: 0
- ✅ **Loading time frontend**: < 1s
- ✅ **Auto-refresh funcionando**: Sim
- ✅ **Dados reais exibidos**: Sim

---

## 🔜 **PRÓXIMAS FASES**

### **FASE 4: Alertas e Regras**
- Criar alertas baseados em thresholds
- Rule engine no backend
- Notificações push/email

### **FASE 5: Dashboard Real-Time**
- WebSocket para updates instantâneos
- Dashboards customizáveis
- KPIs calculados

### **FASE 6: Analytics Avançados**
- Machine Learning para predição
- Detecção de anomalias
- Relatórios automáticos

---

## 📝 **NOTAS DE IMPLEMENTAÇÃO**

1. **Priorizar MVP**: Latest readings + gráfico básico primeiro
2. **Testes constantes**: Testar cada endpoint antes de integrar
3. **Documentar decisões**: Por que escolhemos X sobre Y
4. **Code reviews**: Validar antes de merge
5. **Deploy incremental**: Backend → Frontend → Integração

---

**STATUS**: 🚀 **PRONTO PARA COMEÇAR!**

Documentação de implementação será criada em: `FASE_3_IMPLEMENTACAO.md`
