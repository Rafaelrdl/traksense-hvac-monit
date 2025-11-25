import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { alertsApi, AlertListParams } from '@/services/api/alerts';

/**
 * Query hook para listar alertas com filtros
 * Retorna apenas o array de alertas (extrai de results)
 */
export const useAlertsQuery = (filters: AlertListParams = {}) => {
  return useQuery({
    queryKey: ['alerts', filters],
    queryFn: async () => {
      const response = await alertsApi.list(filters);
      return response.results || [];
    },
    refetchInterval: 30000, // 30 segundos
    staleTime: 1000 * 20, // 20 segundos
    retry: 2, // Retry 2x
    retryDelay: 1500, // 1.5s entre retries
  });
};

/**
 * Query hook para alertas ativos (com polling mais frequente)
 * Retorna apenas o array de alertas
 */
export const useActiveAlertsQuery = () => {
  return useQuery({
    queryKey: ['alerts', 'active'],
    queryFn: async () => {
      const response = await alertsApi.list({ status: 'active' });
      return response.results || [];
    },
    refetchInterval: 10000, // 10 segundos para alertas críticos
    staleTime: 1000 * 5, // 5 segundos
    retry: 3, // Retry 3x para queries críticas
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000), // Exponential backoff
  });
};

/**
 * Query hook para um alerta específico
 */
export const useAlertQuery = (alertId: number | null) => {
  return useQuery({
    queryKey: ['alerts', alertId],
    queryFn: () => alertsApi.get(alertId!),
    enabled: !!alertId,
  });
};

/**
 * Query hook para histórico de alertas
 * Retorna apenas o array de alertas
 */
export const useAlertHistoryQuery = (ruleId?: number) => {
  return useQuery({
    queryKey: ['alerts', 'history', ruleId],
    queryFn: async () => {
      const response = await alertsApi.list({ 
        status: 'resolved',
        rule_id: ruleId,
      });
      return response.results || [];
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};

/**
 * Mutation hook para reconhecer um alerta
 */
export const useAcknowledgeAlertMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (alertId: number) => alertsApi.acknowledge(alertId),
    onSuccess: () => {
      // Invalida todas as queries de alertas
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
    },
    onError: (error) => {
      console.error('Erro ao reconhecer alerta:', error);
    },
  });
};

/**
 * Mutation hook para resolver um alerta
 */
export const useResolveAlertMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ alertId, notes }: { alertId: number; notes?: string }) =>
      alertsApi.resolve(alertId, { notes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
    },
  });
};
