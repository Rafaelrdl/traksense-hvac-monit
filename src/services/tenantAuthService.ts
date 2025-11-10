/**
 * Tenant-Aware Authentication Service
 * 
 * Gerencia autenticação com suporte a multi-tenancy:
 * - Detecta tenant do usuário após login
 * - Reconfigura API para o tenant correto
 * - Isola tokens por tenant
 * - Aplica branding do tenant
 */

import { api, reconfigureApiForTenant } from '@/lib/api';
import { tenantStorage } from '@/lib/tenantStorage';
import { setCurrentTenant, getTenantConfig } from '@/lib/tenant';

interface LoginCredentials {
  username_or_email: string;
  password: string;
}

interface LoginResponse {
  access: string;
  refresh: string;
  user: {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    full_name: string;
    // ... outros campos
  };
  tenant?: {
    slug: string;
    domain: string;
    api_base_url: string;
  };
  message: string;
}

interface JWTPayload {
  token_type: string;
  exp: number;
  iat: number;
  jti: string;
  user_id: number;
  // Campos de tenant (se existirem no JWT)
  tenant_id?: string;
  tenant_slug?: string;
  tenant_name?: string;
}

/**
 * Decodifica JWT payload
 */
const decodeJWT = (token: string): JWTPayload | null => {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
  } catch (error) {
    console.error('❌ Erro ao decodificar JWT:', error);
    return null;
  }
};

/**
 * Extrai informações de tenant do JWT
 */
const extractTenantFromToken = (token: string): { 
  tenantId: string; 
  tenantSlug: string; 
  tenantName: string;
  api_base_url?: string;  // 🆕 Campo opcional
} | null => {
  const payload = decodeJWT(token);
  
  if (!payload) {
    return null;
  }
  
  // Se o JWT contém informações de tenant explicitamente
  if (payload.tenant_id && payload.tenant_slug) {
    return {
      tenantId: payload.tenant_id,
      tenantSlug: payload.tenant_slug,
      tenantName: payload.tenant_name || payload.tenant_slug.toUpperCase(),
    };
  }
  
  // Fallback: extrair do baseURL da API atual
  const currentConfig = getTenantConfig();
  return {
    tenantId: currentConfig.tenantId,
    tenantSlug: currentConfig.tenantSlug,
    tenantName: currentConfig.tenantName,
  };
};

/**
 * Serviço de autenticação com tenant awareness
 */
export const tenantAuthService = {
  /**
   * Realiza login e configura tenant automaticamente
   */
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      console.log('🔐 Iniciando login...');
      
      // 1. Fazer login na API
      const response = await api.post<LoginResponse>('/auth/login/', credentials);
      const { access, refresh, user, tenant, message } = response.data;
      
      console.log('✅ Login bem-sucedido:', user.username);
      
      // 2. Extrair informações de tenant do JWT OU do response.tenant
      let tenantInfo = extractTenantFromToken(access);
      
      // 🆕 Preferir tenant do response (mais completo e confiável)
      if (tenant) {
        tenantInfo = {
          tenantId: tenantInfo?.tenantId || '',
          tenantSlug: tenant.slug,
          tenantName: tenantInfo?.tenantName || tenant.slug,
          api_base_url: tenant.api_base_url
        };
      }
      
      if (tenantInfo) {
        console.log(`🏢 Tenant detectado: ${tenantInfo.tenantName} (${tenantInfo.tenantSlug})`);
        
        // 3. Reconfigurar API para o tenant do usuário
        // 🆕 Usar api_base_url fornecida pelo backend (não localhost hard-coded)
        const apiBaseUrl = tenantInfo.api_base_url || 
                          `http://${tenantInfo.tenantSlug}.localhost:8000/api`;
        
        reconfigureApiForTenant(apiBaseUrl);
        
        // 4. Salvar configuração de tenant com URL real do backend
        setCurrentTenant({
          tenantId: tenantInfo.tenantId,
          tenantSlug: tenantInfo.tenantSlug,
          tenantName: tenantInfo.tenantName,
          apiBaseUrl: apiBaseUrl,  // 🆕 URL real, não localhost
        });
        
        // 🆕 Persistir api_base_url para uso futuro
        tenantStorage.set('api_base_url', apiBaseUrl);
      }
      
      // 5. Salvar tokens no tenant storage (isolado)
      tenantStorage.set('access_token', access);
      tenantStorage.set('refresh_token', refresh);
      tenantStorage.set('user', user);
      
      // 6. Fallback para localStorage global (compatibilidade)
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      localStorage.setItem('user', JSON.stringify(user));
      
      console.log('💾 Tokens salvos com sucesso');
      
      return response.data;
    } catch (error: any) {
      console.error('❌ Erro no login:', error);
      throw error;
    }
  },

  /**
   * Realiza logout e limpa dados do tenant
   */
  async logout(): Promise<void> {
    try {
      console.log('🚪 Realizando logout...');
      
      // 1. Tentar invalidar token no backend (se endpoint existir)
      try {
        await api.post('/auth/logout/');
      } catch {
        // Ignorar erro - endpoint pode não existir
      }
      
      // 2. Limpar tenant storage
      tenantStorage.clear();
      
      // 3. Limpar localStorage global
      localStorage.clear();
      
      console.log('✅ Logout realizado com sucesso');
    } catch (error) {
      console.error('❌ Erro no logout:', error);
      // Limpar mesmo com erro
      tenantStorage.clear();
      localStorage.clear();
    }
  },

  /**
   * Verifica se usuário está autenticado
   */
  isAuthenticated(): boolean {
    const token = tenantStorage.get<string>('access_token') || localStorage.getItem('access_token');
    
    if (!token) {
      return false;
    }
    
    // Verificar se token está expirado
    const payload = decodeJWT(token);
    if (!payload) {
      return false;
    }
    
    const now = Math.floor(Date.now() / 1000);
    const isExpired = payload.exp < now;
    
    if (isExpired) {
      console.log('⚠️ Token expirado');
      return false;
    }
    
    return true;
  },

  /**
   * Obtém usuário atual do storage
   */
  getCurrentUser(): LoginResponse['user'] | null {
    return tenantStorage.get('user') || 
           (localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null);
  },

  /**
   * Obtém access token atual
   */
  getAccessToken(): string | null {
    return tenantStorage.get<string>('access_token') || localStorage.getItem('access_token');
  },

  /**
   * Obtém refresh token atual
   */
  getRefreshToken(): string | null {
    return tenantStorage.get<string>('refresh_token') || localStorage.getItem('refresh_token');
  },
};
