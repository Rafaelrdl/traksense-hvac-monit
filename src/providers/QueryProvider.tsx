import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { ReactNode } from 'react';

/**
 * QueryClient configuration for React Query
 * 
 * Default options:
 * - staleTime: 5 minutes - data considered fresh for this duration
 * - gcTime: 10 minutes (formerly cacheTime) - unused data kept in cache
 * - retry: 3 attempts on failure
 * - refetchOnWindowFocus: disabled to prevent unnecessary refetches
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutos
      gcTime: 1000 * 60 * 10, // 10 minutos (renamed from cacheTime)
      retry: 3,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
    },
  },
});

/**
 * Versão do cache - incrementar quando houver mudanças incompatíveis
 * Força limpeza do cache antigo
 */
const CACHE_VERSION = 2;
const CACHE_KEY = 'TRAKSENSE_QUERY_CACHE';
const VERSION_KEY = 'TRAKSENSE_CACHE_VERSION';

// Verificar e limpar cache antigo se versão mudou
const storedVersion = localStorage.getItem(VERSION_KEY);
if (storedVersion !== String(CACHE_VERSION)) {
  console.log('🗑️ Limpando cache antigo (versão incompatível)');
  localStorage.removeItem(CACHE_KEY);
  localStorage.setItem(VERSION_KEY, String(CACHE_VERSION));
}

/**
 * Persister para cache em localStorage
 * Apenas para queries estáticas (sites, assets sem filtros)
 */
const persister = createSyncStoragePersister({
  storage: window.localStorage,
  key: CACHE_KEY,
  // Adicionar tratamento de erro para cache corrompido
  serialize: (data) => {
    try {
      return JSON.stringify(data);
    } catch (error) {
      console.error('❌ Erro ao serializar cache:', error);
      return '';
    }
  },
  deserialize: (data) => {
    try {
      return JSON.parse(data);
    } catch (error) {
      console.error('❌ Erro ao desserializar cache, limpando...', error);
      localStorage.removeItem(CACHE_KEY);
      return null;
    }
  },
});

interface QueryProviderProps {
  children: ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister,
        maxAge: 1000 * 60 * 60 * 24, // 24 horas
        dehydrateOptions: {
          // Apenas persistir queries específicas (estáticas)
          shouldDehydrateQuery: (query) => {
            const queryKey = query.queryKey[0] as string;
            // Persistir apenas sites e assets sem filtros
            return queryKey === 'sites' || 
                   (queryKey === 'assets' && Object.keys(query.queryKey[1] || {}).length === 0);
          },
        },
        // Tratar erros de restauração graciosamente
        onSuccess: () => {
          console.log('✅ Cache restaurado do localStorage');
        },
      }}
      onError={(error) => {
        console.error('❌ Erro ao restaurar cache, continuando sem cache:', error);
        // Limpar cache corrompido
        localStorage.removeItem(CACHE_KEY);
      }}
    >
      {children}
      {import.meta.env.DEV && (
        <ReactQueryDevtools 
          initialIsOpen={false}
          position="bottom-right"
        />
      )}
    </PersistQueryClientProvider>
  );
}

// Export para uso em testes
export { queryClient };
