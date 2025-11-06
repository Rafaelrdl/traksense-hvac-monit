import React, { useEffect, useState } from 'react';
import { useAppStore } from '../../store/app';
import { useSensorsStore } from '../../store/sensors';
import { useSensorsURLParams } from '../../hooks/useSensorsURLParams';
import { SensorsHeaderControls } from '../../modules/sensors/SensorsHeaderControls';
import { SensorsGrid } from '../../modules/sensors/SensorsGrid';
import { assetsService } from '../../services/assetsService';
import { devicesService } from '../../services/devicesService';
import DeviceCard from '../devices/DeviceCard';
import { DeviceSummary, DeviceStatusFilter } from '@/types/device';

// Helper: Converte ApiSensor para EnhancedSensor
const convertToEnhancedSensor = (sensor: any, asset: any): any => {
  const isOnline = sensor.last_reading_at 
    ? (Date.now() - new Date(sensor.last_reading_at).getTime()) < 5 * 60 * 1000 // Online se última leitura < 5min
    : false;

  return {
    id: sensor.id?.toString() || sensor.tag,
    name: sensor.tag || `Sensor ${sensor.id}`,
    tag: sensor.tag,
    status: (isOnline ? 'online' : 'offline') as 'online' | 'offline',
    equipmentId: asset?.id?.toString() || 'unknown',
    equipmentName: asset?.name || asset?.tag || 'Equipamento não encontrado',
    type: sensor.metric_type || 'UNKNOWN',
    unit: sensor.unit || '',
    lastReading: sensor.last_value !== null && sensor.last_value !== undefined ? {
      value: sensor.last_value,
      timestamp: sensor.last_reading_at ? new Date(sensor.last_reading_at) : new Date(),
    } : null,
    availability: isOnline ? 95 : 0,
    lastSeenAt: sensor.last_reading_at ? new Date(sensor.last_reading_at).getTime() : undefined,
  };
};

