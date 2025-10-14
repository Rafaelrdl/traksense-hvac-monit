import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { EnhancedSensor, SensorStatusFilter, SensorsPagination, SensorsState } from '@/types/sensor';
import { useAppStore } from './app';

interface SensorsStore extends SensorsState {
  // Additional store methods
  initializeFromAppStore: () => void;
  resetFilters: () => void;
}

export const useSensorsStore = create<SensorsStore>()(
  persist(
    (set, get) => ({
      items: [],
      filter: {
        status: 'all' as SensorStatusFilter,
        page: 1,
        size: 25,
      },

      setFilter: (newFilter) => {
        const currentFilter = get().filter;
        const updatedFilter = { ...currentFilter, ...newFilter };
        
        // Reset to page 1 when changing status or size
        if (newFilter.status !== undefined || newFilter.size !== undefined) {
          updatedFilter.page = 1;
        }
        
        set({ filter: updatedFilter });
      },

      getFilteredSensors: () => {
        const { items, filter } = get();
        
        if (filter.status === 'online') {
          return items.filter(sensor => sensor.status === 'online');
        }
        if (filter.status === 'offline') {
          return items.filter(sensor => sensor.status === 'offline');
        }
        return items;
      },

      getPaginatedSensors: () => {
        const { filter } = get();
        const filteredSensors = get().getFilteredSensors();
        
        const total = filteredSensors.length;
        const totalPages = Math.max(1, Math.ceil(total / filter.size));
        const safePage = Math.min(filter.page, totalPages);
        const start = (safePage - 1) * filter.size;
        const sensors = filteredSensors.slice(start, start + filter.size);

        const pagination: SensorsPagination = {
          page: safePage,
          size: filter.size,
          total,
          totalPages,
        };

        return { sensors, pagination };
      },

      initializeFromAppStore: () => {
        // Convert app store sensors to enhanced sensors format
        const appSensors = useAppStore.getState().sensors;
        const appAssets = useAppStore.getState().assets;
        
        const enhancedSensors: EnhancedSensor[] = appSensors.map(sensor => {
          const asset = appAssets.find(asset => asset.id === sensor.assetId);
          
          return {
            id: sensor.id,
            name: sensor.tag,
            tag: sensor.tag,
            status: sensor.online ? 'online' : 'offline',
            equipmentId: sensor.assetId,
            equipmentName: asset?.tag || 'Equipamento não encontrado',
            type: sensor.type,
            unit: sensor.unit,
            lastReading: sensor.lastReading ? {
              value: sensor.lastReading.value,
              timestamp: sensor.lastReading.timestamp instanceof Date 
                ? sensor.lastReading.timestamp 
                : new Date(sensor.lastReading.timestamp),
            } : null,
            availability: sensor.availability,
            lastSeenAt: sensor.lastReading ? 
              (sensor.lastReading.timestamp instanceof Date 
                ? sensor.lastReading.timestamp.getTime() 
                : new Date(sensor.lastReading.timestamp).getTime())
              : undefined,
          };
        });

        set({ items: enhancedSensors });
      },

      resetFilters: () => {
        set({
          filter: {
            status: 'all',
            page: 1,
            size: 25,
          },
        });
      },
    }),
    {
      name: 'ts:sensors',
      version: 1,
      partialize: (state) => ({ 
        filter: { 
          status: state.filter.status, 
          size: state.filter.size // Persist status filter and page size, but not current page
        } 
      }),
    }
  )
);