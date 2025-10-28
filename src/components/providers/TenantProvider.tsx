/**
 * Tenant Provider Component
 * 
 * Componente wrapper que:
 * - Aplica branding do tenant (cores, logo, favicon)
 * - Fornece contexto de tenant para toda aplicação
 * - Atualiza título da página
 */

import React, { useEffect } from 'react';
import { useTenantBranding, useTenantConfig } from '@/hooks/useTenantBranding';

interface TenantProviderProps {
  children: React.ReactNode;
}

export const TenantProvider: React.FC<TenantProviderProps> = ({ children }) => {
  const branding = useTenantBranding();
  const config = useTenantConfig();

  useEffect(() => {
    console.log(`🏢 Tenant ativo: ${config.tenantName} (${config.tenantSlug})`);
    console.log(`🎨 Branding:`, branding);
    
    // Aplicar cores CSS custom properties
    if (branding.primaryColor) {
      document.documentElement.style.setProperty('--tenant-primary', branding.primaryColor);
    }
    
    if (branding.secondaryColor) {
      document.documentElement.style.setProperty('--tenant-secondary', branding.secondaryColor);
    }
    
    // Aplicar favicon
    if (branding.favicon) {
      let link = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
      
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      
      link.href = branding.favicon;
    }
    
    // Aplicar título da página
    if (branding.name) {
      document.title = `${branding.name} | TrakSense`;
    }
    
    // Adicionar atributo data-tenant ao HTML para CSS customizado
    document.documentElement.setAttribute('data-tenant', config.tenantSlug);
    
  }, [branding, config]);

  return <>{children}</>;
};
