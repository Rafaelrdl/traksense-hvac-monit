import { create } from 'zustand';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'operator' | 'viewer';
  site?: string;
  tenant?: string;
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
      site: 'Data Center Principal',
      tenant: 'traksense'
    }
  },
  'viewer@traksense.com': {
    password: 'viewer123',
    user: {
      id: '2',
      email: 'viewer@traksense.com',
      name: 'Visualizador',
      role: 'viewer',
      site: 'Fábrica Industrial',
      tenant: 'traksense'
    }
  }
};

export const useAuthStore = create<AuthState>((set) => ({
  user: (() => {
    // Try to restore user from localStorage
    try {
      const stored = localStorage.getItem('traksense:user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  })(),
  
  isAuthenticated: (() => {
    try {
      const stored = localStorage.getItem('traksense:user');
      return !!stored;
    } catch {
      return false;
    }
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