import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { assetsService } from '@/services/assetsService';
import { telemetryService } from '@/services/telemetryService';
import type { ApiSensor } from '@/types/api';
import type { HistoryQueryParams } from '@/types/telemetry';

/**
 * Lista todos os sensores de um asset específico
 * 
 * @param assetId - ID do asset
 * @param enabled - Habilita/desabilita a query
 */
export function useSensorsQuery(assetId: number | null, enabled = true) {
  return useQuery({
    queryKey: ['sensors', assetId],
    queryFn: () => assetsService.getSensors(assetId!),
    enabled: enabled && assetId !== null,
  });
}

/**
 * Obtém dados de telemetria mais recentes de um device
 * Atualiza a cada 30 segundos automaticamente
 * 
 * @param deviceId - Serial number do device
 * @param sensorId - (Opcional) Filtrar sensor específico
 * @param enabled - Habilita/desabilita a query
 */
export function useSensorDataQuery(
  deviceId: string | null,
  sensorId?: string,
  enabled = true
) {
  return useQuery({
    queryKey: ['sensor-data', deviceId, sensorId],
    queryFn: () => {
      return telemetryService.getLatest(deviceId!, sensorId);
    },
    enabled: enabled && deviceId !== null,
    refetchInterval: 30000, // Poll a cada 30s para dados em tempo real
    staleTime: 1000 * 20, // 20 segundos
    retry: 3, // Retry 3x para telemetria crítica
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
  });
}

/**
 * Obtém histórico de telemetria de um device
 * 
 * @param params - Parâmetros de consulta (deviceId, from, to, sensorId, interval)
 * @param enabled - Habilita/desabilita a query
 */
export function useSensorHistoryQuery(
  params: HistoryQueryParams,
  enabled = true
) {
  return useQuery({
    queryKey: ['sensor-history', params],
    queryFn: () => {
      return telemetryService.getHistory(params);
    },
    enabled: enabled && !!params.deviceId,
    staleTime: 60000, // Histórico pode ser cached por 1 minuto
  });
}

/**
 * Obtém histórico paginado com infinite scroll
 * Para gráficos com grande volume de dados
 * 
 * @param deviceId - Serial number do device
 * @param baseParams - Parâmetros base (from, to, sensorId)
 */
export function useSensorHistoryInfiniteQuery(
  deviceId: string,
  baseParams: Omit<HistoryQueryParams, 'deviceId'>
) {
  return useInfiniteQuery({
    queryKey: ['sensor-history-infinite', deviceId, baseParams],
    queryFn: ({ pageParam = 1 }) => {
      // Backend usa paginação offset-based
      const params: HistoryQueryParams = {
        ...baseParams,
        deviceId,
        // Adicionar offset se backend suportar paginação
      };
      return telemetryService.getHistory(params);
    },
    getNextPageParam: (lastPage, pages) => {
      // Verificar se há mais dados
      // Ajustar baseado na resposta real do backend
      return lastPage.series.length > 0 ? pages.length + 1 : undefined;
    },
    initialPageParam: 1,
  });
}

/**
 * Obtém resumo completo de um device com estatísticas 24h
 * 
 * @param deviceId - Serial number do device
 * @param enabled - Habilita/desabilita a query
 */
export function useDeviceSummaryQuery(deviceId: string | null, enabled = true) {
  return useQuery({
    queryKey: ['device-summary', deviceId],
    queryFn: () => telemetryService.getDeviceSummary(deviceId!),
    enabled: enabled && deviceId !== null,
    refetchInterval: 60000, // Atualizar sumário a cada 1 minuto
  });
}
