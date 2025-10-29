/**
 * Rules Store
 * 
 * Zustand store for managing alert rules state.
 */

import { create } from 'zustand';
import { rulesApi, Rule, RuleListParams, CreateRuleRequest, UpdateRuleRequest, RuleStatistics } from '@/services/api/alerts';
import { toast } from 'sonner';

interface RulesState {
  // State
  rules: Rule[];
  selectedRule: Rule | null;
  statistics: RuleStatistics | null;
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  error: string | null;
  
  // Pagination
  totalCount: number;
  currentPage: number;
  pageSize: number;
  
  // Filters
  filters: RuleListParams;
  
  // Actions
  fetchRules: () => Promise<void>;
  fetchRuleById: (id: number) => Promise<void>;
  createRule: (data: CreateRuleRequest) => Promise<Rule | null>;
  updateRule: (id: number, data: UpdateRuleRequest) => Promise<Rule | null>;
  deleteRule: (id: number) => Promise<boolean>;
  toggleRuleStatus: (id: number) => Promise<boolean>;
  fetchStatistics: () => Promise<void>;
  
  // UI Actions
  setSelectedRule: (rule: Rule | null) => void;
  setFilters: (filters: Partial<RuleListParams>) => void;
  setPage: (page: number) => void;
  clearError: () => void;
}

export const useRulesStore = create<RulesState>((set, get) => ({
  // Initial State
  rules: [],
  selectedRule: null,
  statistics: null,
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  error: null,
  totalCount: 0,
  currentPage: 1,
  pageSize: 10,
  filters: {},
  
  // Fetch Rules
  fetchRules: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const { filters, currentPage, pageSize } = get();
      const data = await rulesApi.list({
        ...filters,
        page: currentPage,
        page_size: pageSize,
      });
      
      set({
        rules: data.results,
        totalCount: data.count,
        isLoading: false,
      });
    } catch (error: any) {
      const message = error.response?.data?.detail || 'Failed to fetch rules';
      set({ error: message, isLoading: false });
      toast.error(message);
    }
  },
  
  // Fetch Single Rule
  fetchRuleById: async (id: number) => {
    set({ isLoading: true, error: null });
    
    try {
      const rule = await rulesApi.get(id);
      set({ selectedRule: rule, isLoading: false });
    } catch (error: any) {
      const message = error.response?.data?.detail || 'Failed to fetch rule';
      set({ error: message, isLoading: false });
      toast.error(message);
    }
  },
  
  // Create Rule
  createRule: async (data: CreateRuleRequest) => {
    set({ isCreating: true, error: null });
    
    try {
      const rule = await rulesApi.create(data);
      
      // Refresh list
      await get().fetchRules();
      
      set({ isCreating: false });
      toast.success('Rule created successfully');
      
      return rule;
    } catch (error: any) {
      const message = error.response?.data?.detail || 'Failed to create rule';
      set({ error: message, isCreating: false });
      toast.error(message);
      return null;
    }
  },
  
  // Update Rule
  updateRule: async (id: number, data: UpdateRuleRequest) => {
    set({ isUpdating: true, error: null });
    
    try {
      const rule = await rulesApi.update(id, data);
      
      // Update in list
      set((state) => ({
        rules: state.rules.map((r) => (r.id === id ? rule : r)),
        selectedRule: state.selectedRule?.id === id ? rule : state.selectedRule,
        isUpdating: false,
      }));
      
      toast.success('Rule updated successfully');
      
      return rule;
    } catch (error: any) {
      const message = error.response?.data?.detail || 'Failed to update rule';
      set({ error: message, isUpdating: false });
      toast.error(message);
      return null;
    }
  },
  
  // Delete Rule
  deleteRule: async (id: number) => {
    set({ isDeleting: true, error: null });
    
    try {
      await rulesApi.delete(id);
      
      // Remove from list
      set((state) => ({
        rules: state.rules.filter((r) => r.id !== id),
        selectedRule: state.selectedRule?.id === id ? null : state.selectedRule,
        totalCount: state.totalCount - 1,
        isDeleting: false,
      }));
      
      toast.success('Rule deleted successfully');
      
      return true;
    } catch (error: any) {
      const message = error.response?.data?.detail || 'Failed to delete rule';
      set({ error: message, isDeleting: false });
      toast.error(message);
      return false;
    }
  },
  
  // Toggle Rule Status
  toggleRuleStatus: async (id: number) => {
    try {
      const rule = await rulesApi.toggleStatus(id);
      
      // Update in list
      set((state) => ({
        rules: state.rules.map((r) => (r.id === id ? rule : r)),
        selectedRule: state.selectedRule?.id === id ? rule : state.selectedRule,
      }));
      
      toast.success(`Rule ${rule.enabled ? 'enabled' : 'disabled'}`);
      
      return true;
    } catch (error: any) {
      const message = error.response?.data?.detail || 'Failed to toggle rule status';
      toast.error(message);
      return false;
    }
  },
  
  // Fetch Statistics
  fetchStatistics: async () => {
    try {
      const statistics = await rulesApi.statistics();
      set({ statistics });
    } catch (error: any) {
      console.error('Failed to fetch statistics:', error);
    }
  },
  
  // UI Actions
  setSelectedRule: (rule: Rule | null) => {
    set({ selectedRule: rule });
  },
  
  setFilters: (filters: Partial<RuleListParams>) => {
    set((state) => ({
      filters: { ...state.filters, ...filters },
      currentPage: 1, // Reset to first page
    }));
    
    // Auto-refresh
    get().fetchRules();
  },
  
  setPage: (page: number) => {
    set({ currentPage: page });
    get().fetchRules();
  },
  
  clearError: () => {
    set({ error: null });
  },
}));
