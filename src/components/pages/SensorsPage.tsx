import React, { useEffect, useState } from 'react';
import { useAppStore } from '../../store/app';
import { useSensorsStore } from '../../store/sensors';
import { useSensorsURLParams } from '../../hooks/useSensorsURLParams';
import { SensorsHeaderControls } from '../../modules/sensors/SensorsHeaderControls';
import { SensorsGrid } from '../../modules/sensors/SensorsGrid';

export const SensorsPage: React.FC = () => {
  const { setSelectedAsset, startTelemetryAutoRefresh, stopTelemetryAutoRefresh } = useAppStore();
  const { setFilter, getPaginatedSensors, initializeFromAppStore, loadRealTelemetry, isLoadingTelemetry, telemetryError } = useSensorsStore();
  const { params } = useSensorsURLParams();
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // Device ID para telemetria (pode ser dinâmico no futuro)
  const DEVICE_ID = 'GW-1760908415'; // Device do teste

  // Initialize sensors with real telemetry on mount
  useEffect(() => {
    // Tentar carregar telemetria real
    loadRealTelemetry(DEVICE_ID).catch(error => {
      console.warn('Falha ao carregar telemetria, usando dados mock:', error);
      // Fallback para dados do app store
      initializeFromAppStore();
    });

    // Iniciar auto-refresh de telemetria (30 segundos)
    startTelemetryAutoRefresh(DEVICE_ID, 30000);

    // Configurar intervalo para atualizar timestamp
    const updateInterval = setInterval(() => {
      setLastUpdate(new Date());
      // Recarregar telemetria
      loadRealTelemetry(DEVICE_ID);
    }, 30000); // 30 segundos

    // Cleanup ao desmontar
    return () => {
      stopTelemetryAutoRefresh();
      clearInterval(updateInterval);
    };
  }, []);

  // Sync URL params with store when URL changes
  useEffect(() => {
    setFilter(params);
  }, [params, setFilter]);

  // Get paginated sensors and pagination info
  const { sensors: pageItems, pagination } = getPaginatedSensors();

  // Handle navigation to equipment details
  const handleNavigateToEquipment = (equipmentId: string) => {
    setSelectedAsset(equipmentId);
    
    // Dispatch custom event to trigger navigation in App.tsx
    window.dispatchEvent(new CustomEvent('navigate-to-page', { 
      detail: { page: 'assets' } 
    }));
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Sensores & Telemetria</h1>
          <p className="text-muted-foreground">
            Monitoramento em tempo real da rede de sensores IoT
          </p>
        </div>
        
        {/* Last Update Badge */}
        <div className="flex items-center gap-2">
          {isLoadingTelemetry && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
              <span>Atualizando...</span>
            </div>
          )}
          
          {!isLoadingTelemetry && lastUpdate && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Última atualização: {lastUpdate.toLocaleTimeString()}</span>
            </div>
          )}
          
          {telemetryError && (
            <div className="flex items-center gap-2 text-sm text-red-500">
              <span>⚠️ {telemetryError}</span>
            </div>
          )}
        </div>
      </div>

      {/* Header Controls with Filters and Pagination */}
      <SensorsHeaderControls 
        onNavigateToEquipment={handleNavigateToEquipment}
      />

      {/* Loading State */}
      {isLoadingTelemetry && pageItems.length === 0 && (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando sensores...</p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoadingTelemetry && pageItems.length === 0 && (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-lg font-medium text-muted-foreground mb-2">
              Nenhum sensor encontrado
            </p>
            <p className="text-sm text-muted-foreground">
              Verifique os filtros ou aguarde a sincronização com o backend
            </p>
          </div>
        </div>
      )}

      {/* Sensors Grid/Table */}
      {pageItems.length > 0 && (
        <SensorsGrid 
          sensors={pageItems} 
          onNavigateToEquipment={handleNavigateToEquipment}
        />
      )}
    </div>
  );
};