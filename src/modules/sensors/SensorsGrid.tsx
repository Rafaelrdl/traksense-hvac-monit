import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Activity, 
  Wifi, 
  WifiOff, 
  ExternalLink,
  Clock
} from 'lucide-react';
import type { EnhancedSensor } from '@/types/sensor';

interface SensorsGridProps {
  sensors: EnhancedSensor[];
  onNavigateToEquipment?: (equipmentId: string) => void;
}

export function SensorsGrid({ sensors, onNavigateToEquipment }: SensorsGridProps) {
  const handleEquipmentClick = (equipmentId: string, e: React.MouseEvent) => {
    e.preventDefault();
    if (onNavigateToEquipment) {
      onNavigateToEquipment(equipmentId);
    }
  };

  const formatSensorType = (type: string) => {
    return type
      .replace(/_/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const formatLastSeen = (timestamp?: number) => {
    if (!timestamp) return 'Nunca';
    
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Agora mesmo';
    if (minutes < 60) return `${minutes}min atrás`;
    if (hours < 24) return `${hours}h atrás`;
    return `${days}d atrás`;
  };

  if (sensors.length === 0) {
    return (
      <div className="bg-card rounded-lg border shadow-sm p-12">
        <div className="text-center">
          <Activity className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-lg font-medium text-muted-foreground mb-2">
            Nenhum sensor encontrado
          </h3>
          <p className="text-sm text-muted-foreground">
            Tente ajustar os filtros ou verifique se há sensores cadastrados
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
      <div className="p-4 border-b bg-muted/30">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary" />
          Catálogo de Sensores
        </h3>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50 border-b">
            <tr>
              <th className="text-left py-3 px-4 font-medium text-muted-foreground text-sm">
                Sensor
              </th>
              <th className="text-left py-3 px-4 font-medium text-muted-foreground text-sm">
                Equipamento
              </th>
              <th className="text-left py-3 px-4 font-medium text-muted-foreground text-sm">
                Tipo
              </th>
              <th className="text-left py-3 px-4 font-medium text-muted-foreground text-sm">
                Última Leitura
              </th>
              <th className="text-left py-3 px-4 font-medium text-muted-foreground text-sm">
                Status
              </th>
              <th className="text-left py-3 px-4 font-medium text-muted-foreground text-sm">
                Disponibilidade
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {sensors.map((sensor) => (
              <tr 
                key={sensor.id} 
                className="hover:bg-muted/30 transition-colors"
              >
                {/* Sensor Name/Tag */}
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      sensor.status === 'online' ? 'bg-green-400' : 'bg-red-400'
                    }`} />
                    <div>
                      <div className="font-medium text-foreground">
                        {sensor.tag}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        ID: {sensor.id.slice(-8)}
                      </div>
                    </div>
                  </div>
                </td>

                {/* Equipment (clickable) */}
                <td className="py-3 px-4">
                  {onNavigateToEquipment ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => handleEquipmentClick(sensor.equipmentId, e)}
                      className="h-auto p-1 text-left justify-start font-medium text-primary hover:text-primary/80 hover:underline transition-colors"
                    >
                      {sensor.equipmentName}
                      <ExternalLink className="w-3 h-3 ml-1 flex-shrink-0" />
                    </Button>
                  ) : (
                    <span className="text-sm font-medium text-primary">
                      {sensor.equipmentName}
                    </span>
                  )}
                </td>

                {/* Sensor Type */}
                <td className="py-3 px-4">
                  <Badge variant="secondary" className="text-xs">
                    {formatSensorType(sensor.type)}
                  </Badge>
                </td>

                {/* Last Reading */}
                <td className="py-3 px-4">
                  {sensor.lastReading ? (
                    <div>
                      <div className="text-sm font-medium">
                        {sensor.lastReading.value.toFixed(2)} {sensor.unit}
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {sensor.lastReading.timestamp.toLocaleString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-muted-foreground">
                      Sem dados
                    </div>
                  )}
                </td>

                {/* Status */}
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    {sensor.status === 'online' ? (
                      <Wifi className="w-4 h-4 text-green-600" />
                    ) : (
                      <WifiOff className="w-4 h-4 text-red-600" />
                    )}
                    <span className={`text-sm font-medium ${
                      sensor.status === 'online' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {sensor.status === 'online' ? 'Online' : 'Offline'}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Visto: {formatLastSeen(sensor.lastSeenAt)}
                  </div>
                </td>

                {/* Availability */}
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      {sensor.availability.toFixed(1)}%
                    </span>
                    <div className="flex-1 max-w-20">
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            sensor.availability >= 90
                              ? 'bg-green-500'
                              : sensor.availability >= 70
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                          }`}
                          style={{ width: `${Math.max(5, sensor.availability)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}