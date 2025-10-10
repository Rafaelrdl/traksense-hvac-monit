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
  widgets: []  // ✅ Dashboard começa vazio - usuário adiciona widgets manualmente
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
          type: widgetType,  // ✅ Mantém o tipo original (card-value, chart-line, etc)
          title: getWidgetTitle(widgetType),
          size: getWidgetDefaultSize(widgetType),
          position,
          config: {}  // ✅ Inicializa config vazio
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
function getWidgetTitle(widgetType: WidgetType): string {
  // Converte widget type em título legível
  const formatted = widgetType
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
  return formatted;
}

function getWidgetDefaultSize(widgetType: WidgetType): DashboardWidget['size'] {
  // Cards são pequenos
  if (widgetType.startsWith('card-')) return 'small';
  
  // Tabelas e alguns charts são grandes
  if (widgetType.startsWith('table-')) return 'large';
  if (widgetType === 'heatmap-time' || widgetType === 'heatmap-matrix') return 'large';
  if (widgetType === 'timeline') return 'large';
  
  // Indicadores simples são pequenos
  if (widgetType.startsWith('indicator-')) return 'small';
  
  // Resto é médio (charts, gauges, etc)
  return 'medium';
}