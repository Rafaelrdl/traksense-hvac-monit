import React from 'react';
import { useAppStore } from '../../store/app';
import { Activity, Wifi, WifiOff, Thermometer, Droplets, Clock, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface JE02SensorDetailProps {
  assetId: string;
}

export const JE02SensorDetail: React.FC<JE02SensorDetailProps> = ({ assetId }) => {
  const { sensors, assets } = useAppStore();

  // Get the asset
  const asset = assets.find(a => a.id === assetId);

  // Get all JE02 sensors for this asset
  const je02Sensors = sensors.filter(s => 
    s.assetId === assetId && 
    (s.tag.includes('JE02') || 
     s.type === 'status' || 
     s.type === 'fault' || 
     s.type === 'rssi' || 
     s.type === 'temp_je02' || 
     s.type === 'humidity_je02' || 
     s.type === 'uptime' || 
     s.type === 'error_count')
  );

  if (je02Sensors.length === 0) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        Nenhum sensor JE02 encontrado para este equipamento.
      </div>
    );
  }

  // Extract sensor data
  const statusSensor = je02Sensors.find(s => s.type === 'status');
  const faultSensor = je02Sensors.find(s => s.type === 'fault');
  const rssiSensor = je02Sensors.find(s => s.type === 'rssi');
  const tempSensor = je02Sensors.find(s => s.type === 'temp_je02');
  const humiditySensor = je02Sensors.find(s => s.type === 'humidity_je02');
  const uptimeSensor = je02Sensors.find(s => s.type === 'uptime');
  const errorSensor = je02Sensors.find(s => s.type === 'error_count');

  // Get status text
  const getStatusText = (value: number | undefined) => {
    if (value === undefined || value === null) return 'UNKNOWN';
    return value === 1 ? 'RUN' : 'STOP';
  };

  const getFaultText = (value: number | undefined) => {
    if (value === undefined || value === null) return 'UNKNOWN';
    return value === 1 ? 'FAULT' : 'OK';
  };

  const getRSSIQuality = (rssi: number | undefined) => {
    if (rssi === undefined || rssi === null) return { text: 'Unknown', color: 'text-gray-500' };
    if (rssi >= -50) return { text: 'Excelente', color: 'text-green-600' };
    if (rssi >= -60) return { text: 'Bom', color: 'text-green-500' };
    if (rssi >= -70) return { text: 'Regular', color: 'text-yellow-600' };
    return { text: 'Fraco', color: 'text-red-600' };
  };

  const formatUptime = (seconds: number | undefined) => {
    if (seconds === undefined || seconds === null) return 'N/A';
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  const statusValue = statusSensor?.lastReading?.value;
  const faultValue = faultSensor?.lastReading?.value;
  const rssiValue = rssiSensor?.lastReading?.value;
  const rssiQuality = getRSSIQuality(rssiValue);

  const isRunning = statusValue === 1;
  const hasFault = faultValue === 1;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Activity className="w-6 h-6 text-primary" />
          Sensor JE02 - {asset?.tag}
        </h2>
        <p className="text-muted-foreground mt-1">{asset?.location}</p>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Operation Status */}
        <Card className={isRunning ? 'border-green-200 bg-green-50/50' : 'border-gray-200'}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              {isRunning ? (
                <CheckCircle2 className="w-4 h-4 text-green-600" />
              ) : (
                <XCircle className="w-4 h-4 text-gray-500" />
              )}
              Status de Operação
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <Badge variant={isRunning ? "default" : "secondary"} className="text-base px-3 py-1">
                {getStatusText(statusValue)}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              INPUT1: {statusValue ?? 'N/A'}
            </p>
          </CardContent>
        </Card>

        {/* Fault Status */}
        <Card className={hasFault ? 'border-red-200 bg-red-50/50' : 'border-green-200 bg-green-50/50'}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              {hasFault ? (
                <AlertTriangle className="w-4 h-4 text-red-600" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-green-600" />
              )}
              Status de Falha
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <Badge variant={hasFault ? "destructive" : "default"} className="text-base px-3 py-1">
                {getFaultText(faultValue)}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              INPUT2: {faultValue ?? 'N/A'}
            </p>
          </CardContent>
        </Card>

        {/* WiFi Signal */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              {rssiValue && rssiValue > -70 ? (
                <Wifi className="w-4 h-4 text-green-600" />
              ) : (
                <WifiOff className="w-4 h-4 text-orange-600" />
              )}
              Sinal WiFi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {rssiValue ?? 'N/A'} <span className="text-sm font-normal text-muted-foreground">dBm</span>
            </div>
            <p className={`text-sm font-medium mt-1 ${rssiQuality.color}`}>
              {rssiQuality.text}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Environmental Data */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Temperature */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Thermometer className="w-5 h-5 text-red-500" />
              Temperatura
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              {tempSensor?.lastReading?.value?.toFixed(1) ?? 'N/A'}
              <span className="text-lg font-normal text-muted-foreground ml-1">°C</span>
            </div>
            <div className="mt-3 text-xs text-muted-foreground">
              <div>VAR0 Raw: {tempSensor?.lastReading?.value ? (tempSensor.lastReading.value * 10).toFixed(0) : 'N/A'}</div>
              <div>Fórmula: VAR0 / 10</div>
            </div>
          </CardContent>
        </Card>

        {/* Humidity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Droplets className="w-5 h-5 text-blue-500" />
              Umidade Relativa
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              {humiditySensor?.lastReading?.value?.toFixed(1) ?? 'N/A'}
              <span className="text-lg font-normal text-muted-foreground ml-1">%</span>
            </div>
            <div className="mt-3 text-xs text-muted-foreground">
              <div>VAR1 Raw: {humiditySensor?.lastReading?.value ? (humiditySensor.lastReading.value * 10).toFixed(0) : 'N/A'}</div>
              <div>Fórmula: VAR1 / 10</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            Informações do Sistema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Tempo de Operação</p>
              <p className="text-xl font-semibold mt-1">
                {formatUptime(uptimeSensor?.lastReading?.value)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {uptimeSensor?.lastReading?.value?.toLocaleString()} segundos
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Erros de Comunicação</p>
              <p className="text-xl font-semibold mt-1">
                {errorSensor?.lastReading?.value ?? 'N/A'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">CNTSERR</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Estado do Relé</p>
              <p className="text-xl font-semibold mt-1">
                <Badge variant="outline">OFF</Badge>
              </p>
              <p className="text-xs text-muted-foreground mt-1">Reset de Falha</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payload Example */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Exemplo de Payload DATA</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto">
{JSON.stringify({
  DATA: {
    INPUT1: statusValue ?? 0,
    INPUT2: faultValue ?? 0,
    RELE: 0,
    WRSSI: rssiValue ?? -60,
    VAR0: tempSensor?.lastReading?.value ? Math.round(tempSensor.lastReading.value * 10) : 0,
    VAR1: humiditySensor?.lastReading?.value ? Math.round(humiditySensor.lastReading.value * 10) : 0,
    CNTSERR: errorSensor?.lastReading?.value ?? 0,
    UPTIME: uptimeSensor?.lastReading?.value ?? 0
  }
}, null, 2)}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
};
