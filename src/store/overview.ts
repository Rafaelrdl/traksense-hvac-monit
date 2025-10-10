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
    id: 'overview-mttf',
    type: 'card-stat',
    title: 'MTTF (Mean Time To Failure)',
    size: 'small',
    position: { x: 0, y: 0 },
    config: {
      label: 'MTTF',
      unit: 'horas',
      color: '#8b5cf6',
      decimals: 0,
      showTrend: true
    }
  },
  {
    id: 'overview-availability',
    type: 'card-progress',
    title: 'Disponibilidade de Equipamentos',
    size: 'small',
    position: { x: 1, y: 0 },
    config: {
      label: 'Disponibilidade',
      unit: '%',
      color: '#10b981',
      decimals: 1,
      target: 99.5
    }
  },
  {
    id: 'overview-active-alerts',
    type: 'card-value',
    title: 'Alertas Ativos',
    size: 'small',
    position: { x: 2, y: 0 },
    config: {
      label: 'Alertas Ativos',
      unit: '',
      color: '#f59e0b',
      decimals: 0,
      showIcon: true
    }
  },
  {
    id: 'overview-health-score',
    type: 'card-gauge',
    title: 'Health Score Geral',
    size: 'small',
    position: { x: 3, y: 0 },
    config: {
      label: 'Health Score',
      unit: '%',
      color: '#10b981',
      decimals: 1,
      minValue: 0,
      maxValue: 100
    }
  },
  {
    id: 'overview-sensor-availability',
    type: 'card-stat',
    title: 'Disponibilidade de Sensores',
    size: 'small',
    position: { x: 4, y: 0 },
    config: {
      label: 'Sensores Online',
      unit: '%',
      color: '#3b82f6',
      decimals: 1,
      showTrend: true
    }
  },
  {
    id: 'overview-equipment-online',
    type: 'card-value',
    title: 'Equipamentos em Operação',
    size: 'small',
    position: { x: 5, y: 0 },
    config: {
      label: 'Em Operação',
      unit: '/total',
      color: '#10b981',
      decimals: 0
    }
  },

  // ============ Linha 2: Consumo e Eficiência ============
  {
    id: 'overview-consumption-bar',
    type: 'chart-bar',
    title: 'Consumo por Equipamento',
    size: 'medium',
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
    size: 'medium',
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
    size: 'large',
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
    size: 'medium',
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
    size: 'medium',
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
          config: {}
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
      version: 1
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
    'chart-line-multi': 'Comparativo Multi-Ativo',
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
  if (widgetType.startsWith('card-')) return 'small';
  if (widgetType.startsWith('table-')) return 'large';
  if (widgetType === 'heatmap-time' || widgetType === 'heatmap-matrix') return 'large';
  if (widgetType === 'timeline') return 'large';
  if (widgetType.startsWith('indicator-')) return 'small';
  return 'medium';
}
