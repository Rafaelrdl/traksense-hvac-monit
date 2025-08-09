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
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

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
  const isMobile = useIsMobile();
  
  return (
    <nav 
      className={cn(
        "flex gap-2",
        isMobile 
          ? "flex-col space-y-1" // Mobile: vertical layout
          : "items-center overflow-x-auto scrollbar-hide h-12 py-2" // Desktop: horizontal layout
      )}
      aria-label="Seções"
      style={!isMobile ? { scrollbarWidth: 'none', msOverflowStyle: 'none' } : undefined}
    >
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = currentPage === item.id;
        
        return (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            aria-current={isActive ? 'page' : undefined}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
              isMobile 
                ? "w-full min-h-[44px] justify-start" // Mobile: full width, left aligned
                : "whitespace-nowrap shrink-0 min-h-[40px]", // Desktop: compact
              isActive 
                ? isMobile
                  ? "bg-primary text-primary-foreground font-semibold" // Mobile active state
                  : "bg-white text-teal-800 shadow-sm ring-teal-200 font-semibold" // Desktop active state
                : isMobile
                  ? "text-slate-700 hover:bg-slate-100" // Mobile inactive state
                  : "text-slate-600 hover:bg-white/70 hover:text-teal-700" // Desktop inactive state
            )}
          >
            <Icon className="size-4 shrink-0" aria-hidden="true" />
            <span className={isMobile ? "block" : "hidden md:inline"}>
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};