import React from 'react';
import { TopBar } from './TopBar';
import { TrakSenseSidebar } from './TrakSenseSidebar';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, currentPage, onNavigate }) => {
  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Top Bar with integrated mobile trigger */}
      <TopBar currentPage={currentPage} onNavigate={onNavigate} />
      
      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar */}
        <div className="hidden md:block">
          <TrakSenseSidebar currentPage={currentPage} onNavigate={onNavigate} />
        </div>
        
        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};