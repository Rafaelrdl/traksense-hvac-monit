/**
 * Telemetry Types - FASE 3
 * 
 * Tipos TypeScript para dados de telemetria real.
 * Mapeamento dos modelos Django Reading e agregações TimescaleDB.
 */

/**
 * Leitura individual de um sensor (raw data).
 * Corresponde ao modelo Reading do backend.
 */
export interface TelemetryReading {
  id: number;
  deviceId: string; // device_id no backend
  sensorId: string; // sensor_id no backend
  value: number;
  labels: SensorLabels;
  timestamp: string; // ts no backend (ISO 8601)
  createdAt: string; // created_at no backend
}

/**
 * Labels/metadata de um sensor.
 * Armazenado no campo JSONB "labels" do Reading.
 */
export interface SensorLabels {
  sensorName?: string; // Nome/tag do sensor
  sensorType?: string; // Tipo (temp_supply, power_kw, etc.)
  unit?: string; // Unidade de medida (°C, kW, Pa, etc.)
  assetId?: string; // ID do ativo relacionado
  [key: string]: string | undefined; // Permite outros campos customizados
}

/**
 * Ponto de série temporal agregado.
 * Retornado pelas views de histórico com agregação automática.
 */
export interface TimeSeriesPoint {
  timestamp: string; // Bucket timestamp (ISO 8601)
  avg: number | null; // Valor médio no bucket
  min: number | null; // Valor mínimo no bucket
  max: number | null; // Valor máximo no bucket
  count: number; // Quantidade de leituras no bucket
  stddev?: number | null; // Desvio padrão (opcional)
}

/**
 * Série temporal completa de um sensor.
 * Estrutura retornada pelo endpoint history/<device_id>/
 */
export interface SensorTimeSeries {
  sensorId: string;
  sensorName: string;
  sensorType: string;
  unit: string;
  data: TimeSeriesPoint[]; // Array de pontos temporais
}

/**
 * Resposta do endpoint /latest/<device_id>/
 * Lista de últimas leituras por sensor.
 */
export interface LatestReadingsResponse {
  deviceId: string;
  timestamp: string; // Timestamp da consulta
  count: number; // Número de sensores
  readings: TelemetryReading[];
}

/**
 * Resposta do endpoint /history/<device_id>/
 * Histórico temporal com agregação automática.
 */
export interface DeviceHistoryResponse {
  deviceId: string;
  period: {
    start: string; // ISO 8601
    end: string; // ISO 8601
  };
  aggregation: AggregationLevel;
  series: SensorTimeSeries[]; // Uma série por sensor
}

/**
 * Resposta do endpoint /device/<device_id>/summary/
 * Resumo completo do device com status e estatísticas.
 */
export interface DeviceSummaryResponse {
  deviceId: string;
  deviceName: string;
  status: DeviceStatus;
  lastSeen: string | null; // ISO 8601
  sensors: SensorSummary[];
  statistics: {
    totalReadings24h: number;
    avgReadingsPerHour: number;
    sensorsOnline: number;
    sensorsTotal: number;
  };
}

/**
 * Resumo de um sensor individual.
 * Parte do DeviceSummaryResponse.
 */
export interface SensorSummary {
  sensorId: string;
  sensorName: string;
  sensorType: string;
  unit: string;
  isOnline: boolean;
  lastValue: number | null;
  lastReadingAt: string | null; // ISO 8601
  statistics24h: {
    avg: number | null;
    min: number | null;
    max: number | null;
    count: number;
    stddev?: number | null;
  };
}

/**
 * Status de conectividade do device.
 */
export type DeviceStatus = 'ONLINE' | 'OFFLINE' | 'UNKNOWN';

/**
 * Níveis de agregação disponíveis.
 * Backend escolhe automaticamente baseado no range temporal.
 */
export type AggregationLevel = 'raw' | '1m' | '5m' | '1h';

/**
 * Parâmetros para consulta de histórico.
 * Usados pelo telemetryService.getHistory()
 */
export interface HistoryQueryParams {
  deviceId: string;
  // Parâmetros exatos esperados pelo backend: 'from' e 'to' em ISO-8601
  from?: string; // ISO 8601
  to?: string; // ISO 8601
  sensorId?: string | string[]; // 🆕 Suportar múltiplos sensores (array ou string única)
  // O backend espera 'interval' para forçar agregação (ex: '1m','5m','1h').
  interval?: AggregationLevel; // Forçar agregação (opcional)
}

/**
 * Metadata de sensor para UI (complementar ao backend).
 * Usado para configuração de visualização.
 */
export interface SensorMetadata {
  sensorType: string;
  displayName: string;
  unit: string;
  icon: string; // Nome do ícone (Phosphor)
  color: string; // Cor HEX para gráficos
  thresholds?: {
    min?: number;
    max?: number;
    warning?: number;
    critical?: number;
  };
}

/**
 * Mapeamento de tipos de sensores para metadata de visualização.
 * Complementa os dados do backend com informações de UI.
 */
