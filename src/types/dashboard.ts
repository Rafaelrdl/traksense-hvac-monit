export interface DashboardWidget {
  id: string;
  type: 'kpi' | 'chart' | 'table' | 'gauge' | 'maintenance';
  title: string;
  size: 'small' | 'medium' | 'large';
  position: {
    x: number;
    y: number;
    w?: number;
    h?: number;
  };
  config?: Record<string, any>;
  props?: Record<string, any>;
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
  | 'alerts-table'
  | 'maintenance-overview';

export interface DashboardLayout {
  id: string;
  name: string;
  description?: string;
  widgets: DashboardWidget[];
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface WidgetDefinition {
  id: WidgetType;
  name: string;
  description: string;
  category: 'kpi' | 'charts' | 'tables' | 'maintenance';
  defaultSize: 'small' | 'medium' | 'large';
  icon: string;
}