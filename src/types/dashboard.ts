export interface DashboardWidget {
  id: string;
  type: 'kpi' | 'chart' | 'table' | 'gauge';
  title: string;
  size: 'small' | 'medium' | 'large';
  position: {
    x: number;
    y: number;
  };
  props?: Record<string, any>;
}

export interface DashboardLayout {
  id: string;
  name: string;
  widgets: DashboardWidget[];
  isDefault: boolean;
}

export type WidgetType = 
  | 'uptime-kpi'
  | 'alerts-kpi'
  | 'consumption-kpi'
  | 'health-kpi'
  | 'mtbf-kpi'
  | 'mttr-kpi'
  | 'temperature-chart'
  | 'energy-chart'
  | 'filter-gauge'
  | 'alerts-heatmap'
  | 'alerts-table';

export interface WidgetDefinition {
  id: WidgetType;
  name: string;
  description: string;
  category: 'kpi' | 'charts' | 'tables';
  defaultSize: 'small' | 'medium' | 'large';
  icon: string;
}