import React, { useState, useEffect } from 'react';
import { useAppStore } from '../../store/app';
import { Bell, ExternalLink, Clock, Building, Menu } from 'lucide-react';
import { HorizontalNav } from './HorizontalNav';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';

interface HeaderProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentPage, onNavigate }) => {
  const alerts = useAppStore(state => state.alerts);
  const lastUpdateTime = useAppStore(state => state.lastUpdateTime);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isMobile = useIsMobile();
  
  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  const activeAlerts = alerts.filter(alert => !alert.resolved && !alert.acknowledged);

  const handleMobileNavigation = (page: string) => {
    onNavigate(page);
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-30 bg-white shadow-sm">
      {/* Top Bar */}
      <div className="bg-primary text-primary-foreground">
        <div className="mx-auto max-w-[1400px] px-6 h-14 flex items-center justify-between">
          {/* Left Side - Logo, Mobile Trigger, and Brand */}
          <div className="flex items-center space-x-4">
            {/* Mobile Menu Trigger */}
            {isMobile && (
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="text-primary-foreground hover:bg-primary-foreground/10"
                    aria-label="Abrir menu de navegação"
                  >
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent 
                  side="left" 
                  className="w-[280px] p-4"
                >
                  <div className="space-y-4">
                    <h2 className="text-lg font-semibold mb-4">Navegação</h2>
                    <HorizontalNav 
                      currentPage={currentPage} 
                      onNavigate={handleMobileNavigation}
                    />
                  </div>
                </SheetContent>
              </Sheet>
            )}
            
            {/* Logo and Brand */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary-foreground/20 rounded-lg flex items-center justify-center">
                <Building className="w-5 h-5" />
              </div>
              <h1 className="text-xl font-bold">TrakSense</h1>
            </div>
            
            {/* Tenant/Site Selector */}
            <div className="hidden md:flex items-center space-x-2 text-sm opacity-90">
              <span>|</span>
              <select className="bg-transparent border-none text-primary-foreground focus:outline-none cursor-pointer">
                <option value="hospital-central" className="text-slate-900">Hospital Central</option>
                <option value="datacenter-01" className="text-slate-900">Datacenter 01</option>
                <option value="shopping-plaza" className="text-slate-900">Shopping Plaza</option>
              </select>
            </div>
          </div>

          {/* Center Info */}
          <div className="hidden lg:flex items-center space-x-6 text-sm">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 opacity-75" />
              <span>
                {currentTime.toLocaleTimeString('pt-BR', { 
                  hour: '2-digit', 
                  minute: '2-digit',
                  second: '2-digit'
                })}
              </span>
            </div>
            
            {lastUpdateTime && (
              <div className="text-xs opacity-75">
                Última atualização: {lastUpdateTime.toLocaleTimeString('pt-BR')}
              </div>
            )}
          </div>

          {/* Right Actions */}
          <div className="flex items-center space-x-4">
            {/* Alert Bell */}
            <div className="relative">
              <Bell className="w-5 h-5 opacity-90" />
              {activeAlerts.length > 0 && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-destructive rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-destructive-foreground">
                    {activeAlerts.length > 9 ? '9+' : activeAlerts.length}
                  </span>
                </div>
              )}
            </div>

            {/* TrakNor Integration Button */}
            <a 
              href="#" 
              className="flex items-center space-x-2 px-3 py-1.5 rounded-md bg-primary-foreground/10 hover:bg-primary-foreground/20 transition-colors text-sm"
              title="Integração em breve"
              onClick={(e) => e.preventDefault()}
            >
              <ExternalLink className="w-4 h-4" />
              <span className="hidden sm:inline">TrakNor</span>
            </a>
          </div>
        </div>
      </div>

      {/* Navigation Bar - Only visible on desktop */}
      {!isMobile && (
        <div className="bg-teal-50/80 backdrop-blur border-b border-teal-100">
          <div className="mx-auto max-w-[1400px] px-6 py-2">
            <HorizontalNav currentPage={currentPage} onNavigate={onNavigate} />
          </div>
        </div>
      )}
    </header>
  );
};