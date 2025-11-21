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
import { LineChartGeneric } from '../charts/LineChartGeneric';
import { BarChartEnergy } from '../charts/BarChartEnergy';
import { BarChartGeneric } from '../charts/BarChartGeneric';
import { PieChartGeneric } from '../charts/PieChartGeneric';
import { RadialChartGeneric } from '../charts/RadialChartGeneric';
import { GaugeFilterHealth } from '../charts/GaugeFilterHealth';
import { HeatmapAlarms } from '../charts/HeatmapAlarms';
import { ChartWrapper } from '../charts/ChartWrapper';
import { ResizableWidget } from './ResizableWidget';
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
import { safeEvalFormula, formatFormulaResult } from '../../utils/formula-eval';
import { useSensorData } from '../../hooks/useSensorData';
import { useSensorTrend } from '../../hooks/useSensorTrend';
import { useSensorHistory } from '../../hooks/useSensorHistory';
import { useMultipleSensorHistory } from '../../hooks/useMultipleSensorHistory';

/**
 * Calcula a cor baseado nos limites de aviso e crítico
 * @param value - Valor atual do sensor
 * @param warningThreshold - Limite de aviso (amarelo)
 * @param criticalThreshold - Limite crítico (vermelho)
 * @param defaultColor - Cor padrão quando dentro dos limites normais
 * @returns Cor hexadecimal para aplicar
 */
function getThresholdColor(
  value: number | null | undefined,
  warningThreshold?: number,
  criticalThreshold?: number,
  defaultColor: string = '#10b981' // verde padrão
): string {
  if (value === null || value === undefined) return defaultColor;
  
  // Verificar limite crítico primeiro (maior prioridade)
  if (criticalThreshold !== undefined && value >= criticalThreshold) {
    return '#ef4444'; // vermelho
  }
  
  // Verificar limite de aviso
  if (warningThreshold !== undefined && value >= warningThreshold) {
    return '#f59e0b'; // amarelo/laranja
  }
  
  // Valor normal
  return defaultColor;
}

/**
 * Retorna classe CSS de background baseado nos limites
 */
