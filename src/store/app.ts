import { create } from 'zustand';
import { useMemo } from 'react';
import { HVACAsset, Sensor, Alert, SimulationScenario, TelemetryPoint, MaintenanceTask, MaintenanceSchedule, MaintenanceHistory } from '../types/hvac';
import { simEngine } from '../lib/simulation';
import { assetsService } from '@/services/assetsService';
import { sitesService } from '@/services/sitesService';
import { mapApiAssetsToHVACAssets, mapHVACAssetToApiAsset, mapApiAssetToHVACAsset } from '@/lib/mappers/assetMapper';
import { telemetryService } from '@/services/telemetryService';
import { 
  LatestReadingsResponse, 
  DeviceHistoryResponse, 
  DeviceSummaryResponse,
  TelemetryReading,
  SensorSummary 
} from '@/types/telemetry';
import {
  mapApiLatestReadingsToFrontend,
  mapApiDeviceHistoryToFrontend,
  mapApiDeviceSummaryToFrontend
} from '@/lib/mappers/telemetryMapper';

interface AppState {
  // Current data
  assets: HVACAsset[];
  sensors: Sensor[];
  alerts: Alert[];
  scenarios: SimulationScenario[];
  maintenanceTasks: MaintenanceTask[];
  maintenanceSchedules: MaintenanceSchedule[];
  maintenanceHistory: MaintenanceHistory[];
  
  // Site management
  availableSites: any[]; // Lista de sites disponíveis
  currentSite: any | null; // Site atualmente selecionado
  isLoadingSites: boolean;
  
  // Telemetry data (FASE 3)
  telemetry: {
    currentDevice: string | null; // Device ID selecionado
    latestReadings: LatestReadingsResponse | null; // Últimas leituras
    history: DeviceHistoryResponse | null; // Histórico temporal
    summary: DeviceSummaryResponse | null; // Resumo do device
    isLoading: boolean; // Loading state
    error: string | null; // Erro
    lastUpdate: Date | null; // Última atualização
    autoRefreshEnabled: boolean; // Auto-refresh ativo
    pollingCleanup: (() => void) | null; // Função de cleanup do polling
  };
  
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
  refreshInterval: ReturnType<typeof setInterval> | null;
  
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
  addAsset: (asset: Omit<HVACAsset, 'id' | 'healthScore' | 'powerConsumption' | 'status' | 'operatingHours' | 'lastMaintenance'>) => Promise<void>;
  deleteAsset: (assetId: string) => Promise<void>;
  
  // Maintenance actions
  addMaintenanceTask: (task: Omit<MaintenanceTask, 'id' | 'createdDate' | 'createdBy'>) => void;
  updateMaintenanceTask: (taskId: string, updates: Partial<MaintenanceTask>) => void;
  completeMaintenanceTask: (taskId: string, notes?: string, cost?: number) => void;
  addMaintenanceSchedule: (schedule: Omit<MaintenanceSchedule, 'id'>) => void;
  updateMaintenanceSchedule: (scheduleId: string, updates: Partial<MaintenanceSchedule>) => void;
  deleteMaintenanceSchedule: (scheduleId: string) => void;
  
  // API actions
  loadAssetsFromApi: () => Promise<void>;
  
  // Site actions
  loadAvailableSites: () => Promise<void>;
  setCurrentSite: (site: any | null) => void;
  
  // Telemetry actions (FASE 3)
  setCurrentDevice: (deviceId: string | null) => void;
  loadTelemetryForDevice: (deviceId: string, options?: { skipHistory?: boolean }) => Promise<void>;
  refreshTelemetry: () => Promise<void>;
  startTelemetryAutoRefresh: (deviceId: string, intervalMs?: number) => void;
  stopTelemetryAutoRefresh: () => void;
  clearTelemetry: () => void;
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
  
  // Site initial state
  availableSites: [],
  currentSite: null,
  isLoadingSites: false,
  
