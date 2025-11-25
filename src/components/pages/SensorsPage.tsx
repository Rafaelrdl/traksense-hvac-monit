import React, { useState } from 'react';
import { useAppStore } from '../../store/app';
import { useDevicesSummaryQuery } from '@/hooks/queries/useDevicesQuery';
import DeviceCard from '../devices/DeviceCard';
import { DeviceStatusFilter } from '@/types/device';

export const SensorsPage: React.FC = () => {
  const { currentSite } = useAppStore();
  const [deviceStatusFilter, setDeviceStatusFilter] = useState<DeviceStatusFilter>('all');

  // React Query: buscar devices summary com auto-refresh de 30s
  const {
    data: devices = [],
    isLoading: isLoadingAssets,
    error,
    refetch,
    dataUpdatedAt,
  } = useDevicesSummaryQuery(currentSite?.id);

  const lastUpdate = dataUpdatedAt ? new Date(dataUpdatedAt) : null;
  const noAssetsAvailable = !isLoadingAssets && devices.length === 0;
  const telemetryError = error ? (error as Error).message : null;

  // Filtrar devices por status
  const filteredDevices = devices.filter((device) => {
    if (deviceStatusFilter === 'all') return true;
    if (deviceStatusFilter === 'online') return device.device_status === 'ONLINE';
    if (deviceStatusFilter === 'offline') return device.device_status === 'OFFLINE';
    return true;
  });

  // Debug logs
  console.log('📊 [SensorsPage Debug]', {
    devicesCount: devices.length,
    filteredDevicesCount: filteredDevices.length,
    isLoadingAssets,
    currentSite: currentSite?.name,
    deviceStatusFilter,
  });

  // Função para atualizar manualmente
  const handleManualRefresh = () => {
    if (!currentSite?.id) return;
    
    console.log('🔄 Atualização manual solicitada');
    refetch();
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Sensores & Telemetria</h1>
          <p className="text-muted-foreground">
            Monitoramento em tempo real de dispositivos agrupados
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

      {/* Filtros e Contadores */}
      <div className="flex items-center justify-between gap-4 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
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

        {/* Contadores */}
        <div className="flex items-center gap-4 text-sm text-gray-600">
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
        </div>
      </div>

      {/* Loading State */}
      {isLoadingAssets && devices.length === 0 && (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando dispositivos...</p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoadingAssets && filteredDevices.length === 0 && (
        <div className="flex items-center justify-center h-64">
          <div className="text-center max-w-md">
            {noAssetsAvailable ? (
              <>
                <p className="text-lg font-medium text-muted-foreground mb-2">
                  📍 {currentSite ? 'Nenhum dispositivo encontrado neste site' : 'Nenhum site selecionado'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {currentSite 
                    ? `O site "${currentSite.name}" ainda não possui dispositivos cadastrados.` 
                    : 'Selecione um site no header para visualizar os dispositivos.'}
                </p>
                {currentSite && (
                  <p className="text-xs text-muted-foreground mt-4">
                    💡 Os dispositivos são cadastrados automaticamente via tópico MQTT
                  </p>
                )}
              </>
            ) : (
              <>
                <p className="text-lg font-medium text-muted-foreground mb-2">
                  Nenhum dispositivo encontrado com os filtros aplicados
                </p>
                <p className="text-sm text-muted-foreground">
                  Tente ajustar o filtro de status ou aguarde a sincronização
                </p>
              </>
            )}
          </div>
        </div>
      )}

      {/* Device Cards Grid */}
      {filteredDevices.length > 0 && (
        <div className="grid gap-6">
          {filteredDevices.map((device) => (
            <DeviceCard key={device.id} device={device} />
          ))}
        </div>
      )}
    </div>
  );
};