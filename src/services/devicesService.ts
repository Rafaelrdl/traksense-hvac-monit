/**
 * Service para gerenciar Devices (dispositivos IoT)
 * 
 * Devices representam os dispositivos físicos instalados nos ativos
 * (ex: Gateways, Controladores, Sensores, etc.)
 * 
 * Endpoints disponíveis:
 * - GET /api/sites/{id}/devices/ - Lista devices de um site
 * - GET /api/devices/ - Lista todos os devices
 * - GET /api/devices/{id}/ - Detalhes de um device
 * - GET /api/sites/{id}/devices/summary/ - Lista devices com variáveis agrupadas
 * - GET /api/devices/{id}/summary/ - Device com variáveis agrupadas
 */

import { api } from '@/lib/api';
import { DeviceSummary } from '@/types/device';

const normalizeDevice = (device: any): Device => {
  const status = (device.status ?? '').toString();
  const boolStatus = typeof device.is_online === 'boolean'
    ? device.is_online
    : status.toUpperCase() === 'ONLINE';

  const asset =
    typeof device.asset === 'object' && device.asset !== null
      ? device.asset
      : device.asset
        ? {
            id: device.asset,
            name: device.asset_name ?? undefined,
            tag: device.asset_tag ?? undefined,
          }
        : undefined;

  return {
    id: device.id,
    name: device.name,
    serial_number: device.serial_number,
    mqtt_client_id: device.mqtt_client_id,
    device_type: device.device_type,
    status,
    is_online: boolStatus,
    firmware_version: device.firmware_version,
    last_seen: device.last_seen,
    asset,
    created_at: device.created_at,
    updated_at: device.updated_at,
  };
};

export interface Device {
  id: number;
  name: string;
  serial_number: string;
  mqtt_client_id: string;
  device_type: string;
  status: string;
  is_online: boolean;
  firmware_version?: string;
  last_seen?: string;
  asset?: {
    id: number;
    name: string;
    tag: string;
  };
  created_at: string;
  updated_at: string;
}

export interface DeviceFilters {
  device_type?: string;
  status?: string;
  is_online?: boolean;
  asset?: number;
}

export const devicesService = {
  /**
   * Lista devices de um site específico
   * 
   * @param siteId - ID do site
   * @param filters - Filtros opcionais (device_type, status, is_online)
   * @returns Lista de devices do site
   * 
   * @example
   * ```ts
   * // Listar todos os devices de um site
   * const devices = await devicesService.listBySite(1);
   * 
   * // Filtrar por tipo
   * const gateways = await devicesService.listBySite(1, { device_type: 'GATEWAY' });
   * 
   * // Filtrar por status online
   * const onlineDevices = await devicesService.listBySite(1, { is_online: true });
   * ```
   */
  async listBySite(siteId: number, filters?: DeviceFilters): Promise<Device[]> {
    const response = await api.get<any>(`/sites/${siteId}/devices/`, { 
      params: filters 
    });
    const payload = Array.isArray(response.data)
      ? response.data
      : Array.isArray(response.data?.results)
        ? response.data.results
        : [];
    return payload.map(normalizeDevice);
  },

  /**
   * Lista todos os devices com filtros
   * 
   * @param filters - Filtros opcionais
   * @returns Lista de devices
   * 
   * @example
   * ```ts
   * // Listar todos os devices
   * const devices = await devicesService.getAll();
   * 
   * // Filtrar por asset
   * const assetDevices = await devicesService.getAll({ asset: 1 });
   * ```
   */
  async getAll(filters?: DeviceFilters): Promise<Device[]> {
    const response = await api.get<any>('/devices/', { 
      params: filters 
    });
    const payload = Array.isArray(response.data)
      ? response.data
      : Array.isArray(response.data?.results)
        ? response.data.results
        : [];
    return payload.map(normalizeDevice);
  },

  /**
   * Busca um device específico por ID
   * 
   * @param id - ID do device
   * @returns Device completo com todas as informações
   * 
   * @example
   * ```ts
   * const device = await devicesService.getById(1);
   * console.log(device.mqtt_client_id);
   * ```
   */
  async getById(id: number): Promise<Device> {
    const response = await api.get<any>(`/devices/${id}/`);
    return normalizeDevice(response.data);
  },

  /**
   * Busca devices por tipo
   * 
   * @param deviceType - Tipo do device (GATEWAY, CONTROLLER, etc)
   * @returns Lista de devices do tipo especificado
   * 
   * @example
   * ```ts
   * const gateways = await devicesService.getByType('GATEWAY');
   * ```
   */
  async getByType(deviceType: string): Promise<Device[]> {
    return this.getAll({ device_type: deviceType });
  },

  /**
   * Busca devices online
   * 
   * @returns Lista de devices online
   * 
   * @example
   * ```ts
   * const onlineDevices = await devicesService.getOnline();
   * ```
   */
  async getOnline(): Promise<Device[]> {
    return this.getAll({ is_online: true });
  },

  /**
   * Lista devices de um site com variáveis agrupadas (Device Summary)
   * 
   * Retorna devices com todas as variáveis (sensores) agrupadas,
   * incluindo contagem de variáveis online/offline e informações do asset.
   * 
   * @param siteId - ID do site
   * @param filters - Filtros opcionais (device_type, status)
   * @returns Lista de devices com variáveis agrupadas
   * 
   * @example
   * ```ts
   * // Listar todos os devices de um site com suas variáveis
   * const devicesSummary = await devicesService.getSummaryBySite(1);
   * 
   * // Filtrar por tipo
   * const gateways = await devicesService.getSummaryBySite(1, { device_type: 'GATEWAY' });
   * 
   * // Filtrar por status
   * const onlineDevices = await devicesService.getSummaryBySite(1, { status: 'ONLINE' });
   * ```
   */
  async getSummaryBySite(siteId: number, filters?: DeviceFilters): Promise<DeviceSummary[]> {
    const response = await api.get<DeviceSummary[]>(`/sites/${siteId}/devices/summary/`, {
      params: filters,
    });
    return response.data;
  },

  /**
   * Busca um device específico com variáveis agrupadas (Device Summary)
   * 
   * Retorna device com todas as variáveis (sensores) agrupadas,
   * incluindo contagem de variáveis online/offline e informações do asset.
   * 
   * @param deviceId - ID do device
   * @returns Device com variáveis agrupadas
   * 
   * @example
   * ```ts
   * const deviceSummary = await devicesService.getSummaryById(8);
   * console.log(deviceSummary.variables); // Lista de variáveis
   * console.log(deviceSummary.online_variables_count); // Quantas online
   * ```
   */
  async getSummaryById(deviceId: number): Promise<DeviceSummary> {
    const response = await api.get<DeviceSummary>(`/devices/${deviceId}/summary/`);
    return response.data;
  },
};
