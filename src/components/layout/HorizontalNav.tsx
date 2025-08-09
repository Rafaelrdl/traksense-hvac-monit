import React from 'react';
import { 
  AirVent,
  BellRing,
  AirVent,
  type Luci
  BellRing,
type NavI
  label: st
  path: str

  { id: 'overview', la

  { id: 'alerts'
  { id: 'repo
];
interface Horizonta
  onNavigate: (
};

      className="flex items-ce
    >
        const Icon = item.icon;
        
          <button
            onClick={() => onNavigate(item.id)}
              "flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-al
              isActive 
                : "text-slate-600 hover:bg-white/70 hover:text-teal-700"
  

          </button>
  currentPage: string;
  onNavigate: (page: string) => void;
}

function cn(...classes: Array<string | boolean | undefined>) {
  return classes.filter(Boolean).join(' ');
}

export const HorizontalNav: React.FC<HorizontalNavProps> = ({ currentPage, onNavigate }) => {
  return (
    <nav 
      className="flex items-center gap-2 overflow-x-auto scrollbar-hide h-12"
      aria-label="Seções"
    >
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = currentPage === item.id;
        
        return (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all duration-150",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2",
              isActive 
                ? "bg-white text-teal-800 shadow-sm font-medium" 
                : "text-slate-600 hover:bg-white/70 hover:text-teal-700"
            )}
            aria-current={isActive ? "page" : undefined}
          >
            <Icon className="size-4 shrink-0" aria-hidden />






