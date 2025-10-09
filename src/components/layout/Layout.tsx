import React from 'react';
import { Header } from './Header';
import { Toaster } from '@/components/ui/sonner';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, currentPage, onNavigate }) => {
  return (
    <div className="min-h-screen bg-[#F4FAFB]">
      {/* Header with integrated horizontal navigation */}
      <Header currentPage={currentPage} onNavigate={onNavigate} />
      
      {/* Main Content - Full width */}
      <main className="mx-auto max-w-[1400px] px-6 py-6">
        {children}
      </main>

      {/* Toast notifications */}
      <Toaster />
    </div>
  );
};