export const SensorsPage: React.FC = () => {
  const { setSelectedAsset, stopTelemetryAutoRefresh, currentSite } = useAppStore();
  const { setFilter, getPaginatedSensors } = useSensorsStore();
  const { params } = useSensorsURLParams();
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [noAssetsAvailable, setNoAssetsAvailable] = useState(false);
  const [isLoadingAssets, setIsLoadingAssets] = useState(false);
  const [telemetryError, setTelemetryError] = useState<string | null>(null);
  
  // 🆕 Novo estado para devices agrupados
  const [devices, setDevices] = useState<DeviceSummary[]>([]);
  const [deviceStatusFilter, setDeviceStatusFilter] = useState<DeviceStatusFilter>('all');
  const [useGroupedView, setUseGroupedView] = useState(true); // Toggle entre nova e antiga visualização

  // 🆕 Carregar devices agrupados com variáveis
  const loadDevicesSummary = async () => {
    if (!currentSite?.id) {
      console.warn('⚠️ Nenhum site selecionado. Aguardando seleção de site...');
      setNoAssetsAvailable(true);
      setDevices([]);
      return;
    }

    console.log(`📡 [GROUPED VIEW] Carregando devices summary do site: ${currentSite.name} (ID: ${currentSite.id})`);
    setIsLoadingAssets(true);
    setNoAssetsAvailable(false);
    setTelemetryError(null);

    try {
      const devicesSummary = await devicesService.getSummaryBySite(currentSite.id);
      console.log(`✅ ${devicesSummary.length} device(s) encontrado(s) com variáveis agrupadas`);
      
      setDevices(devicesSummary);
      setLastUpdate(new Date());
      setNoAssetsAvailable(devicesSummary.length === 0);
    } catch (error: any) {
      console.error('❌ Erro ao carregar devices summary:', error);
      setTelemetryError(error.message || 'Erro ao carregar devices');
      setDevices([]);
      setNoAssetsAvailable(true);
    } finally {
      setIsLoadingAssets(false);
    }
  };

  // Carregar sensores de TODOS os assets do site selecionado (via tópico MQTT)
  useEffect(() => {
    if (!currentSite?.id) {
      console.warn('⚠️ Nenhum site selecionado. Aguardando seleção de site...');
      setNoAssetsAvailable(true);
      useSensorsStore.setState({ items: [] });
      return;
    }

    // 🆕 Se estiver usando visualização agrupada, carregar devices summary
    if (useGroupedView) {
      loadDevicesSummary();
      return;
    }

    // Visualização antiga (lista de sensores individuais)
    console.log(`📡 Carregando assets e sensores do site: ${currentSite.name} (ID: ${currentSite.id})`);
    setIsLoadingAssets(true);
    setNoAssetsAvailable(false);

    // 1. Buscar assets do site
    assetsService.getBySite(currentSite.id)
      .then(async (response) => {
        const assetsList = response.results;
        console.log(`✅ ${assetsList.length} asset(s) encontrado(s) para o site ${currentSite.name}`);

        if (assetsList.length === 0) {
          setNoAssetsAvailable(true);
          useSensorsStore.setState({ items: [] });
          console.warn('⚠️ Nenhum asset encontrado para este site');
          return;
        }

        // 2. Buscar sensores de TODOS os assets (baseado no tópico MQTT)
        const allSensorsPromises = assetsList.map(asset => 
          assetsService.getSensors(asset.id)
            .then(apiSensors => {
              console.log(`📊 Asset "${asset.name}": ${apiSensors.length} sensor(es)`);
              // Converter ApiSensor[] para EnhancedSensor[]
              return apiSensors.map(sensor => convertToEnhancedSensor(sensor, asset));
            })
            .catch(error => {
              console.error(`❌ Erro ao buscar sensores do asset ${asset.name}:`, error);
              return [];
            })
        );

        const sensorsArrays = await Promise.all(allSensorsPromises);
        const allEnhancedSensors = sensorsArrays.flat();

        console.log(`✅ Total consolidado: ${allEnhancedSensors.length} sensores de ${assetsList.length} asset(s)`);
        
        // Atualizar store com todos os sensores do site
        useSensorsStore.setState({ items: allEnhancedSensors });
        setLastUpdate(new Date());
        setNoAssetsAvailable(allEnhancedSensors.length === 0);
        setTelemetryError(null);
      })
      .catch((error) => {
        console.error('❌ Erro ao carregar assets:', error);
        setNoAssetsAvailable(true);
        useSensorsStore.setState({ items: [] });
      })
      .finally(() => {
        setIsLoadingAssets(false);
      });
  }, [currentSite?.id, useGroupedView]);

  // 🔄 Auto-refresh a cada 30 segundos
  useEffect(() => {
    if (!currentSite?.id) return;

    console.log('🔄 Iniciando auto-refresh de telemetria (30s)');
    const intervalId = setInterval(() => {
      console.log('🔄 Atualizando telemetria automaticamente...');
      
      // 🆕 Se estiver usando visualização agrupada, atualizar devices summary
      if (useGroupedView) {
        devicesService.getSummaryBySite(currentSite.id)
          .then((devicesSummary) => {
            setDevices(devicesSummary);
            setLastUpdate(new Date());
            console.log('✅ Devices summary atualizado automaticamente');
          })
          .catch((error) => {
            console.error('❌ Erro ao atualizar devices summary:', error);
          });
        return;
      }

      // Visualização antiga
      assetsService.getBySite(currentSite.id)
        .then(async (response) => {
          const assetsList = response.results;
          const allSensorsPromises = assetsList.map(asset => 
            assetsService.getSensors(asset.id)
              .then(apiSensors => apiSensors.map(s => convertToEnhancedSensor(s, asset)))
              .catch(() => [])
          );
          const sensorsArrays = await Promise.all(allSensorsPromises);
          const allEnhancedSensors = sensorsArrays.flat();
          
          useSensorsStore.setState({ items: allEnhancedSensors });
          setLastUpdate(new Date());
          console.log('✅ Telemetria atualizada automaticamente');
        })
        .catch((error) => {
          console.error('❌ Erro ao atualizar telemetria:', error);
        });
    }, 30000); // 30 segundos

    return () => {
      console.log('⏸️ Parando auto-refresh de telemetria');
      clearInterval(intervalId);
      stopTelemetryAutoRefresh();
    };
  }, [currentSite?.id, useGroupedView]);

  // Sync URL params with store when URL changes
  useEffect(() => {
    setFilter(params);
  }, [params, setFilter]);

  // Get paginated sensors and pagination info
  const { sensors: pageItems, pagination } = getPaginatedSensors();

  // 🆕 Filtrar devices por status
  const filteredDevices = devices.filter((device) => {
    if (deviceStatusFilter === 'all') return true;
    if (deviceStatusFilter === 'online') return device.device_status === 'ONLINE';
    if (deviceStatusFilter === 'offline') return device.device_status === 'OFFLINE';
    return true;
  });

  // Handle navigation to equipment details
  const handleNavigateToEquipment = (equipmentId: string) => {
    setSelectedAsset(equipmentId);
    
    // Dispatch custom event to trigger navigation in App.tsx
    window.dispatchEvent(new CustomEvent('navigate-to-page', { 
      detail: { page: 'assets' } 
    }));
  };

  // Função para atualizar manualmente
  const handleManualRefresh = () => {
    if (!currentSite?.id) return;
    
    console.log('🔄 Atualização manual solicitada');
    
    // 🆕 Se estiver usando visualização agrupada, recarregar devices summary
    if (useGroupedView) {
      loadDevicesSummary();
      return;
    }

    // Visualização antiga
    setIsLoadingAssets(true);
    
    assetsService.getBySite(currentSite.id)
      .then(async (response) => {
        const assetsList = response.results;
        const allSensorsPromises = assetsList.map(asset => 
          assetsService.getSensors(asset.id)
            .then(apiSensors => apiSensors.map(s => convertToEnhancedSensor(s, asset)))
            .catch(() => [])
        );
        const sensorsArrays = await Promise.all(allSensorsPromises);
        const allEnhancedSensors = sensorsArrays.flat();
        
        useSensorsStore.setState({ items: allEnhancedSensors });
        setLastUpdate(new Date());
        setTelemetryError(null);
        console.log('✅ Atualização manual concluída');
      })
      .catch((error) => {
        console.error('❌ Erro na atualização manual:', error);
        setTelemetryError(error.message || 'Erro ao atualizar');
      })
      .finally(() => {
        setIsLoadingAssets(false);
      });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Sensores & Telemetria</h1>
          <p className="text-muted-foreground">
            Monitoramento em tempo real {useGroupedView ? 'de dispositivos agrupados' : 'da rede de sensores IoT'}
          </p>
        </div>
        
        {/* Last Update Badge and Manual Refresh */}
        <div className="flex items-center gap-3">
          {isLoadingAssets && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
              <span>Atualizando...</span>
            </div>
          )}
          
          {!isLoadingAssets && lastUpdate && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Atualizado às {lastUpdate.toLocaleTimeString()}</span>
              </div>
              <button
                onClick={handleManualRefresh}
                disabled={isLoadingAssets}
                className="px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/10 rounded-md transition-colors disabled:opacity-50"
                title="Atualizar agora (próxima atualização automática em 30s)"
              >
                🔄 Atualizar
              </button>
            </div>
          )}
          
          {telemetryError && (
            <div className="flex items-center gap-2 text-sm text-red-500">
              <span>⚠️ {telemetryError}</span>
            </div>
          )}
          
          {currentSite && !isLoadingAssets && !telemetryError && (
            <div className="text-xs text-muted-foreground border-l pl-3">
              Auto-refresh: 30s
            </div>
          )}
        </div>
      </div>

      {/* 🆕 View Toggle e Filtros para visualização agrupada */}
      <div className="flex items-center justify-between gap-4 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center gap-4">
          {/* Toggle de Visualização */}
          <button
            onClick={() => setUseGroupedView(!useGroupedView)}
            className="px-4 py-2 text-sm font-medium rounded-md border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            {useGroupedView ? '📋 Ver Lista Individual' : '📦 Ver Agrupado'}
          </button>

          {/* Filtro de Status (apenas na visualização agrupada) */}
          {useGroupedView && (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">Status:</span>
              <select
                value={deviceStatusFilter}
                onChange={(e) => setDeviceStatusFilter(e.target.value as DeviceStatusFilter)}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="all">Todos ({devices.length})</option>
                <option value="online">
                  Online ({devices.filter((d) => d.device_status === 'ONLINE').length})
                </option>
                <option value="offline">
                  Offline ({devices.filter((d) => d.device_status === 'OFFLINE').length})
                </option>
              </select>
            </div>
          )}
        </div>

        {/* Contadores */}
        <div className="flex items-center gap-4 text-sm text-gray-600">
          {useGroupedView ? (
            <>
              <div className="flex items-center gap-2">
                <span className="font-medium">Devices:</span>
                <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full font-medium">
                  {filteredDevices.length}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">Variáveis Total:</span>
                <span className="px-2 py-0.5 bg-purple-100 text-purple-800 rounded-full font-medium">
                  {filteredDevices.reduce((sum, d) => sum + d.total_variables_count, 0)}
                </span>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <span className="font-medium">Sensores:</span>
              <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full font-medium">
                {pageItems.length}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Header Controls with Filters and Pagination (apenas visualização antiga) */}
      {!useGroupedView && (
        <SensorsHeaderControls 
          onNavigateToEquipment={handleNavigateToEquipment}
        />
      )}

      {/* Loading State */}
      {isLoadingAssets && pageItems.length === 0 && (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-muted-foreground">
              Carregando sensores...
            </p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoadingAssets && pageItems.length === 0 && (
        <div className="flex items-center justify-center h-64">
          <div className="text-center max-w-md">
            {noAssetsAvailable ? (
              <>
                <p className="text-lg font-medium text-muted-foreground mb-2">
                  📍 {currentSite ? 'Nenhum asset encontrado neste site' : 'Nenhum site selecionado'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {currentSite 
                    ? `O site "${currentSite.name}" ainda não possui assets ou sensores cadastrados.` 
                    : 'Selecione um site no header para visualizar os sensores.'}
                </p>
                {currentSite && (
                  <p className="text-xs text-muted-foreground mt-4">
                    💡 Os sensores são cadastrados automaticamente via tópico MQTT: tenants/{currentSite.id}/sites/{currentSite.name}/assets/ASSET_TAG/telemetry
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

      {/* 🆕 Device Cards Grid (visualização agrupada) */}
      {useGroupedView && filteredDevices.length > 0 && (
        <div className="grid gap-6">
          {filteredDevices.map((device) => (
            <DeviceCard key={device.id} device={device} />
          ))}
        </div>
      )}

      {/* Sensors Grid/Table (visualização antiga) */}
      {!useGroupedView && pageItems.length > 0 && (
        <SensorsGrid 
          sensors={pageItems} 
          onNavigateToEquipment={handleNavigateToEquipment}
        />
      )}
    </div>
  );
};