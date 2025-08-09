import { create } from 'zustand';
import { useMemo } from 'react';
import { HVACAsset, Sensor, Alert, SimulationScenario, TelemetryPoint, MaintenanceTask, MaintenanceSchedule, MaintenanceHistory } from '../types/hvac';
import { simEngine } from '../lib/simulation';

interface AppState {
  // Current data
  assets: HVACAsset[];
  sensors: Sensor[];
  alerts: Alert[];
  scenarios: SimulationScenario[];
  maintenanceTasks: MaintenanceTask[];
  maintenanceSchedules: MaintenanceSchedule[];
  maintenanceHistory: MaintenanceHistory[];
  
  // UI state
  selectedAssetId: string | null;
  selectedTimeRange: '1h' | '6h' | '24h' | '7d' | '30d';
  sidebarCollapsed: boolean;
  
  // Real-time simulation
  isSimulationRunning: boolean;
  lastUpdateTime: Date | null;
  refreshInterval: NodeJS.Timeout | null;
  
  // Actions
  setSelectedAsset: (assetId: string | null) => void;
  setTimeRange: (range: AppState['selectedTimeRange']) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  
  startSimulation: () => void;
  stopSimulation: () => void;
  setScenario: (scenarioId: string) => void;
  
  refreshData: () => void;
  acknowledgeAlert: (alertId: string) => void;
  
  // Maintenance actions
  addMaintenanceTask: (task: Omit<MaintenanceTask, 'id' | 'createdDate' | 'createdBy'>) => void;
  updateMaintenanceTask: (taskId: string, updates: Partial<MaintenanceTask>) => void;
  completeMaintenanceTask: (taskId: string, notes?: string, cost?: number) => void;
  addMaintenanceSchedule: (schedule: Omit<MaintenanceSchedule, 'id'>) => void;
  updateMaintenanceSchedule: (scheduleId: string, updates: Partial<MaintenanceSchedule>) => void;
  deleteMaintenanceSchedule: (scheduleId: string) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  // Initial state
  assets: simEngine.getAssets(),
  sensors: simEngine.getSensors(),
  alerts: simEngine.getAlerts(),
  scenarios: simEngine.getScenarios(),
  maintenanceTasks: simEngine.getMaintenanceTasks(),
  maintenanceSchedules: simEngine.getMaintenanceSchedules(),
  maintenanceHistory: simEngine.getMaintenanceHistory(),
  
  selectedAssetId: null,
  selectedTimeRange: '24h',
  sidebarCollapsed: false,
  
  isSimulationRunning: false,
  lastUpdateTime: null,
  refreshInterval: null,
  
  // Actions
  setSelectedAsset: (assetId) => set({ selectedAssetId: assetId }),
  
  setTimeRange: (range) => set({ selectedTimeRange: range }),
  
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  
  startSimulation: () => {
    const state = get();
    if (!state.isSimulationRunning) {
      // Clear any existing interval
      if (state.refreshInterval) {
        clearInterval(state.refreshInterval);
      }
      
      simEngine.startRealTimeSimulation(3000); // 3 second intervals
      
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
      }, 3000);
      
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
        ? { ...alert, acknowledged: true, acknowledgedAt: new Date() }
        : alert
    );
    set({ alerts });
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
  }
}));

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