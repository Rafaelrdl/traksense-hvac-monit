export type EquipmentType =
  | 'CHILLER'
  | 'AHU'            // Unidade de Tratamento de Ar
  | 'FAN_COIL'
  | 'PUMP'
  | 'BOILER'
  | 'COOLING_TOWER'
  | 'VRF'
  | 'RTU'
  | 'VALVE'
  | 'SENSOR'
  | 'CONTROLLER'
  | 'FILTER'
  | 'DUCT'
  | 'METER'
  | 'OTHER';

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
    brand?: string; // Marca
    model?: string; // Modelo
    serialNumber?: string; // Número de Série
    equipmentType?: EquipmentType; // Novo tipo expandido
    equipmentTypeOther?: string; // Texto livre quando type === 'OTHER'
  };
  // Informações de Localização
  company?: string; // Empresa
  sector?: string; // Setor
  subsector?: string; // Subsetor
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
  | 'subcooling'
  | 'vibration'
  | 'noise'
  | 'compressor_state'
  | 'valve_position'
  | 'cop'
  | 'eer'
  | 'maintenance'
  | 'maintenance_reminder';

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
  sensorValue?: number;
  sensorUnit?: string;
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
    loadIncrease?: number; // multiplier
    efficiencyDecrease?: number; // multiplier
    airflowReduction?: number; // multiplier
    powerIncrease?: number; // multiplier
    superheatIncrease?: number; // multiplier
    subcoolingDecrease?: number; // multiplier
    bearingWear?: boolean;
    vibrationIncrease?: number; // multiplier
    airflowDecrease?: number; // multiplier
    noiseIncrease?: number; // multiplier
    voltageFluctuation?: boolean;
    currentIncrease?: number; // multiplier
    maintenanceOverdue?: boolean;
    generalDegradation?: number; // multiplier
    alertFrequencyIncrease?: number; // multiplier
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

export interface MaintenanceTask {
  id: string;
  assetId: string;
  assetTag: string;
  type: 'preventive' | 'corrective' | 'predictive' | 'emergency';
  category: 'filter' | 'cleaning' | 'calibration' | 'inspection' | 'repair' | 'replacement' | 'lubrication' | 'electrical' | 'refrigerant';
  title: string;
  description: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'overdue';
  scheduledDate: Date;
  estimatedDuration: number; // minutes
  assignedTo?: string;
  assignedTeam?: string;
  completedDate?: Date;
  completedBy?: string;
  notes?: string;
  cost?: number;
  partsUsed?: MaintenancePart[];
  nextMaintenanceDate?: Date;
  recurring: boolean;
  recurringInterval?: number; // days
  recurringType?: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually' | 'operating_hours';
  operatingHoursInterval?: number; // for operating hours based maintenance
  createdDate: Date;
  createdBy: string;
}

export interface MaintenancePart {
  id: string;
  name: string;
  partNumber?: string;
  quantity: number;
  unitCost?: number;
  supplier?: string;
}

export interface MaintenanceSchedule {
  id: string;
  assetId?: string;
  assetTag?: string;
  type: MaintenanceTask['category'];
  title: string;
  description: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually' | 'operating_hours';
  interval: number; // days or hours depending on frequency
  duration: number; // minutes (renamed from estimatedDuration)
  priority: MaintenanceTask['priority'];
  enabled?: boolean;
  lastExecuted?: Date;
  nextDue?: Date;
  assignedTeam?: string;
  instructions?: string;
  parts?: MaintenancePart[]; // renamed from requiredParts
  tools?: string[]; // renamed from requiredTools
  safety?: string[]; // renamed from safetyRequirements
}

export interface MaintenanceHistory {
  id: string;
  taskId: string;
  assetId: string;
  assetTag: string;
  type: MaintenanceTask['type'];
  category: MaintenanceTask['category'];
  title: string;
  completedDate: Date;
  completedBy: string;
  duration: number; // actual minutes taken
  cost: number;
  partsUsed: MaintenancePart[];
  notes: string;
  beforeHealthScore?: number;
  afterHealthScore?: number;
  findings?: string[];
  recommendations?: string[];
}