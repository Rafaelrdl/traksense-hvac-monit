import { create } from 'zustand';
import { DashboardLayout, DashboardWidget, WidgetType } from '../types/dashboard';

interface DashboardState {
  layouts: DashboardLayout[];
  currentLayoutId: string;
  editMode: boolean;
  
  // Actions
  setCurrentLayout: (layoutId: string) => void;
  createLayout: (name: string, fromLayoutId?: string) => void;
  updateLayout: (layoutId: string, updates: Partial<DashboardLayout>) => void;
  deleteLayout: (layoutId: string) => void;
  
  addWidget: (layoutId: string, widgetType: WidgetType, position: { x: number; y: number }) => void;
  updateWidget: (layoutId: string, widgetId: string, updates: Partial<DashboardWidget>) => void;
  removeWidget: (layoutId: string, widgetId: string) => void;
  moveWidget: (layoutId: string, widgetId: string, position: { x: number; y: number }) => void;
  
  setEditMode: (editMode: boolean) => void;
}

const defaultLayout: DashboardLayout = {
  id: 'default',
  name: 'Padrão',
  isDefault: true,
  widgets: [
    {
      id: 'uptime-1',
      type: 'kpi',
      title: 'Uptime Dispositivos',
      size: 'small',
      position: { x: 0, y: 0 },
      props: { metricType: 'uptime' }
    },
    {
      id: 'alerts-1',
      type: 'kpi',
      title: 'Ativos com Alerta',
      size: 'small',
      position: { x: 1, y: 0 },
      props: { metricType: 'alerts' }
    },
    {
      id: 'consumption-1',
      type: 'kpi',
      title: 'Consumo Hoje',
      size: 'small',
      position: { x: 2, y: 0 },
      props: { metricType: 'consumption' }
    },
    {
      id: 'health-1',
      type: 'kpi',
      title: 'Saúde Média HVAC',
      size: 'small',
      position: { x: 3, y: 0 },
      props: { metricType: 'health' }
    },
    {
      id: 'mtbf-1',
      type: 'kpi',
      title: 'MTBF',
      size: 'small',
      position: { x: 4, y: 0 },
      props: { metricType: 'mtbf' }
    },
    {
      id: 'mttr-1',
      type: 'kpi',
      title: 'MTTR',
      size: 'small',
      position: { x: 5, y: 0 },
      props: { metricType: 'mttr' }
    },
    {
      id: 'temp-chart-1',
      type: 'chart',
      title: 'Tendências de Temperatura (AHU-001)',
      size: 'medium',
      position: { x: 0, y: 1 },
      props: { chartType: 'temperature' }
    },
    {
      id: 'energy-chart-1',
      type: 'chart',
      title: 'Consumo Energético (Hoje)',
      size: 'medium',
      position: { x: 3, y: 1 },
      props: { chartType: 'energy' }
    },
    {
      id: 'filter-gauge-1',
      type: 'gauge',
      title: 'Saúde do Filtro (AHU-001)',
      size: 'medium',
      position: { x: 0, y: 2 },
      props: { gaugeType: 'filter' }
    },
    {
      id: 'alerts-heatmap-1',
      type: 'chart',
      title: 'Densidade de Alertas (Últimos 7 dias)',
      size: 'medium',
      position: { x: 3, y: 2 },
      props: { chartType: 'alertsHeatmap' }
    },
    {
      id: 'alerts-table-1',
      type: 'table',
      title: 'Alertas Ativos Principais',
      size: 'large',
      position: { x: 0, y: 3 },
      props: { tableType: 'alerts' }
    }
  ]
};

