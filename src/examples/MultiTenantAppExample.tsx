/**
 * Exemplo de Integração Completa - Multi-Tenant Frontend
 * 
 * Este arquivo mostra como integrar todo o sistema de multi-tenant
 * em um componente App.tsx típico.
 */

import React, { useEffect } from 'react';
// import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { TenantProvider } from '@/components/providers/TenantProvider';
import { TenantDebugPanel } from '@/components/debug/TenantDebugPanel';
import { runStorageMigration } from '@/lib/migrations/storageMigration';

// Nota: Este arquivo contém apenas exemplos de código.
// Os componentes reais (LoginPage, DashboardPage, etc.) estão em src/components/pages/

/**
 * EXEMPLO: Componente principal com suporte a multi-tenant
 * 
 * Use este padrão no seu App.tsx real
 */
export const MultiTenantAppExample: React.FC = () => {
  
  // Executar migração de storage na primeira carga
  useEffect(() => {
    runStorageMigration();
  }, []);

  return (
    <TenantProvider>
      {/* 
        NOTA: Para usar rotas, instale react-router-dom:
        npm install react-router-dom
        
        Então descomente o código abaixo:
      */}
      {/*
      <Router>
        <div className="app">
          <Routes>
            <Route path="/login" element={<ExampleLoginPage />} />
            <Route path="/" element={<ExampleDashboardPage />} />
            <Route path="/assets" element={<AssetsPage />} />
          </Routes>
          
          <TenantDebugPanel />
        </div>
      </Router>
      */}
      
      <div className="app">
        <h1>Multi-Tenant App Example</h1>
        <p>Este é um componente de exemplo. Veja os padrões abaixo.</p>
        
        {/* Debug panel (apenas em desenvolvimento) */}
        <TenantDebugPanel />
      </div>
    </TenantProvider>
  );
};

// ============================================
// EXEMPLO: Login Page com Tenant Auth
// ============================================

import { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
import { tenantAuthService } from '@/services/tenantAuthService';
import { TenantLogo } from '@/components/tenant/TenantLogo';

/**
 * EXEMPLO de LoginPage com autenticação multi-tenant
 * 
 * Este é apenas um exemplo. O componente real está em:
 * src/components/pages/LoginPage.tsx
 */
export const ExampleLoginPage: React.FC = () => {
  // const navigate = useNavigate(); // Descomente se usar react-router-dom
  const [credentials, setCredentials] = useState({
    username_or_email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Login com tenant awareness
      const response = await tenantAuthService.login(credentials);
      
      console.log('✅ Login bem-sucedido:', response.user);
      
      // Redirecionar para dashboard (descomente se usar react-router-dom)
      // navigate('/');
      window.location.href = '/'; // Alternativa sem react-router
    } catch (err: any) {
      console.error('❌ Erro no login:', err);
      setError(err.response?.data?.detail || 'Credenciais inválidas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
        {/* Logo do tenant */}
        <div className="flex justify-center">
          <TenantLogo size="lg" showName />
        </div>

        <h2 className="text-center text-3xl font-bold">Login</h2>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email ou Usuário
            </label>
            <input
              type="text"
              value={credentials.username_or_email}
              onChange={(e) => setCredentials({ ...credentials, username_or_email: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Senha
            </label>
            <input
              type="password"
              value={credentials.password}
              onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
};

// ============================================
// EXEMPLO: Header com Logo e Logout
// ============================================

import { useTenantBranding } from '@/hooks/useTenantBranding';

/**
 * EXEMPLO de Header com branding multi-tenant
 */
export const ExampleHeader: React.FC = () => {
  // const navigate = useNavigate(); // Descomente se usar react-router-dom
  const branding = useTenantBranding();

  const handleLogout = async () => {
    await tenantAuthService.logout();
    // navigate('/login'); // Descomente se usar react-router-dom
    window.location.href = '/login'; // Alternativa sem react-router
  };

  return (
    <header 
      className="bg-white border-b px-6 py-4 flex items-center justify-between"
      style={{ borderColor: branding.primaryColor }}
    >
      <TenantLogo size="md" showName />
      
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-600">
          {tenantAuthService.getCurrentUser()?.full_name}
        </span>
        
        <button
          onClick={handleLogout}
          className="text-sm text-red-600 hover:text-red-700"
        >
          Sair
        </button>
      </div>
    </header>
  );
};

// ============================================
// EXEMPLO: Dashboard com Branding Dinâmico
// ============================================

/**
 * EXEMPLO de DashboardPage com branding multi-tenant
 * 
 * Este é apenas um exemplo. O componente real está em:
 * src/components/pages/DashboardPage.tsx
 */
export const ExampleDashboardPage: React.FC = () => {
  const branding = useTenantBranding();

  return (
    <div className="p-6">
      <h1 
        className="text-3xl font-bold mb-6"
        style={{ color: branding.primaryColor }}
      >
        Dashboard - {branding.name}
      </h1>
      
      {/* Seu conteúdo aqui */}
    </div>
  );
};

// ============================================
// EXEMPLO: Usar Tenant Storage em Componente
// ============================================

import { tenantStorage } from '@/lib/tenantStorage';

export const PreferencesPage: React.FC = () => {
  const [theme, setTheme] = useState(() => {
    return tenantStorage.get('theme') || 'light';
  });

  const handleSavePreferences = () => {
    // Salvar preferências isoladas por tenant
    tenantStorage.set('theme', theme);
    tenantStorage.set('preferences', {
      theme,
      notifications: true,
      language: 'pt-BR'
    });
    
    alert('Preferências salvas!');
  };

  return (
    <div>
      <h2>Preferências</h2>
      
      <select value={theme} onChange={(e) => setTheme(e.target.value)}>
        <option value="light">Claro</option>
        <option value="dark">Escuro</option>
      </select>
      
      <button onClick={handleSavePreferences}>
        Salvar
      </button>
    </div>
  );
};
