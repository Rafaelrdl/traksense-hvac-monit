import React, { useState } from 'react';
import { WidgetType, WidgetDefinition } from '../../types/dashboard';
import { useDashboardStore } from '../../store/dashboard';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '../ui/dialog';
import { Input } from '../ui/input';
import { ScrollArea } from '../ui/scroll-area';
import { 
  Plus, 
  Square,
  TrendingUp,
  BarChart2,
  CircleGauge,
  HandIcon,
  ToggleLeft,
  Power,
  LineChart,
  AreaChart,
  CandlestickChart,
  BarChart3,
  BarChartHorizontal,
  Columns,
  PieChart,
  Donut,
  CircleDot,
  Gauge,
  Activity,
  Battery,
  Wifi,
  Circle,
  Lightbulb,
  Signal,
  Table,
  Clock,
  Grid3x3,
  List,
  Type,
  MonitorPlay,
  Search
} from 'lucide-react';

const widgetDefinitions: WidgetDefinition[] = [
  // CARDS SIMPLES
  {
    id: 'card-value' as WidgetType,
    name: 'Card Valor',
    description: 'Exibe um valor único de sensor',
    category: 'cards',
    defaultSize: 'small',
    icon: 'Square',
    configurable: true,
    requiresSensor: true,
  },
  {
    id: 'card-stat' as WidgetType,
    name: 'Card Estatística',
    description: 'Valor com tendência e comparação',
    category: 'cards',
    defaultSize: 'small',
    icon: 'TrendingUp',
    configurable: true,
    requiresSensor: true,
  },
  {
    id: 'card-progress' as WidgetType,
    name: 'Card Progresso',
    description: 'Barra de progresso com percentual',
    category: 'cards',
    defaultSize: 'small',
    icon: 'BarChart2',
    configurable: true,
    requiresSensor: true,
  },
  {
    id: 'card-gauge' as WidgetType,
    name: 'Card Medidor',
    description: 'Medidor circular compacto',
    category: 'cards',
    defaultSize: 'small',
    icon: 'CircleGauge',
    configurable: true,
    requiresSensor: true,
  },
  
  // CARDS DE AÇÃO
  {
    id: 'card-button' as WidgetType,
    name: 'Card Botão',
    description: 'Botão para acionar comando',
    category: 'actions',
    defaultSize: 'small',
    icon: 'HandIcon',
    configurable: true,
    requiresSensor: true,
  },
  {
    id: 'card-toggle' as WidgetType,
    name: 'Card Toggle',
    description: 'Switch para ligar/desligar',
    category: 'actions',
    defaultSize: 'small',
    icon: 'ToggleLeft',
    configurable: true,
    requiresSensor: true,
  },
  {
    id: 'card-status' as WidgetType,
    name: 'Card Status',
    description: 'Indicador de status com cores',
    category: 'actions',
    defaultSize: 'small',
    icon: 'Power',
    configurable: true,
    requiresSensor: true,
  },
  
  // GRÁFICOS DE LINHA
  {
    id: 'chart-line' as WidgetType,
    name: 'Gráfico de Linha',
    description: 'Linha temporal de sensor',
    category: 'charts-line',
    defaultSize: 'medium',
    icon: 'LineChart',
    configurable: true,
    requiresSensor: true,
  },
  {
    id: 'chart-line-multi' as WidgetType,
    name: 'Gráfico Multi-Linha',
    description: 'Múltiplos sensores em linha',
    category: 'charts-line',
    defaultSize: 'medium',
    icon: 'LineChart',
    configurable: true,
    requiresSensor: true,
  },
  {
    id: 'chart-area' as WidgetType,
    name: 'Gráfico de Área',
    description: 'Área preenchida temporal',
    category: 'charts-line',
    defaultSize: 'medium',
    icon: 'AreaChart',
    configurable: true,
    requiresSensor: true,
  },
  {
    id: 'chart-spline' as WidgetType,
    name: 'Gráfico Suave',
    description: 'Linha suavizada temporal',
    category: 'charts-line',
    defaultSize: 'medium',
    icon: 'CandlestickChart',
    configurable: true,
    requiresSensor: true,
  },
  
  // GRÁFICOS DE BARRA
  {
    id: 'chart-bar' as WidgetType,
    name: 'Gráfico de Barras',
    description: 'Barras verticais',
    category: 'charts-bar',
    defaultSize: 'medium',
    icon: 'BarChart3',
    configurable: true,
    requiresSensor: true,
  },
  {
    id: 'chart-bar-horizontal' as WidgetType,
    name: 'Barras Horizontais',
    description: 'Barras na horizontal',
    category: 'charts-bar',
    defaultSize: 'medium',
    icon: 'BarChartHorizontal',
    configurable: true,
    requiresSensor: true,
  },
  {
    id: 'chart-column' as WidgetType,
    name: 'Colunas Agrupadas',
    description: 'Colunas lado a lado',
    category: 'charts-bar',
    defaultSize: 'medium',
    icon: 'Columns',
    configurable: true,
    requiresSensor: true,
  },
  
  // GRÁFICOS CIRCULARES
  {
    id: 'chart-pie' as WidgetType,
    name: 'Gráfico de Pizza',
    description: 'Pizza com percentuais',
    category: 'charts-circular',
    defaultSize: 'medium',
    icon: 'PieChart',
    configurable: true,
    requiresSensor: false,
  },
  {
    id: 'chart-donut' as WidgetType,
    name: 'Gráfico Donut',
    description: 'Rosca com centro vazio',
    category: 'charts-circular',
    defaultSize: 'medium',
    icon: 'Donut',
    configurable: true,
    requiresSensor: false,
  },
  {
    id: 'chart-radial' as WidgetType,
    name: 'Gráfico Radial',
    description: 'Gráfico polar circular',
    category: 'charts-circular',
    defaultSize: 'medium',
    icon: 'CircleDot',
    configurable: true,
    requiresSensor: true,
  },
  
  // MEDIDORES
  {
    id: 'gauge-circular' as WidgetType,
    name: 'Medidor Circular',
    description: 'Medidor circular completo',
    category: 'gauges',
    defaultSize: 'medium',
    icon: 'Gauge',
    configurable: true,
    requiresSensor: true,
  },
  {
    id: 'gauge-semi' as WidgetType,
    name: 'Medidor Semicircular',
    description: 'Medidor meio círculo',
    category: 'gauges',
    defaultSize: 'medium',
    icon: 'Activity',
    configurable: true,
    requiresSensor: true,
  },
  {
    id: 'gauge-tank' as WidgetType,
    name: 'Medidor de Tanque',
    description: 'Visualização de nível',
    category: 'gauges',
    defaultSize: 'small',
    icon: 'Battery',
    configurable: true,
    requiresSensor: true,
  },
  {
    id: 'gauge-thermometer' as WidgetType,
    name: 'Termômetro',
    description: 'Termômetro vertical',
    category: 'gauges',
    defaultSize: 'small',
    icon: 'Activity',
    configurable: true,
    requiresSensor: true,
  },
  
  // INDICADORES
  {
    id: 'indicator-led' as WidgetType,
    name: 'LED Indicador',
    description: 'LED colorido de status',
    category: 'indicators',
    defaultSize: 'small',
    icon: 'Circle',
    configurable: true,
    requiresSensor: true,
  },
  {
    id: 'indicator-traffic' as WidgetType,
    name: 'Semáforo',
    description: 'Verde, amarelo, vermelho',
    category: 'indicators',
    defaultSize: 'small',
    icon: 'Lightbulb',
    configurable: true,
    requiresSensor: true,
  },
  {
    id: 'indicator-battery' as WidgetType,
    name: 'Indicador Bateria',
    description: 'Nível de bateria',
    category: 'indicators',
    defaultSize: 'small',
    icon: 'Battery',
    configurable: true,
    requiresSensor: true,
  },
  {
    id: 'indicator-signal' as WidgetType,
    name: 'Indicador Sinal',
    description: 'Força de sinal WiFi/RSSI',
    category: 'indicators',
    defaultSize: 'small',
    icon: 'Signal',
    configurable: true,
    requiresSensor: true,
  },
  
  // TABELAS
  {
    id: 'table-data' as WidgetType,
    name: 'Tabela de Dados',
    description: 'Tabela simples de dados',
    category: 'tables',
    defaultSize: 'large',
    icon: 'Table',
    configurable: true,
    requiresSensor: false,
  },
  {
    id: 'table-realtime' as WidgetType,
    name: 'Tabela Tempo Real',
    description: 'Atualização em tempo real',
    category: 'tables',
    defaultSize: 'large',
    icon: 'Activity',
    configurable: true,
    requiresSensor: true,
  },
  {
    id: 'table-alerts' as WidgetType,
    name: 'Tabela de Alertas',
    description: 'Lista de alertas ativos',
    category: 'tables',
    defaultSize: 'large',
    icon: 'Table',
    configurable: true,
    requiresSensor: false,
  },
  
  // MAPAS DE CALOR
  {
    id: 'heatmap-time' as WidgetType,
    name: 'Mapa de Calor Temporal',
    description: 'Densidade por tempo',
    category: 'heatmaps',
    defaultSize: 'medium',
    icon: 'Grid3x3',
    configurable: true,
    requiresSensor: true,
  },
  {
    id: 'heatmap-matrix' as WidgetType,
    name: 'Matriz de Calor',
    description: 'Grid de valores coloridos',
    category: 'heatmaps',
    defaultSize: 'medium',
    icon: 'Grid3x3',
    configurable: true,
    requiresSensor: true,
  },
  
  // OUTROS
  {
    id: 'timeline' as WidgetType,
    name: 'Linha do Tempo',
    description: 'Eventos cronológicos',
    category: 'others',
    defaultSize: 'large',
    icon: 'Clock',
    configurable: true,
    requiresSensor: false,
  },
  {
    id: 'list-items' as WidgetType,
    name: 'Lista de Itens',
    description: 'Lista customizada',
    category: 'others',
    defaultSize: 'medium',
    icon: 'List',
    configurable: true,
    requiresSensor: false,
  },
  {
    id: 'text-display' as WidgetType,
    name: 'Exibição de Texto',
    description: 'Texto formatado',
    category: 'others',
    defaultSize: 'small',
    icon: 'Type',
    configurable: true,
    requiresSensor: false,
  },
  {
    id: 'iframe-embed' as WidgetType,
    name: 'Iframe Customizado',
    description: 'Incorporar conteúdo externo',
    category: 'others',
    defaultSize: 'large',
    icon: 'MonitorPlay',
    configurable: true,
    requiresSensor: false,
  },
];

