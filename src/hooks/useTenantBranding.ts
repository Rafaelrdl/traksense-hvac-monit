/**
 * Tenant Branding Hook
 * 
 * React hook para acessar configurações de branding do tenant atual.
 * Permite customização visual por tenant (logo, cores, nome, etc).
 */

import { useMemo } from 'react';
import { getTenantBranding, getTenantConfig, type TenantBranding, type TenantConfig } from '@/lib/tenant';

/**
 * Hook para acessar branding do tenant atual
 */
export const useTenantBranding = (): TenantBranding => {
  return useMemo(() => getTenantBranding(), []);
};

/**
 * Hook para acessar configuração completa do tenant
 */
export const useTenantConfig = (): TenantConfig => {
  return useMemo(() => getTenantConfig(), []);
};

/**
 * Hook para aplicar cores do tenant no documento
 * Injeta CSS custom properties baseado nas cores do tenant
 */
export const useTenantTheme = (): void => {
  const branding = useTenantBranding();
  
  useMemo(() => {
    // Aplicar cores CSS custom properties
    if (branding.primaryColor) {
      document.documentElement.style.setProperty('--tenant-primary', branding.primaryColor);
    }
    
    if (branding.secondaryColor) {
      document.documentElement.style.setProperty('--tenant-secondary', branding.secondaryColor);
    }
    
    // Aplicar favicon
    if (branding.favicon) {
      const link = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
      if (link) {
        link.href = branding.favicon;
      }
    }
    
    // Aplicar título
    if (branding.name) {
      document.title = `${branding.name} | TrakSense`;
    }
  }, [branding]);
};
