/**
 * Alerts Store
 * 
 * Zustand store for managing alerts state.
 */

import { create } from 'zustand';
import { alertsApi, Alert, AlertListParams, AcknowledgeAlertRequest, ResolveAlertRequest, AlertStatistics } from '@/services/api/alerts';
import { toast } from 'sonner';
import { useNotifications } from './notifications';

interface AlertsState {
  // State
  alerts: Alert[];
  selectedAlert: Alert | null;
  statistics: AlertStatistics | null;
  isLoading: boolean;
  isAcknowledging: boolean;
  isResolving: boolean;
  error: string | null;
  
  // Pagination
  totalCount: number;
  currentPage: number;
  pageSize: number;
  
  // Filters
  filters: AlertListParams;
  
  // Actions
  fetchAlerts: () => Promise<void>;
  fetchAlertById: (id: number) => Promise<void>;
  acknowledgeAlert: (id: number, notes?: string) => Promise<boolean>;
  resolveAlert: (id: number, notes?: string) => Promise<boolean>;
  fetchStatistics: () => Promise<void>;
  
  // UI Actions
  setSelectedAlert: (alert: Alert | null) => void;
  setFilters: (filters: Partial<AlertListParams>) => void;
  setPage: (page: number) => void;
  clearError: () => void;
  
  // Real-time updates
  pollAlerts: () => void;
  stopPolling: () => void;
}

let pollingInterval: NodeJS.Timeout | null = null;

export const useAlertsStore = create<AlertsState>((set, get) => ({
  // Initial State
  alerts: [],
  selectedAlert: null,
  statistics: null,
  isLoading: false,
  isAcknowledging: false,
  isResolving: false,
  error: null,
  totalCount: 0,
  currentPage: 1,
  pageSize: 20,
  filters: {},
  
  // Fetch Alerts
  fetchAlerts: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const { filters, currentPage, pageSize, alerts: previousAlerts } = get();
      const data = await alertsApi.list({
        ...filters,
        page: currentPage,
        page_size: pageSize,
      });
      
      // Detectar novos alertas e criar notificações
      const newAlerts = data.results.filter(alert => 
        alert.is_active && !previousAlerts.some(prev => prev.id === alert.id)
      );
      
      if (newAlerts.length > 0) {
        const notificationsStore = useNotifications.getState();
        newAlerts.forEach(alert => {
          // Mapear severity da API para notificação
          let severity: 'info' | 'warning' | 'critical' = 'info';
          const alertSeverity = alert.severity.toLowerCase();
          if (alertSeverity.includes('critical') || alertSeverity === 'critical') {
            severity = 'critical';
          } else if (alertSeverity.includes('high') || alertSeverity === 'high') {
            severity = 'warning';
          }
          
          notificationsStore.add({
            title: alert.rule_name,
            message: alert.message,
            severity,
          });
        });
      }
      
      set({
        alerts: data.results,
        totalCount: data.count,
        isLoading: false,
      });
    } catch (error: any) {
      const message = error.response?.data?.detail || 'Failed to fetch alerts';
      set({ error: message, isLoading: false });
      toast.error(message);
    }
  },
  
  // Fetch Single Alert
  fetchAlertById: async (id: number) => {
    set({ isLoading: true, error: null });
    
    try {
      const alert = await alertsApi.get(id);
      set({ selectedAlert: alert, isLoading: false });
    } catch (error: any) {
      const message = error.response?.data?.detail || 'Failed to fetch alert';
      set({ error: message, isLoading: false });
      toast.error(message);
    }
  },
  
  // Acknowledge Alert
  acknowledgeAlert: async (id: number, notes?: string) => {
    set({ isAcknowledging: true, error: null });
    
    try {
      const data: AcknowledgeAlertRequest = notes ? { notes } : {};
      const alert = await alertsApi.acknowledge(id, data);
      
      // Update in list
      set((state) => ({
        alerts: state.alerts.map((a) => (a.id === id ? alert : a)),
        selectedAlert: state.selectedAlert?.id === id ? alert : state.selectedAlert,
        isAcknowledging: false,
      }));
      
      // Atualizar estatísticas
      get().fetchStatistics();
      
      toast.success('Alerta reconhecido');
      
      return true;
    } catch (error: any) {
      const message = error.response?.data?.detail || 'Falha ao reconhecer alerta';
      set({ error: message, isAcknowledging: false });
      toast.error(message);
      return false;
    }
  },
  
  // Resolve Alert
  resolveAlert: async (id: number, notes?: string) => {
    set({ isResolving: true, error: null });
    
    try {
      const data: ResolveAlertRequest = notes ? { notes } : {};
      const alert = await alertsApi.resolve(id, data);
      
      // Update in list
      set((state) => ({
        alerts: state.alerts.map((a) => (a.id === id ? alert : a)),
        selectedAlert: state.selectedAlert?.id === id ? alert : state.selectedAlert,
        isResolving: false,
      }));
      
      // Atualizar estatísticas
      get().fetchStatistics();
      
      toast.success('Alerta resolvido');
      
      return true;
    } catch (error: any) {
      const message = error.response?.data?.detail || 'Falha ao resolver alerta';
      set({ error: message, isResolving: false });
      toast.error(message);
      return false;
    }
  },
  
  // Fetch Statistics
  fetchStatistics: async () => {
    try {
      const statistics = await alertsApi.statistics();
      set({ statistics });
    } catch (error: any) {
      console.error('Failed to fetch statistics:', error);
    }
  },
  
  // UI Actions
  setSelectedAlert: (alert: Alert | null) => {
    set({ selectedAlert: alert });
  },
  
  setFilters: (filters: Partial<AlertListParams>) => {
    set((state) => ({
      filters: { ...state.filters, ...filters },
      currentPage: 1, // Reset to first page
    }));
    
    // Auto-refresh
    get().fetchAlerts();
  },
  
  setPage: (page: number) => {
    set({ currentPage: page });
    get().fetchAlerts();
  },
  
  clearError: () => {
    set({ error: null });
  },
  
  // Real-time polling
  pollAlerts: () => {
    // Clear existing interval
    if (pollingInterval) {
      clearInterval(pollingInterval);
    }
    
    // Poll every 30 seconds
    pollingInterval = setInterval(() => {
      get().fetchAlerts();
      get().fetchStatistics();
    }, 30000);
  },
  
  stopPolling: () => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
      pollingInterval = null;
    }
  },
}));
