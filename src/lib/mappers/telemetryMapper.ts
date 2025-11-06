/**
 * Telemetry Mappers - FASE 3
 * 
 * Conversões entre formatos Backend (snake_case) ↔ Frontend (camelCase).
 * Garante consistência nos dados recebidos da API.
 */

import {
  TelemetryReading,
  SensorLabels,
  TimeSeriesPoint,
  SensorTimeSeries,
  LatestReadingsResponse,
  DeviceHistoryResponse,
  DeviceSummaryResponse,
  SensorSummary,
  DeviceStatus,
  AggregationLevel,
} from '@/types/telemetry';

/**
 * Mapeia Reading do backend para TelemetryReading do frontend.
 * 
 * Backend (Django):
 * {
 *   "id": 123,
 *   "device_id": "GW-001",
 *   "sensor_id": "temp_supply_1",
 *   "value": 22.5,
 *   "labels": {"sensor_name": "Temp Supply", "unit": "°C"},
 *   "ts": "2025-10-19T12:00:00Z",
 *   "created_at": "2025-10-19T12:00:01Z"
 * }
 * 
 * Frontend (React):
 * {
 *   id: 123,
 *   deviceId: "GW-001",
 *   sensorId: "temp_supply_1",
 *   value: 22.5,
 *   labels: {sensorName: "Temp Supply", unit: "°C"},
 *   timestamp: "2025-10-19T12:00:00Z",
 *   createdAt: "2025-10-19T12:00:01Z"
 * }
 */
export function mapApiReadingToFrontend(apiReading: any): TelemetryReading {
  return {
    id: apiReading.id,
    deviceId: apiReading.device_id,
    sensorId: apiReading.sensor_id,
    value: apiReading.value,
    labels: mapApiLabelsToFrontend(apiReading.labels || {}),
    timestamp: apiReading.ts,
    createdAt: apiReading.created_at,
  };
}

/**
 * Mapeia labels do backend para frontend.
 * Converte snake_case para camelCase.
 */
export function mapApiLabelsToFrontend(apiLabels: any): SensorLabels {
  const labels: SensorLabels = {};
  
  if (apiLabels.sensor_name) labels.sensorName = apiLabels.sensor_name;
  if (apiLabels.sensor_type) labels.sensorType = apiLabels.sensor_type;
  if (apiLabels.unit) labels.unit = apiLabels.unit;
  if (apiLabels.asset_id) labels.assetId = apiLabels.asset_id;
  
  // Copiar outros campos mantendo o formato original
  Object.keys(apiLabels).forEach(key => {
    if (!['sensor_name', 'sensor_type', 'unit', 'asset_id'].includes(key)) {
      labels[key] = apiLabels[key];
    }
  });
  
  return labels;
}

/**
 * Mapeia TimeSeriesPoint do backend para frontend.
 * Backend já usa formato adequado, apenas valida tipos.
 * Suporta tanto dados agregados (avg/min/max) quanto dados brutos (value).
 */
export function mapApiTimeSeriesPointToFrontend(apiPoint: any): TimeSeriesPoint {
  const timestampSource =
    apiPoint.timestamp ??
    apiPoint.time ??
    apiPoint.bucket ??
    apiPoint.ts ??
    null;

  let timestamp = '';
  if (timestampSource instanceof Date) {
    timestamp = timestampSource.toISOString();
  } else if (typeof timestampSource === 'string') {
    timestamp = timestampSource;
  } else if (timestampSource !== null && timestampSource !== undefined) {
    try {
      timestamp = new Date(timestampSource).toISOString();
    } catch (error) {
      timestamp = String(timestampSource);
    }
  }

  const avg =
    apiPoint.avg ??
    apiPoint.avg_value ??
    apiPoint.value ??
    null;
  const min =
    apiPoint.min ??
    apiPoint.min_value ??
    avg;
  const max =
    apiPoint.max ??
    apiPoint.max_value ??
    avg;
  const count =
    apiPoint.count ??
    apiPoint.samples ??
    (avg !== null ? 1 : 0);
  const stddev =
    apiPoint.stddev ??
    apiPoint.stddev_value ??
    null;

  return {
    timestamp,
    avg,
    min,
    max,
    count,
    stddev,
  };
}

/**
 * Mapeia SensorTimeSeries do backend para frontend.
 */
export function mapApiSensorTimeSeriesToFrontend(apiSeries: any): SensorTimeSeries {
  return {
    sensorId: apiSeries.sensor_id,
    sensorName: apiSeries.sensor_name || apiSeries.sensor_id,
    sensorType: apiSeries.sensor_type || 'unknown',
    unit: apiSeries.unit || '',
    data: (apiSeries.data || []).map(mapApiTimeSeriesPointToFrontend),
  };
}

/**
 * Mapeia LatestReadingsResponse do backend para frontend.
 */
