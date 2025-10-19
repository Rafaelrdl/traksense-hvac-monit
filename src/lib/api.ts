/**
 * API Client with Axios
 * 
 * Configuração centralizada do cliente HTTP com:
 * - Base URL configurável
 * - Interceptors para JWT authentication
 * - Auto-refresh de tokens expirados
 * - CORS credentials
 */

import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

// Base URL da API (configurável via env)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://umc.localhost:8000/api';

/**
 * Cliente Axios configurado
 */
export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Importante para cookies HttpOnly
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 segundos
});

/**
 * Interceptor de Request
 * Adiciona o token JWT em todas as requisições autenticadas
 */
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('access_token');
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
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

    const refreshToken = localStorage.getItem('refresh_token');

    if (!refreshToken) {
      // Sem refresh token, redireciona para login
      isRefreshing = false;
      localStorage.clear();
      window.location.href = '/login';
      return Promise.reject(error);
    }

    try {
      // Tenta fazer refresh do token
      const { data } = await axios.post(
        `${API_BASE_URL}/auth/token/refresh/`,
        { refresh: refreshToken },
        { withCredentials: true }
      );

      const newAccessToken = data.access;
      
      // Salva novo access token
      localStorage.setItem('access_token', newAccessToken);

      // Se retornou novo refresh token, salva também
      if (data.refresh) {
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
      // Falha no refresh, limpa tudo e redireciona
      processQueue(refreshError as AxiosError, null);
      isRefreshing = false;

      localStorage.clear();
      window.location.href = '/login';

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
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
};

export default api;
