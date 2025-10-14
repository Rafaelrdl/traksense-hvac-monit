import { useState, useEffect, useCallback } from 'react';
import type { SensorStatusFilter } from '@/types/sensor';

interface SensorsURLParams {
  status: SensorStatusFilter;
  page: number;
  size: number;
}

const DEFAULT_PARAMS: SensorsURLParams = {
  status: 'all',
  page: 1,
  size: 25,
};

/**
 * Custom hook to manage URL query parameters for sensors filtering and pagination
 * This provides a URL-first approach where the URL is the source of truth
 */
export function useSensorsURLParams() {
  const [params, setParams] = useState<SensorsURLParams>(DEFAULT_PARAMS);

  // Parse URL parameters on mount and when URL changes
  useEffect(() => {
    const parseURLParams = (): SensorsURLParams => {
      if (typeof window === 'undefined') return DEFAULT_PARAMS;
      
      const searchParams = new URLSearchParams(window.location.search);
      
      const status = searchParams.get('status') as SensorStatusFilter;
      const page = parseInt(searchParams.get('page') || '1', 10);
      const size = parseInt(searchParams.get('size') || '25', 10);
      
      return {
        status: ['all', 'online', 'offline'].includes(status) ? status : DEFAULT_PARAMS.status,
        page: page > 0 ? page : DEFAULT_PARAMS.page,
        size: [25, 50, 100].includes(size) ? size : DEFAULT_PARAMS.size,
      };
    };

    const handlePopState = () => {
      setParams(parseURLParams());
    };

    // Set initial params
    setParams(parseURLParams());

    // Listen for browser back/forward navigation
    window.addEventListener('popstate', handlePopState);
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // Update URL when parameters change
  const updateParams = useCallback((newParams: Partial<SensorsURLParams>) => {
    if (typeof window === 'undefined') return;
    
    const updatedParams = { ...params, ...newParams };
    
    // Reset page to 1 when status or size changes
    if (newParams.status !== undefined || newParams.size !== undefined) {
      updatedParams.page = 1;
    }
    
    const searchParams = new URLSearchParams();
    
    // Only add non-default parameters to keep URL clean
    if (updatedParams.status !== DEFAULT_PARAMS.status) {
      searchParams.set('status', updatedParams.status);
    }
    if (updatedParams.page !== DEFAULT_PARAMS.page) {
      searchParams.set('page', String(updatedParams.page));
    }
    if (updatedParams.size !== DEFAULT_PARAMS.size) {
      searchParams.set('size', String(updatedParams.size));
    }
    
    const newURL = `${window.location.pathname}${searchParams.toString() ? '?' + searchParams.toString() : ''}`;
    
    // Update URL without triggering page reload
    window.history.replaceState({}, '', newURL);
    
    setParams(updatedParams);
  }, [params]);

  return {
    params,
    updateParams,
    resetParams: () => updateParams(DEFAULT_PARAMS),
  };
}