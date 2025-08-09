// Test file to ensure all navigation components are working properly
// This can be removed after verification

import React from 'react';
import { HorizontalNav, MobileNav } from './components/layout/HorizontalNav';

// Simple test to verify imports work
const TestNavigation: React.FC = () => {
  const mockProps = {
    currentPage: 'overview',
    onNavigate: (page: string) => console.log('Navigate to:', page)
  };

  return (
    <div>
      <h1>Navigation Test</h1>
      <HorizontalNav {...mockProps} />
      <MobileNav {...mockProps} />
    </div>
  );
};

export default TestNavigation;