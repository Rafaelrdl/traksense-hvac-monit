import React, { useState, useMemo } from 'react';
import { useAppStore, useSelectedAsset, useTimeRangeMs } from '../../store/app';
import { simEngine } from '../../lib/simulation';
import { LineChartTemp } from '../charts/LineChartTemp';
import { ScatterPerformance } from '../charts/ScatterPerformance';
import { KPICard } from '../ui/KPICard';
import { 
  ArrowLeft, 
  ExternalLink, 
  Heart, 
  Clock, 
  Gauge, 
  Zap,
  Activity,
  AlertTriangle 
} from 'lucide-react';

export const AssetDetailPage: React.FC = () => {
  const { setSelectedAsset, sensors, alerts } = useAppStore();
  const selectedAsset = useSelectedAsset();
  const timeRange = useTimeRangeMs();
  const [selectedMetrics, setSelectedMetrics] = useState(['temp_supply', 'temp_return', 'power_kw']);
  const [activeTab, setActiveTab] = useState('telemetry');

  if (!selectedAsset) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Nenhum ativo selecionado</p>
          <button
            onClick={() => setSelectedAsset(null)}
            className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg"
          >
            Voltar para Lista
          </button>
        </div>
      </div>
    );
  }

  // Get asset sensors
  const assetSensors = sensors.filter(s => s.assetId === selectedAsset.id);
  const assetAlerts = alerts.filter(a => a.assetId === selectedAsset.id && !a.resolved);

  // Get telemetry data for selected metrics
  const telemetryData = useMemo(() => {
    const data: { [key: string]: any[] } = {};
    selectedMetrics.forEach(metric => {
      const sensorId = `${selectedAsset.id}-${metric}`;
      data[metric] = simEngine.getTelemetryData(sensorId, timeRange);
    });
    return data;
  }, [selectedAsset.id, selectedMetrics, timeRange]);

  // Calculate asset KPIs
  const assetKPIs = useMemo(() => {
    const dpFilterSensor = assetSensors.find(s => s.type === 'dp_filter');
    const currentDp = dpFilterSensor?.lastReading?.value || 0;

    const powerSensor = assetSensors.find(s => s.type === 'power_kw');
    const currentPower = powerSensor?.lastReading?.value || 0;

    const vibrationSensor = assetSensors.find(s => s.type === 'vibration');
    const compressorState = Math.random() > 0.3 ? 'ON' : 'OFF'; // Mock

    return {
      health: selectedAsset.healthScore,
      operatingHours: selectedAsset.operatingHours,
      dpFilter: currentDp,
      compressorState,
      currentPower,
      vibration: vibrationSensor?.lastReading?.value || 0
    };
  }, [selectedAsset, assetSensors]);

  // Performance data for scatter plot
  const performanceData = useMemo(() => {
    const powerData = telemetryData.power_kw || [];
    if (powerData.length === 0) return [];

    const avgPower = powerData.reduce((sum, p) => sum + p.value, 0) / powerData.length;
    const estimatedLoad = avgPower * 0.8; // Mock thermal load calculation
    const eer = (estimatedLoad / avgPower) * 3.412; // Convert to EER

    return [{
      assetId: selectedAsset.id,
      assetTag: selectedAsset.tag,
      powerKw: avgPower,
      thermalLoad: estimatedLoad,
      eer
    }];
  }, [selectedAsset, telemetryData]);

  // Available metrics for selection
  const availableMetrics = [
    { id: 'temp_supply', label: 'Temp. Insuflamento', unit: '°C' },
    { id: 'temp_return', label: 'Temp. Retorno', unit: '°C' },
    { id: 'temp_setpoint', label: 'Setpoint', unit: '°C' },
    { id: 'humidity', label: 'Umidade', unit: '%' },
    { id: 'dp_filter', label: 'ΔP Filtro', unit: 'Pa' },
    { id: 'pressure_suction', label: 'Pressão Sucção', unit: 'kPa' },
    { id: 'pressure_discharge', label: 'Pressão Descarga', unit: 'kPa' },
    { id: 'power_kw', label: 'Potência', unit: 'kW' },
    { id: 'current', label: 'Corrente', unit: 'A' },
    { id: 'vibration', label: 'Vibração', unit: 'mm/s' },
    { id: 'airflow', label: 'Vazão de Ar', unit: 'm³/h' }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setSelectedAsset(null)}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{selectedAsset.tag}</h1>
            <p className="text-muted-foreground">
              {selectedAsset.type} • {selectedAsset.location}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <a
            href="#"
            className="flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Abrir OS no TrakNor</span>
          </a>
        </div>
      </div>

      {/* Asset KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <KPICard
          label="Saúde Geral"
          value={assetKPIs.health.toFixed(0)}
          unit="%"
          status={assetKPIs.health >= 80 ? 'good' : assetKPIs.health >= 60 ? 'warning' : 'critical'}
          icon={<Heart className="w-4 h-4" />}
        />

        <KPICard
          label="Horas Operação"
          value={assetKPIs.operatingHours.toLocaleString('pt-BR')}
          unit="h"
          icon={<Clock className="w-4 h-4" />}
        />

        <KPICard
          label="ΔP Filtro"
          value={assetKPIs.dpFilter.toFixed(0)}
          unit="Pa"
          status={assetKPIs.dpFilter > 250 ? 'critical' : assetKPIs.dpFilter > 200 ? 'warning' : 'good'}
          icon={<Gauge className="w-4 h-4" />}
        />

        <KPICard
          label="Estado Compressor"
          value={assetKPIs.compressorState}
          status={assetKPIs.compressorState === 'ON' ? 'good' : 'warning'}
          icon={<Activity className="w-4 h-4" />}
        />

        <KPICard
          label="Potência Atual"
          value={assetKPIs.currentPower.toFixed(0)}
          unit="kW"
          icon={<Zap className="w-4 h-4" />}
        />

        <KPICard
          label="Vibração"
          value={assetKPIs.vibration.toFixed(1)}
          unit="mm/s"
          status={assetKPIs.vibration > 5 ? 'critical' : assetKPIs.vibration > 3 ? 'warning' : 'good'}
          icon={<Activity className="w-4 h-4" />}
        />
      </div>

      {/* Tabs */}
      <div className="border-b border-border">
        <nav className="flex space-x-8">
          {[
            { id: 'telemetry', label: 'Telemetria' },
            { id: 'performance', label: 'Performance' },
            { id: 'alerts', label: 'Histórico Alertas' },
            { id: 'raw', label: 'Telemetria Bruta' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'telemetry' && (
        <div className="space-y-6">
          {/* Metric Selector */}
          <div className="bg-card rounded-xl p-4 border shadow-sm">
            <h3 className="text-lg font-semibold mb-3">Selecionar Métricas</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
              {availableMetrics.map(metric => (
                <label
                  key={metric.id}
                  className="flex items-center space-x-2 text-sm cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedMetrics.includes(metric.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedMetrics([...selectedMetrics, metric.id]);
                      } else {
                        setSelectedMetrics(selectedMetrics.filter(m => m !== metric.id));
                      }
                    }}
                    className="rounded border-gray-300"
                  />
                  <span>{metric.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Time Series Chart */}
          <div className="bg-card rounded-xl p-6 border shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Séries Temporais</h3>
            {selectedMetrics.includes('temp_supply') && selectedMetrics.includes('temp_return') ? (
              <LineChartTemp 
                data={{
                  supply: telemetryData.temp_supply || [],
                  return: telemetryData.temp_return || [],
                  setpoint: telemetryData.temp_setpoint || []
                }}
                height={400}
              />
            ) : (
              <div className="h-96 flex items-center justify-center text-muted-foreground">
                <p>Selecione temp_supply e temp_return para visualizar o gráfico</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'performance' && (
        <div className="space-y-6">
          <div className="bg-card rounded-xl p-6 border shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Análise de Performance</h3>
            <ScatterPerformance data={performanceData} height={400} />
          </div>
        </div>
      )}

      {activeTab === 'alerts' && (
        <div className="bg-card rounded-xl p-6 border shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Histórico de Alertas</h3>
          {assetAlerts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <AlertTriangle className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum alerta ativo para este ativo</p>
            </div>
          ) : (
            <div className="space-y-3">
              {assetAlerts.map(alert => (
                <div key={alert.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      alert.severity === 'Critical' ? 'bg-red-100 text-red-800' :
                      alert.severity === 'High' ? 'bg-orange-100 text-orange-800' :
                      alert.severity === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {alert.severity}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {alert.timestamp.toLocaleString('pt-BR')}
                    </span>
                  </div>
                  <p className="text-sm">{alert.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">Regra: {alert.ruleName}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'raw' && (
        <div className="bg-card rounded-xl p-6 border shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Telemetria Bruta</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-4">Timestamp</th>
                  <th className="text-left py-2 px-4">Sensor</th>
                  <th className="text-left py-2 px-4">Valor</th>
                  <th className="text-left py-2 px-4">Unidade</th>
                  <th className="text-left py-2 px-4">Qualidade</th>
                </tr>
              </thead>
              <tbody>
                {assetSensors.slice(0, 10).map(sensor => (
                  <tr key={sensor.id} className="border-b">
                    <td className="py-2 px-4">
                      {sensor.lastReading?.timestamp.toLocaleString('pt-BR')}
                    </td>
                    <td className="py-2 px-4">{sensor.tag}</td>
                    <td className="py-2 px-4">
                      {sensor.lastReading?.value.toFixed(2)}
                    </td>
                    <td className="py-2 px-4">{sensor.unit}</td>
                    <td className="py-2 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        sensor.lastReading?.quality === 'good' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {sensor.lastReading?.quality}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};