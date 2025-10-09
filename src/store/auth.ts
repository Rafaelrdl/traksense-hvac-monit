import { create } from 'zustand';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'operator' | 'technician' | 'viewer';
  avatar?: string;
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
      name: 'Carlos Silva',
      role: 'admin',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      site: 'Hospital São Lucas',
      tenant: 'Rede Hospitalar SP'
    }
  },
  'operator@traksense.com': {
    password: 'operator123',
    user: {
      id: '2',
      email: 'operator@traksense.com',
      name: 'Maria Santos',
      role: 'operator',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b75b2fc5?w=150&h=150&fit=crop&crop=face',
      site: 'Shopping Center Norte',
      tenant: 'Rede Comercial RJ'
    }
  },
  'tech@traksense.com': {
    password: 'tech123',
    user: {
      id: '3',
      email: 'tech@traksense.com',
      name: 'João Oliveira',
      role: 'technician',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      site: 'Data Center Principal',
      tenant: 'TechCorp Brasil'
    }
  },
  'viewer@traksense.com': {
    password: 'viewer123',
    user: {
      id: '4',
      email: 'viewer@traksense.com',
      name: 'Ana Costa',
      role: 'viewer',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      site: 'Fábrica Industrial',
      tenant: 'Indústria ABC'
    }
  }
};

export const useAuthStore = create<AuthState>((set, get) => ({
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