export function mapApiLatestReadingsToFrontend(apiResponse: any): LatestReadingsResponse {
  const timestampSource = apiResponse.timestamp ?? apiResponse.last_update ?? null;
  let timestamp = '';

  if (timestampSource instanceof Date) {
    timestamp = timestampSource.toISOString();
  } else if (typeof timestampSource === 'string') {
    timestamp = timestampSource;
  } else if (timestampSource) {
    try {
      timestamp = new Date(timestampSource).toISOString();
    } catch {
      timestamp = String(timestampSource);
    }
  }

  return {
    deviceId: apiResponse.device_id,
    timestamp,
    count: apiResponse.count || 0,
    readings: (apiResponse.readings || []).map(mapApiReadingToFrontend),
  };
}

/**
 * Mapeia DeviceHistoryResponse do backend para frontend.
 */
export function mapApiDeviceHistoryToFrontend(apiResponse: any): DeviceHistoryResponse {
  // A API retorna 'data', não 'series'
  const rawData = apiResponse.data || apiResponse.series || [];
  
  // Se a API retornou dados brutos (array de readings), precisamos agrupar por sensor
  let seriesData: any[] = [];
  
  if (rawData.length > 0 && !rawData[0].sensor_id) {
    // Já está no formato correto (array de series)
    seriesData = rawData;
  } else {
    // Dados brutos: agrupar por sensor_id
    const bySensor = rawData.reduce((acc: any, reading: any) => {
      const sensorId = reading.sensor_id;
      if (!sensorId) return acc;
      
      if (!acc[sensorId]) {
        acc[sensorId] = {
          sensor_id: sensorId,
          sensor_name: sensorId,
          sensor_type: 'unknown',
          unit: '',
          data: []
        };
      }
      
      acc[sensorId].data.push({
        timestamp: reading.ts || reading.bucket,
        value: reading.value || reading.avg_value || reading.min_value || reading.max_value
      });
      
      return acc;
    }, {});
    
    seriesData = Object.values(bySensor);
  }
  
  return {
    deviceId: apiResponse.device_id,
    period: {
      start: apiResponse.from || apiResponse.period?.start || '',
      end: apiResponse.to || apiResponse.period?.end || '',
    },
    aggregation: (apiResponse.interval || apiResponse.aggregation || 'raw') as AggregationLevel,
    series: seriesData.map(mapApiSensorTimeSeriesToFrontend),
  };
}

/**
 * Mapeia SensorSummary do backend para frontend.
 */
export function mapApiSensorSummaryToFrontend(apiSensor: any): SensorSummary {
  return {
    sensorId: apiSensor.sensor_id,
    sensorName: apiSensor.sensor_name || apiSensor.sensor_id,
    sensorType: apiSensor.sensor_type || 'unknown',
    unit: apiSensor.unit || '',
    isOnline: apiSensor.is_online ?? false,
    lastValue: apiSensor.last_value ?? null,
    lastReadingAt: apiSensor.last_reading ?? null, // Backend retorna 'last_reading', não 'last_reading_at'
    statistics24h: {
      avg: apiSensor.statistics_24h?.avg ?? null,
      min: apiSensor.statistics_24h?.min ?? null,
      max: apiSensor.statistics_24h?.max ?? null,
      count: apiSensor.statistics_24h?.count || 0,
      stddev: apiSensor.statistics_24h?.stddev ?? null,
    },
  };
}

/**
 * Mapeia DeviceSummaryResponse do backend para frontend.
 */
export function mapApiDeviceSummaryToFrontend(apiResponse: any): DeviceSummaryResponse {
  const statistics = apiResponse.statistics || {};
  const totalReadings24h = statistics.total_readings_24h ?? 0;
  const sensorsTotal =
    statistics.sensors_total ??
    statistics.sensor_count ??
    (Array.isArray(apiResponse.sensors) ? apiResponse.sensors.length : 0);
  const sensorsOnline =
    statistics.sensors_online ??
    (Array.isArray(apiResponse.sensors)
      ? apiResponse.sensors.filter((sensor: any) => sensor?.is_online).length
      : 0);
  const avgReadingsPerHour =
    statistics.avg_readings_per_hour ??
    (totalReadings24h ? Number((totalReadings24h / 24).toFixed(2)) : 0);

  return {
    deviceId: apiResponse.device_id,
    deviceName: apiResponse.device_name || apiResponse.device_id,
    status: (apiResponse.status || 'UNKNOWN') as DeviceStatus,
    lastSeen: apiResponse.last_seen ?? null,
    sensors: (apiResponse.sensors || []).map(mapApiSensorSummaryToFrontend),
    statistics: {
      totalReadings24h,
      avgReadingsPerHour,
      sensorsOnline,
      sensorsTotal,
    },
  };
}

/**
 * CONVERSÃO REVERSA (Frontend → Backend)
 * Usado para POST/PUT de readings customizados (se necessário no futuro).
 */

/**
 * Mapeia TelemetryReading do frontend para formato do backend.
 */
