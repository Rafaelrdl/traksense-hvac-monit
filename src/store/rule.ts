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
        let changed = false;
        
        const migratedRules: Rule[] = mockRules.map((rule) => {
          const legacyRule = rule as LegacyRule;
          let ruleChanged = false;
          
          // Criar uma cópia da regra para migração
          const migratedRule: Rule = {
            id: rule.id,
            name: rule.name,
            description: rule.description,
            equipmentId: rule.equipmentId,
            assetTypeId: rule.assetTypeId,
            parameterKey: rule.parameterKey,
            variableKey: rule.variableKey,
            operator: rule.operator,
            threshold: rule.threshold,
            unit: rule.unit,
            duration: rule.duration,
            severity: rule.severity,
            actions: [],
            enabled: rule.enabled,
            createdAt: rule.createdAt,
            needsReview: false,
          };

          // 1. Derivar assetTypeId do equipamento se necessário
          const equipment = rule.equipmentId ? eqById.get(rule.equipmentId) : undefined;
          if (equipment && rule.assetTypeId !== equipment.assetTypeId) {
            migratedRule.assetTypeId = equipment.assetTypeId;
            ruleChanged = true;
          }

          // 2. Remover WEBHOOK das ações
          const oldActions = legacyRule.actions || [];
          const cleanActions = oldActions.filter((a: any) => a !== 'WEBHOOK') as ('EMAIL' | 'IN_APP')[];
          
          if (oldActions.includes('WEBHOOK' as any)) {
            ruleChanged = true;
          }

          // 3. Se não restou nenhuma ação, definir IN_APP e marcar para revisão
          if (cleanActions.length === 0) {
            migratedRule.actions = ['IN_APP'];
            migratedRule.enabled = false;
            migratedRule.needsReview = true;
            ruleChanged = true;
          } else {
            migratedRule.actions = cleanActions;
          }

          if (ruleChanged) {
            changed = true;
          }

          return migratedRule;
        });

        if (changed) {
          set({ rules: migratedRules });
          console.log(`Migração de regras concluída. ${migratedRules.length} regras migradas.`);
        } else {
          set({ rules: migratedRules });
        }
      },
    }),
    {
      name: 'rule-store',
      version: 2, // Incrementa quando há mudanças no schema
    }
  )
);