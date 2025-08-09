import React from 'react';
import { useAppStore } from '../../store/app';
import { Activity, Wifi, WifiOff, TrendingUp } from 'lucide-react';

export const SensorsPage: React.FC = () => {
  const { sensors } = useAppStore();

  const onlineSensors = sensors.filter(s => s.online);
  const offlineSensors = sensors.filter(s => !s.online);

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
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card rounded-xl p-6 border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-green-600">{onlineSensors.length}</h3>
              <p className="text-sm text-muted-foreground">Sensores Online</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Wifi className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl p-6 border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-red-600">{offlineSensors.length}</h3>
              <p className="text-sm text-muted-foreground">Sensores Offline</p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <WifiOff className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl p-6 border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-primary">
                {(onlineSensors.length / sensors.length * 100).toFixed(1)}%
              </h3>
              <p className="text-sm text-muted-foreground">Disponibilidade</p>
            </div>
            <div className="p-3 bg-primary/10 rounded-lg">
              <TrendingUp className="w-6 h-6 text-primary" />
            </div>
          </div>
        </div>
      </div>

      {/* Sensors Table */}
      <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold">Catálogo de Sensores</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left py-3 px-6 font-medium text-muted-foreground">Sensor</th>
                <th className="text-left py-3 px-6 font-medium text-muted-foreground">Ativo</th>
                <th className="text-left py-3 px-6 font-medium text-muted-foreground">Tipo</th>
                <th className="text-left py-3 px-6 font-medium text-muted-foreground">Última Leitura</th>
                <th className="text-left py-3 px-6 font-medium text-muted-foreground">Status</th>
                <th className="text-left py-3 px-6 font-medium text-muted-foreground">Disponibilidade</th>
              </tr>
            </thead>
            <tbody>
              {sensors.slice(0, 20).map(sensor => (
                <tr key={sensor.id} className="border-b last:border-b-0 hover:bg-muted/30">
                  <td className="py-3 px-6">
                    <div className="flex items-center space-x-3">
                      <Activity className="w-4 h-4 text-primary" />
                      <span className="font-medium">{sensor.tag}</span>
                    </div>
                  </td>
                  <td className="py-3 px-6 text-sm">{sensor.assetId.toUpperCase()}</td>
                  <td className="py-3 px-6 text-sm">{sensor.type.replace('_', ' ')}</td>
                  <td className="py-3 px-6 text-sm">
                    {sensor.lastReading ? (
                      <div>
                        <div>{sensor.lastReading.value.toFixed(2)} {sensor.unit}</div>
                        <div className="text-xs text-muted-foreground">
                          {(sensor.lastReading.timestamp instanceof Date ? sensor.lastReading.timestamp : new Date(sensor.lastReading.timestamp)).toLocaleString('pt-BR')}
                        </div>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">Sem dados</span>
                    )}
                  </td>
                  <td className="py-3 px-6">
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${sensor.online ? 'bg-green-400' : 'bg-red-400'}`} />
                      <span className="text-sm">{sensor.online ? 'Online' : 'Offline'}</span>
                    </div>
                  </td>
                  <td className="py-3 px-6 text-sm">{sensor.availability.toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};