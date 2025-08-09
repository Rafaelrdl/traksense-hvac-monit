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
    <nav className="flex items-center gap-2 overflow-x-auto scrollbar-hide h-12" aria-label="Seções">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = currentPage === item.id;
        
        return (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={[
              "flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all duration-150",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2",
              isActive 
                ? "bg-white text-teal-800 shadow-sm font-medium" 
                : "text-slate-600 hover:bg-white/70 hover:text-teal-700"
            ].join(" ")}
            aria-current={isActive ? "page" : undefined}
          >
            <Icon className="size-4 shrink-0" aria-hidden />
            <span className="hidden md:inline">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};