import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { EnhancedSensor, SensorStatusFilter, SensorsPagination, SensorsState } from '@/types/sensor';
import { useAppStore } from './app';
import { telemetryService } from '@/services/telemetryService';
import { getSensorMetadata, isSensorOnline } from '@/types/telemetry';

interface SensorsStore extends SensorsState {
  // Additional store methods
  initializeFromAppStore: () => void;
  resetFilters: () => void;
  
  // Telemetry actions (FASE 3)
  loadRealTelemetry: (deviceId: string) => Promise<void>;
  isLoadingTelemetry: boolean;
  telemetryError: string | null;
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
      
      // Telemetry state (FASE 3)
      isLoadingTelemetry: false,
      telemetryError: null,

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

      /**
       * FASE 3: Carrega telemetria real do backend.
       * Converte SensorSummary para EnhancedSensor.
       */
      loadRealTelemetry: async (deviceId: string) => {
        set({ isLoadingTelemetry: true, telemetryError: null });
        
        try {
          // Buscar summary do device (contém lista de sensores)
          const summary = await telemetryService.getDeviceSummary(deviceId);
          
          // Buscar assets para enriquecer dados
          const appAssets = useAppStore.getState().assets;
          
          // Converter SensorSummary para EnhancedSensor
          const enhancedSensors: EnhancedSensor[] = summary.sensors.map(sensor => {
            // Tentar encontrar asset relacionado (simplificado por enquanto)
            const asset = appAssets[0]; // Usa primeiro asset como fallback
            
            // Determinar status online/offline
            const isOnline = isSensorOnline(sensor.lastReadingAt);
            
            // Obter metadata do sensor
            const metadata = getSensorMetadata(sensor.sensorType);
            
            return {
              id: sensor.sensorId,
              name: sensor.sensorName,
              tag: sensor.sensorName,
              status: isOnline ? 'online' : 'offline',
              equipmentId: asset?.id || deviceId,
              equipmentName: asset?.tag || summary.deviceName,
              type: metadata.displayName || sensor.sensorType,
              unit: sensor.unit,
              lastReading: sensor.lastValue !== null ? {
                value: sensor.lastValue,
                timestamp: sensor.lastReadingAt ? new Date(sensor.lastReadingAt) : new Date(),
              } : null,
              availability: isOnline ? 95 : 0, // Simplificado: 95% se online, 0% se offline
              lastSeenAt: sensor.lastReadingAt ? new Date(sensor.lastReadingAt).getTime() : undefined,
            };
          });
          
          set({ 
            items: enhancedSensors, 
            isLoadingTelemetry: false,
            telemetryError: null
          });
          
          console.log(`✅ Telemetria carregada: ${enhancedSensors.length} sensores do device ${deviceId}`);
        } catch (error: any) {
          console.error('❌ Erro ao carregar telemetria:', error);
          set({ 
            isLoadingTelemetry: false,
            telemetryError: error.message || 'Erro ao carregar telemetria'
          });
          
          // Fallback: tentar usar dados do app store
          get().initializeFromAppStore();
        }
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