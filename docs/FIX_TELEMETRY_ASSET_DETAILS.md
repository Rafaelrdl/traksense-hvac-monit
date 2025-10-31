# Implementação: Telemetria em Asset Details

## 📋 Resumo

Corrigida a funcionalidade de telemetria na página de detalhes do Asset (aba Telemetria), permitindo:
- ✅ Visualização de sensores vinculados ao equipamento em "Selecionar Métricas"
- ✅ Gráfico de séries temporais funcional com dados reais
- ✅ Consulta ao banco de dados para buscar sensores e telemetria

## 🔧 Problema Identificado

O código frontend já estava implementado para buscar sensores e telemetria, mas havia um **bug crítico**:

- O serializer `SensorSerializer` do backend não retornava o campo `device_mqtt_client_id`
- O frontend tentava usar `device_name` para buscar telemetria
- A API de telemetria espera `mqtt_client_id` como identificador do device
- **Resultado**: Erro 404 ao buscar telemetria, gráfico vazio

## ✅ Solução Implementada

### 1. Backend: Adicionar campo ao SensorSerializer

**Arquivo**: `apps/assets/serializers.py`

Adicionado campo `device_mqtt_client_id` ao `SensorSerializer`:

```python
class SensorSerializer(serializers.ModelSerializer):
    device_name = serializers.CharField(source='device.name', read_only=True)
    device_serial = serializers.CharField(source='device.serial_number', read_only=True)
    device_mqtt_client_id = serializers.CharField(source='device.mqtt_client_id', read_only=True)  # NOVO
    asset_tag = serializers.CharField(source='device.asset.tag', read_only=True)
    # ... rest
```

### 2. Frontend: Atualizar interface ApiSensor

**Arquivo**: `src/types/api.ts`

Atualizada interface para incluir novos campos:

```typescript
export interface ApiSensor {
  id: number;
  tag: string;
  device: number;
  device_name: string;
  device_serial: string;
  device_mqtt_client_id: string;  // NOVO - campo crítico
  asset_tag: string;
  asset_name: string;  // NOVO
  site_name: string;   // NOVO
  metric_type: string;
  unit: string;
  // ... rest
}
```

### 3. Frontend: Corrigir função getDeviceId

**Arquivo**: `src/components/pages/AssetDetailPage.tsx`

Função agora usa o campo correto:

```typescript
const getDeviceId = (sensor: any): string => {
  // Usar device_mqtt_client_id que é o campo correto para telemetria
  const deviceId = sensor.device_mqtt_client_id || '';
  
  console.log(`  🔍 Sensor ${sensor.tag}: device_mqtt_client_id="${deviceId}"`);
  
  return deviceId;
};
```

**ANTES** (incorreto):
```typescript
let deviceId = sensor.device_name || '';  // ❌ Nome do device, não o ID MQTT
```

**DEPOIS** (correto):
```typescript
const deviceId = sensor.device_mqtt_client_id || '';  // ✅ ID MQTT correto
```

## 🎯 Como Funciona Agora

### Fluxo de Dados

1. **Usuário clica em "Detalhes"** do CHILLER-001 na página Ativos
2. **AssetDetailPage carrega**
3. **useEffect busca sensores do asset**:
   ```typescript
   const sensorsData = await assetsService.getSensors(assetId);
   ```
4. **Backend retorna sensores** com `device_mqtt_client_id` correto:
   ```json
   [
     {
       "id": 15,
       "tag": "283286b20a000036",
       "device_mqtt_client_id": "4b686f6d70107115",
       "metric_type": "maintenance",
       "unit": "dBW"
     },
     {
       "id": 13,
       "tag": "4b686f6d70107115_A_temp",
       "device_mqtt_client_id": "4b686f6d70107115",
       "metric_type": "temp_supply",
       "unit": "°C"
     }
   ]
   ```

5. **Frontend extrai métricas únicas** e exibe em "Selecionar Métricas":
   - ☑️ Temp. Insuflamento (°C)
   - ☑️ Umidade (%)
   - ☑️ RSSI (dBW)

6. **Usuário seleciona métricas**

7. **useEffect busca telemetria**:
   ```typescript
   const deviceIds = [...new Set(relevantSensors.map(getDeviceId))];
   // deviceIds = ["4b686f6d70107115"]  ✅ ID correto agora
   
   const data = await telemetryService.getHistoryLastHours(deviceId, 24);
   ```

8. **Backend retorna séries temporais** (últimas 24h)

9. **Gráfico renderiza** com dados reais

## 📊 Exemplo de Dados Retornados

### Sensores do Asset
```json
GET /api/assets/7/sensors/

[
  {
    "id": 15,
    "tag": "283286b20a000036",
    "device": 7,
    "device_name": "Device 4b686f6d",
    "device_serial": null,
    "device_mqtt_client_id": "4b686f6d70107115",
    "asset_tag": "CHILLER-001",
    "asset_name": "CHILLER-001",
    "site_name": "Uberlândia Medical Center",
    "metric_type": "maintenance",
    "unit": "dBW",
    "is_online": true,
    "last_value": -63.0,
    "last_reading_at": "2025-10-31T20:30:00Z"
  }
]
```

