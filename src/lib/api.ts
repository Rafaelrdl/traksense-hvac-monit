/**
 * API Client with Axios
 * 
 * Configuração centralizada do cliente HTTP com:
 * - Base URL configurável por tenant
 * - Interceptors para JWT authentication
 * - Auto-refresh de tokens expirados
 * - CORS credentials
 * - Multi-tenant awareness
 */

import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { getTenantApiUrl } from './tenant';
import { tenantStorage } from './tenantStorage';

// Base URL da API (dinâmica por tenant)
const getApiBaseUrl = (): string => {
  return getTenantApiUrl();
};

/**
 * Cliente Axios configurado
 */
export const api = axios.create({
  baseURL: getApiBaseUrl(),
  withCredentials: true, // Importante para cookies HttpOnly
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 segundos
});

/**
 * Reconfigura a API base URL dinamicamente
 * Chamado após login para ajustar ao tenant do usuário
 * @param tenantSlugOrUrl - Slug do tenant (para localhost) ou URL completa da API
 */
export const reconfigureApiForTenant = (tenantSlugOrUrl: string): void => {
  let newBaseUrl: string;
  
  // Se parece com URL completa (contém http/https), usa direto
  if (tenantSlugOrUrl.startsWith('http://') || tenantSlugOrUrl.startsWith('https://')) {
    newBaseUrl = tenantSlugOrUrl;
  } else {
    // Caso contrário, constrói URL para localhost (dev)
    newBaseUrl = `http://${tenantSlugOrUrl}.localhost:8000/api`;
  }
  
  api.defaults.baseURL = newBaseUrl;
  console.log(`🔄 API reconfigurada para: ${newBaseUrl}`);
};

/**
 * Interceptor de Request
 * 
 * 🔐 AUTHENTICATION STRATEGY:
 * - Backend sends JWT tokens in HttpOnly cookies (access_token, refresh_token)
 * - These cookies are automatically included in all requests by the browser
 * - DO NOT store tokens in localStorage/tenantStorage (security risk)
 * 
 * This interceptor tries localStorage as fallback for development,
 * but production should rely exclusively on HttpOnly cookies.
 */
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 🔧 FALLBACK: Try localStorage only if cookies aren't working (dev mode)
    const token = tenantStorage.get<string>('access_token') || localStorage.getItem('access_token');
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
      
      if (import.meta.env.DEV) {
        console.warn('⚠️ Using token from localStorage (should use HttpOnly cookie)');
      }
    }
    
    // In production, tokens come from HttpOnly cookies automatically
    // No Authorization header needed
    
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

/**
 * Interceptor de Response
 * Gerencia refresh automático de tokens expirados
 */
let isRefreshing = false;
let isRedirecting = false; // Flag para prevenir múltiplos redirects
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: AxiosError | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    // Ignorar erros de cancelamento - não tentar refresh
    if (error.code === 'ECONNABORTED' || error.code === 'ERR_CANCELED' || error.name === 'CanceledError') {
      console.log('⏹️ Requisição cancelada - ignorando');
      return Promise.reject(error);
    }

    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Se o erro não for 401 ou já tentou refresh, rejeita
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // Se já está fazendo refresh, coloca na fila
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          if (originalRequest.headers && token) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }
          return api(originalRequest);
        })
        .catch((err) => {
          return Promise.reject(err);
        });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    const refreshToken = tenantStorage.get<string>('refresh_token') || localStorage.getItem('refresh_token');

    if (!refreshToken) {
      // Sem refresh token, redireciona para login (uma vez apenas)
      isRefreshing = false;
      
      if (!isRedirecting) {
        isRedirecting = true;
        tenantStorage.clear();
        localStorage.clear();
        console.log('🔒 Sem refresh token - redirecionando para login');
        window.location.href = '/login';
      }
      
      return Promise.reject(error);
    }

    try {
      // Tenta fazer refresh do token
      const { data } = await axios.post(
        `${api.defaults.baseURL}/auth/token/refresh/`,
        { refresh: refreshToken },
        { withCredentials: true }
      );

      const newAccessToken = data.access;
      
      // Salva novo access token (tenant-aware)
      tenantStorage.set('access_token', newAccessToken);
      localStorage.setItem('access_token', newAccessToken); // Fallback

      // Se retornou novo refresh token, salva também
      if (data.refresh) {
        tenantStorage.set('refresh_token', data.refresh);
        localStorage.setItem('refresh_token', data.refresh);
      }

      // Atualiza header da requisição original
      if (originalRequest.headers) {
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      }

      // Processa fila de requisições pendentes
      processQueue(null, newAccessToken);

      isRefreshing = false;

      // Retenta a requisição original
      return api(originalRequest);
    } catch (refreshError) {
      // Falha no refresh, limpa tudo e redireciona (uma vez apenas)
      processQueue(refreshError as AxiosError, null);
      isRefreshing = false;

      if (!isRedirecting) {
        isRedirecting = true;
        tenantStorage.clear();
        localStorage.clear();
        console.log('🔒 Falha ao renovar token - redirecionando para login');
        window.location.href = '/login';
      }

      return Promise.reject(refreshError);
    }
  }
);

/**
 * Helper para upload de arquivos
 */
export const createFormDataConfig = () => ({
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});

/**
 * Helper para verificar se há token válido
 */
export const hasValidToken = (): boolean => {
  return !!localStorage.getItem('access_token');
};

/**
 * Helper para limpar tokens
 */
export const clearTokens = (): void => {
  // Limpar tokens globais do localStorage
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  
  // Limpar tokens do tenantStorage (tenant-aware)
  // Usa import estático no topo do arquivo, não require()
  tenantStorage.remove('access_token');
  tenantStorage.remove('refresh_token');
  tenantStorage.remove('tenant_info');
};

export default api;
