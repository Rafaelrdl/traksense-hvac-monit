import React, { useState, useEffect } from 'react';
import { useAppStore } from '../../store/app';
import { useAuthStore } from '../../store/auth';
import { Bell, Clock, Menu, LogOut, User, ChevronDown, Settings, UserCog, Users } from 'lucide-react';
import logoImage from '@/assets/images/LOGO.png';
import { HorizontalNav, MobileNav } from './HorizontalNav';
import { EditProfileDialog } from '../auth/EditProfileDialog';
import { TeamManagementDialog } from '../auth/TeamManagementDialog';
import { PreferencesDialog } from '../auth/PreferencesDialog';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useIsMobile } from '@/hooks/use-mobile';

interface HeaderProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentPage, onNavigate }) => {
  const alerts = useAppStore(state => state.alerts);
  const lastUpdateTime = useAppStore(state => state.lastUpdateTime);
  const { user, logout } = useAuthStore();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isTeamManagementOpen, setIsTeamManagementOpen] = useState(false);
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);
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
                    <MobileNav 
                      currentPage={currentPage} 
                      onNavigate={handleMobileNavigation}
                    />
                  </div>
                </SheetContent>
              </Sheet>
            )}
            
            {/* Logo and Brand */}
            <div className="flex items-center space-x-3">
              <img 
                src={logoImage} 
                alt="TrakSense Logo" 
                className="w-8 h-8 object-contain"
              />
              <h1 className="text-lg md:text-xl font-bold tracking-tight">
                <span className="font-sans">Trak</span><span className="font-sans">Sense</span>
              </h1>
            </div>
            
            {/* Tenant/Site Selector */}
            <div className="hidden md:flex items-center space-x-2 text-sm opacity-90">
              <span>|</span>
              <span>{user?.site || 'Site não definido'}</span>
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

            {/* User Menu */}
            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button 
                    className="flex items-center space-x-2 px-3 py-2 rounded-md text-white/90 hover:text-white hover:bg-white/10 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                      <User className="w-4 h-4" />
                    </div>
                    <div className="hidden md:flex flex-col items-start text-left">
                      <span className="text-sm font-medium">{user.name}</span>
                      <span className="text-xs opacity-75">{user.role}</span>
                    </div>
                    <ChevronDown className="w-4 h-4 opacity-75" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-xs">
                    <Badge 
                      variant="secondary" 
                      className="capitalize"
                    >
                      {user.role === 'operator' ? 'Operador' :
                       user.role === 'viewer' ? 'Visualizador' : 
                       user.role === 'admin' ? 'Administrador' : user.role}
                    </Badge>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => setIsEditProfileOpen(true)}
                    className="cursor-pointer"
                  >
                    <UserCog className="mr-2 h-4 w-4" />
                    <span>Editar Perfil</span>
                  </DropdownMenuItem>
                  {user.role === 'admin' && (
                    <DropdownMenuItem 
                      onClick={() => setIsTeamManagementOpen(true)}
                      className="cursor-pointer"
                    >
                      <Users className="mr-2 h-4 w-4" />
                      <span>Equipe</span>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem 
                    onClick={() => setIsPreferencesOpen(true)}
                    className="cursor-pointer"
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Preferências</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={logout}
                    className="text-destructive focus:text-destructive cursor-pointer"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sair</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

          </div>
        </div>
      </div>

      {/* Navigation Bar - Responsive horizontal navigation */}
      {!isMobile && (
        <div className="bg-teal-50/80 backdrop-blur border-b border-teal-100">
          <div className="mx-auto max-w-[1400px] px-4 sm:px-6 py-2">
            <HorizontalNav currentPage={currentPage} onNavigate={onNavigate} />
          </div>
        </div>
      )}

      {/* Edit Profile Dialog */}
      <EditProfileDialog 
        open={isEditProfileOpen} 
        onOpenChange={setIsEditProfileOpen} 
      />

      {/* Team Management Dialog */}
      <TeamManagementDialog 
        open={isTeamManagementOpen} 
        onOpenChange={setIsTeamManagementOpen} 
      />

      {/* Preferences Dialog */}
      <PreferencesDialog 
        open={isPreferencesOpen} 
        onOpenChange={setIsPreferencesOpen} 
      />
    </header>
  );
};