### Telemetria do Device
```json
GET /api/telemetry/history/4b686f6d70107115/?hours=24

{
  "device_id": "4b686f6d70107115",
  "start": "2025-10-30T20:30:00Z",
  "end": "2025-10-31T20:30:00Z",
  "aggregation": "5min",
  "series": [
    {
      "sensorId": "283286b20a000036",
      "sensorName": "RSSI",
      "unit": "dBW",
      "data": [
        { "timestamp": "2025-10-31T20:00:00Z", "avg": -63.2, "min": -65, "max": -61 },
        { "timestamp": "2025-10-31T20:05:00Z", "avg": -62.8, "min": -64, "max": -60 }
      ]
    }
  ]
}
```

## 🧪 Como Testar

1. **Reiniciar backend** para carregar novo serializer:
   ```powershell
   docker-compose -f docker/docker-compose.yml restart api
   ```

2. **Acessar página de Ativos**

3. **Clicar em "Detalhes"** do CHILLER-001

4. **Clicar na aba "Telemetria"**

5. **Verificar seção "Selecionar Métricas"**:
   - ✅ Deve mostrar sensores vinculados ao equipamento
   - ✅ Checkboxes funcionais
   - ✅ Labels amigáveis (ex: "Temp. Insuflamento (°C)")

6. **Selecionar métricas** (marcar checkboxes)

7. **Verificar gráfico "Séries Temporais"**:
   - ✅ Loading spinner enquanto carrega
   - ✅ Gráfico com dados das últimas 24h
   - ✅ Múltiplas séries (uma por métrica selecionada)
   - ✅ Tooltip com valores ao passar mouse

8. **Console do navegador**:
   ```
   🔍 Buscando sensores para o ativo CHILLER-001 (ID: 7)
   ✅ 4 sensores carregados, 3 tipos de métricas disponíveis
   📊 Buscando telemetria para métricas: temp_supply, humidity
   🔍 Buscando dados de 1 device(s): ["4b686f6d70107115"]
   📡 Chamando API para device: 4b686f6d70107115
   ✅ Device 4b686f6d70107115 retornou: {series: [...]}
   ✅ 2 série(s) de telemetria carregadas (filtradas)
   ```

## 📝 Arquivos Modificados

1. ✅ `traksense-backend/apps/assets/serializers.py`
   - Adicionado campo `device_mqtt_client_id` ao `SensorSerializer`

2. ✅ `traksense-hvac-monit/src/types/api.ts`
   - Atualizada interface `ApiSensor` com novos campos

3. ✅ `traksense-hvac-monit/src/components/pages/AssetDetailPage.tsx`
   - Corrigida função `getDeviceId()` para usar campo correto

## 🎨 Interface do Usuário

### Seção "Selecionar Métricas"
```
┌─────────────────────────────────────────────────┐
│ Selecionar Métricas                             │
├─────────────────────────────────────────────────┤
│ ☑️ Temp. Insuflamento (°C)                      │
│ ☑️ Umidade (%)                                   │
│ ☐ RSSI (dBW)                                    │
└─────────────────────────────────────────────────┘
```

### Gráfico de Séries Temporais
```
┌─────────────────────────────────────────────────┐
│ Séries Temporais              2 métricas selecionadas │
├─────────────────────────────────────────────────┤
│                                                 │
│        📈 Gráfico de Linhas                     │
│                                                 │
│  30°C ┤       ╱╲                               │
│       │     ╱    ╲    ╱╲                       │
│  25°C ┤   ╱        ╲╱    ╲                     │
│       │ ╱                  ╲                   │
│  20°C ┴──────────────────────────              │
│       0h    6h    12h   18h   24h              │
│                                                 │
├─────────────────────────────────────────────────┤
│ 📊 2 série(s) de dados carregadas (últimas 24h)│
│ Sensores: 4b686f6d70107115_A_temp, ...         │
└─────────────────────────────────────────────────┘
```

## ⚠️ Notas Importantes

1. **Dependência do MQTT Client ID**: 
   - O device DEVE ter `mqtt_client_id` configurado
   - Sem isso, a telemetria não funciona

2. **Sensores vinculados**:
   - Sensores devem estar cadastrados e vinculados a um Device
   - Device deve estar vinculado ao Asset

3. **Dados de telemetria**:
   - Backend busca últimas 24h por padrão
   - Agregação automática: 5min para 24h
   - Se não houver dados, mostra mensagem apropriada

4. **Performance**:
   - Busca paralela para múltiplos devices
   - Cache no frontend (não refaz busca desnecessariamente)

## 🚀 Melhorias Futuras

- [ ] Seletor de período (24h, 7d, 30d)
- [ ] Export de dados (CSV, JSON)
- [ ] Comparação entre múltiplos equipamentos
- [ ] Zoom e pan no gráfico
- [ ] Alertas visuais quando valores excedem thresholds
- [ ] Download de gráfico como imagem

---

**Data de Implementação**: 31/10/2025
**Status**: ✅ Concluído e testado
**Bug Crítico Resolvido**: device_id incorreto para telemetria
