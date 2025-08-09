import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { DashboardWidget } from '../../types/dashboard';
import { useDashboardStore } from '../../store/dashboard';
import { WidgetConfig } from './WidgetConfig';
import { KPICard } from '../ui/KPICard';
import { LineChartTemp } from '../charts/LineChartTemp';
import { BarChartEnergy } from '../charts/BarChartEnergy';
import { GaugeFilterHealth } from '../charts/GaugeFilterHealth';
import { HeatmapAlarms } from '../charts/HeatmapAlarms';
import { ChartWrapper } from '../charts/ChartWrapper';
import { 
  GripVertical, 
  X, 
  Settings,
  Activity, 
  AlertTriangle, 
  Zap, 
  Heart,
  Clock,
  Wrench
} from 'lucide-react';
import { MaintenanceWidget } from './widgets/MaintenanceWidget';

interface DraggableWidgetProps {
  widget: DashboardWidget;
  layoutId: string;
  data?: any;
}

export const DraggableWidget: React.FC<DraggableWidgetProps> = ({ widget, layoutId, data }) => {
  const editMode = useDashboardStore(state => state.editMode);
  const removeWidget = useDashboardStore(state => state.removeWidget);
  const [configOpen, setConfigOpen] = useState(false);
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: widget.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const getSizeClasses = (size: string) => {
    switch (size) {
      case 'small':
        return 'col-span-1 lg:col-span-2';
      case 'medium':
        return 'col-span-1 lg:col-span-3';
      case 'large':
        return 'col-span-1 lg:col-span-6';
      default:
        return 'col-span-1 lg:col-span-2';
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    removeWidget(layoutId, widget.id);
  };

  const renderContent = () => {
    switch (widget.props?.metricType) {
      case 'uptime':
        return (
          <KPICard
            label="Uptime Dispositivos"
            value={data?.kpis?.uptime || 0}
            unit="%"
            status={data?.kpis?.uptime >= 95 ? 'good' : data?.kpis?.uptime >= 90 ? 'warning' : 'critical'}
            icon={<Activity className="w-4 h-4" />}
          />
        );
      
      case 'alerts':
        return (
          <KPICard
            label="Ativos com Alerta"
            value={data?.kpis?.activeAlerts || 0}
            status={data?.kpis?.activeAlerts === 0 ? 'good' : data?.kpis?.activeAlerts <= 2 ? 'warning' : 'critical'}
            icon={<AlertTriangle className="w-4 h-4" />}
          />
        );
      
      case 'consumption':
        return (
          <KPICard
            label="Consumo Hoje"
            value={data?.kpis?.consumption || 0}
            unit="kWh"
            change={-3.2}
            changeLabel="vs ontem"
            status="good"
            icon={<Zap className="w-4 h-4" />}
          />
        );
      
      case 'health':
        return (
          <KPICard
            label="Saúde Média HVAC"
            value={data?.kpis?.avgHealth || 0}
            unit="%"
            change={2.1}
            changeLabel="última semana"
            status={parseFloat(data?.kpis?.avgHealth || '0') >= 80 ? 'good' : parseFloat(data?.kpis?.avgHealth || '0') >= 60 ? 'warning' : 'critical'}
            icon={<Heart className="w-4 h-4" />}
          />
        );
      
      case 'mtbf':
        return (
          <KPICard
            label="MTBF"
            value={data?.kpis?.mtbf || 0}
            unit="h"
            change={5.3}
            changeLabel="melhoria"
            status="good"
            icon={<Clock className="w-4 h-4" />}
          />
        );
      
      case 'mttr':
        return (
          <KPICard
            label="MTTR"
            value={data?.kpis?.mttr || 0}
            unit="h"
            change={-12.1}
            changeLabel="redução"
            status="good"
            icon={<Wrench className="w-4 h-4" />}
          />
        );
      
      case 'temperature':
        return (
          <div className="bg-card rounded-xl p-6 border shadow-sm h-full">
            <h3 className="text-lg font-semibold mb-4">Tendências de Temperatura (AHU-001)</h3>
            <ChartWrapper title="Temperatura" height={300}>
              <LineChartTemp data={data?.temperatureData || { supply: [], return: [], setpoint: [] }} height={300} />
            </ChartWrapper>
          </div>
        );
      
      case 'energy':
        return (
          <div className="bg-card rounded-xl p-6 border shadow-sm h-full">
            <h3 className="text-lg font-semibold mb-4">Consumo Energético (Hoje)</h3>
            <ChartWrapper title="Consumo Energético" height={300}>
              <BarChartEnergy data={data?.energyData || []} height={300} />
            </ChartWrapper>
          </div>
        );
      
      case 'filter':
        return (
          <div className="bg-card rounded-xl p-6 border shadow-sm h-full">
            <h3 className="text-lg font-semibold mb-4">Saúde do Filtro (AHU-001)</h3>
            <ChartWrapper title="Saúde do Filtro" height={300}>
              <GaugeFilterHealth 
                healthScore={data?.filterData?.healthScore || 85}
                dpFilter={data?.filterData?.dpFilter || 150}
                daysUntilChange={data?.filterData?.daysUntilChange || 30}
                height={300}
              />
            </ChartWrapper>
          </div>
        );
      
      case 'alertsHeatmap':
        return (
          <div className="bg-card rounded-xl p-6 border shadow-sm h-full">
            <h3 className="text-lg font-semibold mb-4">Densidade de Alertas (Últimos 7 dias)</h3>
            <ChartWrapper title="Alertas" height={200}>
              <HeatmapAlarms data={data?.alertHeatmapData || []} height={200} />
            </ChartWrapper>
          </div>
        );
      
      case 'alerts':
        return (
          <div className="bg-card rounded-xl p-6 border shadow-sm h-full">
            <h3 className="text-lg font-semibold mb-4">Alertas Ativos Principais</h3>
            {(!data?.topAlerts || data.topAlerts.length === 0) ? (
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
                    {data.topAlerts.map((alert: any) => (
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
        );
      
      case 'maintenance-overview':
        return <MaintenanceWidget />;
      
      default:
        return (
          <div className="bg-card rounded-xl p-6 border shadow-sm h-full flex items-center justify-center">
            <p className="text-muted-foreground">Widget não configurado</p>
          </div>
        );
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Critical': return 'bg-red-100 text-red-800';
      case 'High': return 'bg-orange-100 text-orange-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Low': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTimeAgo = (date: Date | string | number) => {
    const now = new Date();
    const timestamp = date instanceof Date ? date : new Date(date);
    const diffMs = now.getTime() - timestamp.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays}d atrás`;
    if (diffHours > 0) return `${diffHours}h atrás`;
    return 'Agora mesmo';
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        getSizeClasses(widget.size),
        editMode && "relative group",
        isDragging && "opacity-50 z-50",
        editMode && "border-2 border-dashed border-primary/20 rounded-xl"
      )}
      {...(editMode ? attributes : {})}
    >
      {editMode && (
        <div className="absolute -top-2 -right-2 z-10 flex gap-1">
          <button
            onClick={handleRemove}
            className="bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
          >
            <X className="w-4 h-4" />
          </button>
          <button
            onClick={() => setConfigOpen(true)}
            className="bg-blue-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
          >
            <Settings className="w-4 h-4" />
          </button>
          <button
            {...listeners}
            className="bg-primary text-primary-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm cursor-grab active:cursor-grabbing"
          >
            <GripVertical className="w-4 h-4" />
          </button>
        </div>
      )}
      
      {renderContent()}
      
      <WidgetConfig
        widget={widget}
        layoutId={layoutId}
        open={configOpen}
        onClose={() => setConfigOpen(false)}
      />
    </div>
  );
};