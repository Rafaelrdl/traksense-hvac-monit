import React, { useEffect, useState } from 'react';
import { useAppStore } from '../../store/app';
import { useSensorsStore } from '../../store/sensors';
import { useSensorsURLParams } from '../../hooks/useSensorsURLParams';
import { SensorsHeaderControls } from '../../modules/sensors/SensorsHeaderControls';
import { SensorsGrid } from '../../modules/sensors/SensorsGrid';
import { devicesService, Device } from '../../services/devicesService';

export const SensorsPage: React.FC = () => {
  const { setSelectedAsset, startTelemetryAutoRefresh, stopTelemetryAutoRefresh, currentSite } = useAppStore();
  const { setFilter, getPaginatedSensors, initializeFromAppStore, loadRealTelemetry, isLoadingTelemetry, telemetryError } = useSensorsStore();
  const { params } = useSensorsURLParams();
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [noDeviceAvailable, setNoDeviceAvailable] = useState(false);
  const [devices, setDevices] = useState<Device[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [isLoadingDevices, setIsLoadingDevices] = useState(false);

  // Carregar devices do site selecionado
  useEffect(() => {
    if (!currentSite?.id) {
      console.warn('⚠️ Nenhum site selecionado. Aguardando seleção de site...');
      setDevices([]);
      setSelectedDevice(null);
      setNoDeviceAvailable(true);
      useSensorsStore.setState({ items: [] });
      return;
    }

    console.log(`📡 Carregando devices do site: ${currentSite.name} (ID: ${currentSite.id})`);
    setIsLoadingDevices(true);

    devicesService.listBySite(currentSite.id)
      .then((deviceList) => {
        console.log(`✅ ${deviceList.length} device(s) encontrado(s) para o site ${currentSite.name}`);
        setDevices(deviceList);

        if (deviceList.length > 0) {
          // Preferir GATEWAYs, ou usar o primeiro device disponível
          const preferredDevice = deviceList.find(d => d.device_type === 'GATEWAY') || deviceList[0];
          setSelectedDevice(preferredDevice);
          setNoDeviceAvailable(false);
          console.log(`🎯 Device selecionado: ${preferredDevice.name} (${preferredDevice.mqtt_client_id})`);
        } else {
          setSelectedDevice(null);
          setNoDeviceAvailable(true);
          useSensorsStore.setState({ items: [] });
          console.warn('⚠️ Nenhum device encontrado para este site');
        }
      })
      .catch((error) => {
        console.error('❌ Erro ao carregar devices:', error);
        setDevices([]);
        setSelectedDevice(null);
        setNoDeviceAvailable(true);
        useSensorsStore.setState({ items: [] });
      })
      .finally(() => {
        setIsLoadingDevices(false);
      });
  }, [currentSite?.id]);

  // Carregar telemetria quando device for selecionado
  useEffect(() => {
    if (!selectedDevice) {
      useSensorsStore.setState({ items: [] });
      return;
    }

    console.log(`📊 Carregando telemetria do device: ${selectedDevice.mqtt_client_id}`);
    
    loadRealTelemetry(selectedDevice.mqtt_client_id)
      .then(() => {
        console.log('✅ Telemetria carregada com sucesso');
        setLastUpdate(new Date());
      })
      .catch((error) => {
        console.error('❌ Erro ao carregar telemetria:', error);
        useSensorsStore.setState({ items: [] });
      });

    // Auto-refresh a cada 30 segundos
    // startTelemetryAutoRefresh(selectedDevice.mqtt_client_id, 30000);

    return () => {
      stopTelemetryAutoRefresh();
    };
  }, [selectedDevice?.mqtt_client_id]);

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
      {(isLoadingTelemetry || isLoadingDevices) && pageItems.length === 0 && (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-muted-foreground">
              {isLoadingDevices ? 'Carregando devices...' : 'Carregando sensores...'}
            </p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoadingTelemetry && !isLoadingDevices && pageItems.length === 0 && (
        <div className="flex items-center justify-center h-64">
          <div className="text-center max-w-md">
            {noDeviceAvailable ? (
              <>
                <p className="text-lg font-medium text-muted-foreground mb-2">
                  📍 {currentSite ? 'Nenhum device encontrado neste site' : 'Nenhum site selecionado'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {currentSite 
                    ? `O site "${currentSite.name}" ainda não possui devices ou sensores cadastrados.` 
                    : 'Selecione um site no header para visualizar os sensores.'}
                </p>
                {currentSite && (
                  <p className="text-xs text-muted-foreground mt-4">
                    💡 Cadastre devices e vincule-os a assets do site "${currentSite.name}" no Django Admin.
                  </p>
                )}
              </>
            ) : (
              <>
                <p className="text-lg font-medium text-muted-foreground mb-2">
                  Nenhum sensor encontrado
                </p>
                <p className="text-sm text-muted-foreground">
                  Verifique os filtros ou aguarde a sincronização com o backend
                </p>
              </>
            )}
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