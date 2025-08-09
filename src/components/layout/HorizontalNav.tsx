import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { 
  LayoutGrid, 
  PanelsTopLeft, 
  AirVent, 
  Activity, 
  BellRing, 
  Wrench, 
  FileText, 
  Settings 
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
    <nav className="flex items-center gap-2 overflow-x-auto scrollbar-hide h-12 px-1" aria-label="Seções">
      {NAV_ITEMS.map((item) => {
        const isActive = currentPage === item.id;
        const IconComponent = item.icon;
        
        return (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`
              flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all duration-150
              min-w-fit whitespace-nowrap
              ${isActive 
                ? "bg-white text-[#076A75] shadow-sm font-medium" 
                : "text-slate-700 hover:bg-white/70 hover:text-[#076A75]"
              }
            `}
            aria-current={isActive ? 'page' : undefined}
          >
            <IconComponent className="size-4" aria-hidden />
            <span className="hidden md:inline">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};

export const MobileNav: React.FC<HorizontalNavProps> = ({ currentPage, onNavigate }) => {
  return (
    <nav className="flex flex-col gap-2" aria-label="Navegação móvel">
      {NAV_ITEMS.map((item) => {
        const isActive = currentPage === item.id;
        const IconComponent = item.icon;
        
        return (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`
              flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all duration-150
              text-left w-full
              ${isActive 
                ? "bg-[#076A75] text-white shadow-sm font-medium" 
                : "text-slate-700 hover:bg-slate-100"
              }
            `}
            aria-current={isActive ? 'page' : undefined}
          >
            <IconComponent className="size-5" aria-hidden />
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};