function getThresholdBackgroundClass(
  value: number | null | undefined,
  warningThreshold?: number,
  criticalThreshold?: number
): string {
  if (value === null || value === undefined) return 'bg-card';
  
  if (criticalThreshold !== undefined && value >= criticalThreshold) {
    return 'bg-red-50 border-red-300';
  }
  
  if (warningThreshold !== undefined && value >= warningThreshold) {
    return 'bg-yellow-50 border-yellow-300';
  }
  
  return 'bg-card';
}

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
  
  // 📐 DIMENSÕES PERSONALIZADAS DO WIDGET
  const [customWidth, setCustomWidth] = useState<number | undefined>(widget.position.w);
  const [customHeight, setCustomHeight] = useState<number | undefined>(widget.position.h);
  
  // 📅 ESTADO LOCAL PARA PERÍODO DE TEMPO DO GRÁFICO
  const [chartTimeRange, setChartTimeRange] = useState<number>(24); // Sempre iniciar com 24h
  
  // 📄 ESTADO DE PAGINAÇÃO PARA TABELAS
  const [tablePage, setTablePage] = useState(1);

  // 🔥 BUSCAR DADOS REAIS DO SENSOR
  const sensorTag = widget.config?.sensorTag;
  const sensorTags = widget.config?.sensorTags; // Array de tags para multi-série
  const assetId = widget.config?.assetId ? parseInt(widget.config.assetId) : undefined;
  const assetTag = widget.config?.assetTag; // 🔥 AssetTag para API de histórico
  const sensorData = useSensorData(sensorTag, assetId, 30000); // Auto-refresh a cada 30s
  
  // 📊 Log do chartTimeRange para debug
  console.log('📅 chartTimeRange atual:', chartTimeRange);
  
  // 📊 BUSCAR HISTÓRICO PARA GRÁFICOS - usando chartTimeRange do estado local
  const sensorHistory = useSensorHistory(sensorTag, assetTag, chartTimeRange, 60000);
  const multiSensorHistory = useMultipleSensorHistory(
    sensorTags || [],
    assetTag,
    chartTimeRange,
    60000
  ); // Para gráficos multi-série
  
  // 📊 BUSCAR HISTÓRICO PARA TABELAS - últimas 24h com resolução de 1 minuto
  const tableMultiSensorHistory = useMultipleSensorHistory(
    widget.type === 'table-data' || widget.type === 'table-realtime' ? (sensorTags || []) : [],
    widget.type === 'table-data' || widget.type === 'table-realtime' ? assetTag : undefined,
    24, // 24 horas (será forçado para 1m de intervalo)
    60000,
    true // forTable=true para usar alta resolução
  );
  
  // 📊 CALCULAR TENDÊNCIA REAL (apenas para card-stat)
  const trendData = useSensorTrend(
    widget.type === 'card-stat' ? sensorTag : undefined,
    widget.type === 'card-stat' ? assetId : undefined,
    widget.type === 'card-stat' ? sensorData.value : null,
    24 // Comparar com últimas 24 horas
  );

  // 📊 PREPARAR DADOS DA TABELA - Mover useMemo para o topo para evitar erro de hooks
  const tableData = React.useMemo(() => {
    if (widget.type !== 'table-data' && widget.type !== 'table-realtime') {
      return [];
    }
    
    if (!tableMultiSensorHistory.series || tableMultiSensorHistory.series.length === 0) {
      return [];
    }
    
    // Normalizar timestamps para string no formato ISO (sem ms) para garantir comparação correta
    const normalizeTimestamp = (ts: string | Date): string => {
      const date = new Date(ts);
      // Formatar como YYYY-MM-DD HH:mm:ss (sem milissegundos)
      return date.toISOString().split('.')[0].replace('T', ' ');
    };
    
    // Coletar TODOS os timestamps únicos de TODAS as séries (normalizados)
    const allTimestampsSet = new Set<string>();
    tableMultiSensorHistory.series.forEach(serie => {
      if (serie.data) {
        serie.data.forEach(point => {
          allTimestampsSet.add(normalizeTimestamp(point.timestamp));
        });
      }
    });
    
    // Converter para array e ordenar cronologicamente
    const allTimestamps = Array.from(allTimestampsSet).sort();
    
    // Pegar últimos 100 timestamps
    const last100Timestamps = allTimestamps.slice(-100);
    
    // Para cada timestamp, buscar valores de todas as variáveis
    const rows = last100Timestamps.map((timestamp) => {
      const values = tableMultiSensorHistory.series.map(serie => {
        // Buscar o valor para este timestamp específico (comparando timestamps normalizados)
        const matchingData = serie.data?.find(d => normalizeTimestamp(d.timestamp) === timestamp);
        
        // Extrair nome da variável
        const variableName = serie.sensorTag.includes('_') 
          ? serie.sensorTag.split('_').slice(1).join('_')
              .split('_')
              .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
              .join(' ')
          : serie.sensorTag;
        
        return {
          sensorTag: serie.sensorTag,
          value: matchingData?.value ?? null,
          unit: serie.unit || '',
          name: variableName
        };
      });
      
      return { timestamp, values };
    });
    
    // Reverter para mostrar mais recentes primeiro
    return rows.reverse();
  }, [widget.type, tableMultiSensorHistory.series]);

  // Helper para aplicar transformação de fórmula nos valores do widget
  const applyFormulaTransform = (value: any): any => {
    const formula = widget.config?.transform?.formula;
    if (!formula || !formula.trim()) {
      return value;
    }
    
    try {
      return safeEvalFormula(formula, value, value);
    } catch (error) {
      console.error('Erro ao aplicar fórmula no widget:', error);
      return value;
    }
  };

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

  // Obter limites mínimos baseado no tipo de widget
  const getMinDimensions = (): { minWidth: number; minHeight: number } => {
    switch (widget.type) {
      // Gráficos que precisam de mais espaço
      case 'chart-line':
      case 'chart-area':
      case 'chart-bar':
      case 'chart-bar-horizontal':
      case 'chart-pie':
      case 'chart-donut':
      case 'chart-radial':
        return { minWidth: 400, minHeight: 350 };
      
      // Medidores e gauges
      case 'gauge-circular':
      case 'card-gauge':
        return { minWidth: 250, minHeight: 250 };
      
      // Cards menores
      case 'card-kpi':
      case 'card-stat':
      case 'card-value':
      case 'card-progress':
        return { minWidth: 200, minHeight: 120 };
      
      // Widgets de texto e outros
      case 'text-display':
      case 'iframe-embed':
        return { minWidth: 200, minHeight: 150 };
      
      // Padrão para outros tipos
      default:
        return { minWidth: 200, minHeight: 150 };
    }
  };

  const { minWidth, minHeight } = getMinDimensions();

  const handleResizeEnd = (width: number, height: number) => {
    setCustomWidth(width);
    setCustomHeight(height);
    
    // Persistir dimensões no widget
    if (isOverview) {
      useOverviewStore.getState().updateWidget(widget.id, {
        position: { ...widget.position, w: width, h: height }
      });
    } else {
      useDashboardStore.getState().updateWidget(layoutId, widget.id, {
        position: { ...widget.position, w: width, h: height }
      });
    }
  };

  const handleResize = (width: number, height: number) => {
    // Atualizar durante o redimensionamento para feedback visual imediato
    setCustomWidth(width);
    setCustomHeight(height);
  };

  const renderContent = () => {
    // IMPORTANTE: No Overview, widgets não precisam de sensorId (usam dados agregados)
    // Apenas mostrar placeholder de configuração em Dashboards quando não há sensorId ou sensorTags
    const hasConfiguration = widget.config?.sensorId || (widget.config?.sensorTags && widget.config.sensorTags.length > 0);
    if (!isOverview && !hasConfiguration && widget.type !== 'text-display' && widget.type !== 'iframe-embed') {
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
        // 🔥 USAR DADOS REAIS DO SENSOR
        const kpiRawValue = sensorData.value ?? widgetData?.value ?? 0;
        const kpiValue = applyFormulaTransform(kpiRawValue);
        const kpiData = widgetData as any;
        
        // Trend ainda pode vir de cálculos (não está no last_value)
        const kpiTrend = typeof kpiData?.trendValue === 'number' ? kpiData.trendValue : null;
        const kpiTrendDirection = typeof kpiData?.trend === 'string' ? kpiData.trend : (kpiTrend && kpiTrend >= 0 ? 'up' : 'down');
        const kpiTrendLabel = kpiData?.trendLabel || 'último valor';
        
        // 🎨 APLICAR COR BASEADA NOS LIMITES
        const kpiValueNumber = kpiValue !== null && kpiValue !== undefined ? Number(kpiValue) : null;
        const kpiColor = getThresholdColor(
          kpiValueNumber,
          widget.config?.warningThreshold,
          widget.config?.criticalThreshold,
          widget.config?.color || '#3b82f6'
        );
        const kpiBgClass = getThresholdBackgroundClass(
          kpiValueNumber,
          widget.config?.warningThreshold,
          widget.config?.criticalThreshold
        );
        
        // Ícone baseado no tipo ou configuração
        const getKpiIcon = () => {
          const iconColor = widget.config?.iconColor || kpiColor;
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
          <div className={cn("rounded-lg p-6 border shadow-sm min-h-[140px] h-full flex flex-col justify-between hover:shadow-md transition-shadow", 
            kpiBgClass === 'bg-card' ? 'bg-white border-gray-200' : kpiBgClass)}>
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
                <span className="text-3xl font-bold" style={{ color: kpiColor }}>
                  {sensorData.isLoading ? '...' : (kpiValue !== null && kpiValue !== undefined ? Number(kpiValue).toFixed(widget.config?.decimals || 1) : '--')}
                </span>
                <span className="text-sm text-gray-500 font-medium">
                  {sensorData.unit || widget.config?.unit || '%'}
                </span>
              </div>
              {sensorData.error && (
                <p className="text-xs text-red-500 mt-1">Erro ao carregar dados</p>
              )}
              {!sensorData.isOnline && !sensorData.isLoading && !sensorData.error && (
                <p className="text-xs text-orange-500 mt-1">Sensor offline</p>
              )}
            </div>
            
            {/* Tendência/Variação */}
            {kpiTrend !== null && (
              <div className="flex items-center gap-1 text-xs font-medium">
                <span className={kpiTrendDirection === 'up' ? 'text-green-600' : 'text-red-600'}>
                  {kpiTrendDirection === 'up' ? '+' : ''}{kpiTrend}%
                </span>
                <span className="text-gray-500">• {kpiTrendLabel}</span>
              </div>
            )}
          </div>
        );

      // ============ CARDS SIMPLES ============
      case 'card-value':
        // 🔥 USAR DADOS REAIS DO SENSOR
        const cardRawValue = sensorData.value ?? widgetData?.value ?? 0;
        const cardValue = applyFormulaTransform(cardRawValue);
        
        // 🎨 APLICAR COR BASEADA NOS LIMITES
        const cardValueNumber = cardValue !== null && cardValue !== undefined ? Number(cardValue) : null;
        const cardColor = getThresholdColor(
          cardValueNumber,
          widget.config?.warningThreshold,
          widget.config?.criticalThreshold,
          widgetData?.color || widget.config?.color || '#3b82f6'
        );
        const cardBgClass = getThresholdBackgroundClass(
          cardValueNumber,
          widget.config?.warningThreshold,
          widget.config?.criticalThreshold
        );
        
        return (
          <div className={cn("rounded-xl p-6 border shadow-sm h-full flex flex-col justify-between", cardBgClass)}>
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-sm font-medium text-muted-foreground">{widget.config?.label || widget.title}</h3>
              <div 
                className={cn(
                  "w-2 h-2 rounded-full animate-pulse",
                  sensorData.isOnline ? "bg-green-500" : "bg-gray-400"
                )}
                title={sensorData.isOnline ? "Online" : "Offline"} 
              />
            </div>
            <div className="flex-1 flex flex-col justify-center">
              <div className="text-4xl font-bold" style={{ color: cardColor }}>
                {sensorData.isLoading ? '...' : (cardValue !== null && cardValue !== undefined ? Number(cardValue).toFixed(widget.config?.decimals || 2) : '--')}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                {sensorData.unit || widget.config?.unit || 'valor'}
              </div>
              {sensorData.error && (
                <p className="text-xs text-red-500 mt-2">Erro ao carregar</p>
              )}
            </div>
          </div>
        );

      case 'card-stat':
        // 🔥 USAR DADOS REAIS DO SENSOR
        const statRawValue = sensorData.value ?? widgetData?.value ?? 0;
        const statValue = applyFormulaTransform(statRawValue);
        const statData = widgetData as any;
        
        // 📊 Usar tendência calculada do hook (dados reais) ou fallback
        const statTrend = trendData.trendPercentage ?? (typeof statData?.trend === 'number' ? statData.trend : null);
        
        // 🎨 APLICAR COR BASEADA NOS LIMITES
        const statValueNumber = statValue !== null && statValue !== undefined ? Number(statValue) : null;
        const statColor = getThresholdColor(
          statValueNumber,
          widget.config?.warningThreshold,
          widget.config?.criticalThreshold,
          widgetData?.color || widget.config?.color || '#3b82f6'
        );
        const statBgClass = getThresholdBackgroundClass(
          statValueNumber,
          widget.config?.warningThreshold,
          widget.config?.criticalThreshold
        );
        
        return (
          <div className={cn("rounded-xl p-6 border shadow-sm h-full flex flex-col justify-between", statBgClass)}>
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-sm font-medium text-muted-foreground">{widget.config?.label || widget.title}</h3>
              <Activity className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="flex-1 flex flex-col justify-center">
              <div className="text-3xl font-bold" style={{ color: statColor }}>
                {sensorData.isLoading ? '...' : (statValue !== null && statValue !== undefined ? Number(statValue).toFixed(widget.config?.decimals || 2) : '--')}
              </div>
              <div className="text-sm text-muted-foreground mt-1">{sensorData.unit || widget.config?.unit || 'valor'}</div>
              
              {/* Tendência com dados reais */}
              {statTrend !== null && !sensorData.isLoading && !trendData.isLoading && (
                <div className="flex items-center gap-2 mt-2">
                  <span className={`text-sm font-medium ${statTrend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {statTrend >= 0 ? '↑' : '↓'} {Math.abs(statTrend).toFixed(1)}%
                  </span>
                  <span className="text-xs text-muted-foreground">
                    vs {trendData.comparisonPeriod || 'período anterior'}
                  </span>
                </div>
              )}
              
              {/* Loading state da tendência */}
              {trendData.isLoading && !sensorData.isLoading && (
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs text-muted-foreground">Calculando tendência...</span>
                </div>
              )}
              
              {/* Error state da tendência */}
              {trendData.error && !trendData.isLoading && (
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs text-orange-500" title={trendData.error}>
                    ⚠️ Tendência indisponível
                  </span>
                </div>
              )}
            </div>
          </div>
        );

      case 'card-progress':
        // 🔥 USAR DADOS REAIS DO SENSOR  
        const progressRawValue = sensorData.value ?? (widgetData?.value ? parseFloat(String(widgetData.value)) : 0);
        const progressData = widgetData as any;
        
        // 📊 Calcular porcentagem baseada em minValue e maxValue
        const progressMinValue = typeof widget.config?.minValue === 'number' ? widget.config.minValue : 0;
        const progressMaxValue = typeof widget.config?.maxValue === 'number' ? widget.config.maxValue : 100;
        const progressRange = progressMaxValue - progressMinValue;
        const progressPercentage = progressRange > 0 
          ? Math.min(100, Math.max(0, ((progressRawValue - progressMinValue) / progressRange) * 100))
          : 0;
        
        const progressTarget = typeof progressData?.target === 'number'
          ? progressData.target
          : typeof widget.config?.target === 'number'
            ? widget.config.target
            : 100;
        
        // 🎨 APLICAR COR BASEADA NOS LIMITES (usar valor bruto para comparação)
        const progressColor = getThresholdColor(
          progressRawValue,
          widget.config?.warningThreshold,
          widget.config?.criticalThreshold,
          widgetData?.color || widget.config?.color || '#3b82f6'
        );
        const progressBgClass = getThresholdBackgroundClass(
          progressRawValue,
          widget.config?.warningThreshold,
          widget.config?.criticalThreshold
        );
        
        return (
          <div className={cn("rounded-xl p-6 border shadow-sm h-full flex flex-col justify-between", progressBgClass)}>
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-sm font-medium text-muted-foreground">{widget.config?.label || widget.title}</h3>
            </div>
            <div className="flex-1 flex flex-col justify-center">
              <div className="text-2xl font-bold mb-2" style={{ color: progressColor }}>
                {progressRawValue.toFixed(1)} {widgetData?.unit || widget.config?.unit || ''}
              </div>
              <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all duration-300"
                  style={{ 
                    width: `${progressPercentage}%`,
                    backgroundColor: progressColor
                  }}
                />
              </div>
              <div className="text-xs text-muted-foreground mt-2">
                {progressMinValue.toFixed(0)} - {progressMaxValue.toFixed(0)} {widgetData?.unit || widget.config?.unit || ''}
              </div>
            </div>
          </div>
        );

      case 'card-gauge':
        // 🔥 USAR DADOS REAIS DO SENSOR
        const gaugeRawValue = sensorData.value ?? (widgetData?.value ? parseFloat(String(widgetData.value)) : 0);
        
        // 📊 Calcular porcentagem baseada em minValue e maxValue
        const gaugeMinValue = typeof widget.config?.minValue === 'number' ? widget.config.minValue : 0;
        const gaugeMaxValue = typeof widget.config?.maxValue === 'number' ? widget.config.maxValue : 100;
        const gaugeRange = gaugeMaxValue - gaugeMinValue;
        const gaugePercentage = gaugeRange > 0 
          ? Math.min(100, Math.max(0, ((gaugeRawValue - gaugeMinValue) / gaugeRange) * 100))
          : 0;
        
        // 🎨 APLICAR COR BASEADA NOS LIMITES (usar valor bruto para comparação)
        const gaugeColor = getThresholdColor(
          gaugeRawValue,
          widget.config?.warningThreshold,
          widget.config?.criticalThreshold,
          widget.config?.color || '#3b82f6'
        );
        const gaugeBgClass = getThresholdBackgroundClass(
          gaugeRawValue,
          widget.config?.warningThreshold,
          widget.config?.criticalThreshold
        );
        
        return (
          <div className={cn("rounded-xl p-6 border shadow-sm h-full flex flex-col items-center justify-center", gaugeBgClass)}>
            <h3 className="text-sm font-medium text-muted-foreground mb-4">{widget.config?.label || widget.title}</h3>
            <div className="relative w-32 h-32">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="64" cy="64" r="56" stroke="#e5e7eb" strokeWidth="8" fill="none" />
                <circle 
                  cx="64" 
                  cy="64" 
                  r="56" 
                  stroke={gaugeColor}
                  strokeWidth="8" 
                  fill="none"
                  strokeDasharray={`${(gaugePercentage / 100) * 352} 352`}
                  className="transition-all duration-300"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold" style={{ color: gaugeColor }}>
                  {gaugeRawValue.toFixed(1)}
                </span>
                <span className="text-xs text-muted-foreground">{widget.config?.unit || '%'}</span>
              </div>
            </div>
            <div className="text-xs text-muted-foreground mt-3">
              {gaugeMinValue.toFixed(0)} - {gaugeMaxValue.toFixed(0)} {widget.config?.unit || '%'}
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
        // 🔥 USAR DADOS REAIS DO SENSOR
        const statusRawValue = sensorData.value ?? 50;
        
        // 🎨 APLICAR COR BASEADA NOS LIMITES (se configurados)
        // Senão, usar lógica padrão: 0-40 = Crítico, 41-70 = Aviso, 71-100 = OK
        let statusColor: string;
        let status: string;
        let statusBgClass: string;
        
        if (widget.config?.criticalThreshold !== undefined || widget.config?.warningThreshold !== undefined) {
          // Usar thresholds configurados
          statusColor = getThresholdColor(
            statusRawValue,
            widget.config?.warningThreshold,
            widget.config?.criticalThreshold,
            '#10b981' // verde padrão
          );
          statusBgClass = getThresholdBackgroundClass(
            statusRawValue,
            widget.config?.warningThreshold,
            widget.config?.criticalThreshold
          );
          
          // Determinar status baseado nos thresholds
          if (widget.config?.criticalThreshold !== undefined && statusRawValue >= widget.config.criticalThreshold) {
            status = 'Crítico';
          } else if (widget.config?.warningThreshold !== undefined && statusRawValue >= widget.config.warningThreshold) {
            status = 'Aviso';
          } else {
            status = 'OK';
          }
        } else {
          // Lógica padrão: porcentagem
          const statusValue = statusRawValue / 100;
          status = statusValue > 0.7 ? 'OK' : statusValue > 0.4 ? 'Aviso' : 'Crítico';
          statusColor = statusValue > 0.7 ? '#10b981' : statusValue > 0.4 ? '#f59e0b' : '#ef4444';
          statusBgClass = 'bg-card';
        }
        
        return (
          <div className={cn("rounded-xl p-6 border shadow-sm h-full flex flex-col items-center justify-center gap-4", statusBgClass)}>
            <h3 className="text-sm font-medium text-muted-foreground">{widget.config?.label || widget.title}</h3>
            <div 
              className="w-24 h-24 rounded-full flex items-center justify-center"
              style={{ backgroundColor: `${statusColor}20` }}
            >
              <span className="text-2xl font-bold" style={{ color: statusColor }}>
                {sensorData.isLoading ? '...' : status}
              </span>
            </div>
          </div>
        );

      // ============ GRÁFICOS DE LINHA ============
      case 'chart-line':
      case 'chart-area':
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
        
        // 🔥 DASHBOARD NORMAL: USAR DADOS REAIS DO SENSOR
        // Verificar se tem múltiplas variáveis
        const hasMultipleVariables = sensorTags && sensorTags.length > 1;
        
        // 🐛 DEBUG: Log dos dados do widget
        console.log('🔍 DEBUG chart-line widget:', {
          widgetId: widget.id,
          sensorTag,
          sensorTags,
          assetTag,
          chartTimeRange, // 🆕 Log do período atual
          hasMultipleVariables,
          multiSensorHistory: {
            series: multiSensorHistory.series.length,
            loading: multiSensorHistory.loading,
            error: multiSensorHistory.error
          },
          sensorHistory: {
            data: sensorHistory.data.length,
            loading: sensorHistory.loading,
            error: sensorHistory.error
          }
        });
        
        // Usar histórico apropriado
        const historyData = hasMultipleVariables ? multiSensorHistory : sensorHistory;
        
        // Mostrar loading apenas se não tem dados ainda
        const isLoadingInitial = historyData.loading && (!hasMultipleVariables ? sensorHistory.data.length === 0 : multiSensorHistory.series.length === 0);
        
        // Verificar se tem dados para renderizar
        const hasData = hasMultipleVariables ? multiSensorHistory.series.length > 0 : sensorHistory.data.length > 0;
        
        // Renderizar gráfico com dados reais usando LineChartGeneric
        const totalPoints = hasMultipleVariables 
          ? multiSensorHistory.series.reduce((sum, s) => sum + s.data.length, 0)
          : sensorHistory.data.length;

        return (
          <div className="bg-card rounded-xl p-6 border shadow-sm h-full flex flex-col">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold">{widget.config?.label || widget.title}</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {hasMultipleVariables 
                    ? `${sensorTags?.length || 0} variáveis` // Usar sensorTags.length em vez de series.length
                    : (widget.config?.unit || sensorData.unit || '')
                  }
                </p>
              </div>
              <div className="text-right">
                {!hasMultipleVariables && (
                  <p className="text-sm font-semibold" style={{ color: widget.config?.color || '#3b82f6' }}>
                    Atual: {sensorData.value?.toFixed(1) || '--'} {widget.config?.unit || sensorData.unit || ''}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  {totalPoints} pontos
                </p>
              </div>
            </div>
            
            {/* 📅 SELETOR DE PERÍODO */}
            <div className="flex items-center gap-1 mb-3 pb-3 border-b">
              <span className="text-xs text-muted-foreground mr-2">Período:</span>
              <button
                onClick={() => {
                  console.log('⏱️ Alterando período para 1h');
                  setChartTimeRange(1);
                }}
                className={`px-3 py-1 text-xs rounded transition-colors ${
                  chartTimeRange === 1 
                    ? 'bg-primary text-primary-foreground font-medium' 
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                1h
              </button>
              <button
                onClick={() => {
                  console.log('⏱️ Alterando período para 6h');
                  setChartTimeRange(6);
                }}
                className={`px-3 py-1 text-xs rounded transition-colors ${
                  chartTimeRange === 6 
                    ? 'bg-primary text-primary-foreground font-medium' 
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                6h
              </button>
              <button
                onClick={() => {
                  console.log('⏱️ Alterando período para 24h');
                  setChartTimeRange(24);
                }}
                className={`px-3 py-1 text-xs rounded transition-colors ${
                  chartTimeRange === 24 
                    ? 'bg-primary text-primary-foreground font-medium' 
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                24h
              </button>
              <button
                onClick={() => {
                  console.log('⏱️ Alterando período para 7d (168h)');
                  setChartTimeRange(168);
                }}
                className={`px-3 py-1 text-xs rounded transition-colors ${
                  chartTimeRange === 168 
                    ? 'bg-primary text-primary-foreground font-medium' 
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                7d
              </button>
              <button
                onClick={() => {
                  console.log('⏱️ Alterando período para 30d (720h)');
                  setChartTimeRange(720);
                }}
                className={`px-3 py-1 text-xs rounded transition-colors ${
                  chartTimeRange === 720 
                    ? 'bg-primary text-primary-foreground font-medium' 
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                30d
              </button>
            </div>
            
            <div className="flex-1 relative min-h-[250px]">
              {/* Gráfico - sempre renderizado */}
              {hasMultipleVariables ? (
                <LineChartGeneric 
                  series={multiSensorHistory.series}
                  height={250}
                />
              ) : (
                <LineChartGeneric 
                  data={sensorHistory.data} 
                  height={250}
                  color={widget.config?.color || '#3b82f6'}
                />
              )}
              
              {/* Overlay de Loading */}
              {isLoadingInitial && (
                <div className="absolute inset-0 flex items-center justify-center bg-card/80 backdrop-blur-sm rounded z-10">
                  <div className="text-center text-muted-foreground">
                    <Activity className="w-12 h-12 mx-auto mb-2 opacity-50 animate-pulse" />
                    <p className="text-sm">Carregando dados...</p>
                  </div>
                </div>
              )}
              
              {/* Overlay de Erro ou Sem Dados */}
              {!isLoadingInitial && !hasData && (
                <div className="absolute inset-0 flex items-center justify-center bg-card/80 backdrop-blur-sm rounded z-10">
                  <div className="text-center text-muted-foreground px-4">
                    <Activity className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm font-medium">Nenhum dado encontrado</p>
                    {historyData.error && (
                      <p className="text-xs mt-1">{historyData.error}</p>
                    )}
                    <p className="text-xs mt-2">
                      Tente selecionar outro período de tempo
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      // ============ GRÁFICOS DE BARRA ============
      case 'chart-bar':
      case 'chart-bar-horizontal':
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
                    <div key={i} className="flex flex-col items-center justify-end gap-1 flex-1 h-full">
                      <div className="text-xs font-medium text-center">{item.consumption}kWh</div>
                      <div 
                        className="w-full rounded-t-md transition-all bg-blue-500"
                        style={{ 
                          height: `${height}%`,
                          minHeight: '4px',
                          backgroundColor: widget.config?.color || '#3b82f6'
                        }}
                      />
                      <span className="text-xs text-muted-foreground truncate w-full text-center mt-1">{item.tag}</span>
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
                    <div key={i} className="flex flex-col items-center justify-end gap-1 flex-1 h-full">
                      <div className="text-xs font-medium text-center">{mockValues[i]}</div>
                      <div 
                        className="w-full rounded-t-md transition-all bg-blue-500"
                        style={{ 
                          height: `${height}%`,
                          minHeight: '4px',
                          backgroundColor: widget.config?.color || '#3b82f6'
                        }}
                      />
                      <span className="text-xs text-muted-foreground truncate w-full text-center mt-1">{equipment}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        }
        
        // 📊 GRÁFICO DE BARRAS COM DADOS REAIS E MÚLTIPLAS VARIÁVEIS
        const barHasMultipleSeries = sensorTags && sensorTags.length > 0;
        const barHistoryData = barHasMultipleSeries ? multiSensorHistory : sensorHistory;
        const barLoading = barHistoryData.loading;
        const barHasData = barHasMultipleSeries 
          ? ((barHistoryData as any).series && (barHistoryData as any).series.length > 0)
          : ((barHistoryData as any).data && (barHistoryData as any).data.length > 0);
        const isBarHorizontal = widget.type === 'chart-bar-horizontal';
        
        return (
          <div className="bg-card rounded-xl p-6 border shadow-sm h-full flex flex-col relative min-h-[250px]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{widget.title}</h3>
              
              {/* ⏱️ BOTÕES DE SELEÇÃO DE PERÍODO */}
              <div className="flex gap-1">
                {[
                  { label: '1h', value: 1 },
                  { label: '6h', value: 6 },
                  { label: '24h', value: 24 },
                  { label: '7d', value: 168 },
                  { label: '30d', value: 720 }
                ].map(period => (
                  <button
                    key={period.value}
                    onClick={() => setChartTimeRange(period.value)}
                    className={cn(
                      "px-2 py-1 text-xs rounded transition-colors",
                      chartTimeRange === period.value
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    )}
                  >
                    {period.label}
                  </button>
                ))}
              </div>
            </div>
            
            {/* 📊 CHART SEMPRE RENDERIZADO */}
            <div className="flex-1 relative">
              <BarChartGeneric
                data={barHasMultipleSeries ? undefined : (barHistoryData as any).data}
                series={barHasMultipleSeries ? (barHistoryData as any).series : undefined}
                horizontal={isBarHorizontal}
              />
              
              {/* 🔄 OVERLAY DE LOADING */}
              {barLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-card/80 backdrop-blur-sm z-10 rounded-lg">
                  <div className="text-center">
                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Carregando dados...</p>
                  </div>
                </div>
              )}
              
              {/* ⚠️ OVERLAY DE SEM DADOS */}
              {!barLoading && !barHasData && (
                <div className="absolute inset-0 flex items-center justify-center bg-card/80 backdrop-blur-sm z-10 rounded-lg">
                  <div className="text-center text-muted-foreground">
                    <AlertTriangle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Nenhum dado disponível</p>
                    <p className="text-xs mt-1">Configure o widget ou aguarde dados</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      // ============ GRÁFICOS CIRCULARES ============
      case 'chart-pie':
      case 'chart-donut':
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
        
        // 📊 GRÁFICO DE PIZZA/DONUT COM DADOS REAIS E MÚLTIPLAS VARIÁVEIS
        const pieHasMultipleSeries = sensorTags && sensorTags.length > 0;
        const pieHistoryData = pieHasMultipleSeries ? multiSensorHistory : sensorHistory;
        const pieLoading = pieHistoryData.loading;
        const pieHasData = pieHasMultipleSeries 
          ? ((pieHistoryData as any).series && (pieHistoryData as any).series.length > 0)
          : ((pieHistoryData as any).data && (pieHistoryData as any).data.length > 0);
        const pieType = widget.type === 'chart-donut' ? 'donut' : 'pie';
        
        return (
          <div className="bg-card rounded-xl p-6 border shadow-sm h-full flex flex-col relative min-h-[250px]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{widget.title}</h3>
              
              {/* ⏱️ BOTÕES DE SELEÇÃO DE PERÍODO */}
              <div className="flex gap-1">
                {[
                  { label: '1h', value: 1 },
                  { label: '6h', value: 6 },
                  { label: '24h', value: 24 },
                  { label: '7d', value: 168 },
                  { label: '30d', value: 720 }
                ].map(period => (
                  <button
                    key={period.value}
                    onClick={() => setChartTimeRange(period.value)}
                    className={cn(
                      "px-2 py-1 text-xs rounded transition-colors",
                      chartTimeRange === period.value
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    )}
                  >
                    {period.label}
                  </button>
                ))}
              </div>
            </div>
            
            {/* 📊 CHART SEMPRE RENDERIZADO */}
            <div className="flex-1 relative">
              <PieChartGeneric
                data={pieHasMultipleSeries ? undefined : (pieHistoryData as any).data}
                series={pieHasMultipleSeries ? (pieHistoryData as any).series : undefined}
                type={pieType}
              />
              
              {/* 🔄 OVERLAY DE LOADING */}
              {pieLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-card/80 backdrop-blur-sm z-10 rounded-lg">
                  <div className="text-center">
                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Carregando dados...</p>
                  </div>
                </div>
              )}
              
              {/* ⚠️ OVERLAY DE SEM DADOS */}
              {!pieLoading && !pieHasData && (
                <div className="absolute inset-0 flex items-center justify-center bg-card/80 backdrop-blur-sm z-10 rounded-lg">
                  <div className="text-center text-muted-foreground">
                    <AlertTriangle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Nenhum dado disponível</p>
                    <p className="text-xs mt-1">Configure o widget ou aguarde dados</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      // ============ GRÁFICO RADIAL ============
      case 'chart-radial':
        // Se for overview, usar dados mockados
        if (isOverview) {
          return (
            <div className="bg-card rounded-xl p-6 border shadow-sm h-full flex flex-col">
              <h3 className="text-lg font-semibold mb-4">{widget.title}</h3>
              <div className="flex-1 flex items-center justify-center">
                <p className="text-muted-foreground">Gráfico Radial (Overview)</p>
              </div>
            </div>
          );
        }
        
        // 📊 GRÁFICO RADIAL COM DADOS REAIS E MÚLTIPLAS VARIÁVEIS
        const radialHasMultipleSeries = sensorTags && sensorTags.length > 0;
        const radialHistoryData = radialHasMultipleSeries ? multiSensorHistory : sensorHistory;
        const radialLoading = radialHistoryData.loading;
        const radialHasData = radialHasMultipleSeries 
          ? ((radialHistoryData as any).series && (radialHistoryData as any).series.length > 0)
          : ((radialHistoryData as any).data && (radialHistoryData as any).data.length > 0);
        
        return (
          <div className="bg-card rounded-xl p-6 border shadow-sm h-full flex flex-col relative min-h-[250px]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{widget.title}</h3>
              
              {/* ⏱️ BOTÕES DE SELEÇÃO DE PERÍODO */}
              <div className="flex gap-1">
                {[
                  { label: '1h', value: 1 },
                  { label: '6h', value: 6 },
                  { label: '24h', value: 24 },
                  { label: '7d', value: 168 },
                  { label: '30d', value: 720 }
                ].map(period => (
                  <button
                    key={period.value}
                    onClick={() => setChartTimeRange(period.value)}
                    className={cn(
                      "px-2 py-1 text-xs rounded transition-colors",
                      chartTimeRange === period.value
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    )}
                  >
                    {period.label}
                  </button>
                ))}
              </div>
            </div>
            
            {/* 📊 CHART SEMPRE RENDERIZADO */}
            <div className="flex-1 relative">
              <RadialChartGeneric
                data={radialHasMultipleSeries ? undefined : (radialHistoryData as any).data}
                series={radialHasMultipleSeries ? (radialHistoryData as any).series : undefined}
              />
              
              {/* 🔄 OVERLAY DE LOADING */}
              {radialLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-card/80 backdrop-blur-sm z-10 rounded-lg">
                  <div className="text-center">
                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Carregando dados...</p>
                  </div>
                </div>
              )}
              
              {/* ⚠️ OVERLAY DE SEM DADOS */}
              {!radialLoading && !radialHasData && (
                <div className="absolute inset-0 flex items-center justify-center bg-card/80 backdrop-blur-sm z-10 rounded-lg">
                  <div className="text-center text-muted-foreground">
                    <AlertTriangle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Nenhum dado disponível</p>
                    <p className="text-xs mt-1">Configure o widget ou aguarde dados</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      // ============ MEDIDORES ============
      case 'gauge-circular':
        // 🔥 USAR DADOS REAIS DO SENSOR
        const meterValue = sensorData.value ?? 0;
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
                  {sensorData.isLoading ? '...' : (meterValue !== null ? Number(meterValue).toFixed(widget.config?.decimals || 1) : '--')}
                </span>
                <span className="text-sm text-muted-foreground">{sensorData.unit || widget.config?.unit || '%'}</span>
              </div>
            </div>
          </div>
        );

      case 'gauge-tank':
        // 🔥 USAR DADOS REAIS DO SENSOR COM ESCALA MIN/MAX
        const tankValue = sensorData.value ?? 0;
        const tankMin = widget.config?.minValue ?? 0;
        const tankMax = widget.config?.maxValue ?? 100;
        const tankRange = tankMax - tankMin;
        const tankPercentage = tankRange > 0 ? Math.min(Math.max(((tankValue - tankMin) / tankRange) * 100, 0), 100) : 0;
        
        // Determinar cor com base em thresholds
        let tankColor = widget.config?.color || '#3b82f6';
        if (widget.config?.criticalThreshold && tankPercentage <= widget.config.criticalThreshold) {
          tankColor = '#ef4444'; // vermelho
        } else if (widget.config?.warningThreshold && tankPercentage <= widget.config.warningThreshold) {
          tankColor = '#f59e0b'; // amarelo
        }
        
        return (
          <div className="bg-card rounded-xl p-6 border shadow-sm h-full flex flex-col items-center justify-center gap-4">
            <h3 className="text-sm font-medium text-muted-foreground">{widget.title}</h3>
            <div className="flex items-center gap-2">
              {/* Escala lateral esquerda com traços e números */}
              <div className="flex flex-col justify-between h-56 py-2">
                {[
                  { value: tankMax, percent: 100 },
                  { value: tankMin + (tankRange * 0.75), percent: 75 },
                  { value: tankMin + (tankRange * 0.5), percent: 50 },
                  { value: tankMin + (tankRange * 0.25), percent: 25 },
                  { value: tankMin, percent: 0 }
                ].map((mark, idx) => (
                  <div key={idx} className="flex items-center gap-1">
                    <span className="text-xs text-muted-foreground w-8 text-right">
                      {Number(mark.value).toFixed(0)}
                    </span>
                    <span className="text-gray-400">—</span>
                  </div>
                ))}
              </div>
              
              {/* Tanque */}
              <div className="relative w-28 h-56">
                {/* Container do tanque */}
                <div className="absolute inset-0 border-3 border-gray-400 rounded-lg overflow-hidden bg-gray-50">
                  {/* Nível do tanque */}
                  <div 
                    className="absolute bottom-0 left-0 right-0 transition-all duration-500"
                    style={{ 
                      height: `${tankPercentage}%`,
                      backgroundColor: tankColor,
                      opacity: 0.8
                    }}
                  />
                  {/* Valor central */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-2xl font-bold text-foreground drop-shadow-md z-10">
                      {sensorData.isLoading ? '...' : Number(tankValue).toFixed(widget.config?.decimals || 1)}
                    </span>
                    <span className="text-xs text-foreground drop-shadow-md">{sensorData.unit || widget.config?.unit || '%'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'gauge-thermometer':
        // 🔥 USAR DADOS REAIS DO SENSOR COM ESCALA MIN/MAX
        const thermValue = sensorData.value ?? 0;
        const thermMin = widget.config?.minValue ?? 0;
        const thermMax = widget.config?.maxValue ?? 100;
        const thermRange = thermMax - thermMin;
        const thermPercentage = thermRange > 0 ? Math.min(Math.max(((thermValue - thermMin) / thermRange) * 100, 0), 100) : 0;
        
        // Determinar cor com base em thresholds ou temperatura
        let thermColor = widget.config?.color || '#ef4444';
        if (widget.config?.criticalThreshold && thermPercentage >= widget.config.criticalThreshold) {
          thermColor = '#ef4444'; // vermelho crítico
        } else if (widget.config?.warningThreshold && thermPercentage >= widget.config.warningThreshold) {
          thermColor = '#f59e0b'; // amarelo aviso
        } else if (thermPercentage < 50) {
          thermColor = '#3b82f6'; // azul frio
        }
        
        return (
          <div className="bg-card rounded-xl p-6 border shadow-sm h-full w-full flex flex-col items-center justify-center overflow-hidden">
            <h3 className="text-sm font-medium text-muted-foreground mb-2 truncate w-full text-center">{widget.title}</h3>
            <div className="flex items-center gap-2 justify-center flex-shrink-0">
              {/* Escala lateral esquerda */}
              <div className="flex flex-col justify-between h-48 py-2 flex-shrink-0">
                {[
                  { value: thermMax },
                  { value: thermMin + (thermRange * 0.75) },
                  { value: thermMin + (thermRange * 0.5) },
                  { value: thermMin + (thermRange * 0.25) },
                  { value: thermMin }
                ].map((mark, idx) => (
                  <div key={idx} className="flex items-center gap-1">
                    <span className="text-[10px] text-muted-foreground w-7 text-right">
                      {Number(mark.value).toFixed(0)}
                    </span>
                    <span className="text-gray-400 text-[10px]">—</span>
                  </div>
                ))}
              </div>
              
              {/* Termômetro */}
              <div className="relative flex flex-col items-center flex-shrink-0">
                {/* Bulbo superior */}
                <div className="w-5 h-5 rounded-full bg-gray-200 mb-1 border-2 border-gray-300" />
                
                {/* Tubo do termômetro */}
                <div className="relative w-5 h-40 bg-gray-200 rounded-full overflow-hidden border-2 border-gray-300">
                  {/* Mercúrio/Líquido */}
                  <div 
                    className="absolute bottom-0 left-0 right-0 transition-all duration-500 rounded-full"
                    style={{ 
                      height: `${thermPercentage}%`,
                      backgroundColor: thermColor,
                      boxShadow: `0 0 8px ${thermColor}40`
                    }}
                  />
                  
                  {/* Marcações internas */}
                  <div className="absolute inset-0 flex flex-col justify-between py-2 px-0.5">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <div key={i} className="w-full h-px bg-gray-400/30" />
                    ))}
                  </div>
                </div>
                
                {/* Bulbo inferior */}
                <div 
                  className="w-7 h-7 rounded-full -mt-1 border-2 border-gray-300 relative overflow-hidden flex-shrink-0"
                  style={{ backgroundColor: thermColor }}
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-3 h-3 rounded-full bg-white/20" />
                  </div>
                </div>
              </div>
              
              {/* Valor e unidade */}
              <div className="flex flex-col items-start flex-shrink-0 min-w-0">
                <span className="text-2xl font-bold truncate" style={{ color: thermColor }}>
                  {sensorData.isLoading ? '...' : Number(thermValue).toFixed(widget.config?.decimals || 1)}
                </span>
                <span className="text-xs text-muted-foreground truncate">
                  {sensorData.unit || widget.config?.unit || '°C'}
                </span>
              </div>
            </div>
          </div>
        );

      // ============ INDICADORES ============
      case 'indicator-led':
        // 🔥 USAR DADOS REAIS DO SENSOR (valor > 0 = LED ligado)
        const ledOn = sensorData.value !== null && sensorData.value > 0;
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

      case 'indicator-battery':
        // 🔥 USAR DADOS REAIS DO SENSOR
        const batteryLevel = sensorData.value ?? 0;
        return (
          <div className="bg-card rounded-xl p-6 border shadow-sm h-full flex flex-col items-center justify-center gap-4">
            <h3 className="text-sm font-medium text-muted-foreground">{widget.title}</h3>
            <div className="flex items-center gap-2">
              <div className="w-20 h-10 border-2 border-gray-300 rounded-md relative overflow-hidden">
                <div 
                  className="absolute left-0 top-0 bottom-0 transition-all duration-500"
                  style={{ 
                    width: `${Math.min(batteryLevel, 100)}%`,
                    backgroundColor: batteryLevel > 50 ? '#10b981' : batteryLevel > 20 ? '#f59e0b' : '#ef4444'
                  }}
                />
              </div>
              <div className="w-1 h-4 bg-gray-300 rounded-r" />
            </div>
            <span className="text-lg font-bold">
              {sensorData.isLoading ? '...' : `${Number(batteryLevel).toFixed(0)}%`}
            </span>
          </div>
        );

      case 'indicator-signal':
        // 🔥 USAR DADOS REAIS DO SENSOR (0-100 convertido para 1-5)
        const signalValue = sensorData.value ?? 0;
        const signalStrength = Math.max(1, Math.min(5, Math.ceil(signalValue / 20)));
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
        // 🔥 Usar o hook multiSensorHistory que já existe no topo do componente
        const tableVariables = widget.config?.sensorTags || (widget.config?.sensorTag ? [widget.config.sensorTag] : []);
        
        // Calcular status com base em thresholds
        const getVariableStatus = (value: number, varTag: string) => {
          const criticalThreshold = widget.config?.criticalThreshold;
          const warningThreshold = widget.config?.warningThreshold;
          
          if (criticalThreshold && (value >= criticalThreshold || value <= criticalThreshold)) {
            return { label: 'CRÍTICO', color: 'bg-red-100 text-red-800' };
          }
          if (warningThreshold && (value >= warningThreshold || value <= warningThreshold)) {
            return { label: 'AVISO', color: 'bg-yellow-100 text-yellow-800' };
          }
          return { label: 'OK', color: 'bg-green-100 text-green-800' };
        };
        
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
        
        // Widget de tabela normal com dados reais
        // Usar o estado de paginação do topo do componente
        const itemsPerPage = 15;
        
        // tableData já está calculado no topo do componente via useMemo
        // Calcular dados da página atual
        const totalPages = Math.ceil(tableData.length / itemsPerPage);
        const startIndex = (tablePage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const currentPageData = tableData.slice(startIndex, endIndex);
        
        // Formatar timestamp
        const formatTimestamp = (timestamp: string) => {
          const date = new Date(timestamp);
          return date.toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          });
        };
        
        return (
          <div className="bg-card rounded-xl p-6 border shadow-sm h-full flex flex-col overflow-hidden">
            <h3 className="text-lg font-semibold mb-3 truncate">{widget.title}</h3>
            <div className="flex-1 overflow-auto min-h-0">
              {tableMultiSensorHistory.loading ? (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                    <p className="text-sm">Carregando dados...</p>
                  </div>
                </div>
              ) : tableVariables.length === 0 ? (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <p className="text-sm">Configure as variáveis para exibir dados</p>
                </div>
              ) : tableData.length === 0 ? (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <div className="text-center">
                    <p className="text-sm mb-2">Nenhum dado disponível</p>
                    <p className="text-xs">Verifique se as variáveis estão configuradas corretamente</p>
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col">
                  <div className="flex-1 overflow-auto">
                    <table className="w-full">
                      <thead className="sticky top-0 bg-card z-10">
                        <tr className="border-b">
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground bg-card">Data/Hora</th>
                          {currentPageData[0]?.values.map((val) => (
                            <th key={val.sensorTag} className="text-right py-3 px-4 text-sm font-medium text-muted-foreground bg-card">
                              {val.name}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {currentPageData.map((row, rowIdx) => (
                          <tr key={`${row.timestamp}-${rowIdx}`} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                            <td className="py-2 px-4 text-xs text-muted-foreground whitespace-nowrap">
                              {formatTimestamp(row.timestamp)}
                            </td>
                            {row.values.map((val) => {
                              const status = val.value !== null ? getVariableStatus(val.value, val.sensorTag) : null;
                              return (
                                <td key={val.sensorTag} className="py-2 px-4 text-sm font-mono text-right">
                                  {val.value !== null ? (
                                    <span className={status?.label !== 'OK' ? `font-bold text-${status?.color.includes('red') ? 'red' : status?.color.includes('yellow') ? 'yellow' : 'gray'}-700` : ''}>
                                      {Number(val.value).toFixed(widget.config?.decimals ?? 1)}
                                      <span className="text-muted-foreground ml-1 text-xs font-normal">{val.unit}</span>
                                    </span>
                                  ) : (
                                    <span className="text-muted-foreground">--</span>
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  {/* Paginação */}
                  <div className="flex items-center justify-between pt-3 border-t mt-2 flex-shrink-0">
                    <div className="text-xs text-muted-foreground">
                      Mostrando {startIndex + 1}-{Math.min(endIndex, tableData.length)} de {tableData.length} registros
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setTablePage(prev => Math.max(1, prev - 1))}
                        disabled={tablePage === 1}
                        className="px-3 py-1 text-xs border rounded hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Anterior
                      </button>
                      <span className="text-xs text-muted-foreground">
                        Página {tablePage} de {totalPages}
                      </span>
                      <button
                        onClick={() => setTablePage(prev => Math.min(totalPages, prev + 1))}
                        disabled={tablePage === totalPages}
                        className="px-3 py-1 text-xs border rounded hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Próxima
                      </button>
                    </div>
                  </div>
                </div>
              )}
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
      style={{
        ...style,
        ...(customWidth && { width: `${customWidth}px` }),
        ...(customHeight && { height: `${customHeight}px` }),
      }}
      className={cn(
        !customWidth && !customHeight && getSizeClasses(widget.size), // Só usa grid classes se não tiver tamanho custom
        editMode && "relative group",
        isDragging && "opacity-50 z-50",
        editMode && "border-2 border-dashed border-primary/20 rounded-xl"
      )}
      {...(editMode ? attributes : {})}
    >
      {editMode && (
        <div className="absolute -top-6 -right-2 z-10 flex gap-1">
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
      
      <ResizableWidget
        width={customWidth}
        height={customHeight}
        minWidth={minWidth}
        minHeight={minHeight}
        onResize={handleResize}
        onResizeEnd={handleResizeEnd}
        enabled={editMode}
        className="h-full w-full"
      >
        {renderContent()}
      </ResizableWidget>
      
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