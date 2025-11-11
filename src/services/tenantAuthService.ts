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
import { tenantStorage, updateTenantSlugCache } from '@/lib/tenantStorage';
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
 * Decodifica JWT payload (suporta base64url)
 */
const decodeJWT = (token: string): JWTPayload | null => {
  try {
    const payload = token.split('.')[1];
    // 🆕 Normalizar base64url para base64 (RFC 4648 §5)
    const normalizedPayload = payload.replace(/-/g, '+').replace(/_/g, '/');
    const paddedPayload = normalizedPayload + '='.repeat((4 - normalizedPayload.length % 4) % 4);
    return JSON.parse(atob(paddedPayload));
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
      if (import.meta.env.DEV) {
        console.log('🔐 Iniciando login...');
      }
      
      // 1. Fazer login na API
      const response = await api.post<LoginResponse>('/auth/login/', credentials);
      const { access, refresh, user, tenant, message } = response.data;
      
      if (import.meta.env.DEV) {
        console.log('✅ Login bem-sucedido:', user.username);
      }
      
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
        if (import.meta.env.DEV) {
          console.log(`🏢 Tenant detectado: ${tenantInfo.tenantName} (${tenantInfo.tenantSlug})`);
        }
        
        // 🆕 Atualizar cache do tenantStorage ANTES de qualquer operação
        updateTenantSlugCache(tenantInfo.tenantSlug);
        
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
        
        // 5. 🔧 FIX: Save minimal data in tenantStorage (tokens are in HttpOnly cookies)
        // Only save non-sensitive user info and tenant config for UI purposes
        tenantStorage.set('user', user);
        tenantStorage.set('api_base_url', apiBaseUrl);
      }
      
      // 🔐 SECURITY: Do NOT duplicate tokens in localStorage/tenantStorage
      // Backend uses HttpOnly cookies for actual authentication
      // We only store flags/metadata for UI state management
      
      if (import.meta.env.DEV) {
        console.log('💾 User info saved (tokens in HttpOnly cookies)');
      }
      
      return response.data;
    } catch (error: any) {
      if (import.meta.env.DEV) {
        console.error('❌ Erro no login:', error);
      }
      throw error;
    }
  },

  /**
   * Realiza logout e limpa dados do tenant
   */
  async logout(): Promise<void> {
    try {
      if (import.meta.env.DEV) {
        console.log('🚪 Realizando logout...');
      }
      
      // 1. Tentar invalidar token no backend (se endpoint existir)
      try {
        await api.post('/auth/logout/');
      } catch {
        // Ignorar erro - endpoint pode não existir
      }
      
      // 2. 🔧 FIX: Use clearTokens() instead of localStorage.clear()
      // Preserve other data like consent flags, preferences, etc.
      const keysToRemove = ['access_token', 'refresh_token', 'user', 'tenant_config', 'api_base_url'];
      
      // Clear from tenantStorage
      keysToRemove.forEach(key => tenantStorage.remove(key));
      
      // Clear from localStorage (legacy support)
      keysToRemove.forEach(key => localStorage.removeItem(key));
      
      // 3. Resetar cache explicitamente
      updateTenantSlugCache(null);
      
      if (import.meta.env.DEV) {
        console.log('✅ Logout realizado com sucesso');
      }
    } catch (error) {
      console.error('❌ Erro no logout:', error);
      // Limpar mesmo com erro
      const keysToRemove = ['access_token', 'refresh_token', 'user', 'tenant_config', 'api_base_url'];
      keysToRemove.forEach(key => {
        tenantStorage.remove(key);
        localStorage.removeItem(key);
      });
      updateTenantSlugCache(null);
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

  /**
   * 🔒 FIX #14: Register - Migrated from auth.service.ts
   * Registro de novo usuário com suporte multi-tenant
   */
  async register(data: {
    username: string;
    email: string;
    password: string;
    password_confirm: string;
    first_name: string;
    last_name: string;
  }): Promise<LoginResponse['user']> {
    try {
      console.log('📝 Registrando novo usuário...');
      
      const response = await api.post<LoginResponse>('/auth/register/', data);
      
      // Extract tenant info from response
      const tenantSlug = response.data.tenant?.slug || 'umc';
      const apiBaseUrl = response.data.tenant?.api_base_url || `http://${tenantSlug}.localhost:8000/api`;
      
      // Update tenant configuration
      updateTenantSlugCache(tenantSlug);
      reconfigureApiForTenant(tenantSlug);
      
      // Save tokens to tenant-isolated storage
      tenantStorage.set('access_token', response.data.access);
      tenantStorage.set('refresh_token', response.data.refresh);
      tenantStorage.set('user', response.data.user);
      tenantStorage.set('api_base_url', apiBaseUrl);
      tenantStorage.set('tenant_config', {
        tenantId: tenantSlug,
        tenantSlug,
        tenantName: response.data.user.full_name || tenantSlug,
        apiBaseUrl,
      });
      
      // Fallback to global storage
      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
      
      console.log('✅ Registro realizado com sucesso');
      return response.data.user;
    } catch (error: any) {
      console.error('❌ Erro no registro:', error);
      
      // Extract specific error messages
      const errors = error.response?.data;
      if (errors) {
        const firstError = Object.values(errors)[0];
        throw new Error(Array.isArray(firstError) ? firstError[0] : String(firstError));
      }
      
      throw error;
    }
  },

  /**
   * 🔒 FIX #14: Profile Update - Migrated from auth.service.ts
   * Atualiza perfil do usuário
   */
  async updateProfile(data: {
    first_name?: string;
    last_name?: string;
    phone?: string;
    bio?: string;
    timezone?: string;
    time_format?: '12h' | '24h';
  }): Promise<LoginResponse['user']> {
    try {
      console.log('👤 Atualizando perfil...');
      
      const response = await api.patch<{ user: LoginResponse['user'] }>('/auth/me/', data);
      
      // Update stored user
      tenantStorage.set('user', response.data.user);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      console.log('✅ Perfil atualizado com sucesso');
      return response.data.user;
    } catch (error: any) {
      console.error('❌ Erro ao atualizar perfil:', error);
      throw error;
    }
  },

  /**
   * 🔒 FIX #14: Avatar Upload - Migrated from auth.service.ts
   * Upload de avatar do usuário
   */
  async uploadAvatar(file: File): Promise<LoginResponse['user']> {
    try {
      console.log('📸 Fazendo upload de avatar...');
      
      const formData = new FormData();
      formData.append('avatar', file);
      
      const response = await api.post<{ user: LoginResponse['user'] }>('/auth/avatar/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      // Update stored user
      tenantStorage.set('user', response.data.user);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      console.log('✅ Avatar atualizado com sucesso');
      return response.data.user;
    } catch (error: any) {
      console.error('❌ Erro ao fazer upload de avatar:', error);
      throw error;
    }
  },

  /**
   * 🔒 FIX #14: Remove Avatar - Migrated from auth.service.ts
   * Remove avatar do usuário
   */
  async removeAvatar(): Promise<LoginResponse['user']> {
    try {
      console.log('🗑️ Removendo avatar...');
      
      const response = await api.delete<{ user: LoginResponse['user'] }>('/auth/avatar/');
      
      // Update stored user
      tenantStorage.set('user', response.data.user);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      console.log('✅ Avatar removido com sucesso');
      return response.data.user;
    } catch (error: any) {
      console.error('❌ Erro ao remover avatar:', error);
      throw error;
    }
  },

  /**
   * 🔒 FIX #14: Change Password - Migrated from auth.service.ts
   * Altera senha do usuário
   */
  async changePassword(data: {
    old_password: string;
    new_password: string;
    new_password_confirm: string;
  }): Promise<void> {
    try {
      console.log('🔐 Alterando senha...');
      
      await api.post('/auth/change-password/', data);
      
      console.log('✅ Senha alterada com sucesso');
    } catch (error: any) {
      console.error('❌ Erro ao alterar senha:', error);
      
      // Extract specific error messages
      const errors = error.response?.data;
      if (errors) {
        const firstError = Object.values(errors)[0];
        throw new Error(Array.isArray(firstError) ? firstError[0] : String(firstError));
      }
      
      throw error;
    }
  },
};
