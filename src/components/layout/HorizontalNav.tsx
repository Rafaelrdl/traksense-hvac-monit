import React from 'react';
  LayoutG
  AirVent, 
  BellRing, 
  AirVent, 
  Activity, 
  BellRing, 
  Wrench, 
  icon: Luci
};
const NAV_ITEMS: 
  { id: 'custom-dashbo

  { id: 'mainten
  { id: 'sett

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

  return (
 

        return (
  return (
            className={`
              ${isActive 
                : "text-slate-700 hover:bg-slate-
            `}
        
        return (
        );
    </nav>
};
            className={`

              ${isActive 



            `}






      })}

  );




























