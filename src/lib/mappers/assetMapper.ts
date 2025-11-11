/**
 * Mappers para conversão entre formatos da API e Frontend
 * 
 * A API Django usa snake_case (ex: asset_type, health_score)
 * O Frontend React usa camelCase (ex: assetType, healthScore)
 * 
 * Estes mappers fazem a conversão bidirecional mantendo type-safety.
 */

import type { ApiAsset, ApiSite } from '@/types/api';
import type { HVACAsset } from '@/types/hvac';

/**
 * Converte Asset da API (Django) para HVACAsset do frontend (React)
 * 
 * @param apiAsset - Asset retornado pela API
 * @param site - Site associado (opcional, para enriquecer dados)
 * @returns HVACAsset formatado para o frontend
 * 
 * @example
 * ```ts
 * const apiAsset = await assetsService.getById(3);
 * const site = await sitesService.getById(apiAsset.site);
 * const hvacAsset = mapApiAssetToHVACAsset(apiAsset, site);
 * ```
 */
export function mapApiAssetToHVACAsset(
  apiAsset: ApiAsset,
  site?: ApiSite
): HVACAsset {
  return {
    id: apiAsset.id.toString(),
    tag: apiAsset.tag,
    type: mapAssetTypeToFrontend(apiAsset.asset_type),
    location: apiAsset.location_description || apiAsset.full_location,
    healthScore: apiAsset.health_score,
    
    // NOTA: Estes campos não existem no backend ainda
    // TODO: Implementar cálculo via telemetria real quando disponível
    powerConsumption: 0,
    operatingHours: 0,
    
    status: mapStatusToFrontend(apiAsset.status),
    
    lastMaintenance: apiAsset.last_maintenance 
      ? new Date(apiAsset.last_maintenance) 
      : new Date(),
    
    specifications: {
      capacity: apiAsset.specifications?.capacity,
      brand: apiAsset.manufacturer,
      model: apiAsset.model,
      serialNumber: apiAsset.serial_number,
      voltage: apiAsset.specifications?.voltage,
      refrigerant: apiAsset.specifications?.refrigerant,
      maxCurrent: apiAsset.specifications?.maxCurrent,
      equipmentType: apiAsset.specifications?.equipmentType,
      equipmentTypeOther: apiAsset.specifications?.equipmentTypeOther,
    },
    
    // Dados do site (localização)
    // Tentar pegar das specifications primeiro (dados salvos), senão do site
    company: apiAsset.specifications?.company || site?.company || extractCompanyFromSiteName(apiAsset.site_name),
    sector: apiAsset.specifications?.sector || site?.sector,
    subsector: apiAsset.specifications?.subsector || site?.subsector,
  };
}

/**
 * Converte HVACAsset do frontend para dados da API Django
 * 
 * @param asset - HVACAsset do frontend
 * @param siteId - ID do site onde o asset está localizado
 * @returns Objeto formatado para envio à API
 * 
 * @example
 * ```ts
 * const hvacAsset: Partial<HVACAsset> = {
 *   tag: 'AHU-008-ONCO',
 *   type: 'AHU',
 *   status: 'OK',
 *   healthScore: 100,
 * };
 * const apiData = mapHVACAssetToApiAsset(hvacAsset, 1);
 * await assetsService.create(apiData);
 * ```
 */
export function mapHVACAssetToApiAsset(
  asset: Partial<HVACAsset>,
  siteId: number
): Partial<ApiAsset> {
  const mappedType = mapAssetTypeToApi(asset.type);
  
  console.log('📝 Mapeando HVACAsset para ApiAsset:', {
    assetType: asset.type,
    mappedAssetType: mappedType,
    equipmentType: asset.specifications?.equipmentType
  });
  
  return {
    tag: asset.tag,
    name: asset.tag, // Usar tag como name se não tiver outro
    site: siteId,
    asset_type: mappedType,
    manufacturer: asset.specifications?.brand || '',
    model: asset.specifications?.model || '',
    serial_number: asset.specifications?.serialNumber || '',
    location_description: asset.location || '',
    status: mapStatusToApi(asset.status),
    health_score: asset.healthScore || 100,
    last_maintenance: asset.lastMaintenance 
      ? asset.lastMaintenance.toISOString().split('T')[0]
      : null,
    specifications: {
      capacity: asset.specifications?.capacity,
      voltage: asset.specifications?.voltage,
      refrigerant: asset.specifications?.refrigerant,
      maxCurrent: asset.specifications?.maxCurrent,
      equipmentType: asset.specifications?.equipmentType,
      equipmentTypeOther: asset.specifications?.equipmentTypeOther,
      // Adicionar campos de localização para persistência
      company: asset.company,
      sector: asset.sector,
      subsector: asset.subsector,
    },
  };
}

/**
 * Mapeia tipo de asset da API para o formato do frontend
 * 
 * Backend: 'AHU', 'CHILLER', 'COOLING_TOWER'
 * Frontend: 'AHU', 'Chiller', 'CoolingTower'
 * 
 * NOTA: HVACAsset.type suporta apenas 6 tipos.
 * Outros tipos são mapeados para o mais próximo.
 */
