import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

interface QueryMetrics {
  queryKey: string;
  status: string;
  fetchStatus: string;
  dataUpdatedAt: number;
  errorUpdateCount: number;
  isFetching: boolean;
  isStale: boolean;
}

/**
 * Hook para monitorar performance de queries
 * Apenas ativo em desenvolvimento
 * 
 * Monitora:
 * - Queries lentas (> 3s)
 * - Queries com muitos erros
 * - Cache hits/misses
 * 
 * @example
 * ```tsx
 * function App() {
 *   useQueryMonitoring();
 *   return <YourApp />;
 * }
 * ```
 */
export function useQueryMonitoring() {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Apenas em desenvolvimento
    if (!import.meta.env.DEV) return;

    const startTimes = new Map<string, number>();
    let slowQueryCount = 0;
    let errorQueryCount = 0;
    let cacheHits = 0;
    let cacheMisses = 0;

    const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
      if (!event) return;

      const query = event.query;
      const queryKey = JSON.stringify(query.queryKey);

      // Rastrear início de fetch
      if (event.type === 'updated' && query.state.fetchStatus === 'fetching') {
        startTimes.set(queryKey, Date.now());
        
        // Cache hit ou miss?
        if (query.state.data) {
          cacheHits++;
        } else {
          cacheMisses++;
        }
      }

      // Rastrear fim de fetch
      if (event.type === 'updated' && query.state.fetchStatus === 'idle') {
        const startTime = startTimes.get(queryKey);
        if (startTime) {
          const duration = Date.now() - startTime;
          startTimes.delete(queryKey);

          // Query lenta (> 3s)
          if (duration > 3000) {
            slowQueryCount++;
            console.warn(`🐌 Query lenta (${duration}ms):`, query.queryKey);
          }

          // Log em desenvolvimento
          if (duration > 1000) {
            console.log(`⏱️ Query demorou ${duration}ms:`, query.queryKey);
          }
        }
      }

      // Rastrear erros
      if (event.type === 'updated' && query.state.status === 'error') {
        errorQueryCount++;
        console.error(`❌ Query error (${query.state.errorUpdateCount}x):`, query.queryKey, query.state.error);
      }
    });

    // Log periódico de métricas (a cada 30s)
    const metricsInterval = setInterval(() => {
      const queries = queryClient.getQueryCache().getAll();
      const activeQueries = queries.filter(q => q.state.fetchStatus === 'fetching');
      
      console.group('📊 React Query Metrics');
      console.log('Total queries:', queries.length);
      console.log('Active queries:', activeQueries.length);
      console.log('Cache hits:', cacheHits);
      console.log('Cache misses:', cacheMisses);
      console.log('Cache hit ratio:', cacheHits / (cacheHits + cacheMisses) || 0);
      console.log('Slow queries:', slowQueryCount);
      console.log('Error queries:', errorQueryCount);
      console.groupEnd();

      // Lista queries ativas
      if (activeQueries.length > 0) {
        console.log('🔄 Active queries:', activeQueries.map(q => q.queryKey));
      }

      // Lista queries stale
      const staleQueries = queries.filter(q => q.isStale());
      if (staleQueries.length > 0) {
        console.log('⚠️ Stale queries:', staleQueries.length, 'of', queries.length);
      }
    }, 30000);

    return () => {
      unsubscribe();
      clearInterval(metricsInterval);
    };
  }, [queryClient]);
}

/**
 * Hook para obter métricas atuais de uma query específica
 */
export function useQueryMetrics(queryKey: unknown[]): QueryMetrics | null {
  const queryClient = useQueryClient();
  const query = queryClient.getQueryCache().find({ queryKey });

  if (!query) return null;

  return {
    queryKey: JSON.stringify(queryKey),
    status: query.state.status,
    fetchStatus: query.state.fetchStatus,
    dataUpdatedAt: query.state.dataUpdatedAt,
    errorUpdateCount: query.state.errorUpdateCount,
    isFetching: query.state.fetchStatus === 'fetching',
    isStale: query.isStale(),
  };
}
