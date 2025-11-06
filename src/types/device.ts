/**
 * Device Summary Types
 * 
 * Types for device grouping with variables (sensors)
 * Used in SensorsPage to display devices with expandable variables
 */

export interface SensorVariable {
  id: number;
  tag: string;
  name: string;
  metric_type: string;
  unit: string;
  last_value: number | null;
  last_reading_at: string | null;
  is_online: boolean;
}

export interface AssetInfo {
  id: number;
  tag: string;
  name: string;
  site_name: string;
}

export interface DeviceSummary {
  id: number;
  name: string;
  serial_number: string;
  mqtt_client_id: string;
  device_type: string;
  status: 'ONLINE' | 'OFFLINE';
  firmware_version: string | null;
  last_seen: string;
  asset_info: AssetInfo;
  variables: SensorVariable[];
  total_variables_count: number;
  online_variables_count: number;
  device_status: 'ONLINE' | 'OFFLINE';
  created_at: string;
  updated_at: string;
}

export type DeviceStatusFilter = 'all' | 'online' | 'offline';