export const useDashboardStore = create<DashboardState>((set, get) => ({
  layouts: [defaultLayout],
  currentLayoutId: 'default',
  editMode: false,

      setCurrentLayout: (layoutId: string) => {
        set({ currentLayoutId: layoutId });
      },

      createLayout: (name: string, fromLayoutId?: string) => {
        const id = `layout-${Date.now()}`;
        const sourceLayout = fromLayoutId 
          ? get().layouts.find(l => l.id === fromLayoutId)
          : null;
        
        const newLayout: DashboardLayout = {
          id,
          name,
          isDefault: false,
          widgets: sourceLayout ? [...sourceLayout.widgets.map(w => ({...w, id: `${w.id}-copy`}))] : []
        };

        set(state => ({
          layouts: [...state.layouts, newLayout],
          currentLayoutId: id
        }));
      },

      updateLayout: (layoutId: string, updates: Partial<DashboardLayout>) => {
        set(state => ({
          layouts: state.layouts.map(layout =>
            layout.id === layoutId ? { ...layout, ...updates } : layout
          )
        }));
      },

      deleteLayout: (layoutId: string) => {
        const state = get();
        if (state.layouts.find(l => l.id === layoutId)?.isDefault) return;
        
        const newLayouts = state.layouts.filter(l => l.id !== layoutId);
        const newCurrentId = state.currentLayoutId === layoutId 
          ? (newLayouts.find(l => l.isDefault)?.id || newLayouts[0]?.id || 'default')
          : state.currentLayoutId;

        set({
          layouts: newLayouts,
          currentLayoutId: newCurrentId
        });
      },

      addWidget: (layoutId: string, widgetType: WidgetType, position: { x: number; y: number }) => {
        const widgetId = `widget-${Date.now()}`;
        const widget: DashboardWidget = {
          id: widgetId,
          type: getWidgetCategory(widgetType),
          title: getWidgetTitle(widgetType),
          size: getWidgetDefaultSize(widgetType),
          position,
          props: { metricType: widgetType }
        };

        set(state => ({
          layouts: state.layouts.map(layout =>
            layout.id === layoutId
              ? { ...layout, widgets: [...layout.widgets, widget] }
              : layout
          )
        }));
      },

      updateWidget: (layoutId: string, widgetId: string, updates: Partial<DashboardWidget>) => {
        set(state => ({
          layouts: state.layouts.map(layout =>
            layout.id === layoutId
              ? {
                  ...layout,
                  widgets: layout.widgets.map(widget =>
                    widget.id === widgetId ? { ...widget, ...updates } : widget
                  )
                }
              : layout
          )
        }));
      },

      removeWidget: (layoutId: string, widgetId: string) => {
        set(state => ({
          layouts: state.layouts.map(layout =>
            layout.id === layoutId
              ? { ...layout, widgets: layout.widgets.filter(w => w.id !== widgetId) }
              : layout
          )
        }));
      },

      moveWidget: (layoutId: string, widgetId: string, position: { x: number; y: number }) => {
        set(state => ({
          layouts: state.layouts.map(layout =>
            layout.id === layoutId
              ? {
                  ...layout,
                  widgets: layout.widgets.map(widget =>
                    widget.id === widgetId ? { ...widget, position } : widget
                  )
                }
              : layout
          )
        }));
      },

      setEditMode: (editMode: boolean) => {
        set({ editMode });
      }
    })
  );

// Helper functions
function getWidgetCategory(widgetType: WidgetType): DashboardWidget['type'] {
  if (widgetType.includes('kpi')) return 'kpi';
  if (widgetType.includes('chart') || widgetType.includes('heatmap')) return 'chart';
  if (widgetType.includes('gauge')) return 'gauge';
  if (widgetType.includes('table')) return 'table';
  if (widgetType === 'maintenance-overview') return 'maintenance';
  return 'kpi';
}

function getWidgetTitle(widgetType: WidgetType): string {
  const titles: Record<WidgetType, string> = {
    'uptime-kpi': 'Uptime Dispositivos',
    'alerts-kpi': 'Ativos com Alerta',
    'consumption-kpi': 'Consumo Hoje',
    'health-kpi': 'Saúde Média HVAC',
    'mtbf-kpi': 'MTBF',
    'mttr-kpi': 'MTTR',
    'temperature-chart': 'Tendências de Temperatura',
    'energy-chart': 'Consumo Energético',
    'filter-gauge': 'Saúde do Filtro',
    'alerts-heatmap': 'Densidade de Alertas',
    'alerts-table': 'Alertas Ativos',
    'maintenance-overview': 'Visão Geral Manutenção'
  };
  return titles[widgetType] || 'Widget';
}

function getWidgetDefaultSize(widgetType: WidgetType): DashboardWidget['size'] {
  if (widgetType.includes('kpi')) return 'small';
  if (widgetType.includes('table')) return 'large';
  if (widgetType === 'maintenance-overview') return 'medium';
  return 'medium';
}