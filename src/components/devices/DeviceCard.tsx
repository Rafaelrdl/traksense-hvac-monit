import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Activity, AlertCircle, Gauge } from 'lucide-react';
import { DeviceSummary, SensorVariable } from '@/types/device';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface DeviceCardProps {
  device: DeviceSummary;
}

const DeviceCard: React.FC<DeviceCardProps> = ({ device }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getStatusColor = (isOnline: boolean) => {
    return isOnline ? 'text-green-600' : 'text-gray-400';
  };

  const getStatusBadge = (isOnline: boolean) => {
    return isOnline ? (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        <span className="w-2 h-2 mr-1.5 rounded-full bg-green-600"></span>
        Online
      </span>
    ) : (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
        <span className="w-2 h-2 mr-1.5 rounded-full bg-gray-400"></span>
        Offline
      </span>
    );
  };

  const formatValue = (value: number | null, unit: string) => {
    if (value === null) return 'N/A';
    
    // Format based on unit
    if (unit === 'celsius') return `${value.toFixed(1)}°C`;
    if (unit === 'percent_rh') return `${value.toFixed(1)}%`;
    if (unit === 'dBW' || unit === 'dB') return `${value.toFixed(1)} ${unit}`;
    
    return `${value.toFixed(2)} ${unit}`;
  };

  const formatLastReading = (timestamp: string | null) => {
    if (!timestamp) return 'Nunca';
    
    try {
      return formatDistanceToNow(new Date(timestamp), {
        addSuffix: true,
        locale: ptBR,
      });
    } catch {
      return 'Data inválida';
    }
  };

  const getMetricIcon = (metricType: string) => {
    switch (metricType) {
      case 'signal':
      case 'maintenance':
        return <Activity className="w-4 h-4" />;
      case 'humidity':
        return <Gauge className="w-4 h-4" />;
      default:
        return <Gauge className="w-4 h-4" />;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
      {/* Card Header */}
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-lg font-semibold text-gray-900">
                {device.display_name || device.name}
              </h3>
              {getStatusBadge(device.device_status === 'ONLINE')}
            </div>

            <div className="space-y-1 text-sm text-gray-600">
              <p>
                <span className="font-medium">Asset:</span>{' '}
                {device.asset_info.tag} - {device.asset_info.name}
              </p>
              <p>
                <span className="font-medium">MQTT Client ID:</span>{' '}
                {device.mqtt_client_id}
              </p>
              {device.firmware_version && (
                <p>
                  <span className="font-medium">Firmware:</span>{' '}
                  {device.firmware_version}
                </p>
              )}
              <p>
                <span className="font-medium">Última conexão:</span>{' '}
                {formatLastReading(device.last_seen)}
              </p>
            </div>
          </div>

          {/* Variables Summary */}
          <div className="ml-4 text-right">
            <div className="text-sm font-medium text-gray-700 mb-1">
              Variáveis
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {device.total_variables_count}
            </div>
            <div className="text-xs text-gray-500">
              {device.online_variables_count} online
            </div>
          </div>
        </div>

        {/* Expand Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-md transition-colors text-sm font-medium text-gray-700"
        >
          {isExpanded ? (
            <>
              <ChevronUp className="w-4 h-4" />
              Ocultar Variáveis
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4" />
              Ver Variáveis ({device.total_variables_count})
            </>
          )}
        </button>
      </div>

      {/* Expandable Variables List */}
      {isExpanded && (
        <div className="border-t border-gray-200 bg-gray-50">
          <div className="p-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">
              Variáveis do Dispositivo
            </h4>
            
            {device.variables.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <AlertCircle className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm">Nenhuma variável encontrada</p>
              </div>
            ) : (
              <div className="space-y-2">
                {device.variables.map((variable) => (
                  <VariableRow key={variable.id} variable={variable} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

interface VariableRowProps {
  variable: SensorVariable;
}

const VariableRow: React.FC<VariableRowProps> = ({ variable }) => {
  const formatValue = (value: number | null, unit: string) => {
    if (value === null) return 'N/A';
    
    if (unit === 'celsius') return `${value.toFixed(1)}°C`;
    if (unit === 'percent_rh') return `${value.toFixed(1)}%`;
    if (unit === 'dBW' || unit === 'dB') return `${value.toFixed(1)} ${unit}`;
    
    return `${value.toFixed(2)} ${unit}`;
  };

  const formatLastReading = (timestamp: string | null) => {
    if (!timestamp) return 'Nunca';
    
    try {
      return formatDistanceToNow(new Date(timestamp), {
        addSuffix: true,
        locale: ptBR,
      });
    } catch {
      return 'Data inválida';
    }
  };

  return (
    <div
      className={`flex items-center justify-between p-3 rounded-md border ${
        variable.is_online
          ? 'bg-white border-gray-200'
          : 'bg-gray-50 border-gray-200 opacity-60'
      }`}
    >
      <div className="flex items-center gap-3 flex-1">
        {/* Status Indicator */}
        <div
          className={`w-2 h-2 rounded-full ${
            variable.is_online ? 'bg-green-500' : 'bg-gray-400'
          }`}
        />

        {/* Variable Info */}
        <div className="flex-1 min-w-0">
          <h5 className="text-sm font-medium text-gray-900 truncate">
            {variable.name}
          </h5>
          <p className="text-xs text-gray-500 truncate">
            {variable.tag}
          </p>
        </div>
      </div>

      {/* Value & Timestamp */}
      <div className="text-right ml-4">
        <div className={`text-sm font-semibold ${
          variable.is_online ? 'text-gray-900' : 'text-gray-500'
        }`}>
          {formatValue(variable.last_value, variable.unit)}
        </div>
        <div className="text-xs text-gray-500">
          {formatLastReading(variable.last_reading_at)}
        </div>
      </div>
    </div>
  );
};

export default DeviceCard;
