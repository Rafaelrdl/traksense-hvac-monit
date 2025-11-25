import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { rulesApi, CreateRuleRequest, UpdateRuleRequest } from '@/services/api/alerts';

/**
 * Query hook para listar regras
 */
export const useRulesQuery = (filters = {}) => {
  return useQuery({
    queryKey: ['rules', filters],
    queryFn: async () => {
      const response = await rulesApi.list(filters);
      // API retorna { results: Rule[], count: number }
      return response.results || [];
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};

/**
 * Query hook para uma regra específica
 */
export const useRuleQuery = (ruleId: number | null) => {
  return useQuery({
    queryKey: ['rules', ruleId],
    queryFn: () => rulesApi.get(ruleId!),
    enabled: !!ruleId,
  });
};

/**
 * Query hook para estatísticas de regras
 */
export const useRulesStatisticsQuery = () => {
  return useQuery({
    queryKey: ['rules', 'statistics'],
    queryFn: rulesApi.statistics,
    staleTime: 1000 * 60 * 2, // 2 minutos
  });
};

/**
 * Mutation hook para criar regra
 */
export const useCreateRuleMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateRuleRequest) => rulesApi.create(data),
    onMutate: async (newRule) => {
      // Cancel queries
      await queryClient.cancelQueries({ queryKey: ['rules'] });
      
      // Snapshot
      const previousRules = queryClient.getQueryData(['rules', {}]);
      
      // Optimistically add
      queryClient.setQueryData(['rules', {}], (old: any[] | undefined) => {
        if (!old) return [{ ...newRule, id: Date.now(), enabled: true }];
        return [...old, { ...newRule, id: Date.now(), enabled: true }];
      });
      
      return { previousRules };
    },
    onError: (_err, _newRule, context) => {
      if (context?.previousRules) {
        queryClient.setQueryData(['rules', {}], context.previousRules);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rules'] });
      // Invalida alertas pois nova regra pode gerar alertas
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
    },
  });
};

/**
 * Mutation hook para atualizar regra
 * Usa PATCH para atualização parcial (mais seguro que PUT)
 */
export const useUpdateRuleMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateRuleRequest }) =>
      rulesApi.patch(id, data),
    onMutate: async ({ id, data }) => {
      // Cancel queries
      await queryClient.cancelQueries({ queryKey: ['rules'] });
      await queryClient.cancelQueries({ queryKey: ['rules', id] });
      
      // Snapshot
      const previousRules = queryClient.getQueryData(['rules', {}]);
      const previousRule = queryClient.getQueryData(['rules', id]);
      
      // Optimistically update
      queryClient.setQueryData(['rules', {}], (old: any[] | undefined) => {
        if (!old) return old;
        return old.map((rule: any) => 
          rule.id === id ? { ...rule, ...data } : rule
        );
      });
      
      queryClient.setQueryData(['rules', id], (old: any) => 
        old ? { ...old, ...data } : old
      );
      
      return { previousRules, previousRule };
    },
    onError: (_err, { id }, context) => {
      if (context?.previousRules) {
        queryClient.setQueryData(['rules', {}], context.previousRules);
      }
      if (context?.previousRule) {
        queryClient.setQueryData(['rules', id], context.previousRule);
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['rules'] });
      queryClient.invalidateQueries({ queryKey: ['rules', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
    },
  });
};

/**
 * Mutation hook para deletar regra
 */
export const useDeleteRuleMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (ruleId: number) => rulesApi.delete(ruleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rules'] });
    },
  });
};

/**
 * Mutation hook para toggle enable/disable regra
 * Usa o endpoint dedicado /toggle_status/ do backend
 */
export const useToggleRuleMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (ruleId: number) => rulesApi.toggleStatus(ruleId),
    onMutate: async (ruleId) => {
      // Cancel queries
      await queryClient.cancelQueries({ queryKey: ['rules'] });
      
      // Snapshot
      const previousRules = queryClient.getQueryData(['rules', {}]);
      
      // Optimistic update - toggle o status
      queryClient.setQueryData(['rules', {}], (old: any[] | undefined) => {
        if (!old) return old;
        return old.map((rule: any) => 
          rule.id === ruleId ? { ...rule, enabled: !rule.enabled } : rule
        );
      });
      
      return { previousRules };
    },
    onError: (_err, _ruleId, context) => {
      // Rollback on error
      if (context?.previousRules) {
        queryClient.setQueryData(['rules', {}], context.previousRules);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['rules'] });
    },
  });
};
