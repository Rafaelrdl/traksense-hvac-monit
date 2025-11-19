import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DashboardWidget, WidgetType } from '../types/dashboard';

interface OverviewState {
  widgets: DashboardWidget[];
  editMode: boolean;
  
  // Actions
  addWidget: (widgetType: WidgetType, position: { x: number; y: number }) => void;
  updateWidget: (widgetId: string, updates: Partial<DashboardWidget>) => void;
  removeWidget: (widgetId: string) => void;
  reorderWidgets: (widgets: DashboardWidget[]) => void;
  setEditMode: (editMode: boolean) => void;
  resetToDefault: () => void;
}

// Widgets padrão para Visão Geral - Foco em gestão executiva e KPIs estratégicos
const defaultWidgets: DashboardWidget[] = [
  // ============ Linha 1: KPIs de Confiabilidade ============
  {
    id: 'overview-uptime',
    type: 'card-kpi',
    title: 'Uptime Dispositivos',
    size: 'col-2',
    position: { x: 0, y: 0 },
    config: {
      label: 'Uptime Dispositivos',
      unit: '%',
      color: '#10b981',
      iconColor: '#10b981',
      icon: 'activity',
      decimals: 1
    }
  },
  {
    id: 'overview-active-alerts',
    type: 'card-kpi',
    title: 'Ativos com Alerta',
    size: 'col-2',
    position: { x: 1, y: 0 },
    config: {
      label: 'Ativos com Alerta',
      unit: '',
      color: '#f59e0b',
      iconColor: '#ef4444',
      icon: 'alert',
      decimals: 0
    }
  },
  {
    id: 'overview-consumption',
    type: 'card-kpi',
    title: 'Consumo Hoje',
    size: 'col-2',
    position: { x: 2, y: 0 },
    config: {
      label: 'Consumo Hoje',
      unit: 'kWh',
      color: '#10b981',
      iconColor: '#10b981',
      icon: 'energy',
      decimals: 0
    }
  },
  {
    id: 'overview-health-score',
    type: 'card-kpi',
    title: 'Saúde Média HVAC',
    size: 'col-2',
    position: { x: 3, y: 0 },
    config: {
      label: 'Saúde Média HVAC',
      unit: '%',
      color: '#f59e0b',
      iconColor: '#f59e0b',
      icon: 'health',
      decimals: 1
    }
  },
  {
    id: 'overview-mttf',
    type: 'card-kpi',
    title: 'MTBF',
    size: 'col-2',
    position: { x: 4, y: 0 },
    config: {
      label: 'MTBF',
      unit: 'h',
      color: '#10b981',
      iconColor: '#10b981',
      icon: 'clock',
      decimals: 0
    }
  },
  {
    id: 'overview-mttr',
    type: 'card-kpi',
    title: 'MTTR',
    size: 'col-2',
    position: { x: 5, y: 0 },
    config: {
      label: 'MTTR',
      unit: 'h',
      color: '#ef4444',
      iconColor: '#ef4444',
      icon: 'wrench',
      decimals: 1
    }
  },

  // ============ Linha 2: Consumo e Eficiência ============
  {
    id: 'overview-consumption-bar',
    type: 'chart-bar',
    title: 'Consumo por Equipamento',
    size: 'col-3',
    position: { x: 0, y: 1 },
    config: {
      label: 'Consumo Energético (kWh)',
      chartType: 'bar',
      timeRange: '24h',
      showLegend: true
    }
  },
  {
    id: 'overview-consumption-trend',
    type: 'chart-line',
    title: 'Histórico de Consumo',
    size: 'col-3',
    position: { x: 3, y: 1 },
    config: {
      label: 'Consumo ao Longo do Tempo',
      chartType: 'line',
      timeRange: '7d',
      showLegend: true
    }
  },

  // ============ Linha 3: Alertas e Gestão ============
  {
    id: 'overview-alerts-table',
    type: 'table-alerts',
    title: 'Últimos Alertas',
    size: 'col-6',
    position: { x: 0, y: 2 },
    config: {
      label: 'Alertas Mais Recentes',
      showIcon: true,
      maxRows: 8,
      sortBy: 'timestamp'
    }
  },

  // ============ Linha 4: Análise e Tendências ============
  {
    id: 'overview-consumption-distribution',
    type: 'chart-pie',
    title: 'Distribuição de Consumo',
    size: 'col-3',
    position: { x: 0, y: 3 },
    config: {
      label: 'Consumo por Tipo de Ativo',
      chartType: 'pie',
      showPercentage: true
    }
  },
  {
    id: 'overview-alerts-heatmap',
    type: 'heatmap-time',
    title: 'Mapa de Calor de Alertas',
    size: 'col-3',
    position: { x: 3, y: 3 },
    config: {
      label: 'Densidade de Alertas (7 dias)',
      timeRange: '7d',
      showLegend: true
    }
  }
];

