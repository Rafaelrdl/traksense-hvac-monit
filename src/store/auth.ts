import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService } from '@/services/auth.service';

export interface User {
  id: string;
  username?: string;
  email: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  initials?: string;
  name: string; // Legacy field for compatibility
  role: 'admin' | 'operator' | 'viewer';
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
  'admin@traksense.com': {
    password: 'admin123',
    user: {
      id: '1',
      email: 'admin@traksense.com',
      name: 'Admin TrakSense',
      role: 'admin',
      site: 'OncoCentro'
    }
  },
  'viewer@traksense.com': {
    password: 'viewer123',
    user: {
      id: '2',
      email: 'viewer@traksense.com',
      name: 'Visualizador',
      role: 'viewer',
      site: 'Fábrica Industrial'
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
          const user = await authService.login({
            username_or_email: email,
            password,
          });

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
          await authService.logout();
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
          console.log('🔄 Store: Atualizando perfil com:', updates); // Debug
          
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
          
          console.log('📤 Store: Enviando para backend:', backendUpdates); // Debug
          
          const updatedUser = await authService.updateProfile(backendUpdates);

          console.log('✅ Store: Usuário atualizado:', updatedUser); // Debug
          console.log('� Store: time_format na resposta =', updatedUser?.time_format); // Debug
          console.log('�💾 Store: Salvando no state...'); // Debug

          set({
            user: updatedUser,
            isLoading: false,
          });

          console.log('💾 Store: State atualizado!'); // Debug
          console.log('🔍 Store: Verificando localStorage...'); // Debug
          
          // Verificar o que foi salvo no localStorage
          const savedData = localStorage.getItem('ts:auth');
          console.log('💾 localStorage ts:auth =', savedData); // Debug
          
          if (savedData) {
            const parsed = JSON.parse(savedData);
            console.log('⏰ localStorage user.timezone =', parsed?.state?.user?.timezone); // Debug
            console.log('🕐 localStorage user.time_format =', parsed?.state?.user?.time_format); // Debug
          }
        } catch (error: any) {
          console.error('❌ Store: Erro ao atualizar:', error); // Debug
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
      name: 'ts:auth', // Key para localStorage via persist middleware
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated 
      })
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