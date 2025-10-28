/**
 * Tenant Debug Panel
 * 
 * Componente de debug para visualizar estado do tenant.
 * Útil para desenvolvimento e troubleshooting.
 * 
 * REMOVER EM PRODUÇÃO!
 */

import React, { useState } from 'react';
import { useTenantConfig, useTenantBranding } from '@/hooks/useTenantBranding';
import { tenantStorage } from '@/lib/tenantStorage';
import { tenantAuthService } from '@/services/tenantAuthService';

export const TenantDebugPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const config = useTenantConfig();
  const branding = useTenantBranding();
  
  if (import.meta.env.PROD) {
    return null; // Não renderizar em produção
  }

  const storageKeys = tenantStorage.keys();
  const storageSize = tenantStorage.size();
  const isAuth = tenantAuthService.isAuthenticated();
  const user = tenantAuthService.getCurrentUser();

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-purple-600 text-white px-3 py-2 rounded-lg shadow-lg font-mono text-xs hover:bg-purple-700"
      >
        🏢 Debug
      </button>
      
      {isOpen && (
        <div className="absolute bottom-12 right-0 bg-white border-2 border-purple-600 rounded-lg shadow-2xl w-96 max-h-[600px] overflow-auto">
          <div className="bg-purple-600 text-white p-3 font-bold sticky top-0">
            🏢 Tenant Debug Panel
          </div>
          
          <div className="p-4 space-y-4">
            {/* Tenant Config */}
            <div>
              <h3 className="font-bold text-sm mb-2 text-purple-700">📋 Configuração</h3>
              <div className="bg-gray-50 p-2 rounded text-xs font-mono space-y-1">
                <div><strong>ID:</strong> {config.tenantId}</div>
                <div><strong>Slug:</strong> {config.tenantSlug}</div>
                <div><strong>Nome:</strong> {config.tenantName}</div>
                <div><strong>API:</strong> {config.apiBaseUrl}</div>
              </div>
            </div>
            
            {/* Branding */}
            <div>
              <h3 className="font-bold text-sm mb-2 text-purple-700">🎨 Branding</h3>
              <div className="bg-gray-50 p-2 rounded text-xs font-mono space-y-1">
                <div><strong>Nome:</strong> {branding.name}</div>
                <div><strong>Nome Curto:</strong> {branding.shortName}</div>
                <div className="flex items-center gap-2">
                  <strong>Cor Primária:</strong> 
                  <div 
                    className="w-4 h-4 rounded border"
                    style={{ backgroundColor: branding.primaryColor }}
                  />
                  <span>{branding.primaryColor}</span>
                </div>
                {branding.secondaryColor && (
                  <div className="flex items-center gap-2">
                    <strong>Cor Secundária:</strong> 
                    <div 
                      className="w-4 h-4 rounded border"
                      style={{ backgroundColor: branding.secondaryColor }}
                    />
                    <span>{branding.secondaryColor}</span>
                  </div>
                )}
                <div><strong>Logo:</strong> {branding.logo || 'N/A'}</div>
              </div>
            </div>
            
            {/* Auth Status */}
            <div>
              <h3 className="font-bold text-sm mb-2 text-purple-700">🔐 Autenticação</h3>
              <div className="bg-gray-50 p-2 rounded text-xs font-mono space-y-1">
                <div>
                  <strong>Status:</strong>{' '}
                  <span className={isAuth ? 'text-green-600' : 'text-red-600'}>
                    {isAuth ? '✅ Autenticado' : '❌ Não autenticado'}
                  </span>
                </div>
                {user && (
                  <>
                    <div><strong>Usuário:</strong> {user.username}</div>
                    <div><strong>Email:</strong> {user.email}</div>
                    <div><strong>Nome:</strong> {user.full_name}</div>
                  </>
                )}
              </div>
            </div>
            
            {/* Storage Info */}
            <div>
              <h3 className="font-bold text-sm mb-2 text-purple-700">💾 Storage</h3>
              <div className="bg-gray-50 p-2 rounded text-xs font-mono space-y-1">
                <div><strong>Keys:</strong> {storageKeys.length}</div>
                <div><strong>Tamanho:</strong> {(storageSize / 1024).toFixed(2)} KB</div>
                <div className="mt-2">
                  <strong>Chaves:</strong>
                  <ul className="list-disc list-inside mt-1 text-gray-600 max-h-32 overflow-auto">
                    {storageKeys.map(key => (
                      <li key={key}>{key}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
            
            {/* Actions */}
            <div>
              <h3 className="font-bold text-sm mb-2 text-purple-700">🔧 Ações</h3>
              <div className="space-y-2">
                <button
                  onClick={() => {
                    console.log('=== TENANT CONFIG ===');
                    console.log(config);
                    console.log('=== BRANDING ===');
                    console.log(branding);
                    console.log('=== STORAGE ===');
                    storageKeys.forEach(key => {
                      console.log(`${key}:`, tenantStorage.get(key));
                    });
                  }}
                  className="w-full bg-blue-500 text-white px-3 py-1 rounded text-xs hover:bg-blue-600"
                >
                  📋 Log no Console
                </button>
                
                <button
                  onClick={() => {
                    if (confirm('Limpar tenant storage?')) {
                      tenantStorage.clear();
                      alert('Storage limpo!');
                      window.location.reload();
                    }
                  }}
                  className="w-full bg-red-500 text-white px-3 py-1 rounded text-xs hover:bg-red-600"
                >
                  🗑️ Limpar Storage
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
