import React from 'react';
import { 
  AirVent, 
  BellRing, 
  AirVent, 
  type Lucid
  BellRing, 
  id: str
  icon: Luci
};
const NAV_ITEMS: 
  { id: 'custom-dashbo

  { id: 'mainten
  { id: 'sett

  currentPage: stri
}
};

        const isActive = curre
        
          <button
            onClick={() => onNavigate(item.id)}
              flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition whitespa
                ? "bg-white text-teal-800 shadow-sm font-medium" 
              }
            aria-current={isActive ? "page" : undefined}
            <Icon className="size-4" aria-hidden />
  

  );
  currentPage: string;
  onNavigate: (page: string) => void;
}

export const HorizontalNav: React.FC<HorizontalNavProps> = ({ currentPage, onNavigate }) => {
        co
    <nav className="flex items-center gap-2 overflow-x-auto scrollbar-hide h-12" aria-label="Seções">
      {NAV_ITEMS.map((item) => {
        const isActive = currentPage === item.id;
        const Icon = item.icon;
        
                
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            <Icon classN
              flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition whitespace-nowrap
      })}
                ? "bg-white text-teal-800 shadow-sm font-medium" 
                : "text-slate-600 hover:bg-white/70"
              }

            aria-current={isActive ? "page" : undefined}
          >
            <Icon className="size-4" aria-hidden />
            <span className="hidden md:inline">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};

export const MobileNav: React.FC<HorizontalNavProps> = ({ currentPage, onNavigate }) => {
  return (
    <nav className="flex items-center gap-1 overflow-x-auto scrollbar-hide" aria-label="Seções">
      {NAV_ITEMS.map((item) => {
        const isActive = currentPage === item.id;
        const Icon = item.icon;


          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}

              flex items-center gap-1 px-2 py-2 rounded-lg text-sm transition

                ? "bg-white text-teal-800 shadow-sm" 
                : "text-slate-700 hover:bg-slate-100/50"
              }

            aria-current={isActive ? "page" : undefined}
          >
            <Icon className="size-4" aria-hidden />
          </button>
        );

    </nav>

};