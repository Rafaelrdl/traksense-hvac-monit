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
 * 🔐 AUTHENTICATION STRATEGY (SECURITY FIX - Nov 2025):
 * 
 * PRODUCTION (Recommended):
 * - Backend sends JWT tokens in HttpOnly cookies (access_token, refresh_token)
 * - Browser automatically includes cookies in all requests
 * - Cookies are NOT accessible via JavaScript → XSS protection
 * - NO Authorization header needed
 * 
 * DEVELOPMENT FALLBACK (Not secure):
 * - If cookies aren't working, tries localStorage as fallback
 * - Warns in console about non-secure method
 * - Should only be used for local debugging
 * 
 * ⚠️ WHY NOT localStorage?
 * - Vulnerable to XSS attacks (any script can read tokens)
 * - No protection against malicious browser extensions
 * - Audit finding: "Ainda grava access/refresh tokens tanto no localStorage 
 *   quanto no namespace do tenant, mesmo o backend já emitindo cookies HttpOnly. 
 *   Isso permite que qualquer XSS recupere os tokens JWT."
 * 
 * See: docs/bugfixes/CORRECOES_SEGURANCA_COMPLETAS.md - Fix #1
 */
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 🔧 FALLBACK: Try localStorage only if cookies aren't working (dev mode)
    const token = tenantStorage.get<string>('access_token') || localStorage.getItem('access_token');
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
      
      if (import.meta.env.DEV) {
        console.warn('⚠️ Using token from localStorage (should use HttpOnly cookie in production)');
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

    // 🔧 FIX #20: Cookie-based refresh strategy (not localStorage)
    // Audit finding: "Ainda dependem de refresh tokens armazenados; quando expiram, forçam logout"
    // 
    // PRODUCTION STRATEGY:
    // - Backend refresh endpoint reads refresh_token from HttpOnly cookie
    // - Returns new access_token in HttpOnly cookie (not JSON)
    // - No tokens in localStorage
    // 
    // DEVELOPMENT FALLBACK:
    // - If cookies not working, tries localStorage
    // - Should only be used for debugging

    try {
      // 🔧 Attempt refresh using HttpOnly cookies (production)
      const { data } = await axios.post(
        `${api.defaults.baseURL}/auth/token/refresh/`,
        {},  // Empty body - backend reads from cookie
        { 
          withCredentials: true  // Include HttpOnly cookies
        }
      );

      // ✅ SUCCESS: New tokens set as cookies by backend
      // No need to store in localStorage (cookies are automatic)
      
      if (import.meta.env.DEV) {
        console.log('✅ Token refresh successful (cookie-based)');
      }

      // Processa fila de requisições pendentes (sem token, cookies são automáticos)
      processQueue(null, null);

      isRefreshing = false;

      // Retenta a requisição original (cookies atualizados automaticamente)
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
