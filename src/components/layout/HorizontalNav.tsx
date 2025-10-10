import React, { useState, useEffect, useRef } from 'react';
import type { LucideIcon } from 'lucide-react';
import { 
  LayoutGrid, 
  PanelsTopLeft, 
  AirVent, 
  Activity, 
  Zap,
  BellRing, 
  FileText,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal
} from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

type NavItem = {
  id: string;
  label: string;
  icon: LucideIcon;
  path: string;
};

const NAV_ITEMS: NavItem[] = [
  { id: 'overview', label: 'Visão Geral', icon: LayoutGrid, path: '/overview' },
  { id: 'custom-dashboard', label: 'Dashboards', icon: PanelsTopLeft, path: '/dashboards' },
  { id: 'assets', label: 'Ativos (HVAC)', icon: AirVent, path: '/assets' },
  { id: 'sensors', label: 'Sensores & Telemetria', icon: Activity, path: '/sensors' },
  { id: 'rules', label: 'Regras', icon: Zap, path: '/rules' },
  { id: 'alerts', label: 'Alertas', icon: BellRing, path: '/alerts' },
  { id: 'reports', label: 'Relatórios', icon: FileText, path: '/reports' }
];

interface HorizontalNavProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export const HorizontalNav: React.FC<HorizontalNavProps> = ({ currentPage, onNavigate }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [visibleItems, setVisibleItems] = useState(NAV_ITEMS);
  const [hiddenItems, setHiddenItems] = useState<NavItem[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  // Check scroll position
  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 5);
    }
  };

  // Calculate visible items based on viewport width
  const calculateVisibleItems = () => {
    const width = window.innerWidth;
    
    // Breakpoints for different screen sizes
    if (width >= 1400) {
      // Extra large screens - show all (6 items)
      setVisibleItems(NAV_ITEMS);
      setHiddenItems([]);
      setShowDropdown(false);
    } else if (width >= 1200) {
      // Large screens - show all (6 items)
      setVisibleItems(NAV_ITEMS);
      setHiddenItems([]);
      setShowDropdown(false);
    } else if (width >= 1024) {
      // Medium screens - show 5 items
      setVisibleItems(NAV_ITEMS.slice(0, 5));
      setHiddenItems(NAV_ITEMS.slice(5));
      setShowDropdown(true);
    } else if (width >= 768) {
      // Tablet - show 4 items
      setVisibleItems(NAV_ITEMS.slice(0, 4));
      setHiddenItems(NAV_ITEMS.slice(4));
      setShowDropdown(true);
    } else {
      // Small tablets - show 3 items with icons only
      setVisibleItems(NAV_ITEMS.slice(0, 3));
      setHiddenItems(NAV_ITEMS.slice(3));
      setShowDropdown(true);
    }
  };

  useEffect(() => {
    calculateVisibleItems();
    checkScroll();

    const handleResize = () => {
      calculateVisibleItems();
      checkScroll();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScroll);
      checkScroll();
      return () => container.removeEventListener('scroll', checkScroll);
    }
  }, [visibleItems]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 200;
      const newScrollLeft = direction === 'left' 
        ? scrollContainerRef.current.scrollLeft - scrollAmount
        : scrollContainerRef.current.scrollLeft + scrollAmount;
      
      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
    }
  };

  const renderNavButton = (item: NavItem) => {
    const isActive = currentPage === item.id;
    const IconComponent = item.icon;
    
    return (
      <button
        key={item.id}
        onClick={() => onNavigate(item.id)}
        className={`
          flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all duration-150
          min-w-fit whitespace-nowrap flex-shrink-0
          ${isActive 
            ? "bg-white text-[#076A75] shadow-sm font-medium" 
            : "text-slate-700 hover:bg-white/70 hover:text-[#076A75]"
          }
        `}
        aria-current={isActive ? 'page' : undefined}
        title={item.label}
      >
        <IconComponent className="size-4" aria-hidden />
        <span className="hidden lg:inline">{item.label}</span>
      </button>
    );
  };

  return (
    <div className="relative flex items-center gap-2 w-full">
      {/* Left Scroll Button */}
      {canScrollLeft && (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 flex-shrink-0 bg-white/80 hover:bg-white shadow-sm z-10"
          onClick={() => scroll('left')}
          aria-label="Rolar para esquerda"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      )}

      {/* Navigation Items Container */}
      <div 
        ref={scrollContainerRef}
        className="flex items-center gap-2 overflow-x-auto scrollbar-hide flex-1 px-1"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {visibleItems.map(renderNavButton)}
      </div>

      {/* Right Scroll Button */}
      {canScrollRight && (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 flex-shrink-0 bg-white/80 hover:bg-white shadow-sm z-10"
          onClick={() => scroll('right')}
          aria-label="Rolar para direita"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      )}

      {/* Overflow Menu for Hidden Items */}
      {showDropdown && hiddenItems.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 flex-shrink-0 bg-white/80 hover:bg-white shadow-sm gap-1"
              aria-label="Mais opções de navegação"
            >
              <MoreHorizontal className="h-4 w-4" />
              <span className="text-xs">Mais</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            {hiddenItems.map((item) => {
              const isActive = currentPage === item.id;
              const IconComponent = item.icon;
              
              return (
                <DropdownMenuItem
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`flex items-center gap-3 cursor-pointer ${
                    isActive ? 'bg-accent text-accent-foreground font-medium' : ''
                  }`}
                >
                  <IconComponent className="size-4" />
                  <span>{item.label}</span>
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
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