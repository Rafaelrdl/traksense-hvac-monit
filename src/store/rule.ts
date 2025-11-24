import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Rule, LegacyRule } from '@/types/rule';
import type { Equipment } from '@/types/equipment';

interface RuleState {
  rules: Rule[];
  
  // Actions
  addRule: (rule: Omit<Rule, 'id' | 'createdAt'>) => void;
  updateRule: (id: string, rule: Partial<Rule>) => void;
  removeRule: (id: string) => void;
  toggleRule: (id: string) => void;
  getRuleById: (id: string) => Rule | undefined;
  getRulesByEquipment: (equipmentId: string) => Rule[];
  markRuleAsReviewed: (id: string) => void;
  
  // Migration
  migrateRules: (equipments: Equipment[]) => void;
}

// No mock data - use real API data only
export const useRuleStore = create<RuleState>()(
  persist(
    (set, get) => ({
      rules: [],

      addRule: (ruleData) => {
        const newRule: Rule = {
          ...ruleData,
          id: `rule-${Date.now()}`,
          createdAt: Date.now(),
        };
        
        set((state) => ({
          rules: [...state.rules, newRule],
        }));
      },

      updateRule: (id, updates) => {
        set((state) => ({
          rules: state.rules.map((rule) =>
            rule.id === id ? { ...rule, ...updates } : rule
          ),
        }));
      },

      removeRule: (id) => {
        set((state) => ({
          rules: state.rules.filter((rule) => rule.id !== id),
        }));
      },

      toggleRule: (id) => {
        set((state) => ({
          rules: state.rules.map((rule) =>
            rule.id === id ? { ...rule, enabled: !rule.enabled } : rule
          ),
        }));
      },

      getRuleById: (id) => {
        return get().rules.find((rule) => rule.id === id);
      },

      getRulesByEquipment: (equipmentId) => {
        return get().rules.filter((rule) => rule.equipmentId === equipmentId);
      },

      markRuleAsReviewed: (id) => {
        set((state) => ({
          rules: state.rules.map((rule) =>
            rule.id === id ? { ...rule, needsReview: false } : rule
          ),
        }));
      },

      migrateRules: (equipments) => {
        const currentRules = get().rules;
        
        // Se já há regras migradas, não refaz a migração
        if (currentRules.length > 0) {
          return;
        }

        const eqById = new Map(equipments.map(e => [e.id, e]));
        
        // Mock rules removed - no migration needed
        // Rules are now loaded from API only
        console.log('Rule migration removed - using API data only');
      },
    }),
    {
      name: 'rule-store',
      version: 2, // Incrementa quando há mudanças no schema
    }
  )
);