export const useOverviewStore = create<OverviewState>()(
  persist(
    (set, get) => ({
      widgets: defaultWidgets,
      editMode: false,

      addWidget: (widgetType: WidgetType, position: { x: number; y: number }) => {
        const widgetId = `overview-widget-${Date.now()}`;
        const widget: DashboardWidget = {
          id: widgetId,
          type: widgetType,
          title: getWidgetTitle(widgetType),
          size: getWidgetDefaultSize(widgetType),
          position,
          config: getWidgetDefaultConfig(widgetType)
        };

        set(state => ({
          widgets: [...state.widgets, widget]
        }));
      },

      updateWidget: (widgetId: string, updates: Partial<DashboardWidget>) => {
        set(state => ({
          widgets: state.widgets.map(widget =>
            widget.id === widgetId ? { ...widget, ...updates } : widget
          )
        }));
      },

      removeWidget: (widgetId: string) => {
        set(state => ({
          widgets: state.widgets.filter(w => w.id !== widgetId)
        }));
      },

      reorderWidgets: (widgets: DashboardWidget[]) => {
        set({ widgets });
      },

      setEditMode: (editMode: boolean) => {
        set({ editMode });
      },

      resetToDefault: () => {
        set({ widgets: defaultWidgets, editMode: false });
      }
    }),
    {
      name: 'traksense-overview-storage',
      version: 4, // Incrementado para forçar reset e carregar novos widgets KPI
      migrate: (persistedState: any, version: number) => {
        // Se for versão antiga (< v4), resetar para widgets padrão com novos cards KPI
        if (version < 4) {
          return {
            widgets: defaultWidgets,
            editMode: false
          };
        }
        return persistedState as OverviewState;
      }
    }
  )
);

