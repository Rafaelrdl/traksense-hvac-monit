export interface DashboardWidget {
  id: string;
  type: WidgetType;
  title: string;
  size: 'small' | 'medium' | 'large';
  position: {
    x: number;
    y: number;
    w?: number;
    h?: number;
  };
  // Configuração do widget - sensor vinculado, cores, limites, etc
  config?: {
    sensorId?: string;
    assetId?: string;
    label?: string;
    unit?: string;
    color?: string;
    minValue?: number;
    maxValue?: number;
    warningThreshold?: number;
    criticalThreshold?: number;
    chartType?: 'line' | 'bar' | 'area' | 'pie' | 'donut';
    timeRange?: '1h' | '6h' | '24h' | '7d' | '30d';
    refreshInterval?: number;
    decimals?: number;
    showIcon?: boolean;
    iconName?: string;
    [key: string]: any;
  };
  props?: Record<string, any>;
}

export type WidgetType = 
  // Cards simples
  | 'card-value'           // Card com valor único
  | 'card-stat'            // Card com estatística e trend
  | 'card-progress'        // Card com barra de progresso
  | 'card-gauge'           // Card com medidor circular
  
  // Cards de ação
  | 'card-button'          // Card com botão de ação
  | 'card-toggle'          // Card com switch/toggle
  | 'card-status'          // Card de status (ligado/desligado)
  
  // Gráficos de linha
  | 'chart-line'           // Gráfico de linha simples
  | 'chart-line-multi'     // Gráfico de linha múltiplas séries
  | 'chart-area'           // Gráfico de área
  | 'chart-spline'         // Gráfico de linha suave
  
  // Gráficos de barra
  | 'chart-bar'            // Gráfico de barras vertical
  | 'chart-bar-horizontal' // Gráfico de barras horizontal
  | 'chart-column'         // Gráfico de colunas agrupadas
  
  // Gráficos circulares
  | 'chart-pie'            // Gráfico de pizza
  | 'chart-donut'          // Gráfico de rosca (donut)
  | 'chart-radial'         // Gráfico radial/polar
  
  // Medidores
  | 'gauge-circular'       // Medidor circular
  | 'gauge-semi'           // Medidor semicircular
  | 'gauge-tank'           // Medidor de tanque
  | 'gauge-thermometer'    // Termômetro
  
  // Indicadores
  | 'indicator-led'        // LED indicador
  | 'indicator-traffic'    // Semáforo (vermelho/amarelo/verde)
  | 'indicator-battery'    // Indicador de bateria
  | 'indicator-signal'     // Indicador de sinal
  
  // Tabelas
  | 'table-data'           // Tabela de dados simples
  | 'table-realtime'       // Tabela com dados em tempo real
  | 'table-alerts'         // Tabela de alertas
  
  // Mapas de calor
  | 'heatmap-time'         // Mapa de calor temporal
  | 'heatmap-matrix'       // Matriz de calor
  
  // Outros
  | 'timeline'             // Linha do tempo de eventos
  | 'list-items'           // Lista de itens
  | 'text-display'         // Exibição de texto
  | 'iframe-embed';        // Iframe customizado

export interface DashboardLayout {
  id: string;
  name: string;
  description?: string;
  widgets: DashboardWidget[];
  isDefault: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface WidgetDefinition {
  id: WidgetType;
  name: string;
  description: string;
  category: 'cards' | 'actions' | 'charts-line' | 'charts-bar' | 'charts-circular' | 'gauges' | 'indicators' | 'tables' | 'heatmaps' | 'others';
  defaultSize: 'small' | 'medium' | 'large';
  icon: string;
  preview?: string;
  configurable: boolean;
  requiresSensor: boolean;
}