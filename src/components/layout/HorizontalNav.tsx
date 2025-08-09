import React from 'react';
import { 
import { 
  LayoutGrid, 
  Wrench, 
  Settings 
import { cn 

  id: stri
  icon: Luci
};
const NAV_ITEMS: NavIt
  { id: 'custom-dashboard', label

  { id: 'maintena
  { id: 'setti

  currentPage: strin
}
ex

    <nav 
        "flex gap-2",
          ? "flex-col space-y-1" // Mobile: vertical layout
      )}
      style={!isMobile ? { scrollbarWidth: 'none', msOverflowStyle: 'none' } : undefin
      {NAV_ITEMS.map((item) => {
        const isActive = currentPage === item.id;
        return (
            key={item.id}
  

interface HorizontalNavProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export const HorizontalNav: React.FC<HorizontalNavProps> = ({ currentPage, onNavigate }) => {
  return (
    <nav 
      className="flex items-center gap-2 overflow-x-auto scrollbar-hide h-12 py-2" 
      aria-label="Seções"
      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
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
              "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 whitespace-nowrap shrink-0",
              "min-h-[40px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
              isActive 
                ? "bg-white text-teal-800 shadow-sm ring-teal-200 font-semibold" 
                : "text-slate-600 hover:bg-white/70 hover:text-teal-700"
            )}
          >
            <Icon className="size-4 shrink-0" aria-hidden="true" />
            <span className="hidden md:inline">{item.label}</span>
          </button>

      })}

  );
