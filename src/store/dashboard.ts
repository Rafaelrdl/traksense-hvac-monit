import { create } from 'zustand';
import { persist } from 'zustand/middleware';
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
  reorderWidgets: (layoutId: string, widgetIds: string[]) => void;  // 🔥 NOVO: Reordenar widgets
  resetWidgetSizes: (layoutId: string) => void;  // 🔥 NOVO: Resetar tamanhos dos widgets
  
  setEditMode: (editMode: boolean) => void;
}

const defaultLayout: DashboardLayout = {
  id: 'default',
  name: 'Padrão',
  isDefault: true,
  widgets: []  // ✅ Dashboard começa vazio - usuário adiciona widgets manualmente
};

export const useDashboardStore = create<DashboardState>()(
  persist(
    (set, get) => ({
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

      reorderWidgets: (layoutId: string, widgetIds: string[]) => {
        set(state => ({
          layouts: state.layouts.map(layout => {
            if (layout.id !== layoutId) return layout;
            
            // Criar mapa de widgets por ID para lookup rápido
            const widgetMap = new Map(layout.widgets.map(w => [w.id, w]));
            
            // Reordenar widgets de acordo com a nova ordem
            const reorderedWidgets = widgetIds
              .map(id => widgetMap.get(id))
              .filter((w): w is DashboardWidget => w !== undefined);
            
            return { ...layout, widgets: reorderedWidgets };
          })
        }));
      },

      setEditMode: (editMode: boolean) => {
        set({ editMode });
      },
      
      resetWidgetSizes: (layoutId: string) => {
        set(state => ({
          layouts: state.layouts.map(layout => 
            layout.id === layoutId
              ? {
                  ...layout,
                  widgets: layout.widgets.map(widget => ({
                    ...widget,
                    position: { ...widget.position, w: undefined, h: undefined }
                  }))
                }
              : layout
          )
        }));
      }
    }),
    {
      name: 'ts:dashboards',
      version: 1,
    }
  )
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
  // 📏 TAMANHOS ESPECÍFICOS POR TIPO DE WIDGET
  
  // CARDS PEQUENOS (1-2 colunas)
  if (widgetType === 'card-value') return 'col-2';        // Valor simples
  if (widgetType === 'card-stat') return 'col-2';         // Estatística com tendência
  if (widgetType === 'card-progress') return 'col-2';     // Barra de progresso
  if (widgetType === 'card-gauge') return 'col-2';        // Medidor compacto
  if (widgetType === 'card-kpi') return 'col-2';          // KPI estilo overview
  
  // CARDS DE AÇÃO (1-2 colunas)
  if (widgetType === 'card-button') return 'col-2';       // Botão de ação
  if (widgetType === 'card-toggle') return 'col-2';       // Switch/Toggle
  if (widgetType === 'card-status') return 'col-2';       // Status ligado/desligado
  
  // INDICADORES COMPACTOS (1 coluna)
  if (widgetType === 'indicator-led') return 'col-1';     // LED simples
  if (widgetType === 'indicator-battery') return 'col-1'; // Bateria
  if (widgetType === 'indicator-signal') return 'col-1';  // Sinal
  
  // GRÁFICOS DE LINHA (4 colunas - médio/grande)
  if (widgetType === 'chart-line') return 'col-4';        // Linha temporal
  if (widgetType === 'chart-area') return 'col-4';        // Área temporal
  
  // GRÁFICOS DE BARRA (4 colunas)
  if (widgetType === 'chart-bar') return 'col-4';         // Barras verticais
  if (widgetType === 'chart-bar-horizontal') return 'col-4'; // Barras horizontais
  
  // GRÁFICOS CIRCULARES (3 colunas - médio)
  if (widgetType === 'chart-pie') return 'col-3';         // Pizza
  if (widgetType === 'chart-donut') return 'col-3';       // Rosca
  if (widgetType === 'chart-radial') return 'col-3';      // Radial
  
  // MEDIDORES (2-3 colunas)
  if (widgetType === 'gauge-circular') return 'col-3';    // Medidor circular
  if (widgetType === 'gauge-tank') return 'col-2';        // Tanque
  if (widgetType === 'gauge-thermometer') return 'col-2'; // Termômetro
  
  // TABELAS E MAPAS DE CALOR (6 colunas - largura total)
  if (widgetType === 'table-data') return 'col-6';        // Tabela de dados
  if (widgetType === 'table-alerts') return 'col-6';      // Tabela de alertas
  if (widgetType === 'heatmap-time') return 'col-6';      // Mapa temporal
  if (widgetType === 'heatmap-matrix') return 'col-6';    // Matriz de calor
  
  // OUTROS (2-3 colunas)
  if (widgetType === 'text-display') return 'col-2';      // Texto
  if (widgetType === 'photo-upload') return 'col-3';      // Foto
  
  // FALLBACK - médio (3 colunas)
  return 'col-3';
}