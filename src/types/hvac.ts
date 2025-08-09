export interface HVACAsset {
  id: string;
  tag: string;
  type: 'AHU' | 'Chiller' | 'VRF' | 'RTU' | 'Boiler' | 'CoolingTower';
  location: string;
  healthScore: number; // 0-100
  powerConsumption: number; // kWh/day
  status: 'OK' | 'Maintenance' | 'Stopped' | 'Alert';
  operatingHours: number;
  lastMaintenance: Date;
  specifications: {
    capacity?: number; // tons or kW
    voltage?: number;
    maxCurrent?: number;
    refrigerant?: string;
  };
}

export interface SensorReading {
  timestamp: Date;
  value: number;
  quality: 'good' | 'uncertain' | 'bad';
}

export interface Sensor {
  id: string;
  tag: string;
  assetId: string;
  type: SensorType;
  unit: string;
  location: string;
  online: boolean;
  lastReading: SensorReading | null;
  availability: number; // percentage
  min?: number;
  max?: number;
  setpoint?: number;
}

export type SensorType = 
  | 'temp_supply'
  | 'temp_return' 
  | 'temp_external'
  | 'temp_setpoint'
  | 'humidity'
  | 'dewpoint'
  | 'pressure_suction'
  | 'pressure_discharge'
  | 'dp_filter'
  | 'dp_fan'
  | 'airflow'
  | 'rpm_fan'
  | 'voltage'
  | 'current'
  | 'power_kw'
  | 'energy_kwh'
  | 'power_factor'
  | 'superheat'
  | 'subcool'
  | 'vibration'
  | 'noise'
  | 'compressor_state'
  | 'valve_position';

export interface TelemetryPoint {
  sensorId: string;
  timestamp: Date;
  value: number;
  quality: 'good' | 'uncertain' | 'bad';
}

export interface Alert {
  id: string;
  assetId: string;
  assetTag: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  type: string;
  message: string;
  timestamp: Date;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
  resolved: boolean;
  resolvedAt?: Date;
  ruleName: string;
}

export interface AlertRule {
  id: string;
  name: string;
  sensorType: SensorType;
  condition: 'greater_than' | 'less_than' | 'equals' | 'not_equals' | 'range_outside';
  threshold: number;
  thresholdMax?: number; // for range conditions
  duration: number; // minutes
  severity: Alert['severity'];
  enabled: boolean;
  assetTypes: HVACAsset['type'][];
}

export interface KPI {
  label: string;
  value: number;
  unit?: string;
  change?: number; // percentage change
  changeLabel?: string;
  status: 'good' | 'warning' | 'critical';
}

export interface TimeSeriesData {
  sensorId: string;
  sensorType: SensorType;
  unit: string;
  data: Array<{
    timestamp: Date;
    value: number;
  }>;
}

export interface SimulationScenario {
  id: string;
  name: string;
  description: string;
  active: boolean;
  parameters: {
    externalTemp?: number; // deviation from normal
    filterClogging?: number; // 0-1 factor
    refrigerantLeak?: boolean;
    fanFailure?: boolean;
    compressorEfficiency?: number; // 0-1 factor
  };
}

export interface PerformanceMetrics {
  eer?: number; // Energy Efficiency Ratio
  cop?: number; // Coefficient of Performance
  kwhPerTon?: number;
  loadFactor?: number; // 0-1
  thermalLoad?: number; // estimated kW
}

export type Unit = '°C' | '°F' | '%' | 'kPa' | 'Pa' | 'm³/h' | 'RPM' | 'V' | 'A' | 'kW' | 'kWh' | 'K' | 'mm/s' | 'dB' | '-';

export interface ChartThreshold {
  value: number;
  label: string;
  color: string;
  type: 'min' | 'max' | 'target' | 'warning' | 'critical';
}