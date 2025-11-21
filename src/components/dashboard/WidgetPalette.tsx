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
    id: 'chart-area' as WidgetType,
    name: 'Gráfico de Área',
    description: 'Área preenchida temporal',
    category: 'charts-line',
    defaultSize: 'medium',
    icon: 'AreaChart',
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
      <DialogContent className="!max-w-[96vw] sm:!max-w-[92vw] md:!max-w-5xl lg:!max-w-6xl xl:!max-w-7xl !max-h-[92vh] overflow-hidden flex flex-col p-0">
        <div className="flex flex-col h-full max-h-[92vh]">
          {/* Header fixo */}
          <DialogHeader className="flex-shrink-0 px-4 sm:px-6 py-4 sm:py-5 border-b bg-background">
            <DialogTitle className="text-xl sm:text-2xl font-bold">Biblioteca de Widgets</DialogTitle>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Selecione um modelo para adicionar à sua tela. Você poderá configurar o sensor depois.
            </p>
            
            {/* Busca */}
            <div className="relative mt-3 sm:mt-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Buscar widgets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-9 sm:h-10"
                aria-label="Buscar widgets"
              />
            </div>
            
            {/* Filtro por categoria - com scroll horizontal */}
            <div className="mt-3 sm:mt-4 -mx-4 sm:-mx-6">
              <div className="px-4 sm:px-6 overflow-x-auto scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
                <div className="flex gap-2 pb-2 min-w-max">
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
              </div>
            </div>
          </DialogHeader>

          {/* Corpo rolável com ScrollArea */}
          <ScrollArea 
            className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-6" 
            type="auto"
            aria-label="Lista de widgets disponíveis"
          >
            <div className="space-y-6 sm:space-y-8 pr-2">
              {Object.keys(groupedWidgets).length === 0 ? (
                <div className="text-center py-12 sm:py-16 text-muted-foreground">
                  <Search className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 opacity-50" />
                  <p className="text-base sm:text-lg font-medium">Nenhum widget encontrado</p>
                  <p className="text-xs sm:text-sm mt-1">Tente ajustar sua busca ou filtros</p>
                </div>
              ) : (
                Object.entries(groupedWidgets).map(([category, widgets]) => (
                  <div key={category}>
                    <h3 className="text-sm sm:text-base font-semibold mb-3 sm:mb-4 flex items-center justify-between pb-2 border-b">
                      <span>{categoryNames[category]}</span>
                      <span className="text-xs sm:text-sm font-normal text-muted-foreground">
                        {widgets.length} {widgets.length === 1 ? 'widget' : 'widgets'}
                      </span>
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-2.5 sm:gap-3">
                      {widgets.map(widget => {
                        const IconComponent = iconMap[widget.icon];
                        return (
                          <button
                            key={widget.id}
                            onClick={() => handleAddWidget(widget.id)}
                            className="
                              flex items-start gap-2.5 sm:gap-3 p-3 sm:p-4 
                              border rounded-lg 
                              bg-card hover:bg-accent/50 hover:border-primary/50 hover:shadow-md 
                              transition-all duration-200 text-left group relative
                              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
                              min-h-[100px]
                            "
                            aria-label={`Adicionar ${widget.name}`}
                          >
                            <div className="p-2 sm:p-2.5 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors flex-shrink-0">
                              {IconComponent && <IconComponent className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-xs sm:text-sm mb-1 group-hover:text-primary transition-colors break-words">
                                {widget.name}
                              </h4>
                              <p className="text-[10px] sm:text-xs text-muted-foreground leading-relaxed line-clamp-2">
                                {widget.description}
                              </p>
                              
                              {/* Badges */}
                              <div className="flex gap-1 sm:gap-1.5 flex-wrap mt-2 sm:mt-2.5">
                                {widget.requiresSensor && (
                                  <span className="text-[9px] sm:text-[10px] font-medium px-1.5 sm:px-2 py-0.5 bg-primary/10 text-primary rounded-full border border-primary/20">
                                    Requer Sensor
                                  </span>
                                )}
                                <span className="text-[9px] sm:text-[10px] font-medium px-1.5 sm:px-2 py-0.5 bg-muted text-muted-foreground rounded-full border">
                                  {widget.defaultSize === 'small' ? 'Pequeno' : widget.defaultSize === 'medium' ? 'Médio' : 'Grande'}
                                </span>
                              </div>
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
          <div className="flex-shrink-0 border-t px-4 sm:px-6 py-3 sm:py-4 bg-background">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-0 w-full">
              <p className="text-xs sm:text-sm text-muted-foreground">
                {filteredWidgets.length} {filteredWidgets.length === 1 ? 'widget disponível' : 'widgets disponíveis'}
              </p>
              <Button 
                variant="outline" 
                onClick={() => setOpen(false)}
                className="gap-2 w-full sm:w-auto"
                size="sm"
              >
                Fechar
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};