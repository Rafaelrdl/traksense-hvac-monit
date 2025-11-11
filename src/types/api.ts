/**
 * Tipos de resposta da API Django REST Framework
 * 
 * Este arquivo contém as interfaces TypeScript que correspondem
 * aos modelos Django e respostas da API REST implementada na FASE 2.
 */

/**
 * Resposta paginada padrão do Django REST Framework
 */
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

/**
 * Site (localização física dos equipamentos)
 * Corresponde ao model Site em apps/assets/models.py
 */
export interface ApiSite {
  id: number;
  name: string;
  full_name: string;
  company: string;
  sector: string;
  subsector: string;
  address: string;
  latitude: string | null;
  longitude: string | null;
  timezone: string;
  asset_count: number;
  created_at: string;
  updated_at: string;
}

/**
 * Asset (equipamento HVAC)
 * Corresponde ao model Asset em apps/assets/models.py
 */
export interface ApiAsset {
  id: number;
  tag: string;
  name: string;
  site: number;
  site_name: string;
  full_location: string;
  asset_type: 
    | 'AHU' 
    | 'CHILLER' 
    | 'VRF' 
    | 'RTU' 
    | 'BOILER' 
    | 'COOLING_TOWER'
    | 'FAN_COIL'
    | 'PUMP'
    | 'AHU_COMPACTO'
    | 'SPLIT'
    | 'VAV'
    | 'HEAT_EXCHANGER'
    | 'DAMPER'
    | 'HUMIDIFIER'
    | 'DEHUMIDIFIER';
  asset_type_other: string | null;
  manufacturer: string;
  model: string;
  serial_number: string;
  location_description: string;
  installation_date: string | null;
  last_maintenance: string | null;
  status: 'OK' | 'MAINTENANCE' | 'STOPPED' | 'ALERT';
  health_score: number;
  specifications: Record<string, any>;
  device_count: number;
  sensor_count: number;
  created_at: string;
  updated_at: string;
}

/**
 * Device (dispositivo IoT conectado ao equipamento)
 * Corresponde ao model Device em apps/assets/models.py
 */
export interface ApiDevice {
  id: number;
  name: string;
  display_name?: string;  // Nome curto para exibição (sufixo do serial)
  serial_number: string;
  asset: number;
  asset_tag: string;
  device_type: string;
  mqtt_client_id: string;
  status: 'ONLINE' | 'OFFLINE' | 'ERROR' | 'MAINTENANCE';
  firmware_version: string;
  last_seen: string | null;
  sensor_count: number;
  created_at: string;
  updated_at: string;
}

/**
 * Sensor (sensor físico conectado ao dispositivo)
 * Corresponde ao model Sensor em apps/assets/models.py
 */
export interface ApiSensor {
  id: number;
  tag: string;
  device: number;
  device_name: string;
  device_display_name?: string;  // Nome curto do device (sufixo)
  device_serial: string;
  device_mqtt_client_id: string;
  asset_tag: string;
  asset_name: string;
  site_name: string;
  metric_type: string;
  unit: string;
  thresholds: Record<string, any>;
  is_online: boolean;
  last_value: number | null;
  last_reading_at: string | null;
  availability: number | null;
  created_at: string;
  updated_at: string;
}

/**
 * Parâmetros de filtro para listagem de Assets
 */
export interface AssetFilters {
  site?: number;
  asset_type?: string;
  status?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

/**
 * Parâmetros de filtro para listagem de Sites
 */
export interface SiteFilters {
  company?: string;
  sector?: string;
  timezone?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

/**
 * Parâmetros de filtro para listagem de Devices
 */
export interface DeviceFilters {
  asset?: number;
  device_type?: string;
  status?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

/**
 * Parâmetros de filtro para listagem de Sensors
 */
export interface SensorFilters {
  device?: number;
  metric_type?: string;
  is_online?: boolean;
  search?: string;
  limit?: number;
  offset?: number;
}
