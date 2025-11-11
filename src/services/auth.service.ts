/**
 * Authentication Service
 * 
 * Gerencia todas as operações de autenticação com o backend:
 * - Login/Logout
 * - Registro
 * - Refresh de tokens
 * - Gerenciamento de perfil
 * - Upload de avatar
 */

import api, { clearTokens, createFormDataConfig } from '@/lib/api';
import type { User } from '@/store/auth';

/**
 * DTOs (Data Transfer Objects)
 */
export interface LoginCredentials {
  username_or_email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  password_confirm: string;
  first_name: string;
  last_name: string;
}

export interface UserProfileUpdate {
  first_name?: string;
  last_name?: string;
  phone?: string;
  bio?: string;
  timezone?: string;
  time_format?: '12h' | '24h';
}

export interface ChangePasswordData {
  old_password: string;
  new_password: string;
  new_password_confirm: string;
}

/**
 * Response types from backend
 */
export interface AuthResponse {
  user: BackendUser;
  access: string;
  refresh: string;
  message: string;
  tenant?: {
    slug: string;
    domain: string;
    api_base_url: string;
  };
}

export interface BackendUser {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  initials: string;
  avatar: string | null;
  phone: string | null;
  bio: string | null;
  timezone: string;
  time_format: '12h' | '24h';
  email_verified: boolean;
  is_active: boolean;
  is_staff: boolean;
  role: string;  // Role from TenantMembership
  site: string;  // Tenant name
  date_joined: string;
  last_login: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Converte BackendUser para User (formato do frontend)
 */
const mapBackendUserToUser = (backendUser: BackendUser): User => {
  // 🔒 SECURITY FIX #15: Remove PII logging in production
  // Only log in development mode to prevent exposing names, emails, roles in production logs
  if (import.meta.env.DEV) {
    console.log('🔄 mapBackendUserToUser - Input:', backendUser);
    console.log('🕐 mapBackendUserToUser - time_format recebido:', backendUser.time_format);
    console.log('👤 mapBackendUserToUser - role recebido:', backendUser.role);
    console.log('🏢 mapBackendUserToUser - site recebido:', backendUser.site);
  }
  
  const mappedUser: User = {
    id: backendUser.id.toString(),
    email: backendUser.email,
    name: backendUser.full_name || backendUser.username,
    role: backendUser.role as 'admin' | 'operator' | 'viewer' | 'owner', // Use role from backend (TenantMembership)
    site: backendUser.site || undefined, // Use site from backend (Tenant name)
    photoUrl: backendUser.avatar || undefined,
    phone: backendUser.phone || undefined,
    // Preferências
    timezone: backendUser.timezone || 'America/Sao_Paulo',
    time_format: backendUser.time_format || '24h',
    // Outros campos do perfil
    bio: backendUser.bio || undefined,
    first_name: backendUser.first_name || undefined,
    last_name: backendUser.last_name || undefined,
    full_name: backendUser.full_name || undefined,
    initials: backendUser.initials || undefined,
    email_verified: backendUser.email_verified,
    is_active: backendUser.is_active,
    is_staff: backendUser.is_staff,
    date_joined: backendUser.date_joined,
  };
  
  if (import.meta.env.DEV) {
    console.log('✅ mapBackendUserToUser - Output:', mappedUser);
    console.log('🕐 mapBackendUserToUser - time_format mapeado:', mappedUser.time_format);
  }
  
  return mappedUser;
};

/**
 * Auth Service Class
 */
class AuthService {
  /**
   * Login do usuário
   */
  async login(credentials: LoginCredentials): Promise<User> {
    try {
      const { data } = await api.post<AuthResponse>('/auth/login/', credentials);

      // Salva tokens no localStorage
      localStorage.setItem('access_token', data.access);
      localStorage.setItem('refresh_token', data.refresh);

      // 🆕 Configurar tenant se retornado pelo backend
      if (data.tenant) {
        const { slug, api_base_url } = data.tenant;
        console.log(`✅ Login com tenant: ${slug} (API: ${api_base_url})`);
        
        // Importar dinamicamente para evitar circular dependency
        const { reconfigureApiForTenant } = await import('@/lib/api');
        const { tenantStorage } = await import('@/lib/tenantStorage');
        
        // Reconfigurar API client com a URL fornecida pelo backend (não localhost fixo)
        reconfigureApiForTenant(api_base_url);
        
        // Salvar tenant info no storage isolado
        tenantStorage.set('tenant_info', {
          slug,
          domain: data.tenant.domain,
          api_base_url,
        });
        
        // Salvar tokens também no tenant storage
        tenantStorage.set('access_token', data.access);
        tenantStorage.set('refresh_token', data.refresh);
      }

      // Retorna usuário no formato do frontend
      return mapBackendUserToUser(data.user);
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(
        error.response?.data?.username_or_email?.[0] ||
        error.response?.data?.detail ||
        'Falha no login. Verifique suas credenciais.'
      );
    }
  }

