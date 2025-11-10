import React, { useState, useEffect } from 'react';
import { Layout } from './components/layout/Layout';
import { EditableOverviewPage } from './components/pages/EditableOverviewPage';
import { AssetsPage } from './components/pages/AssetsPage';
import { AssetDetailPage } from './components/pages/AssetDetailPage';
import { SensorsPage } from './components/pages/SensorsPage';
import { RulesPage } from './components/pages/RulesPage';
import { AlertsPage } from './components/alerts/AlertsPage';
import { ReportsPage } from './components/pages/ReportsPage';
import { MaintenancePage } from './components/pages/MaintenancePage';
import { SettingsPage } from './components/pages/SettingsPage';
import { CustomDashboard } from './components/dashboard/CustomDashboard';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { useAppStore } from './store/app';
import { useNotifications } from './store/notifications';

function App() {
  // Recuperar página salva no localStorage ou usar 'overview' como padrão
  const [currentPage, setCurrentPage] = useState(() => {
    return localStorage.getItem('currentPage') || 'overview';
  });
  const selectedAssetId = useAppStore(state => state.selectedAssetId);

  // NOTA: Simulação desabilitada - agora usamos dados reais da API
  // A simulação só deve ser ativada manualmente para testes/desenvolvimento
  // Se necessário, reative comentando o código abaixo
  
  // useEffect(() => {
  //   const { startSimulation, isSimulationRunning, stopSimulation } = useAppStore.getState();
  //   
  //   if (!isSimulationRunning) {
  //     startSimulation();
  //   }
  //
  //   // Cleanup on unmount
  //   return () => {
  //     stopSimulation();
  //   };
  // }, []); // Empty dependency array to run only once
  
  // REMOVIDO: Seed de notificações mockadas
  // As notificações agora devem vir APENAS do backend via API
  // useEffect(() => {
  //   if (import.meta.env.DEV && notifications.length === 0) {
  //     // Add some sample notifications for testing
  //     addNotification({
  //       title: 'HVAC: Consumo acima do esperado',
  //       message: 'Zona L2 apresenta consumo 18% acima da meta estabelecida',
  //       severity: 'warning',
  //     });
  //     
  //     addNotification({
  //       title: 'Sensores sincronizados',
  //       message: 'Todos os sensores da planta foram sincronizados com sucesso',
  //       severity: 'info',
  //     });
  //     
  //     addNotification({
  //       title: 'Alerta crítico: Temperatura alta',
  //       message: 'Chiller 02 operando com temperatura de condensação acima do limite',
  //       severity: 'critical',
  //     });
  //   }
  // }, [addNotification, notifications.length]);

  const handleNavigation = (page: string) => {
    setCurrentPage(page);
    // Salvar página atual no localStorage para persistir após F5
    localStorage.setItem('currentPage', page);
    // Clear selected asset when navigating away from asset details
    if (page !== 'assets' && selectedAssetId) {
      useAppStore.getState().setSelectedAsset(null);
    }
  };

  // Listen for custom navigation events
  useEffect(() => {
    const handleNavigateToAsset = (event: CustomEvent) => {
      const { assetId } = event.detail;
      setCurrentPage('assets');
      localStorage.setItem('currentPage', 'assets');
      // The asset will be selected by the sensors page handler
    };

    const handleNavigateToPage = (event: CustomEvent) => {
      const { page } = event.detail;
      setCurrentPage(page);
      localStorage.setItem('currentPage', page);
    };

    window.addEventListener('navigate-to-asset', handleNavigateToAsset as EventListener);
    window.addEventListener('navigate-to-page', handleNavigateToPage as EventListener);
    
    return () => {
      window.removeEventListener('navigate-to-asset', handleNavigateToAsset as EventListener);
      window.removeEventListener('navigate-to-page', handleNavigateToPage as EventListener);
    };
  }, []);

  const renderPage = () => {
    // Show asset detail if an asset is selected
    if (selectedAssetId && (currentPage === 'assets' || currentPage === 'overview')) {
      return <AssetDetailPage />;
    }

    switch (currentPage) {
      case 'overview':
        return <EditableOverviewPage />;
      case 'custom-dashboard':
        return <CustomDashboard />;
      case 'assets':
        return <AssetsPage />;
      case 'sensors':
        return <SensorsPage />;
      case 'rules':
        return <RulesPage />;
      case 'alerts':
        return <AlertsPage />;
      case 'maintenance':
        return <MaintenancePage />;
      case 'reports':
        return <ReportsPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <EditableOverviewPage />;
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