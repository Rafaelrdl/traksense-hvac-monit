export interface DashboardWidget {
  id: string;
  type: 'kpi' | 'chart' | 'table' | 'gauge';
  title: string;
  };
}
export interfa
  name: string
  is

 

  | 'mtbf-kpi'
  | 'temperat
  | 'filter-gau
  | 'alerts-table';
export interface Widg
 

  icon: string;












export interface WidgetDefinition {
  id: WidgetType;
  name: string;
  description: string;
  category: 'kpi' | 'charts' | 'tables';
  defaultSize: 'small' | 'medium' | 'large';
  icon: string;
}