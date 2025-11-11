/**
 * Service para gerenciar Assets (equipamentos HVAC)
 * 
 * Este service se conecta à API REST Django implementada na FASE 2
 * e fornece métodos para CRUD de equipamentos HVAC.
 * 
 * Endpoints disponíveis:
 * - GET/POST   /api/assets/
 * - GET/PATCH/DELETE /api/assets/{id}/
 * - GET /api/assets/{id}/devices/
 * - GET /api/assets/{id}/sensors/
 * 
 * 🔧 PAGINATION FIX: Uses DRF page/page_size instead of limit/offset
 */

import { api } from '@/lib/api';
import type { 
  ApiAsset, 
  ApiDevice, 
  ApiSensor,
  PaginatedResponse, 
  AssetFilters 
} from '@/types/api';

/**
 * Helper function to fetch all paginated results by following 'next' links
 * 🔧 PERFORMANCE: Follows DRF pagination 'next' links to get complete data
 */
async function fetchAllPages<T>(
  endpoint: string, 
  params?: Record<string, any>
): Promise<T[]> {
  const allResults: T[] = [];
  let nextUrl: string | null = endpoint;
  
  // Convert params to use page/page_size (DRF standard) instead of limit/offset
  const drfParams = { ...params };
  if ('limit' in drfParams) {
    drfParams.page_size = drfParams.limit;
    delete drfParams.limit;
  }
  if ('offset' in drfParams) {
    delete drfParams.offset; // DRF uses 'page' parameter instead
  }
  
  while (nextUrl) {
    const response = await api.get<PaginatedResponse<T>>(nextUrl, {
      params: nextUrl === endpoint ? drfParams : undefined // Only send params on first request
    });
    
    allResults.push(...response.data.results);
    nextUrl = response.data.next;
  }
  
  return allResults;
}

