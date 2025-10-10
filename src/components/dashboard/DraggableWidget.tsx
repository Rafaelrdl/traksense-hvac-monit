import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { DashboardWidget } from '../../types/dashboard';
import { useDashboardStore } from '../../store/dashboard';
import { useOverviewStore } from '../../store/overview';
import { cn } from '../../lib/utils';
import { WidgetConfig } from './WidgetConfig';
import { OverviewWidgetConfig } from './OverviewWidgetConfig';
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
  // Suporta tanto dashboard quanto overview
  const isOverview = layoutId === 'overview';
  const editMode = isOverview 
    ? useOverviewStore(state => state.editMode)
    : useDashboardStore(state => state.editMode);
  
  const [configOpen, setConfigOpen] = useState(false);
  const [toggleState, setToggleState] = useState(false);

  // Helper function to get real or mocked data for overview widgets based on widget ID or type
  const getWidgetData = () => {
    if (!isOverview) return null;

    // Get assets from data if available
    const assets = data?.assets || [];
    const onlineAssets = assets.filter((a: any) => a.status === 'OK').length;
    const totalAssets = assets.length;

    // Map widget IDs to their corresponding data (real or mocked)
    switch (widget.id) {
      case 'overview-uptime':
        return { 
          value: data?.kpis?.uptime || '99,3', 
          unit: '%', 
          trendValue: 2.1,
          trend: 'up',
          trendLabel: 'vs ontem',
          color: '#10b981' 
        };
      case 'overview-active-alerts':
        return { 
          value: data?.kpis?.activeAlerts || 19, 
          unit: '', 
          trendValue: -3.2,
          trend: 'down',
          trendLabel: 'vs ontem',
          color: '#f59e0b' 
        };
      case 'overview-consumption':
        return { 
          value: data?.kpis?.consumption || '955', 
          unit: 'kWh', 
          trendValue: -3.2,
          trend: 'down',
          trendLabel: 'vs ontem',
          color: '#10b981' 
        };
      case 'overview-health-score':
        return { 
          value: data?.kpis?.avgHealth || '69,9', 
          unit: '%', 
          trendValue: 2.1,
          trend: 'up',
          trendLabel: 'última semana',
          color: '#f59e0b' 
        };
      case 'overview-mttf':
      case 'overview-mtbf':
        return { 
          value: data?.kpis?.mtbf || '168', 
          unit: 'h', 
          trendValue: 5.3,
          trend: 'up',
          trendLabel: 'melhoria',
          color: '#10b981' 
        };
      case 'overview-mttr':
        return { 
          value: data?.kpis?.mttr || '2,5', 
          unit: 'h', 
          trendValue: -12.1,
          trend: 'down',
          trendLabel: 'redução',
          color: '#ef4444' 
        };
      default:
        // Generate mocked data based on widget type for newly added widgets
        return getDefaultDataByType(widget.type);
    }
  };

  // Generate realistic mocked data based on widget type
  const getDefaultDataByType = (type: string) => {
    switch (type) {
      case 'card-kpi':
        const trendVal = (Math.random() * 10 - 5).toFixed(1);
        return { 
          value: (85 + Math.random() * 15).toFixed(1), 
          unit: '%', 
          trendValue: parseFloat(trendVal),
          trend: parseFloat(trendVal) >= 0 ? 'up' : 'down',
          trendLabel: 'vs ontem',
          color: '#3b82f6' 
        };
      case 'card-stat':
        return { 
          value: (85 + Math.random() * 15).toFixed(1), 
          unit: '%', 
          trend: (Math.random() * 10 - 2).toFixed(1), 
          color: '#3b82f6' 
        };
      case 'card-value':
        return { 
          value: Math.floor(Math.random() * 20 + 5), 
          unit: '', 
          color: '#10b981' 
        };
      case 'card-progress':
        return { 
          value: (80 + Math.random() * 20).toFixed(1), 
          unit: '%', 
          target: 95, 
          color: '#10b981' 
        };
      case 'card-gauge':
        return { 
          value: (75 + Math.random() * 25).toFixed(1), 
          unit: '%', 
          color: '#8b5cf6' 
        };
      default:
        return null;
    }
  };

  const widgetData = getWidgetData();
  
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
      // Novos tamanhos específicos por coluna
      case 'col-1':
        return 'col-span-1 lg:col-span-1';
      case 'col-2':
        return 'col-span-1 lg:col-span-2';
      case 'col-3':
        return 'col-span-1 lg:col-span-3';
      case 'col-4':
        return 'col-span-1 lg:col-span-4';
      case 'col-5':
        return 'col-span-1 lg:col-span-5';
      case 'col-6':
        return 'col-span-1 lg:col-span-6';
      
      // Compatibilidade com tamanhos antigos
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
    if (isOverview) {
      useOverviewStore.getState().removeWidget(widget.id);
    } else {
      useDashboardStore.getState().removeWidget(layoutId, widget.id);
    }
  };

  const renderContent = () => {
    // IMPORTANTE: No Overview, widgets não precisam de sensorId (usam dados agregados)
    // Apenas mostrar placeholder de configuração em Dashboards quando não há sensorId
    if (!isOverview && !widget.config?.sensorId && widget.type !== 'text-display' && widget.type !== 'iframe-embed') {
      return (
        <div className="bg-card rounded-xl p-6 border-2 border-dashed border-muted-foreground/20 h-full flex flex-col items-center justify-center gap-3">
          <Settings className="w-12 h-12 text-muted-foreground/50" />
          <div className="text-center">
            <p className="font-medium text-foreground">Widget não configurado</p>
            <p className="text-sm text-muted-foreground">Clique no ⚙️ para vincular um sensor</p>
          </div>
        </div>
      );
    }

    // Renderizar widget baseado no tipo
    switch (widget.type) {
      // ============ CARDS KPI (Estilo Overview) ============
      case 'card-kpi':
        const kpiValue = widgetData?.value ?? (Math.random() * 100).toFixed(widget.config?.decimals || 1);
        const kpiData = widgetData as any;
        const kpiTrend = typeof kpiData?.trendValue === 'number' ? kpiData.trendValue : (Math.random() * 10 - 5).toFixed(1);
        const kpiTrendDirection = typeof kpiData?.trend === 'string' ? kpiData.trend : (parseFloat(kpiTrend as string) >= 0 ? 'up' : 'down');
        const kpiTrendLabel = kpiData?.trendLabel || 'vs ontem';
        
        // Ícone baseado no tipo ou configuração
        const getKpiIcon = () => {
          const iconColor = widget.config?.iconColor || widget.config?.color || '#3b82f6';
          const iconStyle = { color: iconColor };
          
          if (widget.config?.icon === 'activity') return <Activity className="w-5 h-5" style={iconStyle} />;
          if (widget.config?.icon === 'alert') return <AlertTriangle className="w-5 h-5" style={iconStyle} />;
          if (widget.config?.icon === 'energy') return <Zap className="w-5 h-5" style={iconStyle} />;
          if (widget.config?.icon === 'health') return <Heart className="w-5 h-5" style={iconStyle} />;
          if (widget.config?.icon === 'clock') return <Clock className="w-5 h-5" style={iconStyle} />;
          if (widget.config?.icon === 'wrench') return <Wrench className="w-5 h-5" style={iconStyle} />;
          
          return <Activity className="w-5 h-5" style={iconStyle} />;
        };
        
        return (
          <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm min-h-[140px] h-full flex flex-col justify-between hover:shadow-md transition-shadow">
            {/* Header com título e ícone */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="text-xs font-medium text-gray-600 leading-tight">
                  {widget.config?.label || widget.title}
                </h3>
              </div>
              <div className="ml-2 flex-shrink-0">
                {getKpiIcon()}
              </div>
            </div>
            
            {/* Valor principal */}
            <div className="mb-2">
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-gray-900">
                  {kpiValue}
                </span>
                <span className="text-sm text-gray-500 font-medium">
                  {widgetData?.unit || widget.config?.unit || '%'}
                </span>
              </div>
            </div>
            
            {/* Tendência/Variação */}
            <div className="flex items-center gap-1 text-xs font-medium">
              <span className={kpiTrendDirection === 'up' ? 'text-green-600' : 'text-red-600'}>
                {kpiTrendDirection === 'up' ? '+' : ''}{kpiTrend}%
              </span>
              <span className="text-gray-500">• {kpiTrendLabel}</span>
            </div>
          </div>
        );

      // ============ CARDS SIMPLES ============
      case 'card-value':
        const cardValue = widgetData?.value ?? (Math.random() * 100).toFixed(widget.config?.decimals || 2);
        return (
          <div className="bg-card rounded-xl p-6 border shadow-sm h-full flex flex-col justify-between">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-sm font-medium text-muted-foreground">{widget.config?.label || widget.title}</h3>
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" title="Online" />
            </div>
            <div className="flex-1 flex flex-col justify-center">
              <div className="text-4xl font-bold" style={{ color: widgetData?.color || widget.config?.color || '#3b82f6' }}>
                {cardValue}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                {widgetData?.unit || widget.config?.unit || 'valor'}
              </div>
            </div>
          </div>
        );

      case 'card-stat':
        const statValue = widgetData?.value ?? (Math.random() * 100).toFixed(widget.config?.decimals || 2);
        const statData = widgetData as any;
        const statTrend = typeof statData?.trend === 'number' ? statData.trend : 5.2;
        return (
          <div className="bg-card rounded-xl p-6 border shadow-sm h-full flex flex-col justify-between">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-sm font-medium text-muted-foreground">{widget.config?.label || widget.title}</h3>
              <Activity className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="flex-1 flex flex-col justify-center">
              <div className="text-3xl font-bold" style={{ color: widgetData?.color || widget.config?.color || '#3b82f6' }}>
                {statValue}
              </div>
              <div className="text-sm text-muted-foreground mt-1">{widgetData?.unit || widget.config?.unit || 'valor'}</div>
              <div className="flex items-center gap-2 mt-2">
                <span className={`text-sm font-medium ${statTrend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {statTrend >= 0 ? '↑' : '↓'} {Math.abs(statTrend).toFixed(1)}%
                </span>
                <span className="text-xs text-muted-foreground">vs ontem</span>
              </div>
            </div>
          </div>
        );

      case 'card-progress':
        const progressValue = typeof widgetData?.value === 'number' 
          ? widgetData.value 
          : typeof widgetData?.value === 'string' 
            ? parseFloat(widgetData.value) || Math.random() * 100
            : Math.random() * 100;
        const progressData = widgetData as any;
        const progressTarget = typeof progressData?.target === 'number'
          ? progressData.target
          : typeof widget.config?.target === 'number'
            ? widget.config.target
            : 100;
        return (
          <div className="bg-card rounded-xl p-6 border shadow-sm h-full flex flex-col justify-between">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-sm font-medium text-muted-foreground">{widget.config?.label || widget.title}</h3>
            </div>
            <div className="flex-1 flex flex-col justify-center">
              <div className="text-2xl font-bold mb-2" style={{ color: widgetData?.color || widget.config?.color || '#3b82f6' }}>
                {progressValue.toFixed(1)}%
              </div>
              <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all duration-300"
                  style={{ 
                    width: `${progressValue}%`,
                    backgroundColor: widgetData?.color || widget.config?.color || '#3b82f6'
                  }}
                />
              </div>
              <div className="text-xs text-muted-foreground mt-2">
                Meta: {progressTarget}% {widgetData?.unit || widget.config?.unit || ''}
              </div>
            </div>
          </div>
        );

      case 'card-gauge':
        const gaugeValue = typeof widgetData?.value === 'number' 
          ? widgetData.value 
          : typeof widgetData?.value === 'string' 
            ? parseFloat(widgetData.value) || Math.random() * 100
            : Math.random() * 100;
        return (
          <div className="bg-card rounded-xl p-6 border shadow-sm h-full flex flex-col items-center justify-center">
            <h3 className="text-sm font-medium text-muted-foreground mb-4">{widget.config?.label || widget.title}</h3>
            <div className="relative w-32 h-32">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="64" cy="64" r="56" stroke="#e5e7eb" strokeWidth="8" fill="none" />
                <circle 
                  cx="64" 
                  cy="64" 
                  r="56" 
                  stroke={widget.config?.color || '#3b82f6'}
                  strokeWidth="8" 
                  fill="none"
                  strokeDasharray={`${(gaugeValue / 100) * 352} 352`}
                  className="transition-all duration-300"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold" style={{ color: widget.config?.color || '#3b82f6' }}>
                  {gaugeValue.toFixed(0)}
                </span>
                <span className="text-xs text-muted-foreground">{widget.config?.unit || '%'}</span>
              </div>
            </div>
          </div>
        );

      // ============ CARDS DE AÇÃO ============
      case 'card-button':
        return (
          <div className="bg-card rounded-xl p-6 border shadow-sm h-full flex flex-col items-center justify-center gap-4">
            <h3 className="text-sm font-medium text-muted-foreground">{widget.config?.label || widget.title}</h3>
            <button 
              className="px-8 py-4 rounded-lg font-semibold text-white shadow-lg hover:shadow-xl transition-all"
              style={{ backgroundColor: widget.config?.color || '#3b82f6' }}
            >
              Executar Ação
            </button>
          </div>
        );

      case 'card-toggle':
        return (
          <div className="bg-card rounded-xl p-6 border shadow-sm h-full flex flex-col items-center justify-center gap-4">
            <h3 className="text-sm font-medium text-muted-foreground">{widget.config?.label || widget.title}</h3>
            <button
              onClick={() => setToggleState(!toggleState)}
              className={`relative w-16 h-8 rounded-full transition-colors ${
                toggleState ? 'bg-green-500' : 'bg-gray-300'
              }`}
            >
              <div 
                className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                  toggleState ? 'transform translate-x-8' : ''
                }`}
              />
            </button>
            <span className="text-sm font-medium">
              {toggleState ? 'Ligado' : 'Desligado'}
            </span>
          </div>
        );

      case 'card-status':
        const statusValue = Math.random();
        const status = statusValue > 0.7 ? 'OK' : statusValue > 0.4 ? 'Aviso' : 'Crítico';
        const statusColor = statusValue > 0.7 ? '#10b981' : statusValue > 0.4 ? '#f59e0b' : '#ef4444';
        return (
          <div className="bg-card rounded-xl p-6 border shadow-sm h-full flex flex-col items-center justify-center gap-4">
            <h3 className="text-sm font-medium text-muted-foreground">{widget.config?.label || widget.title}</h3>
            <div 
              className="w-24 h-24 rounded-full flex items-center justify-center"
              style={{ backgroundColor: `${statusColor}20` }}
            >
              <span className="text-2xl font-bold" style={{ color: statusColor }}>
                {status}
              </span>
            </div>
          </div>
        );

      // ============ GRÁFICOS DE LINHA ============
      case 'chart-line':
      case 'chart-line-multi':
      case 'chart-area':
      case 'chart-spline':
        // Se for overview e temos dados de consumo histórico, renderizar gráfico real
        if (isOverview && widget.id === 'overview-consumption-trend' && data?.energyData && data.energyData.length > 0) {
          return (
            <div className="bg-card rounded-xl p-6 border shadow-sm h-full flex flex-col">
              <h3 className="text-lg font-semibold mb-4">{widget.title}</h3>
              <ChartWrapper title="Consumo Histórico" height={250}>
                <BarChartEnergy data={data.energyData} height={250} />
              </ChartWrapper>
            </div>
          );
        }
        
        // Se for overview e widget de histórico de consumo, gerar dados mockados de barras (como na imagem)
        if (isOverview && widget.id === 'overview-consumption-trend') {
          // Gerar 24 horas de dados mockados realistas que variam ao longo do tempo
          const now = new Date();
          const currentHour = now.getHours();
          const currentMinute = now.getMinutes();
          
          // Padrão de consumo: mais alto durante horário comercial (8h-18h)
          const generateHourlyConsumption = (hour: number) => {
            const baseConsumption = 300;
            let multiplier = 1.0;
            
            // Horário comercial: 8h-18h (consumo alto)
            if (hour >= 8 && hour < 18) {
              multiplier = 1.4 + (Math.sin((hour - 8) / 10 * Math.PI) * 0.3);
            } 
            // Madrugada: 0h-6h (consumo baixo)
            else if (hour >= 0 && hour < 6) {
              multiplier = 0.8 + (Math.random() * 0.1);
            }
            // Noite: 18h-24h (consumo médio decrescente)
            else {
              multiplier = 1.2 - ((hour - 18) / 6 * 0.3);
            }
            
            // Adicionar variação aleatória realista
            const randomVariation = (Math.random() - 0.5) * 0.2;
            return Math.round(baseConsumption * (multiplier + randomVariation));
          };
          
          // Criar array de 24 horas começando da hora atual e voltando
          const hourlyData = Array.from({ length: 24 }, (_, i) => {
            const hour = (currentHour - (23 - i) + 24) % 24;
            const timestamp = new Date(now);
            timestamp.setHours(hour, 0, 0, 0);
            
            return {
              timestamp,
              value: generateHourlyConsumption(hour),
              sensorId: 'mock-energy-sensor',
              quality: 'good' as const
            };
          });
          
          // Calcular total
          const total = hourlyData.reduce((sum, d) => sum + d.value, 0);
          const totalFormatted = (total / 1000).toFixed(1); // Converter para MWh
          const percentageOfGoal = ((total / 6000) * 100).toFixed(1); // Meta fictícia de 6000 kWh
          
          return (
            <div className="bg-card rounded-xl p-6 border shadow-sm h-full flex flex-col">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold">{widget.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">Energia (kWh)</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-orange-600">
                    Total Hoje: {totalFormatted} MWh ({percentageOfGoal}% da meta)
                  </p>
                </div>
              </div>
              <ChartWrapper title="" height={250}>
                <BarChartEnergy data={hourlyData} height={250} />
              </ChartWrapper>
            </div>
          );
        }
        
        // Se for overview mas não for o widget específico, gerar linha mockada genérica
        if (isOverview) {
          const hours = Array.from({ length: 24 }, (_, i) => i);
          return (
            <div className="bg-card rounded-xl p-6 border shadow-sm h-full flex flex-col">
              <h3 className="text-lg font-semibold mb-4">{widget.title}</h3>
              <div className="flex-1 relative">
                <svg className="w-full h-full" viewBox="0 0 400 200">
                  {/* Grid lines */}
                  {[0, 50, 100, 150, 200].map(y => (
                    <line key={y} x1="40" y1={y} x2="390" y2={y} stroke="#e5e7eb" strokeWidth="1" />
                  ))}
                  {/* Line chart */}
                  <polyline
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="2"
                    points={hours.map((h, i) => {
                      const x = 40 + (i * 350 / 23);
                      const y = 150 - (Math.sin(h / 3) * 40 + Math.random() * 30 + 50);
                      return `${x},${y}`;
                    }).join(' ')}
                  />
                  {/* Axis labels */}
                  <text x="10" y="30" fontSize="10" fill="#9ca3af">Alta</text>
                  <text x="10" y="180" fontSize="10" fill="#9ca3af">Baixa</text>
                </svg>
              </div>
            </div>
          );
        }
        
        return (
          <div className="bg-card rounded-xl p-6 border shadow-sm h-full flex flex-col">
            <h3 className="text-lg font-semibold mb-4">{widget.title}</h3>
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <Activity className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Gráfico de linha</p>
                <p className="text-xs">Dados do sensor: {widget.config?.label}</p>
              </div>
            </div>
          </div>
        );

      // ============ GRÁFICOS DE BARRA ============
      case 'chart-bar':
      case 'chart-bar-horizontal':
      case 'chart-column':
        // Se for overview e widget de consumo por equipamento, gerar dados mockados que variam
        if (isOverview && widget.id === 'overview-consumption-bar') {
          const now = new Date();
          const seed = Math.floor(now.getTime() / 60000); // Atualiza a cada minuto
          
          // Equipamentos com consumo base diferente
          const mockEquipments = [
            { tag: 'AHU-001', baseConsumption: 1200 },
            { tag: 'Chiller-01', baseConsumption: 900 },
            { tag: 'VRF-002', baseConsumption: 550 },
            { tag: 'RTU-001', baseConsumption: 430 },
            { tag: 'Boiler-01', baseConsumption: 310 },
            { tag: 'CT-001', baseConsumption: 270 }
          ];
          
          // Gerar valores que variam de forma realista baseado no tempo
          const generateRealisticValue = (base: number, index: number) => {
            const hour = now.getHours();
            const minute = now.getMinutes();
            
            // Variação horária (mais consumo durante horário comercial)
            let hourMultiplier = 1.0;
            if (hour >= 8 && hour < 18) {
              hourMultiplier = 1.2 + (Math.sin((hour - 8) / 10 * Math.PI) * 0.2);
            } else if (hour >= 0 && hour < 6) {
              hourMultiplier = 0.7;
            } else {
              hourMultiplier = 0.9;
            }
            
            // Variação por minuto (simulando flutuações)
            const minuteVariation = Math.sin((minute + index * 10) / 60 * Math.PI * 2) * 0.1;
            
            // Variação aleatória suave (muda a cada minuto)
            const randomSeed = (seed + index) % 100;
            const randomVariation = (Math.sin(randomSeed) * 0.15);
            
            return Math.round(base * (hourMultiplier + minuteVariation + randomVariation));
          };
          
          const mockData = mockEquipments.map((equipment, i) => ({
            tag: equipment.tag,
            consumption: generateRealisticValue(equipment.baseConsumption, i)
          }));
          
          const maxValue = Math.max(...mockData.map(d => d.consumption));
          
          return (
            <div className="bg-card rounded-xl p-6 border shadow-sm h-full flex flex-col">
              <h3 className="text-lg font-semibold mb-4">{widget.title}</h3>
              <div className="flex-1 flex items-end justify-between gap-2 px-4" style={{ minHeight: '200px' }}>
                {mockData.map((item, i) => {
                  const height = (item.consumption / maxValue) * 100;
                  return (
                    <div key={i} className="flex flex-col items-center gap-1 flex-1">
                      <div className="text-xs font-medium text-center mb-1">{item.consumption}kWh</div>
                      <div 
                        className="w-full rounded-t-md transition-all"
                        style={{ 
                          height: `${height}%`,
                          backgroundColor: widget.config?.color || '#3b82f6'
                        }}
                      />
                      <span className="text-xs text-muted-foreground truncate w-full text-center">{item.tag}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        }
        
        // Se for overview mas não for o widget específico, gerar dados estáticos genéricos
        if (isOverview) {
          const mockEquipments = ['Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 5', 'Item 6'];
          const mockValues = [1250, 920, 580, 450, 320, 280];
          const maxValue = Math.max(...mockValues);
          
          return (
            <div className="bg-card rounded-xl p-6 border shadow-sm h-full flex flex-col">
              <h3 className="text-lg font-semibold mb-4">{widget.title}</h3>
              <div className="flex-1 flex items-end justify-between gap-2 px-4" style={{ minHeight: '200px' }}>
                {mockEquipments.map((equipment, i) => {
                  const height = (mockValues[i] / maxValue) * 100;
                  return (
                    <div key={i} className="flex flex-col items-center gap-1 flex-1">
                      <div className="text-xs font-medium text-center mb-1">{mockValues[i]}</div>
                      <div 
                        className="w-full rounded-t-md transition-all"
                        style={{ 
                          height: `${height}%`,
                          backgroundColor: widget.config?.color || '#3b82f6'
                        }}
                      />
                      <span className="text-xs text-muted-foreground truncate w-full text-center">{equipment}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        }
        
        return (
          <div className="bg-card rounded-xl p-6 border shadow-sm h-full flex flex-col">
            <h3 className="text-lg font-semibold mb-4">{widget.title}</h3>
            <div className="flex-1 flex items-end justify-between gap-2 px-4" style={{ minHeight: '200px' }}>
              {[...Array(7)].map((_, i) => {
                const height = 30 + Math.random() * 70;
                return (
                  <div key={i} className="flex flex-col items-center gap-1 flex-1">
                    <div 
                      className="w-full rounded-t-md transition-all"
                      style={{ 
                        height: `${height}%`,
                        backgroundColor: widget.config?.color || '#3b82f6'
                      }}
                    />
                    <span className="text-xs text-muted-foreground">{i + 1}</span>
                  </div>
                );
              })}
            </div>
          </div>
        );

      // ============ GRÁFICOS CIRCULARES ============
      case 'chart-pie':
      case 'chart-donut':
      case 'chart-radial':
        // Se for overview e widget de distribuição de consumo com dados reais
        if (isOverview && widget.id === 'overview-consumption-distribution' && data?.assets && data.assets.length > 0) {
          // Agrupar consumo por tipo de equipamento
          const consumptionByType = data.assets.reduce((acc: any, asset: any) => {
            const type = asset.type;
            acc[type] = (acc[type] || 0) + asset.powerConsumption;
            return acc;
          }, {});
          
          const total = Object.values(consumptionByType).reduce((a: any, b: any) => a + b, 0) as number;
          const colors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4'];
          let currentAngle = 0;

          return (
            <div className="bg-card rounded-xl p-6 border shadow-sm h-full flex flex-col">
              <h3 className="text-lg font-semibold mb-4">{widget.title}</h3>
              <div className="flex-1 flex items-center justify-center gap-6">
                <div className="relative w-48 h-48">
                  <svg className="w-full h-full transform -rotate-90">
                    {Object.entries(consumptionByType).map(([type, value]: [string, any], i) => {
                      const percentage = (value / total) * 100;
                      const angle = (percentage / 100) * 360;
                      const circumference = 2 * Math.PI * 80;
                      const strokeDasharray = `${(angle / 360) * circumference} ${circumference}`;
                      const rotation = currentAngle;
                      currentAngle += angle;
                      
                      return (
                        <circle 
                          key={type}
                          cx="96" 
                          cy="96" 
                          r="80" 
                          stroke={colors[i % colors.length]}
                          strokeWidth="32" 
                          fill="none"
                          strokeDasharray={strokeDasharray}
                          style={{ transform: `rotate(${rotation}deg)`, transformOrigin: '96px 96px' }}
                        />
                      );
                    })}
                  </svg>
                </div>
                <div className="flex flex-col gap-2">
                  {Object.entries(consumptionByType).map(([type, value]: [string, any], i) => {
                    const percentage = ((value / total) * 100).toFixed(1);
                    return (
                      <div key={type} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colors[i % colors.length] }} />
                        <span className="text-sm">{type}: {percentage}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        }
        
        // Se for overview, gerar dados mockados
        if (isOverview) {
          const mockData = {
            'AHU': 42.3,
            'Chiller': 31.2,
            'VRF': 18.9,
            'RTU': 7.6
          };
          const colors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];
          let currentAngle = 0;

          return (
            <div className="bg-card rounded-xl p-6 border shadow-sm h-full flex flex-col">
              <h3 className="text-lg font-semibold mb-4">{widget.title}</h3>
              <div className="flex-1 flex items-center justify-center gap-6">
                <div className="relative w-48 h-48">
                  <svg className="w-full h-full transform -rotate-90">
                    {Object.entries(mockData).map(([type, percentage], i) => {
                      const angle = (percentage / 100) * 360;
                      const circumference = 2 * Math.PI * 80;
                      const strokeDasharray = `${(angle / 360) * circumference} ${circumference}`;
                      const rotation = currentAngle;
                      currentAngle += angle;
                      
                      return (
                        <circle 
                          key={type}
                          cx="96" 
                          cy="96" 
                          r="80" 
                          stroke={colors[i]}
                          strokeWidth="32" 
                          fill="none"
                          strokeDasharray={strokeDasharray}
                          style={{ transform: `rotate(${rotation}deg)`, transformOrigin: '96px 96px' }}
                        />
                      );
                    })}
                  </svg>
                </div>
                <div className="flex flex-col gap-2">
                  {Object.entries(mockData).map(([type, percentage], i) => (
                    <div key={type} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colors[i] }} />
                      <span className="text-sm">{type}: {percentage.toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        }
        return (
          <div className="bg-card rounded-xl p-6 border shadow-sm h-full flex flex-col">
            <h3 className="text-lg font-semibold mb-4">{widget.title}</h3>
            <div className="flex-1 flex items-center justify-center">
              <div className="relative w-48 h-48">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="96" cy="96" r="80" stroke="#e5e7eb" strokeWidth="32" fill="none" />
                  <circle 
                    cx="96" 
                    cy="96" 
                    r="80" 
                    stroke={widget.config?.color || '#3b82f6'}
                    strokeWidth="32" 
                    fill="none"
                    strokeDasharray="314 188"
                  />
                  <circle 
                    cx="96" 
                    cy="96" 
                    r="80" 
                    stroke="#10b981"
                    strokeWidth="32" 
                    fill="none"
                    strokeDasharray="125 377"
                    strokeDashoffset="-314"
                  />
                </svg>
                {widget.type === 'chart-donut' && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold">{widget.config?.label}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      // ============ MEDIDORES ============
      case 'gauge-circular':
      case 'gauge-semi':
        const meterValue = Math.random() * 100;
        return (
          <div className="bg-card rounded-xl p-6 border shadow-sm h-full flex flex-col items-center justify-center">
            <h3 className="text-sm font-medium text-muted-foreground mb-4">{widget.title}</h3>
            <div className="relative w-40 h-40">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="80" cy="80" r="70" stroke="#e5e7eb" strokeWidth="12" fill="none" />
                <circle 
                  cx="80" 
                  cy="80" 
                  r="70" 
                  stroke={widget.config?.color || '#3b82f6'}
                  strokeWidth="12" 
                  fill="none"
                  strokeDasharray={`${(meterValue / 100) * 440} 440`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold" style={{ color: widget.config?.color || '#3b82f6' }}>
                  {meterValue.toFixed(widget.config?.decimals || 1)}
                </span>
                <span className="text-sm text-muted-foreground">{widget.config?.unit || '%'}</span>
              </div>
            </div>
          </div>
        );

      case 'gauge-tank':
        const tankLevel = Math.random() * 100;
        return (
          <div className="bg-card rounded-xl p-6 border shadow-sm h-full flex flex-col items-center justify-center gap-4">
            <h3 className="text-sm font-medium text-muted-foreground">{widget.title}</h3>
            <div className="relative w-24 h-48 border-2 border-gray-300 rounded-lg overflow-hidden">
              <div 
                className="absolute bottom-0 left-0 right-0 transition-all duration-500"
                style={{ 
                  height: `${tankLevel}%`,
                  backgroundColor: widget.config?.color || '#3b82f6',
                  opacity: 0.7
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl font-bold text-foreground z-10">
                  {tankLevel.toFixed(0)}%
                </span>
              </div>
            </div>
          </div>
        );

      case 'gauge-thermometer':
        const tempValue = 20 + Math.random() * 15;
        return (
          <div className="bg-card rounded-xl p-6 border shadow-sm h-full flex flex-col items-center justify-center gap-4">
            <h3 className="text-sm font-medium text-muted-foreground">{widget.title}</h3>
            <div className="relative flex items-end gap-2">
              <div className="w-8 h-48 bg-gray-200 rounded-full overflow-hidden relative">
                <div 
                  className="absolute bottom-0 left-0 right-0 rounded-full transition-all duration-500"
                  style={{ 
                    height: `${(tempValue / 35) * 100}%`,
                    backgroundColor: widget.config?.color || '#ef4444'
                  }}
                />
              </div>
              <div className="text-2xl font-bold" style={{ color: widget.config?.color || '#ef4444' }}>
                {tempValue.toFixed(1)}°C
              </div>
            </div>
          </div>
        );

      // ============ INDICADORES ============
      case 'indicator-led':
        const ledOn = Math.random() > 0.5;
        return (
          <div className="bg-card rounded-xl p-6 border shadow-sm h-full flex flex-col items-center justify-center gap-4">
            <h3 className="text-sm font-medium text-muted-foreground">{widget.title}</h3>
            <div 
              className={`w-16 h-16 rounded-full ${ledOn ? 'animate-pulse' : 'opacity-30'}`}
              style={{ 
                backgroundColor: widget.config?.color || '#10b981',
                boxShadow: ledOn ? `0 0 20px ${widget.config?.color || '#10b981'}` : 'none'
              }}
            />
            <span className="text-sm font-medium">{ledOn ? 'ATIVO' : 'INATIVO'}</span>
          </div>
        );

      case 'indicator-traffic':
        const trafficStatus = Math.random();
        const trafficColor = trafficStatus > 0.66 ? '#10b981' : trafficStatus > 0.33 ? '#f59e0b' : '#ef4444';
        return (
          <div className="bg-card rounded-xl p-6 border shadow-sm h-full flex flex-col items-center justify-center gap-3">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">{widget.title}</h3>
            <div className="flex flex-col gap-2">
              <div className={`w-12 h-12 rounded-full ${trafficStatus > 0.66 ? 'bg-red-500 opacity-30' : 'bg-gray-200'}`} />
              <div className={`w-12 h-12 rounded-full ${trafficStatus > 0.33 && trafficStatus <= 0.66 ? 'bg-yellow-500' : 'bg-gray-200 opacity-30'}`} />
              <div className={`w-12 h-12 rounded-full ${trafficStatus <= 0.33 ? 'bg-green-500' : 'bg-gray-200 opacity-30'}`} />
            </div>
          </div>
        );

      case 'indicator-battery':
        const batteryLevel = Math.random() * 100;
        return (
          <div className="bg-card rounded-xl p-6 border shadow-sm h-full flex flex-col items-center justify-center gap-4">
            <h3 className="text-sm font-medium text-muted-foreground">{widget.title}</h3>
            <div className="flex items-center gap-2">
              <div className="w-20 h-10 border-2 border-gray-300 rounded-md relative overflow-hidden">
                <div 
                  className="absolute left-0 top-0 bottom-0 transition-all duration-500"
                  style={{ 
                    width: `${batteryLevel}%`,
                    backgroundColor: batteryLevel > 50 ? '#10b981' : batteryLevel > 20 ? '#f59e0b' : '#ef4444'
                  }}
                />
              </div>
              <div className="w-1 h-4 bg-gray-300 rounded-r" />
            </div>
            <span className="text-lg font-bold">{batteryLevel.toFixed(0)}%</span>
          </div>
        );

      case 'indicator-signal':
        const signalStrength = Math.floor(Math.random() * 5) + 1;
        return (
          <div className="bg-card rounded-xl p-6 border shadow-sm h-full flex flex-col items-center justify-center gap-4">
            <h3 className="text-sm font-medium text-muted-foreground">{widget.title}</h3>
            <div className="flex items-end gap-1">
              {[...Array(5)].map((_, i) => (
                <div 
                  key={i}
                  className="w-3 rounded-t transition-all"
                  style={{ 
                    height: `${(i + 1) * 8}px`,
                    backgroundColor: i < signalStrength ? (widget.config?.color || '#3b82f6') : '#e5e7eb'
                  }}
                />
              ))}
            </div>
            <span className="text-sm font-medium">{signalStrength}/5</span>
          </div>
        );

      // ============ TABELAS ============
      case 'table-data':
      case 'table-realtime':
      case 'table-alerts':
        // Se for overview e widget de últimos alertas com dados reais
        if (isOverview && widget.id === 'overview-alerts-table' && data?.topAlerts && data.topAlerts.length > 0) {
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
            <div className="bg-card rounded-xl p-6 border shadow-sm h-full flex flex-col">
              <h3 className="text-lg font-semibold mb-4">{widget.title}</h3>
              {data.topAlerts.length === 0 ? (
                <div className="flex-1 flex items-center justify-center text-center text-muted-foreground">
                  <div>
                    <AlertTriangle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhum alerta ativo no momento</p>
                  </div>
                </div>
              ) : (
                <div className="flex-1 overflow-auto">
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
        }
        
        // Se for overview, gerar alertas mockados
        if (isOverview) {
          const mockAlerts = [
            { severity: 'High', asset: 'AHU-002', message: 'Filter replacement critical - Pressure drop: 350.0 Pa (Limit: 300 Pa)', time: 'Agora mesmo' },
            { severity: 'High', asset: 'AHU-001', message: 'Filter replacement critical - Pressure drop: 350.0 Pa (Limit: 300 Pa)', time: 'Agora mesmo' },
            { severity: 'High', asset: 'AHU-003', message: 'Filter nearly critical - Pressure drop: 287.5 Pa (Limit: 280 Pa)', time: '2d atrás' },
            { severity: 'High', asset: 'CHILL-001', message: 'Superheat elevated - Possible refrigerant leak: 13.8 K (Normal: 4-8 K)', time: '6h atrás' },
            { severity: 'Medium', asset: 'BOIL-001', message: 'Scheduled maintenance overdue by 437 days', time: 'Agora mesmo' }
          ];
          
          const getSeverityColor = (severity: string) => {
            switch (severity) {
              case 'High': return 'bg-orange-100 text-orange-800';
              case 'Medium': return 'bg-yellow-100 text-yellow-800';
              default: return 'bg-gray-100 text-gray-800';
            }
          };
          
          return (
            <div className="bg-card rounded-xl p-6 border shadow-sm h-full flex flex-col">
              <h3 className="text-lg font-semibold mb-4">{widget.title}</h3>
              <div className="flex-1 overflow-auto">
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
                    {mockAlerts.map((alert, i) => (
                      <tr key={i} className="border-b last:border-b-0 hover:bg-muted/50">
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(alert.severity)}`}>
                            {alert.severity}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-medium">{alert.asset}</td>
                        <td className="py-3 px-4 text-sm">{alert.message}</td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">{alert.time}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        }
        
        return (
          <div className="bg-card rounded-xl p-6 border shadow-sm h-full flex flex-col">
            <h3 className="text-lg font-semibold mb-4">{widget.title}</h3>
            <div className="flex-1 overflow-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-4 text-sm font-medium text-muted-foreground">Sensor</th>
                    <th className="text-left py-2 px-4 text-sm font-medium text-muted-foreground">Valor</th>
                    <th className="text-left py-2 px-4 text-sm font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {[...Array(3)].map((_, i) => (
                    <tr key={i} className="border-b last:border-0">
                      <td className="py-2 px-4 text-sm">Sensor {i + 1}</td>
                      <td className="py-2 px-4 text-sm font-medium">{(70 + Math.random() * 30).toFixed(1)}</td>
                      <td className="py-2 px-4">
                        <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">OK</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      // ============ OUTROS ============
      case 'heatmap-time':
      case 'heatmap-matrix':
        // Se for overview e widget de mapa de calor de alertas
        if (isOverview && widget.id === 'overview-alerts-heatmap' && data?.alertHeatmapData) {
          return (
            <div className="bg-card rounded-xl p-6 border shadow-sm h-full flex flex-col">
              <h3 className="text-lg font-semibold mb-4">{widget.title}</h3>
              <ChartWrapper title="Mapa de Calor de Alertas" height={200}>
                <HeatmapAlarms data={data.alertHeatmapData} height={200} />
              </ChartWrapper>
            </div>
          );
        }
        
        // Se for overview, gerar heatmap mockado realista
        if (isOverview) {
          // Gerar 7 dias x 24 horas (168 células)
          const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
          const hours = Array.from({ length: 24 }, (_, i) => i);
          
          // Padrão realista: mais alertas durante horário comercial (8-18h)
          const getMockIntensity = (day: number, hour: number) => {
            const isWeekday = day >= 1 && day <= 5; // Seg-Sex
            const isBusinessHours = hour >= 8 && hour <= 18;
            
            let base = 0.2;
            if (isWeekday && isBusinessHours) base = 0.6;
            if (isWeekday && !isBusinessHours) base = 0.3;
            
            // Adicionar aleatoriedade
            return Math.min(1, base + (Math.random() * 0.3));
          };
          
          return (
            <div className="bg-card rounded-xl p-6 border shadow-sm h-full flex flex-col">
              <h3 className="text-lg font-semibold mb-4">{widget.title}</h3>
              <div className="flex-1 flex flex-col gap-2">
                {/* Labels de dias */}
                <div className="grid grid-cols-[60px_1fr] gap-2">
                  <div></div>
                  <div className="grid grid-cols-24 gap-1 text-xs text-muted-foreground text-center">
                    {[0, 6, 12, 18].map(h => (
                      <div key={h} className="col-span-6">{h}h</div>
                    ))}
                  </div>
                </div>
                
                {/* Heatmap */}
                {days.map((day, dayIdx) => (
                  <div key={dayIdx} className="grid grid-cols-[60px_1fr] gap-2 items-center">
                    <div className="text-xs font-medium text-muted-foreground">{day}</div>
                    <div className="grid grid-cols-24 gap-1">
                      {hours.map(hour => {
                        const intensity = getMockIntensity(dayIdx, hour);
                        return (
                          <div 
                            key={hour}
                            className="aspect-square rounded hover:ring-2 hover:ring-primary cursor-pointer transition-all"
                            style={{ 
                              backgroundColor: intensity > 0.7 ? '#ef4444' : intensity > 0.4 ? '#f59e0b' : '#3b82f6',
                              opacity: intensity
                            }}
                            title={`${day} ${hour}:00 - ${Math.floor(intensity * 10)} alertas`}
                          />
                        );
                      })}
                    </div>
                  </div>
                ))}
                
                {/* Legenda */}
                <div className="flex items-center justify-end gap-2 text-xs text-muted-foreground mt-2">
                  <span>Menos</span>
                  <div className="flex gap-1">
                    {[0.2, 0.4, 0.6, 0.8, 1.0].map((opacity, i) => (
                      <div 
                        key={i}
                        className="w-4 h-4 rounded"
                        style={{ 
                          backgroundColor: opacity > 0.7 ? '#ef4444' : opacity > 0.4 ? '#f59e0b' : '#3b82f6',
                          opacity
                        }}
                      />
                    ))}
                  </div>
                  <span>Mais</span>
                </div>
              </div>
            </div>
          );
        }
        
        return (
          <div className="bg-card rounded-xl p-6 border shadow-sm h-full flex flex-col">
            <h3 className="text-lg font-semibold mb-4">{widget.title}</h3>
            <div className="flex-1 grid grid-cols-7 gap-1">
              {[...Array(35)].map((_, i) => {
                const intensity = Math.random();
                return (
                  <div 
                    key={i}
                    className="aspect-square rounded"
                    style={{ 
                      backgroundColor: widget.config?.color || '#3b82f6',
                      opacity: intensity
                    }}
                  />
                );
              })}
            </div>
          </div>
        );

      case 'timeline':
        return (
          <div className="bg-card rounded-xl p-6 border shadow-sm h-full flex flex-col">
            <h3 className="text-lg font-semibold mb-4">{widget.title}</h3>
            <div className="flex-1 space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: widget.config?.color || '#3b82f6' }}
                    />
                    {i < 2 && <div className="w-0.5 h-full bg-gray-200" />}
                  </div>
                  <div className="flex-1 pb-4">
                    <p className="text-sm font-medium">Evento {i + 1}</p>
                    <p className="text-xs text-muted-foreground">Há {i + 1}h atrás</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'list-items':
        return (
          <div className="bg-card rounded-xl p-6 border shadow-sm h-full flex flex-col">
            <h3 className="text-lg font-semibold mb-4">{widget.title}</h3>
            <ul className="flex-1 space-y-2">
              {[...Array(5)].map((_, i) => (
                <li key={i} className="flex items-center gap-3 py-2 border-b last:border-0">
                  <div 
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: widget.config?.color || '#3b82f6' }}
                  />
                  <span className="text-sm">Item {i + 1}</span>
                </li>
              ))}
            </ul>
          </div>
        );

      case 'text-display':
        return (
          <div className="bg-card rounded-xl p-6 border shadow-sm h-full flex items-center justify-center">
            <p className="text-lg text-center">{widget.config?.label || widget.title}</p>
          </div>
        );

      case 'iframe-embed':
        return (
          <div className="bg-card rounded-xl p-6 border shadow-sm h-full">
            <iframe 
              src={widget.config?.url || 'about:blank'}
              className="w-full h-full rounded border-0"
              title={widget.title}
            />
          </div>
        );

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
      
      {/* Modal de configuração condicional baseado no contexto */}
      {isOverview ? (
        <OverviewWidgetConfig
          widget={widget}
          isOpen={configOpen}
          onClose={() => setConfigOpen(false)}
          onSave={(updates) => {
            useOverviewStore.getState().updateWidget(widget.id, updates);
          }}
        />
      ) : (
        <WidgetConfig
          widget={widget}
          layoutId={layoutId}
          open={configOpen}
          onClose={() => setConfigOpen(false)}
        />
      )}
    </div>
  );
};