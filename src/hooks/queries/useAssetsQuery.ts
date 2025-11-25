import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { assetsService } from '@/services/assetsService';

interface AssetQueryFilters {
  site?: number;
  asset_type?: string;
  status?: string;
}

/**
 * Query hook para listar assets
 */
export const useAssetsQuery = (filters: AssetQueryFilters = {}) => {
  return useQuery({
    queryKey: ['assets', filters],
    queryFn: () => assetsService.getAllComplete(filters),
    staleTime: 1000 * 60 * 10, // 10 minutos
  });
};

/**
 * Query hook para detalhes de um asset específico
 */
export const useAssetDetailsQuery = (assetId: number | null) => {
  return useQuery({
    queryKey: ['assets', assetId],
    queryFn: () => assetsService.getById(assetId!),
    enabled: !!assetId,
    staleTime: 1000 * 60 * 5,
  });
};

/**
 * Query hook para sensores de um asset
 */
export const useAssetSensorsQuery = (assetId: number | null) => {
  return useQuery({
    queryKey: ['assets', assetId, 'sensors'],
    queryFn: () => assetsService.getSensors(assetId!),
    enabled: !!assetId,
    staleTime: 1000 * 60 * 5,
  });
};

/**
 * Mutation hook para criar asset
 */
export const useCreateAssetMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: assetsService.create,
    onMutate: async (newAsset) => {
      // Cancel outgoing queries
      await queryClient.cancelQueries({ queryKey: ['assets'] });
      
      // Snapshot previous value
      const previousAssets = queryClient.getQueryData(['assets']);
      
      // Optimistically update to new value
      queryClient.setQueryData(['assets', {}], (old: any) => {
        if (!old) return [{ ...newAsset, id: Date.now() }];
        return [...old, { ...newAsset, id: Date.now() }];
      });
      
      return { previousAssets };
    },
    onError: (_err, _newAsset, context) => {
      // Rollback on error
      if (context?.previousAssets) {
        queryClient.setQueryData(['assets', {}], context.previousAssets);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
    },
  });
};

/**
 * Mutation hook para atualizar asset
 */
export const useUpdateAssetMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      assetsService.update(id, data),
    onMutate: async ({ id, data }) => {
      // Cancel queries
      await queryClient.cancelQueries({ queryKey: ['assets'] });
      await queryClient.cancelQueries({ queryKey: ['assets', id] });
      
      // Snapshot previous values
      const previousAssets = queryClient.getQueryData(['assets']);
      const previousAsset = queryClient.getQueryData(['assets', id]);
      
      // Optimistically update
      queryClient.setQueryData(['assets', {}], (old: any) => {
        if (!old) return old;
        return old.map((asset: any) => 
          asset.id === id ? { ...asset, ...data } : asset
        );
      });
      
      queryClient.setQueryData(['assets', id], (old: any) => 
        old ? { ...old, ...data } : old
      );
      
      return { previousAssets, previousAsset };
    },
    onError: (_err, { id }, context) => {
      // Rollback on error
      if (context?.previousAssets) {
        queryClient.setQueryData(['assets', {}], context.previousAssets);
      }
      if (context?.previousAsset) {
        queryClient.setQueryData(['assets', id], context.previousAsset);
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      queryClient.invalidateQueries({ queryKey: ['assets', variables.id] });
    },
  });
};

/**
 * Mutation hook para deletar asset
 */
export const useDeleteAssetMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (assetId: number) => assetsService.delete(assetId),
    onMutate: async (assetId) => {
      // Cancel queries
      await queryClient.cancelQueries({ queryKey: ['assets'] });
      
      // Snapshot previous value
      const previousAssets = queryClient.getQueryData(['assets']);
      
      // Optimistically remove from list
      queryClient.setQueryData(['assets', {}], (old: any) => {
        if (!old) return old;
        return old.filter((asset: any) => asset.id !== assetId);
      });
      
      return { previousAssets };
    },
    onError: (_err, _assetId, context) => {
      // Rollback on error
      if (context?.previousAssets) {
        queryClient.setQueryData(['assets', {}], context.previousAssets);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
    },
  });
};
