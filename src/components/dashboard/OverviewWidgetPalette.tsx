import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { ScrollArea } from '../ui/scroll-area';
import { Plus, Search, LayoutGrid, TrendingUp, Activity, AlertTriangle, Zap, Clock, Wrench, Heart, BarChart3, PieChart, Gauge } from 'lucide-react';
import { WidgetType } from '../../types/dashboard';

interface OverviewWidgetDefinition {
  id: WidgetType;
  name: string;
  description: string;
  category: 'reliability' | 'operations' | 'energy' | 'management' | 'analytics';
  icon: React.ReactNode;
  defaultSize: 'col-1' | 'col-2' | 'col-3' | 'col-4' | 'col-5' | 'col-6' | 'small' | 'medium' | 'large';
}

// Widgets focados em gestão executiva e monitoramento estratégico
const overviewWidgetDefinitions: OverviewWidgetDefinition[] = [
  // ============ Cards KPI (Estilo Overview) ============
  {
    id: 'card-kpi',
    name: 'Uptime Dispositivos',
    description: 'Percentual de disponibilidade com tendência',
    category: 'reliability',
    icon: <Activity className="w-5 h-5 text-green-600" />,
    defaultSize: 'col-2'
  },
  {
    id: 'card-kpi',
    name: 'Ativos com Alerta',
    description: 'Quantidade de alertas ativos no momento',
    category: 'reliability',
    icon: <AlertTriangle className="w-5 h-5 text-red-600" />,
    defaultSize: 'col-2'
  },
  {
    id: 'card-kpi',
    name: 'Consumo Hoje',
    description: 'Consumo energético do dia com variação',
    category: 'energy',
    icon: <Zap className="w-5 h-5 text-green-600" />,
    defaultSize: 'col-2'
  },
  {
    id: 'card-kpi',
    name: 'Saúde Média HVAC',
    description: 'Score consolidado de health com tendência',
    category: 'reliability',
    icon: <Heart className="w-5 h-5 text-yellow-600" />,
    defaultSize: 'col-2'
  },
  {
    id: 'card-kpi',
    name: 'MTBF',
    description: 'Mean Time Between Failures com melhoria',
    category: 'reliability',
    icon: <Clock className="w-5 h-5 text-green-600" />,
    defaultSize: 'col-2'
  },
  {
    id: 'card-kpi',
    name: 'MTTR',
    description: 'Mean Time To Repair com redução',
    category: 'operations',
    icon: <Wrench className="w-5 h-5 text-red-600" />,
    defaultSize: 'col-2'
  },
  
  // ============ KPIs de Confiabilidade (Antigos) ============
  {
    id: 'card-stat',
    name: 'MTTF (Mean Time To Failure)',
    description: 'Tempo médio entre falhas dos equipamentos',
    category: 'reliability',
    icon: <Clock className="w-5 h-5" />,
    defaultSize: 'col-2'
  },
  {
    id: 'card-progress',
    name: 'Disponibilidade de Equipamentos',
    description: 'Percentual de uptime dos ativos críticos',
    category: 'reliability',
    icon: <Heart className="w-5 h-5" />,
    defaultSize: 'col-2'
  },
  {
    id: 'card-value',
    name: 'Alertas Ativos',
    description: 'Quantidade de alertas pendentes no momento',
    category: 'reliability',
    icon: <AlertTriangle className="w-5 h-5" />,
    defaultSize: 'col-2'
  },
  {
    id: 'card-gauge',
    name: 'Health Score Geral',
    description: 'Score de saúde consolidado de todos os ativos',
    category: 'reliability',
    icon: <Heart className="w-5 h-5" />,
    defaultSize: 'col-2'
  },
  
  // ============ KPIs Operacionais ============
  {
    id: 'card-stat',
    name: 'Disponibilidade de Sensores',
    description: 'Percentual de sensores online e funcionando',
    category: 'operations',
    icon: <Activity className="w-5 h-5" />,
    defaultSize: 'col-2'
  },
  {
    id: 'card-value',
    name: 'Equipamentos em Operação',
    description: 'Total de equipamentos ativos no momento',
    category: 'operations',
    icon: <Zap className="w-5 h-5" />,
    defaultSize: 'col-2'
  },
  {
    id: 'card-progress',
    name: 'Taxa de Manutenção Preventiva',
    description: 'Cumprimento do plano de manutenção',
    category: 'operations',
    icon: <Wrench className="w-5 h-5" />,
    defaultSize: 'col-2'
  },
  
  // ============ Consumo e Eficiência ============
  {
    id: 'chart-bar',
    name: 'Consumo por Equipamento',
    description: 'Comparativo de consumo energético (kWh)',
    category: 'energy',
    icon: <BarChart3 className="w-5 h-5" />,
    defaultSize: 'col-4'
  },
  {
    id: 'chart-line',
    name: 'Histórico de Consumo',
    description: 'Tendência de consumo ao longo do tempo',
    category: 'energy',
    icon: <TrendingUp className="w-5 h-5" />,
    defaultSize: 'col-4'
  },
  {
    id: 'chart-pie',
    name: 'Distribuição de Consumo',
    description: 'Proporção de consumo por tipo de ativo',
    category: 'energy',
    icon: <PieChart className="w-5 h-5" />,
    defaultSize: 'col-3'
  },
  {
    id: 'gauge-circular',
    name: 'Eficiência Energética',
    description: 'Indicador de eficiência operacional (COP/EER)',
    category: 'energy',
    icon: <Gauge className="w-5 h-5" />,
    defaultSize: 'col-3'
  },
  
  // ============ Alertas e Gestão ============
  {
    id: 'table-alerts',
    name: 'Últimos Alertas',
    description: 'Tabela com alertas mais recentes e prioritários',
    category: 'management',
    icon: <AlertTriangle className="w-5 h-5" />,
    defaultSize: 'col-6'
  },
  {
    id: 'heatmap-time',
    name: 'Mapa de Calor de Alertas',
    description: 'Densidade de alertas por horário e dia',
    category: 'management',
    icon: <LayoutGrid className="w-5 h-5" />,
    defaultSize: 'col-6'
  },
  {
    id: 'timeline',
    name: 'Timeline de Manutenções',
    description: 'Cronologia de manutenções realizadas e programadas',
    category: 'management',
    icon: <Clock className="w-5 h-5" />,
    defaultSize: 'col-6'
  },
  {
    id: 'chart-bar-horizontal',
    name: 'Alertas por Severidade',
    description: 'Distribuição de alertas (Crítico, Alto, Médio, Baixo)',
    category: 'management',
    icon: <BarChart3 className="w-5 h-5" />,
    defaultSize: 'col-4'
  },
  
  // ============ Análise e Tendências ============
  {
    id: 'chart-area',
    name: 'Tendência de Disponibilidade',
    description: 'Evolução da disponibilidade dos equipamentos',
    category: 'analytics',
    icon: <TrendingUp className="w-5 h-5" />,
    defaultSize: 'col-4'
  },
  {
    id: 'chart-donut',
    name: 'Status dos Equipamentos',
    description: 'Distribuição: OK, Alerta, Manutenção, Parado',
    category: 'analytics',
    icon: <PieChart className="w-5 h-5" />,
    defaultSize: 'col-3'
  }
];

