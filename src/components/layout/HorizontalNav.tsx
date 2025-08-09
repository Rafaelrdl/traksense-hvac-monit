import React from 'react';
import { 
  LayoutGrid, 
  PanelsTopLeft, 
  AirVent, 
  Activity, 
  BellRing, 
  Wrench, 
  FileText, 
  Settings,
  type LucideIcon
} from 'lucide-react';

type NavItem = {
  id: string;
  label: string;
  icon: LucideIcon;
  path: string;
};

const NAV_ITEMS: NavItem[] = [
  { id: 'overview', label: 'Visão Geral', icon: LayoutGrid, path: '/overview' },
  { id: 'custom-dashboard', label: 'Dashboard Custom', icon: PanelsTopLeft, path: '/custom-dashboard' },
  { id: 'assets', label: 'Ativos (HVAC)', icon: AirVent, path: '/assets' },
  { id: 'sensors', label: 'Sensores & Telemetria', icon: Activity, path: '/sensors' },
  { id: 'alerts', label: 'Alertas & Regras', icon: BellRing, path: '/alerts' },
  { id: 'maintenance', label: 'Manutenção', icon: Wrench, path: '/maintenance' },
  { id: 'reports', label: 'Relatórios', icon: FileText, path: '/reports' },
  { id: 'settings', label: 'Configurações', icon: Settings, path: '/settings' }
];

interface HorizontalNavProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export const HorizontalNav: React.FC<HorizontalNavProps> = ({ currentPage, onNavigate }) => {
  return (
    <nav className="flex items-center gap-2 overflow-x-auto scrollbar-hide h-12" aria-label="Seções">
      {NAV_ITEMS.map((item) => {
        const isActive = currentPage === item.id;
        const Icon = item.icon;
        
        return (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`
              flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition whitespace-nowrap
              ${isActive 
                ? "bg-white text-teal-800 shadow-sm font-medium" 
                : "text-slate-600 hover:bg-white/70"
              }
            `}
            aria-current={isActive ? "page" : undefined}
          >
            <Icon className="size-4" aria-hidden />
            <span className="hidden md:inline">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};

export const MobileNav: React.FC<HorizontalNavProps> = ({ currentPage, onNavigate }) => {
  return (
    <nav className="flex items-center gap-1 overflow-x-auto scrollbar-hide" aria-label="Seções">
      {NAV_ITEMS.map((item) => {
        const isActive = currentPage === item.id;
        const Icon = item.icon;

        return (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`
              flex items-center gap-1 px-2 py-2 rounded-lg text-sm transition
              ${isActive 
                ? "bg-white text-teal-800 shadow-sm" 
                : "text-slate-700 hover:bg-slate-100/50"
              }
            `}
            aria-current={isActive ? "page" : undefined}
          >
            <Icon className="size-4" aria-hidden />
          </button>
        );
      })}
    </nav>
  );
};