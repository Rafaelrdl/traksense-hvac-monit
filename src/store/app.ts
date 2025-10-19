import { create } from 'zustand';
import { useMemo } from 'react';
import { HVACAsset, Sensor, Alert, SimulationScenario, TelemetryPoint, MaintenanceTask, MaintenanceSchedule, MaintenanceHistory } from '../types/hvac';
import { simEngine } from '../lib/simulation';
import { assetsService } from '@/services/assetsService';
import { sitesService } from '@/services/sitesService';
import { mapApiAssetsToHVACAssets } from '@/lib/mappers/assetMapper';

interface AppState {
  // Current data
  assets: HVACAsset[];
  sensors: Sensor[];
  alerts: Alert[];
  scenarios: SimulationScenario[];
  maintenanceTasks: MaintenanceTask[];
  maintenanceSchedules: MaintenanceSchedule[];
  maintenanceHistory: MaintenanceHistory[];
  
  // Loading states
  isLoadingAssets: boolean;
  isLoadingSensors: boolean;
  error: string | null;
  
  // UI state
  selectedAssetId: string | null;
  selectedTimeRange: '1h' | '6h' | '24h' | '7d' | '30d';
  sidebarCollapsed: boolean;
  
  // Real-time simulation
  isSimulationRunning: boolean;
  lastUpdateTime: Date | null;
  refreshInterval: number | null;
  
  // Actions
  setSelectedAsset: (assetId: string | null) => void;
  setTimeRange: (range: AppState['selectedTimeRange']) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  
  startSimulation: () => void;
  stopSimulation: () => void;
  setScenario: (scenarioId: string) => void;
  
  refreshData: () => void;
  acknowledgeAlert: (alertId: string) => void;
  resolveAlert: (alertId: string) => void;
  
  // Asset actions
  addAsset: (asset: Omit<HVACAsset, 'id' | 'healthScore' | 'powerConsumption' | 'status' | 'operatingHours' | 'lastMaintenance'>) => void;
  
  // Maintenance actions
  addMaintenanceTask: (task: Omit<MaintenanceTask, 'id' | 'createdDate' | 'createdBy'>) => void;
  updateMaintenanceTask: (taskId: string, updates: Partial<MaintenanceTask>) => void;
  completeMaintenanceTask: (taskId: string, notes?: string, cost?: number) => void;
  addMaintenanceSchedule: (schedule: Omit<MaintenanceSchedule, 'id'>) => void;
  updateMaintenanceSchedule: (scheduleId: string, updates: Partial<MaintenanceSchedule>) => void;
  deleteMaintenanceSchedule: (scheduleId: string) => void;
  
  // API actions
  loadAssetsFromApi: () => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  // Initial state - vazio, será carregado da API
  assets: [],
  sensors: simEngine.getSensors(),
  alerts: simEngine.getAlerts(),
  scenarios: simEngine.getScenarios(),
  maintenanceTasks: simEngine.getMaintenanceTasks(),
  maintenanceSchedules: simEngine.getMaintenanceSchedules(),
  maintenanceHistory: simEngine.getMaintenanceHistory(),
  
  // Loading states
  isLoadingAssets: true, // Inicia como loading
  isLoadingSensors: false,
  error: null,
  
  selectedAssetId: null,
  selectedTimeRange: '24h',
  sidebarCollapsed: (() => {
    // Initialize from localStorage
    try {
      const stored = localStorage.getItem('sidebar:collapsed');
      return stored === 'true';
    } catch {
      return false;
    }
  })(),
  
  isSimulationRunning: false,
  lastUpdateTime: null,
  refreshInterval: null,
  
  // Actions
  setSelectedAsset: (assetId) => set({ selectedAssetId: assetId }),
  
  setTimeRange: (range) => set({ selectedTimeRange: range }),
  
  setSidebarCollapsed: (collapsed) => {
    // Persist to localStorage
    try {
      localStorage.setItem('sidebar:collapsed', String(collapsed));
    } catch {
      // Ignore localStorage errors
    }
    set({ sidebarCollapsed: collapsed });
  },
  
  startSimulation: () => {
    const state = get();
    if (!state.isSimulationRunning) {
      // Clear any existing interval
      if (state.refreshInterval) {
        clearInterval(state.refreshInterval);
      }
      
      simEngine.startRealTimeSimulation(300000); // 5 minute intervals
      
      // Set up periodic data refresh
      const refreshInterval = setInterval(() => {
        const currentState = get();
        if (!currentState.isSimulationRunning) {
          clearInterval(refreshInterval);
          return;
        }
        
        set({
          assets: simEngine.getAssets(),
          sensors: simEngine.getSensors(),
          alerts: simEngine.getAlerts(),
          maintenanceTasks: simEngine.getMaintenanceTasks(),
          maintenanceSchedules: simEngine.getMaintenanceSchedules(),
          maintenanceHistory: simEngine.getMaintenanceHistory(),
          lastUpdateTime: new Date()
        });
      }, 300000);
      
      set({ 
        isSimulationRunning: true,
        refreshInterval
      });
    }
  },
  
  stopSimulation: () => {
    const state = get();
    simEngine.stop();
    
    // Clear the refresh interval
    if (state.refreshInterval) {
      clearInterval(state.refreshInterval);
    }
    
    set({ 
      isSimulationRunning: false,
      refreshInterval: null
    });
  },
  
  setScenario: (scenarioId) => {
    simEngine.setScenario(scenarioId);
    const updatedScenarios = simEngine.getScenarios();
    set({ scenarios: updatedScenarios });
  },
  