export const SENSOR_METADATA: Record<string, SensorMetadata> = {
  // Temperatura
  temp_supply: {
    sensorType: 'temp_supply',
    displayName: 'Temperatura de Suprimento',
    unit: '°C',
    icon: 'Thermometer',
    color: '#3b82f6', // blue-500
  },
  temp_return: {
    sensorType: 'temp_return',
    displayName: 'Temperatura de Retorno',
    unit: '°C',
    icon: 'ThermometerCold',
    color: '#06b6d4', // cyan-500
  },
  temp_external: {
    sensorType: 'temp_external',
    displayName: 'Temperatura Externa',
    unit: '°C',
    icon: 'Sun',
    color: '#f59e0b', // amber-500
  },
  
  // Umidade
  humidity: {
    sensorType: 'humidity',
    displayName: 'Umidade Relativa',
    unit: '%',
    icon: 'Drop',
    color: '#0ea5e9', // sky-500
  },
  
  // Pressão
  pressure_suction: {
    sensorType: 'pressure_suction',
    displayName: 'Pressão de Sucção',
    unit: 'Pa',
    icon: 'ArrowDown',
    color: '#8b5cf6', // violet-500
  },
  pressure_discharge: {
    sensorType: 'pressure_discharge',
    displayName: 'Pressão de Descarga',
    unit: 'Pa',
    icon: 'ArrowUp',
    color: '#a855f7', // purple-500
  },
  
  // Elétrico
  power_kw: {
    sensorType: 'power_kw',
    displayName: 'Potência Ativa',
    unit: 'kW',
    icon: 'Lightning',
    color: '#eab308', // yellow-500
  },
  voltage: {
    sensorType: 'voltage',
    displayName: 'Tensão',
    unit: 'V',
    icon: 'BatteryCharging',
    color: '#84cc16', // lime-500
  },
  current: {
    sensorType: 'current',
    displayName: 'Corrente',
    unit: 'A',
    icon: 'ArrowsClockwise',
    color: '#22c55e', // green-500
  },
  energy_kwh: {
    sensorType: 'energy_kwh',
    displayName: 'Energia Acumulada',
    unit: 'kWh',
    icon: 'ChartLine',
    color: '#14b8a6', // teal-500
  },
  
  // Fluxo
  airflow: {
    sensorType: 'airflow',
    displayName: 'Vazão de Ar',
    unit: 'm³/h',
    icon: 'Wind',
    color: '#06b6d4', // cyan-500
  },
  
  // Rotação
  rpm_fan: {
    sensorType: 'rpm_fan',
    displayName: 'Rotação do Ventilador',
    unit: 'RPM',
    icon: 'Fan',
    color: '#6366f1', // indigo-500
  },
};

/**
 * Helper para obter metadata de um sensor.
 * Retorna metadata padrão se tipo não existir.
 */
export function getSensorMetadata(sensorType: string | null | undefined): SensorMetadata {
  // Validação defensiva
  if (!sensorType || typeof sensorType !== 'string') {
    return {
      sensorType: 'unknown',
      displayName: 'UNKNOWN',
      unit: '',
      icon: 'CircleDashed',
      color: '#64748b', // slate-500
    };
  }
  
  return SENSOR_METADATA[sensorType] || {
    sensorType,
    displayName: sensorType.replace(/_/g, ' ').toUpperCase(),
    unit: '',
    icon: 'CircleDashed',
    color: '#64748b', // slate-500
  };
}

/**
 * Helper para formatar valor de sensor com unidade.
 */
export function formatSensorValue(
  value: number | null,
  unit: string,
  decimals: number = 1
): string {
  if (value === null || value === undefined) {
    return '--';
  }
  return `${value.toFixed(decimals)}${unit ? ' ' + unit : ''}`;
}

/**
 * Helper para determinar se um sensor está online.
 * Considera online se última leitura < 60 minutos (1 hora).
 * 
 * IMPORTANTE: Deve estar alinhado com a regra do backend (1 hora).
 */
export function isSensorOnline(lastReadingAt: string | null | undefined): boolean {
  if (!lastReadingAt || typeof lastReadingAt !== 'string') return false;
  
  try {
    const lastReading = new Date(lastReadingAt);
    
    // Validar se data é válida
    if (isNaN(lastReading.getTime())) return false;
    
    const now = new Date();
    const diffMinutes = (now.getTime() - lastReading.getTime()) / (1000 * 60);
    
    return diffMinutes < 60; // Online se leitura < 60 minutos (1 hora)
  } catch (error) {
    console.warn('Erro ao validar lastReadingAt:', lastReadingAt, error);
    return false;
  }
}

/**
 * Helper para obter cor do status do sensor.
 */
export function getSensorStatusColor(
  isOnline: boolean,
  value: number | null,
  metadata: SensorMetadata
): string {
  if (!isOnline) return '#ef4444'; // red-500 (offline)
  if (value === null) return '#94a3b8'; // slate-400 (no data)
  
  const thresholds = metadata.thresholds;
  if (!thresholds) return '#22c55e'; // green-500 (normal)
  
  // Verificar limites críticos
  if (thresholds.critical !== undefined && value >= thresholds.critical) {
    return '#dc2626'; // red-600 (critical high)
  }
  if (thresholds.min !== undefined && value <= thresholds.min) {
    return '#dc2626'; // red-600 (critical low)
  }
  
  // Verificar warnings
  if (thresholds.warning !== undefined && value >= thresholds.warning) {
    return '#f59e0b'; // amber-500 (warning)
  }
  
  return '#22c55e'; // green-500 (normal)
}
