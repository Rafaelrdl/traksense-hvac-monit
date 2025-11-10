import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { tenantAuthService } from '@/services/tenantAuthService';
import { authService } from '@/services/auth.service'; // TODO: Migrar register, getProfile, updateProfile, uploadAvatar, removeAvatar para tenantAuthService
import { tenantStorage } from '@/lib/tenantStorage';
import { getTenantConfig } from '@/lib/tenant';

export interface User {
  id: string;
  username?: string;
  email: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  initials?: string;
  name: string; // Legacy field for compatibility
  role: 'admin' | 'operator' | 'viewer' | 'owner';
  site?: string; // Legacy field
  avatar?: string | null; // Backend field
  photoUrl?: string; // Legacy frontend field
  phone?: string | null;
  bio?: string | null;
  timezone?: string;
  time_format?: '12h' | '24h'; // Formato de hora: 12h (AM/PM) ou 24h
  email_verified?: boolean;
  is_active?: boolean;
  is_staff?: boolean;
  date_joined?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  register: (data: {
    username: string;
    email: string;
    password: string;
    password_confirm: string;
    first_name: string;
    last_name: string;
  }) => Promise<boolean>;
  getProfile: () => Promise<void>;
  updateUserProfile: (updates: Partial<User>) => Promise<void>;
  uploadAvatar: (file: File) => Promise<void>;
  removeAvatar: () => Promise<void>;
  clearError: () => void;
}

// Demo users for testing (mantido para fallback)
const DEMO_USERS: Record<string, { password: string; user: User }> = {
  'admin@umc.com': {
    password: 'admin123',
    user: {
      id: '1',
      email: 'admin@umc.com',
      name: 'Admin UMC',
      role: 'owner',
      site: 'UMC Hospital'
    }
  },
  'gerente@umc.com': {
    password: 'senha123',
    user: {
      id: '4',
      email: 'gerente@umc.com',
      name: 'Carlos Gerente',
      role: 'admin',
      site: 'UMC Hospital'
    }
  },
  'operador@umc.com': {
    password: 'senha123',
    user: {
      id: '5',
      email: 'operador@umc.com',
      name: 'João Silva',
      role: 'operator',
      site: 'UMC Hospital'
    }
  },
  'visualizador@umc.com': {
    password: 'senha123',
    user: {
      id: '6',
      email: 'visualizador@umc.com',
      name: 'Maria Santos',
      role: 'viewer',
      site: 'UMC Hospital'
    }
  }
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });

        try {
          const response = await tenantAuthService.login({
            username_or_email: email,
            password,
          });

          // Mapear resposta do backend para formato do store
          const backendUser = response.user as any;
          const user: User = {
            id: String(backendUser.id),
            username: backendUser.username,
            email: backendUser.email,
            first_name: backendUser.first_name,
            last_name: backendUser.last_name,
            full_name: backendUser.full_name,
            initials: backendUser.initials,
            name: backendUser.full_name || backendUser.username, // Compatibility
            role: backendUser.role || 'viewer',
            avatar: backendUser.avatar,
            phone: backendUser.phone,
            bio: backendUser.bio,
            timezone: backendUser.timezone,
            time_format: backendUser.time_format,
            email_verified: backendUser.email_verified,
            is_active: backendUser.is_active,
            is_staff: backendUser.is_staff,
            date_joined: backendUser.date_joined,
          };

          set({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          return true;
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.message || 'Erro ao fazer login',
          });
          return false;
        }
      },

      logout: async () => {
        set({ isLoading: true });

        try {
          await tenantAuthService.logout();
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        }
      },

      register: async (data) => {
        set({ isLoading: true, error: null });

        try {
          // TODO: Migrar para tenantAuthService.register quando disponível
          const user = await authService.register(data);

          set({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          return true;
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.message || 'Erro ao registrar usuário',
          });
          return false;
        }
      },

      getProfile: async () => {
        set({ isLoading: true });

        try {
          // TODO: Migrar para tenantAuthService.getProfile quando disponível
          const user = await authService.getProfile();
          
          set({
            user,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error: any) {
          console.error('Get profile error:', error);
          set({ isLoading: false });
        }
      },

      updateUserProfile: async (updates: Partial<User>) => {
        set({ isLoading: true, error: null });

        try {
          // Converte campos do frontend para backend se necessário
          const backendUpdates: any = { ...updates };
          
          // Se enviou 'name', quebra em first_name e last_name
          if (updates.name) {
            const [firstName, ...lastNameParts] = updates.name.split(' ');
            backendUpdates.first_name = firstName;
            backendUpdates.last_name = lastNameParts.join(' ');
            delete backendUpdates.name;
          }
          
          // Remove campos que não devem ser enviados
          delete backendUpdates.photoUrl; // Backend usa 'avatar'
          delete backendUpdates.site; // Campo legacy
          delete backendUpdates.role; // Não atualizado via profile
          delete backendUpdates.id;
          delete backendUpdates.full_name;
          delete backendUpdates.initials;
          delete backendUpdates.username;
          
          const updatedUser = await authService.updateProfile(backendUpdates);

          set({
            user: updatedUser,
            isLoading: false,
          });
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.message || 'Erro ao atualizar perfil',
          });
          throw error;
        }
      },

      uploadAvatar: async (file: File) => {
        set({ isLoading: true, error: null });

        try {
          const avatarUrl = await authService.uploadAvatar(file);

          const currentUser = get().user;
          if (currentUser) {
            set({
              user: {
                ...currentUser,
                avatar: avatarUrl,
                photoUrl: avatarUrl, // Maintain legacy field compatibility
              },
              isLoading: false,
            });
          }
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.message || 'Erro ao fazer upload do avatar',
          });
          throw error;
        }
      },

      removeAvatar: async () => {
        set({ isLoading: true, error: null });

        try {
          await authService.removeAvatar();

          const currentUser = get().user;
          if (currentUser) {
            set({
              user: {
                ...currentUser,
                avatar: null,
                photoUrl: undefined, // Maintain legacy field compatibility
              },
              isLoading: false,
            });
          }
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.message || 'Erro ao remover avatar',
          });
          throw error;
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: (() => {
        // Namespace por tenant para isolar autenticação
        const tenant = getTenantConfig();
        return `ts:auth:${tenant.tenantSlug || 'default'}`;
      })(),
      storage: createJSONStorage(() => ({
        getItem: (name) => {
          const value = tenantStorage.get(name);
          return value !== null ? JSON.stringify(value) : null;
        },
        setItem: (name, value) => {
          tenantStorage.set(name, JSON.parse(value));
        },
        removeItem: (name) => {
          tenantStorage.remove(name);
        },
      })),
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated 
      }),
      // Remover onRehydrateStorage que vazava PII via console.log
    }
  )
);

// Get demo users list (for login hints)
export const getDemoUsers = () => {
  return Object.entries(DEMO_USERS).map(([email, { user }]) => ({
    email,
    name: user.name,
    role: user.role,
    site: user.site
  }));
};