  /**
   * Registro de novo usuário
   * 🔒 FIX #11: Migrated to tenantAuthService for proper multi-tenant support
   * @deprecated Use tenantAuthService.register() instead
   */
  async register(data: RegisterData): Promise<User> {
    try {
      const { data: response } = await api.post<AuthResponse>('/auth/register/', data);

      // 🔒 FIX #11: Use tenantStorage instead of localStorage for tenant isolation
      // Extract tenant info from JWT response
      const tenantConfig = {
        tenantId: response.tenant?.slug || 'default',
        tenantSlug: response.tenant?.slug || 'umc',
        tenantName: response.user.site || 'TrakSense',
        apiBaseUrl: response.tenant?.api_base_url || api.defaults.baseURL || 'http://umc.localhost:8000/api',
      };

      // Import tenantStorage dynamically to avoid circular dependency
      const { tenantStorage } = await import('@/lib/tenantStorage');
      const { reconfigureApiForTenant } = await import('@/lib/api');

      // Save tokens to tenant-isolated storage
      tenantStorage.set('access_token', response.access);
      tenantStorage.set('refresh_token', response.refresh);
      tenantStorage.set('tenant_config', tenantConfig);

      // Reconfigure API base URL for the registered tenant
      reconfigureApiForTenant(tenantConfig.tenantSlug);

      // Retorna usuário no formato do frontend
      return mapBackendUserToUser(response.user);
    } catch (error: any) {
      console.error('Register error:', error);
      
      // Extrai mensagens de erro específicas
      const errors = error.response?.data;
      if (errors) {
        const firstError = Object.values(errors)[0];
        throw new Error(Array.isArray(firstError) ? firstError[0] : firstError as string);
      }
      
      throw new Error('Falha no registro. Tente novamente.');
    }
  }

  /**
   * Logout do usuário
   */
  async logout(): Promise<void> {
    try {
      // Importar tenant storage
      const { tenantStorage } = await import('@/lib/tenantStorage');
      const refreshToken = tenantStorage.get<string>('refresh_token') || 
                          localStorage.getItem('refresh_token');
      
      await api.post('/auth/logout/', {
        refresh_token: refreshToken,
      });
    } catch (error) {
      console.error('Logout error:', error);
      // Continua mesmo com erro no backend
    } finally {
      // Sempre limpa tokens locais
      clearTokens();
    }
  }

  /**
   * Obtém perfil do usuário atual
   */
  async getProfile(): Promise<User> {
    try {
      const { data } = await api.get<BackendUser>('/users/me/');
      return mapBackendUserToUser(data);
    } catch (error) {
      console.error('Get profile error:', error);
      throw new Error('Erro ao carregar perfil do usuário.');
    }
  }

  /**
   * Atualiza perfil do usuário
   */
  async updateProfile(updates: UserProfileUpdate): Promise<User> {
    try {
      const { data } = await api.patch<{ user: BackendUser; message: string }>(
        '/users/me/',
        updates
      );
      
      console.log('updateProfile response:', data); // Debug
      
      // Backend retorna { user: {...}, message: '...' }
      return mapBackendUserToUser(data.user);
    } catch (error: any) {
      console.error('Update profile error:', error);
      console.error('Response data:', error.response?.data); // Debug
      throw new Error(
        error.response?.data?.detail ||
        'Erro ao atualizar perfil.'
      );
    }
  }

  /**
   * Upload de avatar
   */
  async uploadAvatar(file: File): Promise<string> {
    try {
      // Valida tipo de arquivo
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Tipo de arquivo não permitido. Use JPG, PNG, GIF ou WebP.');
      }

      // Valida tamanho (5MB)
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        throw new Error('Arquivo muito grande. Tamanho máximo: 5MB.');
      }

      const formData = new FormData();
      formData.append('avatar', file);

      const { data } = await api.post<{ avatar: string; message: string }>(
        '/users/me/avatar/',
        formData,
        createFormDataConfig()
      );

      return data.avatar;
    } catch (error: any) {
      console.error('Upload avatar error:', error);
      throw new Error(
        error.response?.data?.error ||
        error.message ||
        'Erro ao fazer upload do avatar.'
      );
    }
  }

  /**
   * Remove avatar
   */
  async removeAvatar(): Promise<void> {
    try {
      await api.delete('/users/me/avatar/');
    } catch (error) {
      console.error('Remove avatar error:', error);
      throw new Error('Erro ao remover avatar.');
    }
  }

  /**
   * Altera senha do usuário
   */
  async changePassword(data: ChangePasswordData): Promise<void> {
    try {
      await api.post('/users/me/change-password/', data);
    } catch (error: any) {
      console.error('Change password error:', error);
      
      const errors = error.response?.data;
      if (errors) {
        const firstError = Object.values(errors)[0];
        throw new Error(Array.isArray(firstError) ? firstError[0] : firstError as string);
      }
      
      throw new Error('Erro ao alterar senha.');
    }
  }

  /**
   * Verifica se o usuário está autenticado
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem('access_token');
  }

  /**
   * Refresh manual do token (geralmente feito automaticamente pelo interceptor)
   */
  async refreshToken(): Promise<void> {
    // Importar tenant storage
    const { tenantStorage } = await import('@/lib/tenantStorage');
    const refreshToken = tenantStorage.get<string>('refresh_token') || 
                        localStorage.getItem('refresh_token');
    
    if (!refreshToken) {
      throw new Error('Nenhum refresh token disponível.');
    }

    try {
      const { data } = await api.post<{ access: string; refresh?: string }>(
        '/auth/token/refresh/',
        { refresh: refreshToken }
      );

      // Salvar em tenantStorage primeiro
      tenantStorage.set('access_token', data.access);
      localStorage.setItem('access_token', data.access);
      
      if (data.refresh) {
        tenantStorage.set('refresh_token', data.refresh);
        localStorage.setItem('refresh_token', data.refresh);
      }
    } catch (error) {
      console.error('Refresh token error:', error);
      clearTokens();
      throw new Error('Sessão expirada. Faça login novamente.');
    }
  }
}

// Export singleton instance
export const authService = new AuthService();
export default authService;