// Helper functions
function getWidgetTitle(widgetType: WidgetType): string {
  // Mapeamento de títulos específicos para widgets de gestão
  const managementTitles: Record<string, string> = {
    'card-stat': 'KPI com Tendência',
    'card-progress': 'KPI de Progresso',
    'card-value': 'KPI Simples',
    'card-gauge': 'Medidor de Performance',
    'chart-bar': 'Gráfico de Consumo',
    'chart-line': 'Tendência Histórica',
    'chart-pie': 'Distribuição',
    'chart-donut': 'Status por Categoria',
    'chart-area': 'Evolução Temporal',

    'chart-bar-horizontal': 'Alertas por Severidade',
    'table-alerts': 'Tabela de Alertas',
    'heatmap-time': 'Mapa de Calor Temporal',
    'timeline': 'Timeline de Manutenções',
    'gauge-circular': 'Indicador de Eficiência'
  };

  return managementTitles[widgetType] || widgetType
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function getWidgetDefaultSize(widgetType: WidgetType): DashboardWidget['size'] {
  // Cards simples e indicadores: 2 colunas (pequeno)
  if (widgetType.startsWith('card-')) return 'col-2';
  if (widgetType.startsWith('indicator-')) return 'col-1';
  
  // Tabelas, heatmaps, timeline: 6 colunas (largura total)
  if (widgetType.startsWith('table-')) return 'col-6';
  if (widgetType === 'heatmap-time' || widgetType === 'heatmap-matrix') return 'col-6';
  if (widgetType === 'timeline') return 'col-6';
  
  // Gráficos: 3 colunas (médio)
  if (widgetType.startsWith('chart-')) return 'col-3';
  if (widgetType.startsWith('gauge-')) return 'col-2';
  
  // Padrão: 3 colunas
  return 'col-3';
}

function getWidgetDefaultConfig(widgetType: WidgetType): Record<string, any> {
  // Configurações padrão inteligentes para cada tipo de widget
  const configs: Record<string, Record<string, any>> = {
    'card-kpi': {
      label: 'KPI',
      unit: '%',
      color: '#3b82f6',
      iconColor: '#3b82f6',
      icon: 'activity',
      decimals: 1
    },
    'card-stat': {
      label: 'KPI',
      unit: '%',
      color: '#3b82f6',
      decimals: 1,
      showTrend: true
    },
    'card-progress': {
      label: 'Progresso',
      unit: '%',
      color: '#10b981',
      decimals: 1,
      target: 95
    },
    'card-value': {
      label: 'Valor',
      unit: '',
      color: '#f59e0b',
      decimals: 0,
      showIcon: true
    },
    'card-gauge': {
      label: 'Medidor',
      unit: '%',
      color: '#10b981',
      decimals: 1,
      minValue: 0,
      maxValue: 100
    },
    'chart-bar': {
      label: 'Consumo Energético',
      chartType: 'bar',
      timeRange: '24h',
      showLegend: true
    },
    'chart-line': {
      label: 'Tendência',
      chartType: 'line',
      timeRange: '24h',
      showLegend: true
    },
    'chart-pie': {
      label: 'Distribuição',
      chartType: 'pie',
      showPercentage: true
    },
    'chart-donut': {
      label: 'Status',
      chartType: 'donut',
      showPercentage: true
    },
    'chart-area': {
      label: 'Área',
      chartType: 'area',
      timeRange: '7d',
      showLegend: true
    },
    'chart-bar-horizontal': {
      label: 'Alertas por Severidade',
      chartType: 'bar-horizontal',
      showLegend: true
    },
    'table-alerts': {
      label: 'Alertas',
      showIcon: true,
      maxRows: 10,
      sortBy: 'timestamp'
    },
    'heatmap-time': {
      label: 'Densidade de Alertas',
      timeRange: '7d',
      showLegend: true
    },
    'heatmap-matrix': {
      label: 'Matriz de Alertas',
      timeRange: '7d',
      showLegend: true
    },
    'timeline': {
      label: 'Timeline',
      maxItems: 10,
      showIcon: true
    },
    'gauge-circular': {
      label: 'Eficiência',
      unit: '%',
      color: '#3b82f6',
      decimals: 1,
      minValue: 0,
      maxValue: 100
    },
    'gauge-semi': {
      label: 'Performance',
      unit: '%',
      color: '#10b981',
      decimals: 1,
      minValue: 0,
      maxValue: 100
    },
    'indicator-led': {
      label: 'Status',
      color: '#10b981',
      onValue: 'Online',
      offValue: 'Offline'
    },
    'indicator-traffic': {
      label: 'Semáforo',
      greenThreshold: 80,
      yellowThreshold: 50
    },
    'indicator-battery': {
      label: 'Bateria',
      unit: '%',
      lowThreshold: 20
    },
    'indicator-signal': {
      label: 'Sinal',
      unit: 'dBm',
      goodThreshold: -70,
      fairThreshold: -85
    }
  };

  return configs[widgetType] || { label: 'Widget', showLegend: true };
}
