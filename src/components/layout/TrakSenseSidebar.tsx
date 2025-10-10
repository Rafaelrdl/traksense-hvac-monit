import React, { useState, useEffect } from 'react';
import { 
  LayoutGrid, 
  PanelsTopLeft, 
  AirVent, 
  Activity,
  BellRing, 
  Wrench, 
  FileText, 
  Settings,
  Menu,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore } from '../../store/app';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';

// Navigation items following TrakSense specification order
type NavItem = { 
  id: string; 
  label: string; 
  icon: React.ComponentType<any>; 
  path?: string; 
  disabled?: boolean;
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

interface TrakSenseSidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

// Navigation Menu Component (reusable for both desktop and mobile)
function NavigationMenu({ currentPage, onNavigate, onItemClick }: TrakSenseSidebarProps & { onItemClick?: () => void }) {
  return (
    <nav className="space-y-1" role="navigation" aria-label="Menu lateral">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = currentPage === item.id;
        
        return (
          <button
            key={item.id}
            onClick={() => {
              onNavigate(item.id);
              onItemClick?.();
            }}
            aria-current={isActive ? 'page' : undefined}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-full text-left transition-all duration-150",
              "min-h-[44px] text-white/90 hover:text-white",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006b76]",
              isActive && [
                "bg-[var(--sidebar-item-active-bg)] text-white font-medium"
              ],
              !isActive && "hover:bg-[var(--sidebar-item-active-bg)]/50"
            )}
            style={isActive ? { '--tw-ring-offset-color': 'var(--sidebar-bg)' } as React.CSSProperties : undefined}
          >
            <Icon className="h-[18px] w-[18px] shrink-0" />
            <span className="truncate">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

// System Status Footer
function SystemStatus({ className }: { className?: string }) {
  return (
    <div className={cn("p-3", className)}>
      <div 
        className="rounded-lg p-3"
        style={{ backgroundColor: 'color-mix(in oklab, var(--sidebar-bg) 85%, white)' }}
      >
        <div className="text-xs text-white/60 mb-1">Sistema</div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-sm text-white/90">Online</span>
        </div>
      </div>
    </div>
  );
}

// Mobile Sidebar Sheet
function MobileSidebar({ currentPage, onNavigate }: TrakSenseSidebarProps) {
  const [open, setOpen] = useState(false);

  const handleItemClick = () => {
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon"
          className="text-primary-foreground hover:bg-primary-foreground/10"
          aria-label="Abrir menu lateral"
        >
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent 
        side="left" 
        className="w-[240px] p-0 bg-[var(--sidebar-bg)] border-r border-[var(--sidebar-divider)]"
      >
        <div className="flex h-full flex-col">
          {/* Header with close button */}
          <div className="flex items-center justify-between p-4 border-b border-[var(--sidebar-divider)]">
            <span className="text-lg font-semibold text-white/90">Menu</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setOpen(false)}
              className="text-white/90 hover:bg-[var(--sidebar-item-active-bg)] h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Navigation Menu */}
          <div className="flex-1 p-4">
            <NavigationMenu 
              currentPage={currentPage} 
              onNavigate={onNavigate} 
              onItemClick={handleItemClick}
            />
          </div>

          {/* Mobile Status Footer */}
          <SystemStatus className="border-t border-sidebar-divider" />
        </div>
      </SheetContent>
    </Sheet>
  );
}

// Desktop Sidebar
function DesktopSidebar({ currentPage, onNavigate }: TrakSenseSidebarProps) {
  const { sidebarCollapsed, setSidebarCollapsed } = useAppStore();

  // Keyboard shortcut: Ctrl/Cmd + \ to toggle sidebar
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === '\\' && (event.ctrlKey || event.metaKey)) {
        event.preventDefault();
        setSidebarCollapsed(!sidebarCollapsed);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [sidebarCollapsed, setSidebarCollapsed]);

  return (
    <div 
      className={cn(
        "bg-[var(--sidebar-bg)] text-white/90 transition-all duration-300 h-full flex-shrink-0 border-r border-primary/20",
        "flex flex-col", // Always visible on desktop
        sidebarCollapsed ? "w-16" : "w-60"
      )}
      style={{ minHeight: '100%' }}
    >
      {/* Toggle Button */}
      <div className="p-4 border-b border-primary/20">
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="w-full flex items-center justify-center p-2 rounded-lg hover:bg-primary-foreground/10 transition-colors text-white/90 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006b76]"
          title={sidebarCollapsed ? 'Expandir menu (Ctrl+\\)' : 'Recolher menu (Ctrl+\\)'}
        >
          {sidebarCollapsed ? (
            <Menu className="w-5 h-5" />
          ) : (
            <X className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Navigation Content */}
      <div className="flex flex-col h-full">
        <div className="flex-1 p-4">
          {sidebarCollapsed ? (
            // Collapsed state - icon only
            <div className="space-y-1">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    title={item.label}
                    className={cn(
                      "w-full flex items-center justify-center p-3 rounded-lg transition-all duration-150",
                      "min-h-[44px] text-white/90 hover:text-white",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006b76]",
                      isActive && "bg-[var(--sidebar-item-active-bg)] text-white",
                      !isActive && "hover:bg-[var(--sidebar-item-active-bg)]/50"
                    )}
                  >
                    <Icon className="h-[18px] w-[18px]" />
                  </button>
                );
              })}
            </div>
          ) : (
            // Expanded state - full menu
            <NavigationMenu currentPage={currentPage} onNavigate={onNavigate} />
          )}
        </div>

        {/* System Status - only when expanded */}
        {!sidebarCollapsed && <SystemStatus />}
      </div>
    </div>
  );
}

// Main Sidebar Component
export function TrakSenseSidebar({ currentPage, onNavigate }: TrakSenseSidebarProps) {
  const isMobile = useIsMobile();

  // Render desktop sidebar only on desktop - mobile uses TopBar trigger
  if (isMobile) {
    return null; // Mobile sidebar is handled by MobileSidebar in TopBar
  }

  return <DesktopSidebar currentPage={currentPage} onNavigate={onNavigate} />;
}

// Export MobileSidebar separately for use in TopBar
export { MobileSidebar };