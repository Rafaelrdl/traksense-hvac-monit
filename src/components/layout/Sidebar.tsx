import React from 'react';
import { useAppStore } from '../../store/app';
import { 
  LayoutDashboard, 
  Wind, 
  Sensors, 
  AlertTriangle, 
  FileText, 
  Settings,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

const menuItems = [
  { id: 'overview', label: 'Visão Geral', icon: LayoutDashboard },
  { id: 'assets', label: 'Ativos (HVAC)', icon: Wind },
  { id: 'sensors', label: 'Sensores & Telemetria', icon: Sensors },
  { id: 'alerts', label: 'Alertas & Regras', icon: AlertTriangle },
  { id: 'reports', label: 'Relatórios', icon: FileText },
  { id: 'settings', label: 'Configurações', icon: Settings }
];

export const Sidebar: React.FC<SidebarProps> = ({ currentPage, onNavigate }) => {
  const { sidebarCollapsed, setSidebarCollapsed } = useAppStore();

  return (
    <div className={`bg-primary text-primary-foreground transition-all duration-300 ${
      sidebarCollapsed ? 'w-16' : 'w-64'
    } flex-shrink-0 border-r border-primary/20`}>
      {/* Toggle Button */}
      <div className="p-4 border-b border-primary/20">
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="w-full flex items-center justify-center p-2 rounded-lg hover:bg-primary-foreground/10 transition-colors"
          title={sidebarCollapsed ? 'Expandir menu' : 'Recolher menu'}
        >
          {sidebarCollapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <ChevronLeft className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Navigation Menu */}
      <nav className="p-4 space-y-2">
        {menuItems.map(item => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                isActive 
                  ? 'bg-primary-foreground/20 text-primary-foreground' 
                  : 'hover:bg-primary-foreground/10 text-primary-foreground/80 hover:text-primary-foreground'
              }`}
              title={sidebarCollapsed ? item.label : ''}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!sidebarCollapsed && (
                <span className="text-sm font-medium">{item.label}</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Status */}
      {!sidebarCollapsed && (
        <div className="absolute bottom-4 left-4 right-4">
          <div className="bg-primary-foreground/10 rounded-lg p-3">
            <div className="text-xs text-primary-foreground/60 mb-1">Sistema</div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm">Online</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};