const categoryLabels: Record<string, string> = {
  reliability: 'Confiabilidade',
  operations: 'Operações',
  energy: 'Energia & Consumo',
  management: 'Alertas & Gestão',
  analytics: 'Análise & Tendências'
};

const categoryIcons: Record<string, React.ReactNode> = {
  reliability: <Heart className="w-4 h-4" />,
  operations: <Activity className="w-4 h-4" />,
  energy: <Zap className="w-4 h-4" />,
  management: <AlertTriangle className="w-4 h-4" />,
  analytics: <TrendingUp className="w-4 h-4" />
};

interface OverviewWidgetPaletteProps {
  onAddWidget: (widgetType: WidgetType) => void;
}

export const OverviewWidgetPalette: React.FC<OverviewWidgetPaletteProps> = ({ onAddWidget }) => {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const handleAddWidget = (widgetType: WidgetType) => {
    onAddWidget(widgetType);
    setOpen(false);
    setSearchTerm('');
    setSelectedCategory(null);
  };

  // Filtrar widgets por busca e categoria
  const filteredWidgets = overviewWidgetDefinitions.filter(widget => {
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
  }, {} as Record<string, OverviewWidgetDefinition[]>);

  // Get unique categories
  const categories = Array.from(new Set(overviewWidgetDefinitions.map(w => w.category)));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Plus className="w-4 h-4" />
          Adicionar Widget
        </Button>
      </DialogTrigger>
      
      <DialogContent className="!max-w-[95vw] sm:!max-w-[90vw] md:!max-w-[85vw] lg:!max-w-6xl max-h-[90vh] overflow-hidden flex flex-col p-6">
        <DialogHeader>
          <DialogTitle className="text-xl">Biblioteca de Widgets - Visão Geral</DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Widgets focados em gestão executiva e monitoramento estratégico. Configure sensores depois de adicionar.
          </p>
        </DialogHeader>

        {/* Search and Filters */}
        <div className="space-y-3 border-b pb-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar widgets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Category Filter */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(null)}
              className="whitespace-nowrap"
            >
              Todos ({overviewWidgetDefinitions.length})
            </Button>
            {categories.map(category => {
              const count = overviewWidgetDefinitions.filter(w => w.category === category).length;
              return (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className="whitespace-nowrap flex items-center gap-1.5"
                >
                  {categoryIcons[category]}
                  {categoryLabels[category]} ({count})
                </Button>
              );
            })}
          </div>
        </div>

        {/* Widget List */}
        <div className="space-y-6 overflow-y-auto pr-2 flex-1 -mx-1 px-1">
          {Object.keys(groupedWidgets).length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Search className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
              <p className="font-medium">Nenhum widget encontrado</p>
              <p className="text-sm mt-1">Tente ajustar sua busca ou filtros</p>
            </div>
          ) : (
            Object.entries(groupedWidgets).map(([category, widgets]) => (
              <div key={category}>
                <h3 className="text-lg font-semibold mb-3 sticky top-0 bg-background py-2 z-10 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {categoryIcons[category]}
                    <span>{categoryLabels[category]}</span>
                  </div>
                  <span className="text-sm font-normal text-muted-foreground">
                    {widgets.length} {widgets.length === 1 ? 'widget' : 'widgets'}
                  </span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {widgets.map((widget) => (
                    <button
                      key={widget.id}
                      onClick={() => handleAddWidget(widget.id)}
                      className="flex flex-col items-start gap-3 p-4 border border-border rounded-lg hover:bg-muted/50 hover:border-primary/50 hover:shadow-md transition-all text-left group relative"
                    >
                      <div className="flex items-start gap-3 w-full">
                        <div className="p-2 bg-primary/10 rounded-md group-hover:bg-primary/20 transition-colors flex-shrink-0">
                          {widget.icon}
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
                        <span className="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full">
                          {(() => {
                            // Mostrar largura em colunas
                            if (widget.defaultSize.startsWith('col-')) {
                              const cols = widget.defaultSize.replace('col-', '');
                              return `${cols}/6 colunas`;
                            }
                            // Fallback para tamanhos antigos
                            return widget.defaultSize === 'small' ? 'Pequeno (2/6)' : 
                                   widget.defaultSize === 'medium' ? 'Médio (3/6)' : 
                                   'Grande (6/6)';
                          })()}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {filteredWidgets.length} widget{filteredWidgets.length !== 1 ? 's' : ''} disponível{filteredWidgets.length !== 1 ? 'eis' : ''}
            </span>
            <span className="text-xs text-muted-foreground">
              💡 Configure sensores individualmente após adicionar
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
