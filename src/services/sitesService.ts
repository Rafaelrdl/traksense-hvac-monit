/**
 * Service para gerenciar Sites (localizações físicas)
 * 
 * Sites representam as localizações físicas onde os equipamentos HVAC
 * estão instalados (ex: UMC - Oncologia, UMC - UTI, etc.)
 * 
 * Endpoints disponíveis:
 * - GET/POST   /api/sites/
 * - GET/PATCH/DELETE /api/sites/{id}/
 * 
 * 🔧 PAGINATION FIX: Uses DRF page/page_size instead of limit/offset
 */

import { api } from '@/lib/api';
import { fetchAllPages } from '@/lib/pagination';
import type { 
  ApiSite, 
  PaginatedResponse, 
  SiteFilters 
} from '@/types/api';

export const sitesService = {
  /**
   * Lista todos os sites com paginação e filtros
   * 
   * @param params - Filtros opcionais (company, sector, timezone, search, page_size)
   * @returns Resposta paginada com lista de sites
   * 
   * @example
   * ```ts
   * // Listar todos os sites
   * const response = await sitesService.getAll();
   * 
   * // Filtrar por empresa
   * const umcSites = await sitesService.getAll({ company: 'UMC' });
   * 
   * // Buscar por nome
   * const search = await sitesService.getAll({ search: 'Oncologia' });
   * ```
   */
  async getAll(params?: SiteFilters): Promise<PaginatedResponse<ApiSite>> {
    const drfParams: Record<string, any> = { ...params };
    if (params?.limit) {
      drfParams.page_size = params.limit;
      delete drfParams.limit;
    }
    if (params?.offset) {
      delete drfParams.offset;
    }
    
    const response = await api.get<PaginatedResponse<ApiSite>>('/sites/', { 
      params: drfParams
    });
    return response.data;
  },

  /**
   * Fetch ALL sites across all pages (follows 'next' links)
   */
  async getAllComplete(params?: SiteFilters): Promise<ApiSite[]> {
    return fetchAllPages<ApiSite>('/sites/', params);
  },

  /**
   * Busca um site específico por ID
   * 
   * @param id - ID do site
   * @returns Site completo com todas as informações
   * 
   * @example
   * ```ts
   * const site = await sitesService.getById(1);
   * console.log(site.full_name); // "UMC - Oncologia"
   * ```
   */
  async getById(id: number): Promise<ApiSite> {
    const response = await api.get<ApiSite>(`/sites/${id}/`);
    return response.data;
  },

  /**
   * Cria um novo site
   * 
   * @param data - Dados do site a ser criado
   * @returns Site criado com ID gerado
   * 
   * @example
   * ```ts
   * const newSite = await sitesService.create({
   *   name: 'Oncologia',
   *   company: 'UMC',
   *   sector: 'Oncologia',
   *   subsector: 'Quimioterapia',
   *   address: 'Rua exemplo, 123',
   *   timezone: 'America/Sao_Paulo',
   * });
   * ```
   */
  async create(data: Partial<ApiSite>): Promise<ApiSite> {
    const response = await api.post<ApiSite>('/sites/', data);
    return response.data;
  },

  /**
   * Atualiza um site parcialmente (PATCH)
   * 
   * @param id - ID do site a ser atualizado
   * @param data - Campos a serem atualizados
   * @returns Site atualizado
   * 
   * @example
   * ```ts
   * // Atualizar endereço
   * await sitesService.update(1, { 
   *   address: 'Novo endereço, 456' 
   * });
   * 
   * // Atualizar coordenadas
   * await sitesService.update(1, { 
   *   latitude: '-23.5505',
   *   longitude: '-46.6333'
   * });
   * ```
   */
  async update(id: number, data: Partial<ApiSite>): Promise<ApiSite> {
    const response = await api.patch<ApiSite>(`/sites/${id}/`, data);
    return response.data;
  },

  /**
   * Deleta um site permanentemente
   * 
   * ATENÇÃO: Deletar um site pode afetar os assets associados
   * 
   * @param id - ID do site a ser deletado
   * 
   * @example
   * ```ts
   * await sitesService.delete(1);
   * ```
   */
  async delete(id: number): Promise<void> {
    await api.delete(`/sites/${id}/`);
  },

  /**
   * Busca sites por empresa
   * 
   * @param company - Nome da empresa
   * @returns Sites da empresa
   * 
   * @example
   * ```ts
   * const umcSites = await sitesService.getByCompany('UMC');
   * ```
   */
  async getByCompany(company: string): Promise<PaginatedResponse<ApiSite>> {
    return this.getAll({ company });
  },

  /**
   * Busca sites por setor
   * 
   * @param sector - Nome do setor
   * @returns Sites do setor
   * 
   * @example
   * ```ts
   * const oncoSites = await sitesService.getBySector('Oncologia');
   * ```
   */
  async getBySector(sector: string): Promise<PaginatedResponse<ApiSite>> {
    return this.getAll({ sector });
  },

  /**
   * Busca sites por timezone
   * 
   * @param timezone - Timezone (ex: America/Sao_Paulo)
   * @returns Sites no timezone especificado
   * 
   * @example
   * ```ts
   * const brSites = await sitesService.getByTimezone('America/Sao_Paulo');
   * ```
   */
  async getByTimezone(timezone: string): Promise<PaginatedResponse<ApiSite>> {
    return this.getAll({ timezone });
  },

  /**
   * Busca sites com múltiplos filtros
   * 
   * @param filters - Objeto com múltiplos filtros
   * @returns Sites filtrados
   * 
   * @example
   * ```ts
   * const sites = await sitesService.search({
   *   company: 'UMC',
   *   sector: 'Oncologia'
   * });
   * ```
   */
  async search(filters: SiteFilters): Promise<PaginatedResponse<ApiSite>> {
    return this.getAll(filters);
  },

  /**
   * Busca estatísticas de um site específico
   * 
   * @param id - ID do site
   * @returns Estatísticas do site (assets, devices, sensores, alertas)
   * 
   * @example
   * ```ts
   * const stats = await sitesService.getStats(1);
   * console.log(`Disponibilidade: ${stats.avg_device_availability}%`);
   * console.log(`Assets com alertas: ${stats.assets_with_active_alerts}`);
   * ```
   */
  async getStats(id: number): Promise<{
    total_assets: number;
    assets_by_status: Record<string, number>;
    assets_by_type: Record<string, number>;
    total_devices: number;
    online_devices: number;
    avg_device_availability: number;
    total_sensors: number;
    online_sensors: number;
    assets_with_active_alerts: number;
  }> {
    const response = await api.get(`/sites/${id}/stats/`);
    return response.data;
  },

  // Alias para compatibilidade com React Query hooks
  list: async () => {
    return sitesService.getAllComplete();
  },

  get: async (id: string) => {
    return sitesService.getById(parseInt(id));
  },
};