export function mapFrontendReadingToApi(reading: Partial<TelemetryReading>): any {
  return {
    device_id: reading.deviceId,
    sensor_id: reading.sensorId,
    value: reading.value,
    labels: mapFrontendLabelsToApi(reading.labels || {}),
    ts: reading.timestamp,
  };
}

/**
 * Mapeia labels do frontend para backend.
 * Converte camelCase para snake_case.
 */
export function mapFrontendLabelsToApi(labels: SensorLabels): any {
  const apiLabels: any = {};
  
  if (labels.sensorName) apiLabels.sensor_name = labels.sensorName;
  if (labels.sensorType) apiLabels.sensor_type = labels.sensorType;
  if (labels.unit) apiLabels.unit = labels.unit;
  if (labels.assetId) apiLabels.asset_id = labels.assetId;
  
  // Copiar outros campos mantendo o formato original
  Object.keys(labels).forEach(key => {
    if (!['sensorName', 'sensorType', 'unit', 'assetId'].includes(key)) {
      apiLabels[key] = labels[key];
    }
  });
  
  return apiLabels;
}

/**
 * HELPERS PARA VALIDAÇÃO
 */

/**
 * Valida se um reading do backend tem todos os campos obrigatórios.
 */
export function isValidApiReading(apiReading: any): boolean {
  return (
    apiReading &&
    typeof apiReading.id === 'number' &&
    typeof apiReading.device_id === 'string' &&
    typeof apiReading.sensor_id === 'string' &&
    typeof apiReading.value === 'number' &&
    typeof apiReading.ts === 'string'
  );
}

/**
 * Valida se uma série temporal tem dados válidos.
 */
export function isValidTimeSeries(series: SensorTimeSeries): boolean {
  return (
    series &&
    typeof series.sensorId === 'string' &&
    Array.isArray(series.data) &&
    series.data.every(point =>
      typeof point.timestamp === 'string' &&
      typeof point.count === 'number'
    )
  );
}

/**
 * Remove readings inválidos de um array.
 * Útil para sanitizar dados do backend antes de usar.
 */
export function sanitizeReadings(apiReadings: any[]): TelemetryReading[] {
  return apiReadings
    .filter(isValidApiReading)
    .map(mapApiReadingToFrontend);
}

/**
 * HELPERS PARA PROCESSAMENTO
 */

/**
 * Agrupa readings por sensor.
 * Útil para organizar dados de múltiplos sensores.
 */
export function groupReadingsBySensor(
  readings: TelemetryReading[]
): Record<string, TelemetryReading[]> {
  return readings.reduce((acc, reading) => {
    const sensorId = reading.sensorId;
    if (!acc[sensorId]) {
      acc[sensorId] = [];
    }
    acc[sensorId].push(reading);
    return acc;
  }, {} as Record<string, TelemetryReading[]>);
}

/**
 * Ordena readings por timestamp (mais recente primeiro).
 */
export function sortReadingsByTimestamp(
  readings: TelemetryReading[],
  descending: boolean = true
): TelemetryReading[] {
  return [...readings].sort((a, b) => {
    const timeA = new Date(a.timestamp).getTime();
    const timeB = new Date(b.timestamp).getTime();
    return descending ? timeB - timeA : timeA - timeB;
  });
}

/**
 * Filtra readings por intervalo de tempo.
 */
export function filterReadingsByTimeRange(
  readings: TelemetryReading[],
  start: Date,
  end: Date
): TelemetryReading[] {
  return readings.filter(reading => {
    const timestamp = new Date(reading.timestamp);
    return timestamp >= start && timestamp <= end;
  });
}

/**
 * Calcula estatísticas básicas de um array de readings.
 */
export function calculateReadingStats(readings: TelemetryReading[]): {
  avg: number | null;
  min: number | null;
  max: number | null;
  count: number;
} {
  if (readings.length === 0) {
    return { avg: null, min: null, max: null, count: 0 };
  }

  const values = readings.map(r => r.value);
  const sum = values.reduce((acc, val) => acc + val, 0);
  
  return {
    avg: sum / values.length,
    min: Math.min(...values),
    max: Math.max(...values),
    count: values.length,
  };
}

/**
 * EXPORT ALL
 */
export default {
  // Mappers API → Frontend
  mapApiReadingToFrontend,
  mapApiLabelsToFrontend,
  mapApiTimeSeriesPointToFrontend,
  mapApiSensorTimeSeriesToFrontend,
  mapApiLatestReadingsToFrontend,
  mapApiDeviceHistoryToFrontend,
  mapApiSensorSummaryToFrontend,
  mapApiDeviceSummaryToFrontend,
  
  // Mappers Frontend → API
  mapFrontendReadingToApi,
  mapFrontendLabelsToApi,
  
  // Validação
  isValidApiReading,
  isValidTimeSeries,
  sanitizeReadings,
  
  // Processamento
  groupReadingsBySensor,
  sortReadingsByTimestamp,
  filterReadingsByTimeRange,
  calculateReadingStats,
};
