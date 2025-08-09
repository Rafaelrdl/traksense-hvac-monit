import React, { useState } from 'react';
import { WidgetType } from '../../types/dashboard';
import { useDashboardStore } from '../../store/dashboard';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { 
  Plus, 
  Activity, 
  AlertTriangle, 
  Zap, 
  Heart,
  Clock,
  Wrench,
  LineChart,
  BarChart3,
  Gauge,
  Grid3x3,
  Table
} from 'lucide-react';

const widgetDefinitions = [
  {
    id: 'uptime-kpi' as WidgetType,
    name: 'Uptime Dispositivos',
    description: 'Percentual de dispositivos online',
    category: 'kpi',
    icon: Activity,
  },
  {
    id: 'alerts-kpi' as WidgetType,
    name: 'Ativos com Alerta',
    description: 'Número de ativos com alertas ativos',
    category: 'kpi',
    icon: AlertTriangle,
  },
  {
    id: 'consumption-kpi' as WidgetType,
    name: 'Consumo Hoje',
    description: 'Consumo energético do dia',
    category: 'kpi',
    icon: Zap,
  },
  {
    id: 'health-kpi' as WidgetType,
    name: 'Saúde Média HVAC',
    description: 'Saúde média dos equipamentos HVAC',
    category: 'kpi',
    icon: Heart,
  },
  {
    id: 'mtbf-kpi' as WidgetType,
    name: 'MTBF',
    description: 'Tempo médio entre falhas',
    category: 'kpi',
    icon: Clock,
  },
  {
    id: 'mttr-kpi' as WidgetType,
    name: 'MTTR',
    description: 'Tempo médio para reparo',
    category: 'kpi',
    icon: Wrench,
  },
  {
    id: 'temperature-chart' as WidgetType,
    name: 'Tendências de Temperatura',
    description: 'Gráfico de linhas com temperaturas',
    category: 'charts',
    icon: LineChart,
  },
  {
    id: 'energy-chart' as WidgetType,
    name: 'Consumo Energético',
    description: 'Gráfico de barras com consumo por hora',
    category: 'charts',
    icon: BarChart3,
  },
  {
    id: 'filter-gauge' as WidgetType,
    name: 'Saúde do Filtro',
    description: 'Medidor de saúde do filtro',
    category: 'charts',
    icon: Gauge,
  },
  {
    id: 'alerts-heatmap' as WidgetType,
    name: 'Densidade de Alertas',
    description: 'Mapa de calor de alertas por período',
    category: 'charts',
    icon: Grid3x3,
  },
  {
    id: 'alerts-table' as WidgetType,
    name: 'Alertas Ativos',
    description: 'Tabela com alertas principais',
    category: 'tables',
    icon: Table,
  },
];

interface WidgetPaletteProps {
  layoutId: string;
}

export const WidgetPalette: React.FC<WidgetPaletteProps> = ({ layoutId }) => {
  const [open, setOpen] = useState(false);
  const addWidget = useDashboardStore(state => state.addWidget);

  const handleAddWidget = (widgetType: WidgetType) => {
    // Find next available position
    const position = { x: 0, y: 0 }; // Simplified - could be improved
    addWidget(layoutId, widgetType, position);
    setOpen(false);
  };

  const groupedWidgets = widgetDefinitions.reduce((acc, widget) => {
    if (!acc[widget.category]) {
      acc[widget.category] = [];
    }
    acc[widget.category].push(widget);
    return acc;
  }, {} as Record<string, typeof widgetDefinitions>);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Plus className="w-4 h-4" />
          Adicionar Widget
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Adicionar Widget</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          {Object.entries(groupedWidgets).map(([category, widgets]) => (
            <div key={category}>
              <h3 className="text-lg font-medium mb-3 capitalize">
                {category === 'kpi' ? 'KPIs' : category === 'charts' ? 'Gráficos' : 'Tabelas'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {widgets.map(widget => {
                  const IconComponent = widget.icon;
                  return (
                    <button
                      key={widget.id}
                      onClick={() => handleAddWidget(widget.id)}
                      className="flex items-start gap-3 p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors text-left"
                    >
                      <div className="p-2 bg-primary/10 rounded-md">
                        <IconComponent className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm">{widget.name}</h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          {widget.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};