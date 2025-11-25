import { useQuery } from '@tanstack/react-query';
import { sitesService } from '@/services/sitesService';

/**
 * Query hook para listar todos os sites
 */
export const useSitesQuery = () => {
  return useQuery({
    queryKey: ['sites'],
    queryFn: sitesService.list,
    staleTime: 1000 * 60 * 10, // 10 minutos - sites mudam raramente
  });
};

/**
 * Query hook para buscar um site específico
 */
export const useSiteQuery = (siteId: string | null) => {
  return useQuery({
    queryKey: ['sites', siteId],
    queryFn: () => sitesService.get(siteId!),
    enabled: !!siteId,
  });
};

/**
 * Query hook para estatísticas do site (com polling)
 * 
 * Retorna:
 * - avg_device_availability: number
 * - assets_with_active_alerts: number
 */
export const useSiteStatsQuery = (siteId: string | number | null | undefined) => {
  return useQuery({
    queryKey: ['sites', siteId, 'stats'],
    queryFn: () => {
      const id = typeof siteId === 'string' ? parseInt(siteId) : siteId!;
      return sitesService.getStats(id);
    },
    refetchInterval: 60000, // 1 minuto
    enabled: !!siteId,
  });
};
