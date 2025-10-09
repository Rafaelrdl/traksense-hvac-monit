import React, { useState, useEffect } from 'react';
import { Layout } from './components/layout/Layout';
import { OverviewPage } from './components/pages/OverviewPage';
import { AssetsPage } from './components/pages/AssetsPage';
import { AssetDetailPage } from './components/pages/AssetDetailPage';
import { SensorsPage } from './components/pages/SensorsPage';
import { AlertsPage } from './components/pages/AlertsPage';
import { ReportsPage } from './components/pages/ReportsPage';
import { MaintenancePage } from './components/pages/MaintenancePage';
import { SettingsPage } from './components/pages/SettingsPage';
import { CustomDashboard } from './components/dashboard/CustomDashboard';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { useAppStore } from './store/app';

function App() {
  const [currentPage, setCurrentPage] = useState('overview');
  const selectedAssetId = useAppStore(state => state.selectedAssetId);

  // Start simulation on app load
  useEffect(() => {
    const { startSimulation, isSimulationRunning, stopSimulation } = useAppStore.getState();
    
    if (!isSimulationRunning) {
      startSimulation();
    }

    // Cleanup on unmount
    return () => {
      stopSimulation();
    };
  }, []); // Empty dependency array to run only once

  const handleNavigation = (page: string) => {
    setCurrentPage(page);
    // Clear selected asset when navigating away from asset details
    if (page !== 'assets' && selectedAssetId) {
      useAppStore.getState().setSelectedAsset(null);
    }
  };

  const renderPage = () => {
    // Show asset detail if an asset is selected
    if (selectedAssetId && (currentPage === 'assets' || currentPage === 'overview')) {
      return <AssetDetailPage />;
    }

    switch (currentPage) {
      case 'overview':
        return <OverviewPage />;
      case 'custom-dashboard':
        return <CustomDashboard />;
      case 'assets':
        return <AssetsPage />;
      case 'sensors':
        return <SensorsPage />;
      case 'alerts':
        return <AlertsPage />;
      case 'maintenance':
        return <MaintenancePage />;
      case 'reports':
        return <ReportsPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <OverviewPage />;
    }
  };

  return (
    <ProtectedRoute>
      <Layout currentPage={currentPage} onNavigate={handleNavigation}>
        {renderPage()}
      </Layout>
    </ProtectedRoute>
  );
}

export default App;