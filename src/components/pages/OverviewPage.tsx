import React, { useMemo } from 'react';
import { useAppStore, useTimeRangeMs } from '../../store/app';
import { simEngine } from '../../lib/simulation';
import { KPICard } from '../ui/KPICard';
import { LineChartTemp } from '../charts/LineChartTemp';
import { BarChartEnergy } from '../charts/BarChartEnergy';
import { GaugeFilterHealth } from '../charts/GaugeFilterHealth';
import { HeatmapAlarms } from '../charts/HeatmapAlarms';
import { ChartWrapper } from '../charts/ChartWrapper';
import { 
  Activity, 
  AlertTriangle, 
  Zap, 
  Heart,
  Clock,
  Wrench
} from 'lucide-react';

export const OverviewPage: React.FC = () => {
  const { assets, sensors, alerts } = useAppStore();
  const timeRange = useTimeRangeMs();

  // Calculate KPIs
  const kpis = useMemo(() => {
    const onlineSensors = sensors.filter(s => s.online).length;
    const totalSensors = sensors.length;
    const uptime = ((onlineSensors / totalSensors) * 100).toFixed(1);

    const activeAlerts = alerts.filter(a => !a.resolved && !a.acknowledged).length;

    const totalConsumption = assets.reduce((sum, asset) => sum + asset.powerConsumption, 0);

    const avgHealth = assets.reduce((sum, asset) => sum + asset.healthScore, 0) / assets.length;

    return {
      uptime: parseFloat(uptime),
      activeAlerts,
      consumption: totalConsumption.toFixed(0),
      avgHealth: avgHealth.toFixed(1),
      mtbf: '168', // Mock MTBF
      mttr: '2.5'  // Mock MTTR
    };
  }, [assets, sensors, alerts]);

  // Get temperature data for the main chart
  const temperatureData = useMemo(() => {
    try {
      const ahuSensor = sensors.find(s => s.assetId === 'ahu-001');
      if (!ahuSensor) return { supply: [], return: [], setpoint: [] };

      const supplyData = simEngine.getTelemetryData(`ahu-001-temp_supply`, timeRange) || [];
      const returnData = simEngine.getTelemetryData(`ahu-001-temp_return`, timeRange) || [];
      const setpointData = simEngine.getTelemetryData(`ahu-001-temp_setpoint`, timeRange) || [];

      return {
        supply: supplyData,
        return: returnData,
        setpoint: setpointData
      };
    } catch (error) {
      console.error('Error loading temperature data:', error);
      return { supply: [], return: [], setpoint: [] };
    }
  }, [sensors, timeRange]);

  // Get energy consumption data
  const energyData = useMemo(() => {
    try {
      return simEngine.getTelemetryData('ahu-001-power_kw', {
        start: new Date(new Date().setHours(0, 0, 0, 0)),
        end: new Date()
      }) || [];
    } catch (error) {
      console.error('Error loading energy data:', error);
      return [];
    }
  }, []);

  // Get filter health data
  const filterData = useMemo(() => {
    try {
      const dpFilterData = simEngine.getTelemetryData('ahu-001-dp_filter', timeRange) || [];
      const currentDp = dpFilterData.length > 0 ? dpFilterData[dpFilterData.length - 1].value : 0;
      const healthScore = Math.max(0, Math.min(100, 100 - (currentDp / 400) * 100));
      const daysUntilChange = Math.max(1, Math.floor((400 - currentDp) / 5)); // Rough estimate

      return {
        healthScore: isNaN(healthScore) ? 85 : healthScore,
        dpFilter: isNaN(currentDp) ? 150 : currentDp,
        daysUntilChange: isNaN(daysUntilChange) ? 30 : daysUntilChange
      };
    } catch (error) {
      console.error('Error loading filter data:', error);
      return {
        healthScore: 85,
        dpFilter: 150,
        daysUntilChange: 30
      };
    }
  }, [timeRange]);

  // Generate heatmap data for alerts
  const alertHeatmapData = useMemo(() => {
    const data = [];
    const now = new Date();
    
    for (let day = 6; day >= 0; day--) {
      for (let hour = 0; hour < 24; hour++) {
        const date = new Date(now);
        date.setDate(date.getDate() - day);
        date.setHours(hour, 0, 0, 0);
        
        // Simulate alert density based on time patterns
        let count = 0;
        if (hour >= 8 && hour <= 18) { // Business hours
          count = Math.floor(Math.random() * 3);
        } else {
          count = Math.floor(Math.random() * 2);
        }
        
        data.push({
          day: date.getDay(),
          hour,
          count,
          date
        });
      }
    }
    
    return data;
  }, []);

  // Top active alerts for table
  const topAlerts = alerts
    .filter(a => !a.resolved)
    .sort((a, b) => {
      const severityOrder = { 'Critical': 4, 'High': 3, 'Medium': 2, 'Low': 1 };
      return severityOrder[b.severity] - severityOrder[a.severity];
    })
    .slice(0, 5);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Critical': return 'bg-red-100 text-red-800';
      case 'High': return 'bg-orange-100 text-orange-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Low': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays}d atrás`;
    if (diffHours > 0) return `${diffHours}h atrás`;
    return 'Agora mesmo';
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Visão Geral</h1>
          <p className="text-muted-foreground">
            Monitoramento em tempo real dos sistemas HVAC críticos
          </p>
        </div>
        
        {/* Time Range Selector */}
        <div className="flex items-center space-x-2">
          <label className="text-sm text-muted-foreground">Período:</label>
          <select 
            className="px-3 py-1 border border-input rounded-md text-sm bg-background"
            value={useAppStore.getState().selectedTimeRange}
            onChange={(e) => useAppStore.getState().setTimeRange(e.target.value as any)}
          >
            <option value="1h">1 Hora</option>
            <option value="6h">6 Horas</option>
            <option value="24h">24 Horas</option>
            <option value="7d">7 Dias</option>
            <option value="30d">30 Dias</option>
          </select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <KPICard
          label="Uptime Dispositivos"
          value={kpis.uptime}
          unit="%"
          status={kpis.uptime >= 95 ? 'good' : kpis.uptime >= 90 ? 'warning' : 'critical'}
          icon={<Activity className="w-4 h-4" />}
        />
        
        <KPICard
          label="Ativos com Alerta"
          value={kpis.activeAlerts}
          status={kpis.activeAlerts === 0 ? 'good' : kpis.activeAlerts <= 2 ? 'warning' : 'critical'}
          icon={<AlertTriangle className="w-4 h-4" />}
        />
        
        <KPICard
          label="Consumo Hoje"
          value={kpis.consumption}
          unit="kWh"
          change={-3.2}
          changeLabel="vs ontem"
          status="good"
          icon={<Zap className="w-4 h-4" />}
        />
        
        <KPICard
          label="Saúde Média HVAC"
          value={kpis.avgHealth}
          unit="%"
          change={2.1}
          changeLabel="última semana"
          status={parseFloat(kpis.avgHealth) >= 80 ? 'good' : parseFloat(kpis.avgHealth) >= 60 ? 'warning' : 'critical'}
          icon={<Heart className="w-4 h-4" />}
        />
        
        <KPICard
          label="MTBF"
          value={kpis.mtbf}
          unit="h"
          change={5.3}
          changeLabel="melhoria"
          status="good"
          icon={<Clock className="w-4 h-4" />}
        />
        
        <KPICard
          label="MTTR"
          value={kpis.mttr}
          unit="h"
          change={-12.1}
          changeLabel="redução"
          status="good"
          icon={<Wrench className="w-4 h-4" />}
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Temperature Trends */}
        <div className="bg-card rounded-xl p-6 border shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Tendências de Temperatura (AHU-001)</h3>
          <ChartWrapper title="Temperatura" height={300}>
            <LineChartTemp data={temperatureData} height={300} />
          </ChartWrapper>
        </div>

        {/* Energy Consumption */}
        <div className="bg-card rounded-xl p-6 border shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Consumo Energético (Hoje)</h3>
          <ChartWrapper title="Consumo Energético" height={300}>
            <BarChartEnergy data={energyData} height={300} />
          </ChartWrapper>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Filter Health Gauge */}
        <div className="bg-card rounded-xl p-6 border shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Saúde do Filtro (AHU-001)</h3>
          <ChartWrapper title="Saúde do Filtro" height={300}>
            <GaugeFilterHealth 
              healthScore={filterData.healthScore}
              dpFilter={filterData.dpFilter}
              daysUntilChange={filterData.daysUntilChange}
              height={300}
            />
          </ChartWrapper>
        </div>

        {/* Alert Heatmap */}
        <div className="bg-card rounded-xl p-6 border shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Densidade de Alertas (Últimos 7 dias)</h3>
          <ChartWrapper title="Alertas" height={200}>
            <HeatmapAlarms data={alertHeatmapData} height={200} />
          </ChartWrapper>
        </div>
      </div>

      {/* Alerts Table */}
      <div className="bg-card rounded-xl p-6 border shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Alertas Ativos Principais</h3>
        {topAlerts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <AlertTriangle className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum alerta ativo no momento</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Severidade</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Ativo</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Mensagem</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Há quanto tempo</th>
                </tr>
              </thead>
              <tbody>
                {topAlerts.map(alert => (
                  <tr key={alert.id} className="border-b last:border-b-0 hover:bg-muted/50">
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(alert.severity)}`}>
                        {alert.severity}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium">{alert.assetTag}</td>
                    <td className="py-3 px-4 text-sm">{alert.message}</td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">{getTimeAgo(alert.timestamp)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};