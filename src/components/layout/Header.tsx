import React, { useState, useEffect } from 'react';
import { useAppStore } from '../../store/app';
import { useAuthStore } from '../../store/auth';
import { Clock, Menu, LogOut, ChevronDown, Settings, UserCog, Users, Building2 } from 'lucide-react';
import logoImage from '@/assets/images/LOGO.png';
import traksenseLogo from '@/assets/images/traksense-logo.png';
import { HorizontalNav, MobileNav } from './HorizontalNav';
import { EditProfileDialog } from '../auth/EditProfileDialog';
import { TeamManagementDialog } from '../auth/TeamManagementDialog';
import { PreferencesDialog } from '../auth/PreferencesDialog';
import { HeaderNotifications } from '@/components/header/HeaderNotifications';
import { useAlertNotifications } from '@/hooks/queries/useAlertNotifications';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useIsMobile } from '@/hooks/use-mobile';
import { getInitials } from '@/lib/get-initials';

interface HeaderProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentPage, onNavigate }) => {
  const alerts = useAppStore(state => state.alerts);
  const lastUpdateTime = useAppStore(state => state.lastUpdateTime);
  const availableSites = useAppStore(state => state.availableSites);
  const currentSite = useAppStore(state => state.currentSite);
  const isLoadingSites = useAppStore(state => state.isLoadingSites);
  const loadAvailableSites = useAppStore(state => state.loadAvailableSites);
  const setCurrentSite = useAppStore(state => state.setCurrentSite);
  const { user, logout } = useAuthStore();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isTeamManagementOpen, setIsTeamManagementOpen] = useState(false);
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);
  const isMobile = useIsMobile();
  
  // Sincronizar alertas ativos com sistema de notificações
  useAlertNotifications();
  
  // Configurações de timezone e formato de hora do usuário
  const userTimezone = user?.timezone || 'America/Sao_Paulo';
  const userTimeFormat = user?.time_format || '24h';
  const hour12 = userTimeFormat === '12h';
  
  // Load available sites on mount
  useEffect(() => {
    loadAvailableSites();
  }, [loadAvailableSites]);
  
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
            <div className="flex items-center space-x-1.5">
              <img 
                src={logoImage} 
                alt="TrakSense Logo" 
                className="w-8 h-8 object-contain"
              />
              <img 
                src={traksenseLogo} 
                alt="TrakSense" 
                className="h-6 md:h-20 w-auto object-contain"
              />
            </div>
            
            {/* Tenant/Site Selector */}
            <div className="hidden md:flex items-center space-x-2 text-sm opacity-90">
              <span>|</span>
              {isLoadingSites ? (
                <span className="text-xs">Carregando...</span>
              ) : availableSites.length <= 1 ? (
                <div className="flex items-center gap-1.5">
                  <Building2 className="w-4 h-4" />
                  <span>{currentSite?.name || 'Nenhum site disponível'}</span>
                </div>
              ) : (
                <DropdownMenu>
                  <DropdownMenuTrigger className="flex items-center gap-1.5 hover:opacity-100 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 rounded px-2 py-1">
                    <Building2 className="w-4 h-4" />
                    <span>{currentSite?.name || 'Selecione um site'}</span>
                    <ChevronDown className="w-3.5 h-3.5" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-[280px]">
                    <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground uppercase">
                      Sites Disponíveis
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {availableSites.map((site) => (
                      <DropdownMenuItem 
                        key={site.id}
                        onClick={() => setCurrentSite(site)}
                        className={`cursor-pointer ${currentSite?.id === site.id ? 'bg-muted font-medium' : ''}`}
                      >
                        <div className="flex flex-col gap-0.5">
                          <span className="font-medium">{site.name}</span>
                          {(site.sector || site.company) && (
                            <span className="text-xs text-muted-foreground">
                              {site.sector || site.company}
                            </span>
                          )}
                        </div>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
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
                  second: '2-digit',
                  timeZone: userTimezone,
                  hour12: hour12
                })}
              </span>
            </div>
            
            {lastUpdateTime && (
              <div className="text-xs opacity-75">
                Última atualização: {lastUpdateTime.toLocaleTimeString('pt-BR', {
                  timeZone: userTimezone,
                  hour12: hour12
                })}
              </div>
            )}
          </div>

          {/* Right Actions */}
          <div className="flex items-center space-x-2">
            {/* Notifications */}
            <HeaderNotifications 
              onNavigateToAlerts={() => {
                onNavigate('alerts');
                setIsMobileMenuOpen(false);
              }}
            />

            {/* User Menu */}
            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button 
                    className="flex items-center space-x-2 px-3 py-2 rounded-md text-white/90 hover:text-white hover:bg-white/10 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20"
                    aria-label="Menu do usuário"
                  >
                    <Avatar className="w-8 h-8 ring-1 ring-white/40">
                      <AvatarImage 
                        src={user.photoUrl || ''} 
                        alt={user.name}
                        className="object-cover"
                      />
                      <AvatarFallback className="bg-primary-foreground/20 text-primary-foreground font-semibold text-sm">
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden md:flex flex-col items-start text-left">
                      <span className="text-sm font-medium">{user.name}</span>
                      <span className="text-xs opacity-75">
                        {user.role === 'operator' ? 'Operador' :
                         user.role === 'viewer' ? 'Visualizador' : 
                         user.role === 'admin' ? 'Administrador' :
                         user.role === 'owner' ? 'Owner' : user.role}
                      </span>
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
                       user.role === 'admin' ? 'Administrador' :
                       user.role === 'owner' ? 'Owner' : user.role}
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
                  {(user.role === 'admin' || user.role === 'owner') && (
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