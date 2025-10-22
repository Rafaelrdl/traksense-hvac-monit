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
 */

import { api } from '@/lib/api';

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
    const response = await api.get<Device[]>(`/sites/${siteId}/devices/`, { 
      params: filters 
    });
    return response.data;
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
    const response = await api.get<Device[]>('/devices/', { 
      params: filters 
    });
    return response.data;
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
    const response = await api.get<Device>(`/devices/${id}/`);
    return response.data;
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
};
