import { useQuery } from '@tanstack/react-query';
import { devicesService } from '@/services/devicesService';
import type { DeviceFilters } from '@/services/devicesService';

/**
 * Query hook para devices summary de um site
 * Retorna devices com variáveis agrupadas, contagem online/offline e informações do asset
 * 
 * Configurado com:
 * - Polling automático de 30s (refetchInterval)
 * - Cache de 20s (staleTime)
 * - Habilitado apenas quando siteId está disponível
 */
export const useDevicesSummaryQuery = (
  siteId: number | null | undefined,
  filters?: DeviceFilters
) => {
  return useQuery({
    queryKey: ['devices', 'summary', siteId, filters],
    queryFn: () => devicesService.getSummaryBySite(siteId!, filters),
    enabled: !!siteId,
    staleTime: 1000 * 20, // 20 segundos
    refetchInterval: 1000 * 30, // Auto-refresh a cada 30s
  });
};

/**
 * Query hook para detalhes de um device summary específico
 */
export const useDeviceSummaryQuery = (deviceId: number | null) => {
  return useQuery({
    queryKey: ['devices', 'summary', deviceId],
    queryFn: () => devicesService.getSummaryById(deviceId!),
    enabled: !!deviceId,
    staleTime: 1000 * 20,
  });
};

/**
 * Query hook para devices simples de um site (sem summary)
 */
export const useDevicesQuery = (
  siteId: number | null | undefined,
  filters?: DeviceFilters
) => {
  return useQuery({
    queryKey: ['devices', siteId, filters],
    queryFn: () => devicesService.listBySite(siteId!, filters),
    enabled: !!siteId,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};

/**
 * Query hook para device específico
 */
export const useDeviceQuery = (deviceId: number | null) => {
  return useQuery({
    queryKey: ['devices', deviceId],
    queryFn: () => devicesService.getById(deviceId!),
    enabled: !!deviceId,
    staleTime: 1000 * 60 * 5,
  });
};
