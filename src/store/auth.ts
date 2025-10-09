import { create } from 'zustand';

export interface User {
  id: string;
  site?: string;
}
interface AuthState {
  isAuthenticated:
  error: string 
  // Actions
 

// Demo users for tes
  'admin@traksense.c
    user: {
      email: 'admin@t
  error: string | null;
  
  // Actions
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
}

// Demo users for testing
const DEMO_USERS: Record<string, { password: string; user: User }> = {
  'admin@traksense.com': {
    password: 'admin123',
      role:
      site: 'D
    }
  'viewer@traksense.com': {
    user: {
      email: 'viewer@traksense.com',
      role: 'viewer',
      site: 'Fábrica Industrial',
    }
  }
export const useAuthStore = c
    // Try to restore user f
      const
    } catch {
    }
  isAuthenticated: (() => {
      const stored = lo
    } catch {
    }
  isLoading: false,

    
    // Simulate API delay

    
      set({ 
        error: 'Email ou senha inv
      return false;

    try {
    } catch {
    }
    s
    
      error: null

  },
  logout: () =
      localStorage.removeItem('traks
      // Ignore localSto

      user: null,
      error: null
  },
  cle

ex

    role: user.role,
    tenant: user
};






  })(),








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

    // Store user in localStorage
    try {
      localStorage.setItem('traksense:user', JSON.stringify(demoUser.user));
    } catch {
      // Ignore localStorage errors
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
    try {
      localStorage.removeItem('traksense:user');
    } catch {
      // Ignore localStorage errors
    }

    set({
      user: null,
      isAuthenticated: false,
      error: null
    });
  },

  clearError: () => set({ error: null })
}));

// Get demo users list (for login hints)
export const getDemoUsers = () => {
  return Object.entries(DEMO_USERS).map(([email, { user }]) => ({
    email,
    name: user.name,
    role: user.role,
    site: user.site,
    tenant: user.tenant
  }));
};