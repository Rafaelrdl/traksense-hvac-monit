import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

export interface SiteStats {
  total_assets: number;
  assets_by_status: Record<string, number>;
  assets_by_type: Record<string, number>;
  total_devices: number;
  online_devices: number;
  avg_device_availability: number;
  total_sensors: number;
  online_sensors: number;
  assets_with_active_alerts: number;
}

interface UseSiteStatsResult {
  data: SiteStats | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * Hook para buscar estatísticas de um site específico.
 * 
 * Retorna estatísticas incluindo:
 * - Total de assets, devices e sensores
 * - Contagem de devices/sensores online
 * - Disponibilidade média dos devices (%)
 * 
 * @param siteId - ID do site para buscar estatísticas
 * @param refetchInterval - Intervalo de atualização em milissegundos (padrão: 60s)
 * @returns Estatísticas do site com refetch automático
 */
export function useSiteStats(
  siteId: number | undefined,
  refetchInterval = 60000
): UseSiteStatsResult {
  const [data, setData] = useState<SiteStats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!siteId) {
      setData(null);
      setIsLoading(false);
      setError('Site ID não fornecido');
      return;
    }

    let isMounted = true;

    const fetchStats = async () => {
      try {
        setIsLoading(true);
        console.log(`📡 Buscando stats para site ID: ${siteId}`);
        const response = await api.get(`/sites/${siteId}/stats/`);
        console.log(`✅ Stats recebidas:`, response.data);
        
        if (isMounted) {
          setData(response.data);
          setError(null);
        }
      } catch (err: any) {
        if (isMounted) {
          console.error('❌ Erro ao buscar estatísticas do site:', err);
          console.error('Detalhes do erro:', err.response?.data);
          setError(err.message || 'Erro ao buscar estatísticas');
          setData(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    // Buscar imediatamente
    fetchStats();

    // Configurar intervalo de atualização
    const intervalId = setInterval(fetchStats, refetchInterval);

    // Cleanup
    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [siteId, refetchInterval]);

  return { data, isLoading, error };
}
