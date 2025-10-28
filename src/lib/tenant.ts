/**
 * Tenant Management System
 * 
 * Gerencia a identificação e configuração de tenants no frontend.
 * Suporta múltiplas fontes de identificação:
 * 1. Token JWT (após login)
 * 2. Hostname (nginx multi-domain)
 * 3. Fallback para configuração padrão
 */

export interface TenantConfig {
  tenantId: string;
  tenantSlug: string;
  tenantName: string;
  apiBaseUrl: string;
  branding?: TenantBranding;
}

export interface TenantBranding {
  logo?: string;
  primaryColor: string;
  secondaryColor?: string;
  name: string;
  shortName?: string;
  favicon?: string;
}

/**
 * Decodifica JWT sem validação (apenas leitura do payload)
 */
const decodeJWT = (token: string): any => {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
  } catch (error) {
    console.error('❌ Erro ao decodificar JWT:', error);
    return null;
  }
};

/**
 * Extrai tenant do hostname
 * Suporta formatos:
 * - umc.localhost:5173 → "umc"
 * - acme.traksense.com → "acme"
 * - localhost:5173 → null
 */
const getTenantFromHostname = (): string | null => {
  const hostname = window.location.hostname;
  
  // Ignorar localhost simples
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return null;
  }
  
  // Extrair primeiro segmento do domínio
  const parts = hostname.split('.');
  if (parts.length > 1) {
    return parts[0];
  }
  
  return null;
};

/**
 * Branding padrão para tenants conhecidos
 */
const TENANT_BRANDINGS: Record<string, TenantBranding> = {
  umc: {
    name: 'Uberlândia Medical Center',
    shortName: 'UMC',
    primaryColor: '#0A5F7F',
    secondaryColor: '#0EA5E9',
    logo: '/logos/umc.svg',
    favicon: '/favicons/umc.ico',
  },
  acme: {
    name: 'ACME Corporation',
    shortName: 'ACME',
    primaryColor: '#FF6B00',
    secondaryColor: '#F97316',
    logo: '/logos/acme.svg',
    favicon: '/favicons/acme.ico',
  },
  default: {
    name: 'TrakSense',
    shortName: 'TrakSense',
    primaryColor: '#0A5F7F',
    secondaryColor: '#0EA5E9',
    logo: '/logo.svg',
    favicon: '/favicon.ico',
  },
};

/**
 * Obtém configuração do tenant atual
 * 
 * Prioridade de detecção:
 * 1. Token JWT (mais confiável, pós-login)
 * 2. Hostname (nginx multi-domain)
 * 3. localStorage (tenant anterior)
 * 4. Fallback para default
 */
export const getTenantConfig = (): TenantConfig => {
  // 1. Tentar ler do token JWT (mais confiável)
  const token = localStorage.getItem('access_token');
  if (token) {
    const payload = decodeJWT(token);
    if (payload?.tenant_id) {
      const tenantSlug = payload.tenant_slug || payload.tenant_id;
      return {
        tenantId: payload.tenant_id,
        tenantSlug,
        tenantName: payload.tenant_name || tenantSlug.toUpperCase(),
        apiBaseUrl: `http://${tenantSlug}.localhost:8000/api`,
        branding: TENANT_BRANDINGS[tenantSlug] || TENANT_BRANDINGS.default,
      };
    }
  }
  
  // 2. Tentar ler do hostname
  const hostnameTenant = getTenantFromHostname();
  if (hostnameTenant) {
    return {
      tenantId: hostnameTenant,
      tenantSlug: hostnameTenant,
      tenantName: hostnameTenant.toUpperCase(),
      apiBaseUrl: `http://${hostnameTenant}.localhost:8000/api`,
      branding: TENANT_BRANDINGS[hostnameTenant] || TENANT_BRANDINGS.default,
    };
  }
  
  // 3. Tentar ler tenant salvo anteriormente
  const savedTenant = localStorage.getItem('current_tenant');
  if (savedTenant) {
    try {
      const parsed = JSON.parse(savedTenant);
      return {
        tenantId: parsed.tenantId,
        tenantSlug: parsed.tenantSlug,
        tenantName: parsed.tenantName,
        apiBaseUrl: parsed.apiBaseUrl,
        branding: TENANT_BRANDINGS[parsed.tenantSlug] || TENANT_BRANDINGS.default,
      };
    } catch {
      // Ignorar erro de parse
    }
  }
  
  // 4. Fallback para configuração padrão
  const defaultUrl = import.meta.env.VITE_API_URL || 'http://umc.localhost:8000/api';
  return {
    tenantId: 'default',
    tenantSlug: 'umc',
    tenantName: 'TrakSense',
    apiBaseUrl: defaultUrl,
    branding: TENANT_BRANDINGS.default,
  };
};

/**
 * Define o tenant atual
 * Salva no localStorage para persistência
 */
export const setCurrentTenant = (config: TenantConfig): void => {
  localStorage.setItem('current_tenant', JSON.stringify({
    tenantId: config.tenantId,
    tenantSlug: config.tenantSlug,
    tenantName: config.tenantName,
    apiBaseUrl: config.apiBaseUrl,
  }));
  
  console.log(`🏢 Tenant atual definido: ${config.tenantName} (${config.tenantSlug})`);
};

/**
 * Limpa configuração de tenant
 * Usado no logout
 */
export const clearTenantConfig = (): void => {
  localStorage.removeItem('current_tenant');
  console.log('🗑️ Configuração de tenant limpa');
};

/**
 * Verifica se está em modo multi-domain
 * (hostname contém tenant)
 */
export const isMultiDomainMode = (): boolean => {
  return getTenantFromHostname() !== null;
};

/**
 * Obtém URL da API para o tenant atual
 */
export const getTenantApiUrl = (): string => {
  return getTenantConfig().apiBaseUrl;
};

/**
 * Obtém branding do tenant atual
 */
export const getTenantBranding = (): TenantBranding => {
  const config = getTenantConfig();
  return config.branding || TENANT_BRANDINGS.default;
};