  refreshData: () => {
    set({
      assets: simEngine.getAssets(),
      sensors: simEngine.getSensors(),
      alerts: simEngine.getAlerts(),
      scenarios: simEngine.getScenarios(),
      maintenanceTasks: simEngine.getMaintenanceTasks(),
      maintenanceSchedules: simEngine.getMaintenanceSchedules(),
      maintenanceHistory: simEngine.getMaintenanceHistory(),
      lastUpdateTime: new Date()
    });
  },
  
  acknowledgeAlert: (alertId) => {
    const alerts = get().alerts.map(alert => 
      alert.id === alertId 
        ? { ...alert, acknowledged: true, acknowledgedAt: new Date(), acknowledgedBy: 'Admin TrakSense' }
        : alert
    );
    set({ alerts });
  },

  resolveAlert: (alertId) => {
    const alerts = get().alerts.map(alert => 
      alert.id === alertId 
        ? { ...alert, resolved: true, resolvedAt: new Date() }
        : alert
    );
    set({ alerts });
  },

  // Asset actions
  addAsset: (assetData) => {
    const newAsset: HVACAsset = {
      ...assetData,
      id: `asset-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      healthScore: 100, // New asset starts with perfect health
      powerConsumption: 0, // Will be calculated by simulation
      status: 'OK',
      operatingHours: 0,
      lastMaintenance: new Date(),
    };
    
    const currentAssets = get().assets;
    set({ assets: [...currentAssets, newAsset] });
  },

  // Maintenance actions
  addMaintenanceTask: (task) => {
    const newTask = simEngine.addMaintenanceTask(task);
    if (newTask) {
      const currentTasks = get().maintenanceTasks;
      set({ maintenanceTasks: [...currentTasks, newTask] });
    }
  },

  updateMaintenanceTask: (taskId, updates) => {
    const updatedTask = simEngine.updateMaintenanceTask(taskId, updates);
    if (updatedTask) {
      const currentTasks = get().maintenanceTasks;
      const newTasks = currentTasks.map(task => 
        task.id === taskId ? updatedTask : task
      );
      set({ maintenanceTasks: newTasks });
    }
  },

  completeMaintenanceTask: (taskId, notes, cost) => {
    const completedTask = simEngine.completeMaintenanceTask(taskId, notes, cost);
    if (completedTask) {
      set({
        maintenanceTasks: simEngine.getMaintenanceTasks(),
        maintenanceHistory: simEngine.getMaintenanceHistory()
      });
    }
  },

  addMaintenanceSchedule: (schedule) => {
    const newSchedule = { ...schedule, id: `sched-${Date.now()}` };
    const currentSchedules = get().maintenanceSchedules;
    set({ maintenanceSchedules: [...currentSchedules, newSchedule] });
  },

  updateMaintenanceSchedule: (scheduleId, updates) => {
    const currentSchedules = get().maintenanceSchedules;
    const newSchedules = currentSchedules.map(schedule => 
      schedule.id === scheduleId ? { ...schedule, ...updates } : schedule
    );
    set({ maintenanceSchedules: newSchedules });
  },

  deleteMaintenanceSchedule: (scheduleId) => {
    const currentSchedules = get().maintenanceSchedules;
    const newSchedules = currentSchedules.filter(schedule => schedule.id !== scheduleId);
    set({ maintenanceSchedules: newSchedules });
  },

  /**
   * Carrega assets da API REST Django
   * Esta função substitui o uso do simEngine quando useApiData = true
   */
  loadAssetsFromApi: async () => {
    set({ isLoadingAssets: true, error: null });
    
    try {
      // Buscar todos os assets (ajustar limit conforme necessário)
      const assetsResponse = await assetsService.getAll({ 
        limit: 100 
      });
      
      // Buscar sites para enriquecer dados
      const sitesResponse = await sitesService.getAll({ 
        limit: 100 
      });
      
      const sitesMap = new Map(
        sitesResponse.results.map(s => [s.id, s])
      );
      
      // Mapear para formato do frontend
      const assets = mapApiAssetsToHVACAssets(
        assetsResponse.results,
        sitesMap
      );
      
      set({ 
        assets, 
        isLoadingAssets: false,
        lastUpdateTime: new Date()
      });
      
      console.log(`✅ Carregados ${assets.length} assets da API`);
    } catch (error) {
      console.error('❌ Erro ao carregar assets da API:', error);
      set({ 
        error: 'Falha ao carregar ativos. Verifique sua conexão.', 
        isLoadingAssets: false 
      });
    }
  },
}));

// Carregar assets automaticamente ao inicializar
useAppStore.getState().loadAssetsFromApi();

// Utility hooks for specific data
export const useAssets = () => useAppStore(state => state.assets);
export const useSensors = () => useAppStore(state => state.sensors);
export const useAlerts = () => useAppStore(state => state.alerts);
export const useSelectedAsset = () => {
  const selectedAssetId = useAppStore(state => state.selectedAssetId);
  const assets = useAppStore(state => state.assets);
  return selectedAssetId ? assets.find(a => a.id === selectedAssetId) : null;
};

// Get time range in milliseconds for data queries
export const useTimeRangeMs = () => {
  const range = useAppStore(state => state.selectedTimeRange);
  
  return useMemo(() => {
    const now = Date.now();
    
    switch (range) {
      case '1h': return { start: new Date(now - 60 * 60 * 1000), end: new Date(now) };
      case '6h': return { start: new Date(now - 6 * 60 * 60 * 1000), end: new Date(now) };
      case '24h': return { start: new Date(now - 24 * 60 * 60 * 1000), end: new Date(now) };
      case '7d': return { start: new Date(now - 7 * 24 * 60 * 60 * 1000), end: new Date(now) };
      case '30d': return { start: new Date(now - 30 * 24 * 60 * 60 * 1000), end: new Date(now) };
      default: return { start: new Date(now - 24 * 60 * 60 * 1000), end: new Date(now) };
    }
  }, [range]);
};