function mapAssetTypeToFrontend(
  apiType: ApiAsset['asset_type']
): HVACAsset['type'] {
  const typeMap: Partial<Record<ApiAsset['asset_type'], HVACAsset['type']>> = {
    'AHU': 'AHU',
    'CHILLER': 'Chiller',
    'VRF': 'VRF',
    'RTU': 'RTU',
    'BOILER': 'Boiler',
    'COOLING_TOWER': 'CoolingTower',
    // Tipos não suportados mapeiam para similar
    'FAN_COIL': 'AHU',
    'PUMP': 'AHU',
    'AHU_COMPACTO': 'AHU',
    'SPLIT': 'VRF',
    'VAV': 'AHU',
    'HEAT_EXCHANGER': 'CoolingTower',
    'DAMPER': 'AHU',
    'HUMIDIFIER': 'AHU',
    'DEHUMIDIFIER': 'AHU',
  };
  
  return typeMap[apiType] || 'AHU';
}

/**
 * Mapeia tipo de asset do frontend para a API
 * 
 * Frontend: 'AHU', 'Chiller', 'CoolingTower'
 * Backend: 'AHU', 'CHILLER', 'COOLING_TOWER'
 * 
 * NOTA: HVACAsset.type é limitado, todos mapeiam para equivalentes na API
 */
function mapAssetTypeToApi(
  frontendType?: HVACAsset['type']
): ApiAsset['asset_type'] {
  if (!frontendType) return 'AHU';
  
  const typeMap: Record<HVACAsset['type'], ApiAsset['asset_type']> = {
    'AHU': 'AHU',
    'Chiller': 'CHILLER',
    'VRF': 'VRF',
    'RTU': 'RTU',
    'Boiler': 'BOILER',
    'CoolingTower': 'COOLING_TOWER',
  };
  
  return typeMap[frontendType] || 'AHU';
}

/**
 * Mapeia status da API para o frontend
 * 
 * Backend: 'OK', 'MAINTENANCE', 'STOPPED', 'ALERT'
 * Frontend: 'OK', 'Maintenance', 'Stopped', 'Alert'
 */
function mapStatusToFrontend(
  apiStatus: ApiAsset['status']
): HVACAsset['status'] {
  const statusMap: Record<string, HVACAsset['status']> = {
    'OK': 'OK',
    'MAINTENANCE': 'Maintenance',
    'STOPPED': 'Stopped',
    'ALERT': 'Alert',
  };
  
  return statusMap[apiStatus] || 'OK';
}

/**
 * Mapeia status do frontend para a API
 * 
 * Frontend: 'OK', 'Maintenance', 'Stopped', 'Alert'
 * Backend: 'OK', 'MAINTENANCE', 'STOPPED', 'ALERT'
 */
function mapStatusToApi(
  frontendStatus?: HVACAsset['status']
): ApiAsset['status'] {
  if (!frontendStatus) return 'OK';
  
  const statusMap: Record<HVACAsset['status'], ApiAsset['status']> = {
    'OK': 'OK',
    'Maintenance': 'MAINTENANCE',
    'Stopped': 'STOPPED',
    'Alert': 'ALERT',
  };
  
  return statusMap[frontendStatus] || 'OK';
}

/**
 * Extrai o nome da company do site_name retornado pela API
 * 
 * A API retorna site_name no formato: "UMC - Oncologia"
 * Esta função extrai apenas "UMC"
 * 
 * @param siteName - Nome completo do site (ex: "UMC - Oncologia")
 * @returns Nome da empresa (ex: "UMC")
 */
function extractCompanyFromSiteName(siteName: string): string {
  const parts = siteName.split(' - ');
  return parts[0] || siteName;
}

/**
 * Converte múltiplos assets da API de uma vez
 * 
 * @param apiAssets - Lista de assets da API
 * @param sites - Map de sites (id -> site) para enriquecimento
 * @returns Lista de HVACAssets formatados
 * 
 * @example
 * ```ts
 * const assetsResponse = await assetsService.getAll();
 * const sitesResponse = await sitesService.getAll();
 * const sitesMap = new Map(sitesResponse.results.map(s => [s.id, s]));
 * const hvacAssets = mapApiAssetsToHVACAssets(
 *   assetsResponse.results, 
 *   sitesMap
 * );
 * ```
 */
export function mapApiAssetsToHVACAssets(
  apiAssets: ApiAsset[],
  sites?: Map<number, ApiSite>
): HVACAsset[] {
  return apiAssets.map(apiAsset => {
    const site = sites?.get(apiAsset.site);
    return mapApiAssetToHVACAsset(apiAsset, site);
  });
}

/**
 * Filtra assets por múltiplos critérios localmente
 * (útil quando a API não suporta todos os filtros)
 * 
 * @param assets - Lista de assets
 * @param filters - Filtros a aplicar
 * @returns Assets filtrados
 * 
 * @example
 * ```ts
 * const filtered = filterAssetsLocally(allAssets, {
 *   company: 'UMC',
 *   sector: 'Oncologia',
 *   status: 'OK'
 * });
 * ```
 */
export function filterAssetsLocally(
  assets: HVACAsset[],
  filters: {
    company?: string | null;
    sector?: string | null;
    subsector?: string | null;
    status?: string | null;
    type?: string | null;
  }
): HVACAsset[] {
  let filtered = assets;
  
  if (filters.company) {
    filtered = filtered.filter(a => a.company === filters.company);
  }
  
  if (filters.sector) {
    filtered = filtered.filter(a => a.sector === filters.sector);
  }
  
  if (filters.subsector) {
    filtered = filtered.filter(a => a.subsector === filters.subsector);
  }
  
  if (filters.status) {
    filtered = filtered.filter(a => a.status === filters.status);
  }
  
  if (filters.type) {
    filtered = filtered.filter(a => a.type === filters.type);
  }
  
  return filtered;
}