export const assetsService = {
  /**
   * Lista todos os assets com paginação e filtros
   * 
   * @param params - Filtros opcionais (site, asset_type, status, search, page_size)
   * @returns Resposta paginada com lista de assets
   * 
   * @example
   * ```ts
   * // Listar todos os assets
   * const response = await assetsService.getAll();
   * 
   * // Filtrar por tipo
   * const ahus = await assetsService.getAll({ asset_type: 'AHU' });
   * 
   * // Buscar por tag
   * const search = await assetsService.getAll({ search: 'AHU-001' });
   * ```
   */
  async getAll(params?: AssetFilters): Promise<PaginatedResponse<ApiAsset>> {
    // 🔧 FIX: Convert limit/offset to page_size for DRF compatibility
    const drfParams: Record<string, any> = { ...params };
    if (params?.limit) {
      drfParams.page_size = params.limit;
      delete drfParams.limit;
    }
    if (params?.offset) {
      delete drfParams.offset;
    }
    
    const response = await api.get<PaginatedResponse<ApiAsset>>('/assets/', { 
      params: drfParams
    });
    return response.data;
  },

  /**
   * Fetch ALL assets across all pages (follows 'next' links)
   * Use this when you need the complete dataset, not just first page
   * 
   * @param params - Filtros opcionais (site, asset_type, status, search)
   * @returns Array completo de todos os assets
   */
  async getAllComplete(params?: AssetFilters): Promise<ApiAsset[]> {
    return fetchAllPages<ApiAsset>('/assets/', params);
  },

  /**
   * Busca um asset específico por ID
   * 
   * @param id - ID do asset
   * @returns Asset completo com todas as informações
   * 
   * @example
   * ```ts
   * const asset = await assetsService.getById(3);
   * console.log(asset.tag); // "AHU-001-ONCO"
   * ```
   */
  async getById(id: number): Promise<ApiAsset> {
    const response = await api.get<ApiAsset>(`/assets/${id}/`);
    return response.data;
  },

  /**
   * Cria um novo asset
   * 
   * @param data - Dados do asset a ser criado
   * @returns Asset criado com ID gerado
   * 
   * @example
   * ```ts
   * const newAsset = await assetsService.create({
   *   tag: 'AHU-008-ONCO',
   *   name: 'Fan Coil Sala 8',
   *   site: 1,
   *   asset_type: 'AHU',
   *   manufacturer: 'Carrier',
   *   model: 'Model X',
   *   serial_number: 'SN12345',
   *   status: 'OK',
   *   health_score: 100,
   * });
   * ```
   */
  async create(data: Partial<ApiAsset>): Promise<ApiAsset> {
    const response = await api.post<ApiAsset>('/assets/', data);
    return response.data;
  },

  /**
   * Atualiza um asset parcialmente (PATCH)
   * 
   * @param id - ID do asset a ser atualizado
   * @param data - Campos a serem atualizados
   * @returns Asset atualizado
   * 
   * @example
   * ```ts
   * // Atualizar apenas o status
   * await assetsService.update(3, { status: 'MAINTENANCE' });
   * 
   * // Atualizar health score
   * await assetsService.update(3, { health_score: 85 });
   * ```
   */
  async update(id: number, data: Partial<ApiAsset>): Promise<ApiAsset> {
    const response = await api.patch<ApiAsset>(`/assets/${id}/`, data);
    return response.data;
  },

  /**
   * Deleta um asset permanentemente
   * 
   * @param id - ID do asset a ser deletado
   * 
   * @example
   * ```ts
   * await assetsService.delete(3);
   * ```
   */
  async delete(id: number): Promise<void> {
    await api.delete(`/assets/${id}/`);
  },

  /**
   * Lista todos os devices (dispositivos IoT) de um asset
   * 
   * @param assetId - ID do asset
   * @returns Lista de devices conectados ao asset
   * 
   * @example
   * ```ts
   * const devices = await assetsService.getDevices(3);
   * console.log(devices.length); // 2
   * ```
   */
  async getDevices(assetId: number): Promise<ApiDevice[]> {
    const response = await api.get<ApiDevice[]>(`/assets/${assetId}/devices/`);
    return response.data;
  },

  /**
   * Lista todos os sensors de um asset
   * 
   * @param assetId - ID do asset
   * @returns Lista de sensors conectados ao asset
   * 
   * @example
   * ```ts
   * const sensors = await assetsService.getSensors(3);
   * console.log(sensors.length); // 8
   * ```
   */
  async getSensors(assetId: number): Promise<ApiSensor[]> {
    const response = await api.get<ApiSensor[]>(`/assets/${assetId}/sensors/`);
    return response.data;
  },

  /**
   * Busca assets por múltiplos filtros
   * 
   * @param filters - Objeto com múltiplos filtros
   * @returns Assets filtrados
   * 
   * @example
   * ```ts
   * // Buscar AHUs em manutenção
   * const assets = await assetsService.search({
   *   asset_type: 'AHU',
   *   status: 'MAINTENANCE'
   * });
   * ```
   */
  async search(filters: AssetFilters): Promise<PaginatedResponse<ApiAsset>> {
    return this.getAll(filters);
  },

  /**
   * Busca assets de um site específico
   * 
   * @param siteId - ID do site
   * @returns Assets do site
   * 
   * @example
   * ```ts
   * const siteAssets = await assetsService.getBySite(1);
   * ```
   */
  async getBySite(siteId: number): Promise<PaginatedResponse<ApiAsset>> {
    return this.getAll({ site: siteId });
  },

  /**
   * Busca assets por tipo
   * 
   * @param assetType - Tipo do asset (AHU, CHILLER, etc.)
   * @returns Assets do tipo especificado
   * 
   * @example
   * ```ts
   * const chillers = await assetsService.getByType('CHILLER');
   * ```
   */
  async getByType(assetType: string): Promise<PaginatedResponse<ApiAsset>> {
    return this.getAll({ asset_type: assetType });
  },

  /**
   * Busca assets por status
   * 
   * @param status - Status do asset (OK, MAINTENANCE, STOPPED, ALERT)
   * @returns Assets com o status especificado
   * 
   * @example
   * ```ts
   * const alertAssets = await assetsService.getByStatus('ALERT');
   * ```
   */
  async getByStatus(status: string): Promise<PaginatedResponse<ApiAsset>> {
    return this.getAll({ status });
  },
};