// Mapa de ícones
const iconMap: Record<string, any> = {
  Square, TrendingUp, BarChart2, CircleGauge, HandIcon, ToggleLeft, Power,
  LineChart, AreaChart, CandlestickChart, BarChart3, BarChartHorizontal, Columns,
  PieChart, Donut, CircleDot, Gauge, Activity, Battery, Wifi, Circle,
  Lightbulb, Signal, Table, Clock, Grid3x3, List, Type, MonitorPlay
};

// Nomes de categorias
const categoryNames: Record<string, string> = {
  'cards': 'Cards Simples',
  'actions': 'Cards de Ação',
  'charts-line': 'Gráficos de Linha',
  'charts-bar': 'Gráficos de Barra',
  'charts-circular': 'Gráficos Circulares',
  'gauges': 'Medidores',
  'indicators': 'Indicadores',
  'tables': 'Tabelas',
  'heatmaps': 'Mapas de Calor',
  'others': 'Outros'
};

interface WidgetPaletteProps {
  layoutId: string;
}

export const WidgetPalette: React.FC<WidgetPaletteProps> = ({ layoutId }) => {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const addWidget = useDashboardStore(state => state.addWidget);

  const handleAddWidget = (widgetType: WidgetType) => {
    // Find next available position
    const position = { x: 0, y: 0 }; // Simplified - could be improved
    addWidget(layoutId, widgetType, position);
    setOpen(false);
    setSearchTerm('');
    setSelectedCategory(null);
  };

  // Filtrar widgets por busca
  const filteredWidgets = widgetDefinitions.filter(widget => {
    const matchesSearch = searchTerm === '' || 
      widget.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      widget.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = !selectedCategory || widget.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Agrupar widgets filtrados por categoria
  const groupedWidgets = filteredWidgets.reduce((acc, widget) => {
    if (!acc[widget.category]) {
      acc[widget.category] = [];
    }
    acc[widget.category].push(widget);
    return acc;
  }, {} as Record<string, typeof widgetDefinitions>);

  // Obter categorias únicas
  const categories = Array.from(new Set(widgetDefinitions.map(w => w.category)));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Plus className="w-4 h-4" />
          Adicionar Widget
        </Button>
      </DialogTrigger>
      <DialogContent 
        className="
          w-[min(96vw,900px)] p-0 overflow-hidden
          max-h-[min(calc(100dvh-6rem),85vh)]
        "
      >
        <div className="grid grid-rows-[auto,1fr,auto] h-full">
          {/* Header fixo */}
          <DialogHeader 
            className="
              sticky top-0 z-10 border-b px-6 py-4
              bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60
            "
          >
            <DialogTitle className="text-xl">Biblioteca de Widgets</DialogTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Selecione um modelo para adicionar à sua tela. Você poderá configurar o sensor depois.
            </p>
            
            {/* Busca */}
            <div className="relative mt-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Buscar widgets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
                aria-label="Buscar widgets"
              />
            </div>
            
            {/* Filtro por categoria */}
            <div className="flex gap-2 overflow-x-auto pb-2 mt-3 -mx-2 px-2 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
              <Button
                variant={selectedCategory === null ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(null)}
                className="whitespace-nowrap flex-shrink-0"
              >
                Todos ({widgetDefinitions.length})
              </Button>
              {categories.map(category => {
                const count = widgetDefinitions.filter(w => w.category === category).length;
                return (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                    className="whitespace-nowrap flex-shrink-0"
                  >
                    {categoryNames[category]} ({count})
                  </Button>
                );
              })}
            </div>
          </DialogHeader>

          {/* Corpo rolável com ScrollArea */}
          <ScrollArea 
            className="px-6 py-4" 
            type="auto"
            aria-label="Lista de widgets disponíveis"
          >
            <div className="space-y-6 pr-2">
              {Object.keys(groupedWidgets).length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <p>Nenhum widget encontrado</p>
                  <p className="text-sm mt-1">Tente ajustar sua busca</p>
                </div>
              ) : (
                Object.entries(groupedWidgets).map(([category, widgets]) => (
                  <div key={category} className="scroll-mt-4">
                    <h3 className="text-lg font-semibold mb-3 flex items-center justify-between sticky top-0 bg-background py-2 z-[5]">
                      <span>{categoryNames[category]}</span>
                      <span className="text-sm font-normal text-muted-foreground">
                        {widgets.length} {widgets.length === 1 ? 'widget' : 'widgets'}
                      </span>
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {widgets.map(widget => {
                        const IconComponent = iconMap[widget.icon];
                        return (
                          <button
                            key={widget.id}
                            onClick={() => handleAddWidget(widget.id)}
                            className="
                              flex flex-col items-start gap-3 p-4 
                              border border-border rounded-lg 
                              hover:bg-accent/50 hover:border-primary/50 hover:shadow-md 
                              transition-all text-left group relative
                              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
                            "
                            aria-label={`Adicionar ${widget.name}`}
                          >
                            <div className="flex items-start gap-3 w-full">
                              <div className="p-2 bg-accent-3 rounded-md group-hover:bg-accent-4 transition-colors flex-shrink-0 dark:bg-accent-4/50">
                                {IconComponent && <IconComponent className="w-5 h-5 text-accent-11" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-sm group-hover:text-primary transition-colors">
                                  {widget.name}
                                </h4>
                                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                  {widget.description}
                                </p>
                              </div>
                            </div>
                            
                            {/* Badges */}
                            <div className="flex gap-1 flex-wrap">
                              {widget.requiresSensor && (
                                <span className="text-[10px] px-2 py-0.5 bg-accent-2 text-accent-11 rounded-full border border-accent-6 dark:bg-accent-3/30 dark:border-accent-6/50">
                                  Requer Sensor
                                </span>
                              )}
                              <span className="text-[10px] px-2 py-0.5 bg-muted text-muted-foreground rounded-full">
                                {widget.defaultSize === 'small' ? 'Pequeno' : widget.defaultSize === 'medium' ? 'Médio' : 'Grande'}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>

          {/* Footer fixo */}
          <DialogFooter 
            className="
              sticky bottom-0 z-10 border-t px-6 py-4
              bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60
            "
          >
            <div className="flex items-center justify-between w-full">
              <p className="text-sm text-muted-foreground">
                {filteredWidgets.length} {filteredWidgets.length === 1 ? 'widget disponível' : 'widgets disponíveis'}
              </p>
              <Button 
                variant="outline" 
                onClick={() => setOpen(false)}
                className="gap-2"
              >
                Fechar
              </Button>
            </div>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};