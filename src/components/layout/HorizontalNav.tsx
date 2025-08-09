import React from 'react';
import { 
import { 
  Activity, 
  PanelsTopLeft, 
  AirVent, 
  Activity, 
  BellRing, 
  icon: Lu
  FileText, 
const NAV_I
} from 'lucide-react';

type NavItem = {
  id: string;
  label: string;
  icon: LucideIcon;
  path: string;
ex

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

export const MobileNav: React.FC<Hori
 

        
          
            onClick={() => onNavigate(item.id)}
              "flex items-center
              isActive 
                : "text-slate-700 hover:bg-slate-
        
            <Ico
          </butto
      })}
  );
















