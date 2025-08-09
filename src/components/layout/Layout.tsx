import React from 'react';
import { TopBar } from './TopBar';
import { TrakSenseSidebar } from './TrakSenseSidebar';
import { useIsMobile } from '@/hooks/use-mobile';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, currentPage, onNavigate }) => {
  const isMobile = useIsMobile();

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Top Bar with integrated mobile trigger */}
      <TopBar currentPage={currentPage} onNavigate={onNavigate} />
      
      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - only renders on desktop */}
        <TrakSenseSidebar currentPage={currentPage} onNavigate={onNavigate} />
        
        {/* Main Content - takes full width on mobile when sidebar is not rendered */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};