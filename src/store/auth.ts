import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'operator' | 'viewer';
  site?: string;
  photoUrl?: string; // Base64 data URL ou URL externa
  phone?: string;
  // tenant removido - mantido apenas por compatibilidade histórica interna
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
  updateUserProfile: (updates: Partial<User>) => void;
}

// Demo users for testing
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

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        const demoUser = DEMO_USERS[email.toLowerCase()];
        
        if (!demoUser || demoUser.password !== password) {
          set({ 
            isLoading: false, 
            error: 'Email ou senha inválidos' 
          });
          return false;
        }

        set({
          user: demoUser.user,
          isAuthenticated: true,
          isLoading: false,
          error: null
        });

        return true;
      },

      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
          error: null
        });
      },

      clearError: () => set({ error: null }),

      updateUserProfile: (updates: Partial<User>) => {
        const currentUser = get().user;
        if (!currentUser) return;
        
        set({
          user: {
            ...currentUser,
            ...updates
          }
        });
      }
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