  // Telemetry initial state (FASE 3)
  telemetry: {
    currentDevice: null,
    latestReadings: null,
    history: null,
    summary: null,
    isLoading: false,
    error: null,
    lastUpdate: null,
    autoRefreshEnabled: false,
    pollingCleanup: null,
  },
  
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
  addAsset: async (assetData) => {
    try {
      // 1. Buscar ou criar site padrão
      let siteId = 1; // Default para Uberlândia Medical Center
      
      try {
        // Tentar buscar sites existentes
        const sitesResponse = await sitesService.getAll();
        if (sitesResponse.results.length > 0) {
          // Usar primeiro site disponível
          siteId = sitesResponse.results[0].id;
        }
      } catch (siteError) {
        console.warn('⚠️ Não foi possível buscar sites, usando ID padrão:', siteError);
      }

      // 2. Converter dados do frontend para formato da API usando mapper
      const apiAssetData = mapHVACAssetToApiAsset(
        {
          ...assetData,
          healthScore: 100,
          status: 'OK',
          lastMaintenance: new Date(),
        },
        siteId
      );

      // 3. Criar asset na API
      const createdApiAsset = await assetsService.create(apiAssetData);
      
      // 4. Converter resposta da API para formato do frontend
      const createdHVACAsset = mapApiAssetToHVACAsset(createdApiAsset);
      
      // 5. Adicionar asset criado ao estado local
      const currentAssets = get().assets;
      set({ assets: [...currentAssets, createdHVACAsset] });
      
      console.log('✅ Asset criado com sucesso na API:', createdHVACAsset.tag);
    } catch (error) {
      console.error('❌ Erro ao criar asset na API:', error);
      
      // Fallback: adicionar localmente se API falhar
      const newAsset: HVACAsset = {
        ...assetData,
        id: `asset-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        healthScore: 100,
        powerConsumption: 0,
        status: 'OK',
        operatingHours: 0,
        lastMaintenance: new Date(),
      };
      
      const currentAssets = get().assets;
      set({ assets: [...currentAssets, newAsset] });
      
      // Re-throw para exibir erro ao usuário
      throw error;
    }
  },

  deleteAsset: async (assetId: string) => {
    try {
      // 1. Extrair o ID numérico do formato "asset-{id}" ou usar diretamente se já for número
      const numericId = assetId.startsWith('asset-') 
        ? parseInt(assetId.split('-')[1]) 
        : parseInt(assetId);
      
      // 2. Deletar na API
      await assetsService.delete(numericId);
      
      // 3. Remover do estado local
      const currentAssets = get().assets;
      set({ assets: currentAssets.filter(asset => asset.id !== assetId) });
      
      console.log('✅ Asset deletado com sucesso:', assetId);
    } catch (error) {
      console.error('❌ Erro ao deletar asset na API:', error);
      throw error;
    }
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
    // Verificar se há token antes de tentar carregar
    if (!localStorage.getItem('access_token')) {
      console.warn('⚠️ loadAssetsFromApi: Sem token - abortando carregamento');
      set({ isLoadingAssets: false, error: 'Não autenticado' });
      return;
    }

    console.log('🔄 loadAssetsFromApi: Iniciando carregamento...');
    set({ isLoadingAssets: true, error: null });
    
    try {
      // Obter site atual para filtrar
      const currentSite = get().currentSite;
      console.log('📍 Site atual:', currentSite);
      
      // Buscar todos os assets (ajustar limit conforme necessário)
      console.log('📦 Buscando assets da API...');
      const assetsResponse = await assetsService.getAll({ 
        limit: 100,
        ...(currentSite ? { site: currentSite.id } : {})
      });
      console.log('📦 Assets recebidos:', assetsResponse);
      
      // Buscar sites para enriquecer dados
      console.log('📍 Buscando sites da API...');
      const sitesResponse = await sitesService.getAll({ 
        limit: 100 
      });
      console.log('📍 Sites recebidos:', sitesResponse);
      
      const sitesMap = new Map(
        sitesResponse.results.map(s => [s.id, s])
      );
      
      // Mapear para formato do frontend
      console.log('🔄 Mapeando assets para formato do frontend...');
      const assets = mapApiAssetsToHVACAssets(
        assetsResponse.results,
        sitesMap
      );
      console.log('✅ Assets mapeados:', assets);
      
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

  /**
   * SITE MANAGEMENT ACTIONS
   */
  
  /**
   * Carrega todos os sites disponíveis do tenant
   */
  loadAvailableSites: async () => {
    set({ isLoadingSites: true });
    
    try {
      const sitesResponse = await sitesService.getAll({ limit: 100 });
      const sites = sitesResponse.results;
      
      set({ 
        availableSites: sites,
        isLoadingSites: false
      });
      
      // Se não houver site selecionado e existirem sites, selecionar o primeiro
      const currentSite = get().currentSite;
      if (!currentSite && sites.length > 0) {
        set({ currentSite: sites[0] });
      }
      
      console.log(`✅ Carregados ${sites.length} sites disponíveis`);
    } catch (error) {
      console.error('❌ Erro ao carregar sites:', error);
      set({ isLoadingSites: false });
    }
  },
  
  /**
   * Define o site atual e recarrega os dados filtrados
   */
  setCurrentSite: async (site) => {
    set({ currentSite: site });
    
    // Recarregar assets filtrados pelo site
    if (site) {
      await get().loadAssetsFromApi();
    }
    
    console.log(`✅ Site selecionado: ${site?.name || 'Nenhum'}`);
  },

  /**
   * TELEMETRY ACTIONS (FASE 3)
   */

  /**
   * Define o device atual para telemetria.
   */
  setCurrentDevice: (deviceId) => {
    const currentTelemetry = get().telemetry;
    
    // Se mudou de device, limpar dados antigos
    if (currentTelemetry.currentDevice !== deviceId) {
      set({
        telemetry: {
          ...currentTelemetry,
          currentDevice: deviceId,
          latestReadings: null,
          history: null,
          summary: null,
          error: null,
        }
      });
    } else {
      set({
        telemetry: {
          ...currentTelemetry,
          currentDevice: deviceId,
        }
      });
    }
  },

  /**
   * Carrega telemetria completa para um device.
   * Busca: latest readings, summary e opcionalmente history (24h).
   */
  loadTelemetryForDevice: async (deviceId, options = {}) => {
    const { skipHistory = false } = options;
    
    set({
      telemetry: {
        ...get().telemetry,
        currentDevice: deviceId,
        isLoading: true,
        error: null,
      }
    });

    try {
      // Buscar latest readings e summary em paralelo
      const [latestResponse, summaryResponse] = await Promise.all([
        telemetryService.getLatest(deviceId),
        telemetryService.getDeviceSummary(deviceId),
      ]);

      // Mapear respostas para formato frontend
      const latestReadings = mapApiLatestReadingsToFrontend(latestResponse);
      const summary = mapApiDeviceSummaryToFrontend(summaryResponse);

      // Buscar histórico se não skipado
      let history: DeviceHistoryResponse | null = null;
      if (!skipHistory) {
        const historyResponse = await telemetryService.getHistoryLastHours(deviceId, 24);
        history = mapApiDeviceHistoryToFrontend(historyResponse);
      }

      set({
        telemetry: {
          ...get().telemetry,
          latestReadings,
          summary,
          history,
          isLoading: false,
          lastUpdate: new Date(),
          error: null,
        }
      });

      console.log(`✅ Telemetria carregada para device: ${deviceId}`);
    } catch (error: any) {
      console.error('❌ Erro ao carregar telemetria:', error);
      set({
        telemetry: {
          ...get().telemetry,
          isLoading: false,
          error: error.message || 'Erro ao carregar telemetria',
        }
      });
    }
  },

  /**
   * Atualiza telemetria do device atual (apenas latest readings).
   * Usado para auto-refresh.
   */
  refreshTelemetry: async () => {
    const currentDevice = get().telemetry.currentDevice;
    
    if (!currentDevice) {
      console.warn('⚠️ Nenhum device selecionado para refresh');
      return;
    }

    try {
      const latestResponse = await telemetryService.getLatest(currentDevice);
      const latestReadings = mapApiLatestReadingsToFrontend(latestResponse);

      set({
        telemetry: {
          ...get().telemetry,
          latestReadings,
          lastUpdate: new Date(),
          error: null,
        }
      });

      console.log(`🔄 Telemetria atualizada: ${currentDevice}`);
    } catch (error: any) {
      console.error('❌ Erro ao atualizar telemetria:', error);
      set({
        telemetry: {
          ...get().telemetry,
          error: error.message || 'Erro ao atualizar telemetria',
        }
      });
    }
  },

  /**
   * Inicia auto-refresh de telemetria.
   * Atualiza latest readings periodicamente.
   */
  startTelemetryAutoRefresh: (deviceId, intervalMs = 30000) => {
    // Parar auto-refresh anterior se existir
    const currentCleanup = get().telemetry.pollingCleanup;
    if (currentCleanup) {
      currentCleanup();
    }

    // Definir device e carregar dados iniciais
    get().setCurrentDevice(deviceId);
    get().loadTelemetryForDevice(deviceId);

    // Configurar polling
    const cleanup = telemetryService.startPolling(
      deviceId,
      (data) => {
        const latestReadings = mapApiLatestReadingsToFrontend(data);
        set({
          telemetry: {
            ...get().telemetry,
            latestReadings,
            lastUpdate: new Date(),
          }
        });
      },
      intervalMs
    );

    set({
      telemetry: {
        ...get().telemetry,
        autoRefreshEnabled: true,
        pollingCleanup: cleanup,
      }
    });

    console.log(`🔄 Auto-refresh iniciado para device: ${deviceId} (${intervalMs}ms)`);
  },

  /**
   * Para auto-refresh de telemetria.
   */
  stopTelemetryAutoRefresh: () => {
    const currentCleanup = get().telemetry.pollingCleanup;
    
    if (currentCleanup) {
      currentCleanup();
      set({
        telemetry: {
          ...get().telemetry,
          autoRefreshEnabled: false,
          pollingCleanup: null,
        }
      });
      console.log('⏸️ Auto-refresh de telemetria parado');
    }
  },

  /**
   * Limpa todos os dados de telemetria.
   */
  clearTelemetry: () => {
    // Parar auto-refresh se ativo
    const currentCleanup = get().telemetry.pollingCleanup;
    if (currentCleanup) {
      currentCleanup();
    }

    set({
      telemetry: {
        currentDevice: null,
        latestReadings: null,
        history: null,
        summary: null,
        isLoading: false,
        error: null,
        lastUpdate: null,
        autoRefreshEnabled: false,
        pollingCleanup: null,
      }
    });

    console.log('🗑️ Dados de telemetria limpos');
  },
}));

// Carregar assets automaticamente ao inicializar (somente se autenticado)
if (localStorage.getItem('access_token')) {
  console.log('✅ Token encontrado - carregando assets da API');
  useAppStore.getState().loadAssetsFromApi();
} else {
  console.log('⚠️ Sem token - pulando carregamento automático de assets');
}

// Utility hooks for specific data
export const useAssets = () => useAppStore(state => state.assets);
export const useSensors = () => useAppStore(state => state.sensors);
export const useAlerts = () => useAppStore(state => state.alerts);
export const useSelectedAsset = () => {
  const selectedAssetId = useAppStore(state => state.selectedAssetId);
  const assets = useAppStore(state => state.assets);
  return selectedAssetId ? assets.find(a => a.id === selectedAssetId) : null;
};

// Telemetry hooks (FASE 3)
export const useTelemetry = () => useAppStore(state => state.telemetry);
export const useTelemetryLatest = () => useAppStore(state => state.telemetry.latestReadings);
export const useTelemetryHistory = () => useAppStore(state => state.telemetry.history);
export const useTelemetrySummary = () => useAppStore(state => state.telemetry.summary);
export const useTelemetryLoading = () => useAppStore(state => state.telemetry.isLoading);
export const useTelemetryError = () => useAppStore(state => state.telemetry.error);

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