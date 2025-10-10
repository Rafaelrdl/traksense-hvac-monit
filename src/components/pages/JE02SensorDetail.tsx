import React, { useState } from 'react';
import { useAppStore } from '../../store/app';
import { Activity, Wifi, WifiOff, Clock, AlertTriangle, CheckCircle2, XCircle, RotateCcw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface JE02SensorDetailProps {
  assetId: string;
}

export const JE02SensorDetail: React.FC<JE02SensorDetailProps> = ({ assetId }) => {
  const { sensors, assets } = useAppStore();
  const [isResetting, setIsResetting] = useState(false);

  // Get the asset
  const asset = assets.find(a => a.id === assetId);

  // Get all JE02 sensors for this asset
  const je02Sensors = sensors.filter(s => 
    s.assetId === assetId && s.tag?.includes('JE02')
  );

  if (je02Sensors.length === 0) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        Nenhum sensor JE02 encontrado para este equipamento.
      </div>
    );
  }

  // Extract sensor data by tag patterns (INPUT1, INPUT2, RSSI, UPTIME)
  const statusSensor = je02Sensors.find(s => s.tag?.includes('_INPUT1'));
  const faultSensor = je02Sensors.find(s => s.tag?.includes('_INPUT2'));
  const rssiSensor = je02Sensors.find(s => s.tag?.includes('_RSSI'));
  const uptimeSensor = je02Sensors.find(s => s.tag?.includes('_UPTIME'));

  // Handle reset fault
  const handleResetFault = () => {
    setIsResetting(true);
    
    // Simulate relay activation and fault reset
    setTimeout(() => {
      // In a real implementation, this would send a command to the device
      // to activate the relay and reset the fault
      console.log('Resetting fault for asset:', assetId);
      setIsResetting(false);
      
      // Show success message (you can add toast notification here)
      alert('Comando de reset enviado com sucesso!');
    }, 1500);
  };

  // Get status text
  const getStatusText = (value: number | undefined) => {
    if (value === undefined || value === null) return 'Desconhecido';
    return value === 1 ? 'Ligado' : 'Desligado';
  };

  const getFaultText = (value: number | undefined) => {
    if (value === undefined || value === null) return 'Desconhecido';
    return value === 1 ? 'Com Falha' : 'Sem Falha';
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
          </CardContent>
        </Card>

        {/* Fault Status */}
        <Card className={hasFault ? 'border-red-200 bg-red-50/50' : 'border-green-200 bg-green-50/50'}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              <div className="flex items-center gap-2">
                {hasFault ? (
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                )}
                Status de Falha
              </div>
              {hasFault && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleResetFault}
                  disabled={isResetting}
                  className="h-7 text-xs"
                >
                  <RotateCcw className={`w-3 h-3 mr-1 ${isResetting ? 'animate-spin' : ''}`} />
                  Reset
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <Badge variant={hasFault ? "destructive" : "default"} className="text-base px-3 py-1">
                {getFaultText(faultValue)}
              </Badge>
            </div>
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
              {rssiValue !== undefined && rssiValue !== null ? rssiValue.toFixed(2) : 'N/A'} <span className="text-sm font-normal text-muted-foreground">dBm</span>
            </div>
            <p className={`text-sm font-medium mt-1 ${rssiQuality.color}`}>
              {rssiQuality.text}
            </p>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-muted-foreground">Tempo de Operação</p>
              <p className="text-2xl font-semibold mt-2">
                {formatUptime(uptimeSensor?.lastReading?.value)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {uptimeSensor?.lastReading?.value?.toLocaleString()} segundos
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Última Atualização</p>
              <p className="text-lg font-semibold mt-2">
                {statusSensor?.lastReading?.timestamp 
                  ? new Date(statusSensor.lastReading.timestamp).toLocaleString('pt-BR')
                  : 'N/A'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Timestamp do sensor</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
