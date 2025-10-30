import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Switch } from '@/components/ui/switch';
import { AddRuleModal } from './AddRuleModal';
import {
  Plus,
  Trash2,
  Edit,
  Activity,
  AlertTriangle,
  Zap,
  Clock,
  MoreVertical,
  Filter,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';

import { useRulesStore } from '@/store/rulesStore';
import { useAppStore } from '@/store/app';
import { getParameterLabel, getVariableLabel } from '@/hooks/useIoTParams';
import { ASSET_TYPES } from '@/types/equipment';
import { Rule } from '@/services/api/alerts';

export const RuleBuilder: React.FC = () => {
  // Estados dos stores
  const { 
    rules, 
    isLoading, 
    fetchRules, 
    deleteRule, 
    toggleRuleStatus 
  } = useRulesStore();
  const { assets, loadAssetsFromApi } = useAppStore();
  
  // Estados locais
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<Rule | null>(null);
  const [selectedEquipmentId, setSelectedEquipmentId] = useState<string>('all');

  // Carregar regras e assets do backend ao montar o componente
  useEffect(() => {
    fetchRules();
    loadAssetsFromApi();
  }, [fetchRules, loadAssetsFromApi]);

  // Filtrar regras por equipamento selecionado
  const filteredRules = useMemo(() => {
    if (selectedEquipmentId === 'all') {
      return rules;
    }
    return rules.filter(rule => String(rule.equipment) === selectedEquipmentId);
  }, [rules, selectedEquipmentId]);

  // Handlers
  const handleCreateRule = () => {
    setEditingRule(null);
    setIsModalOpen(true);
  };

  const handleEditRule = (rule: Rule) => {
    setEditingRule(rule);
    setIsModalOpen(true);
  };

  const handleDeleteRule = async (ruleId: number) => {
    const rule = rules.find(r => r.id === ruleId);
    const success = await deleteRule(ruleId);
    if (!success) {
      toast.error('Erro ao remover regra');
    }
  };

  const handleToggleRule = async (ruleId: number) => {
    const success = await toggleRuleStatus(ruleId);
    if (!success) {
      toast.error('Erro ao alterar status da regra');
    }
  };

  // Helper functions
  const getSeverityColor = (severity: string) => {
    const colors: Record<string, string> = {
      'CRITICAL': 'bg-red-100 text-red-800 border-red-300',
      'HIGH': 'bg-orange-100 text-orange-800 border-orange-300',
      'MEDIUM': 'bg-yellow-100 text-yellow-800 border-yellow-300',
      'LOW': 'bg-blue-100 text-blue-800 border-blue-300',
    };
    return colors[severity] || '';
  };

  const getOperatorLabel = (op: string) => {
    const labels: Record<string, string> = {
      '>': 'Maior que',
      '>=': 'Maior ou igual',
      '<': 'Menor que',
      '<=': 'Menor ou igual',
      '==': 'Igual',
      '!=': 'Diferente',
    };
    return labels[op] || op;
  };

  const getEquipmentName = (equipmentId: number, equipmentName?: string) => {
    const asset = assets.find(a => String(a.id) === String(equipmentId));
    return asset?.tag || equipmentName || 'Equipamento não encontrado';
  };

  const getEquipmentTag = (equipmentId: number) => {
    const asset = assets.find(a => String(a.id) === String(equipmentId));
    return asset?.tag || '';
  };

  const resolveAssetTypeName = (assetTypeId: string) => {
    const assetType = ASSET_TYPES.find(at => at.id === assetTypeId);
    return assetType?.label || assetTypeId;
  };

  const formatRuleSummary = (rule: Rule) => {
    const asset = assets.find(a => String(a.id) === String(rule.equipment));
    // Por enquanto, usamos apenas as chaves dos parâmetros sem resolver os labels
    const paramLabel = rule.parameter_key;
    const variableLabel = rule.variable_key ? ` (${rule.variable_key})` : '';
    
    return `${paramLabel}${variableLabel} ${rule.operator} ${rule.threshold} por ${rule.cooldown_minutes} min`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            Construtor de Regras
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Configure regras de monitoramento para alertas automáticos
          </p>
        </div>
        <Button onClick={handleCreateRule} className="gap-2">
          <Plus className="w-4 h-4" />
          Nova Regra
        </Button>
      </div>

      {/* Filtros */}
      <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg border">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium">Filtrar por equipamento:</span>
        </div>
        <Select value={selectedEquipmentId} onValueChange={setSelectedEquipmentId}>
          <SelectTrigger className="w-[300px]">
            <SelectValue placeholder="Todos os equipamentos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os equipamentos</SelectItem>
            {assets.map(asset => (
              <SelectItem key={asset.id} value={String(asset.id)}>
                <div className="flex items-center gap-2">
                  <span>{asset.tag}</span>
                  <span className="text-muted-foreground">({asset.type})</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="text-sm text-muted-foreground">
          {filteredRules.length} regra{filteredRules.length !== 1 ? 's' : ''} encontrada{filteredRules.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Rules List */}
      <div className="space-y-3">
        {filteredRules.length === 0 ? (
          <div className="text-center py-12 bg-muted/30 rounded-lg border-2 border-dashed">
            <Activity className="w-12 h-12 mx-auto mb-4 opacity-50 text-muted-foreground" />
            <p className="text-muted-foreground font-medium">
              {selectedEquipmentId === 'all' 
                ? 'Nenhuma regra configurada' 
                : 'Nenhuma regra encontrada para este equipamento'
              }
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Clique em "Nova Regra" para começar
            </p>
          </div>
        ) : (
          filteredRules.map((rule) => (
            <div
              key={rule.id}
              className={`bg-card rounded-lg p-4 border shadow-sm transition-all ${
                rule.enabled ? 'border-l-4 border-l-primary' : 'opacity-60'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-semibold text-base">{rule.name}</h4>
                    <Badge variant={rule.enabled ? 'default' : 'secondary'} className="text-xs">
                      {rule.enabled ? 'Ativa' : 'Inativa'}
                    </Badge>
                    <Badge className={`text-xs border ${getSeverityColor(rule.severity)}`}>
                      {rule.severity}
                    </Badge>
                  </div>

                  <p className="text-sm text-muted-foreground mb-3">{rule.description}</p>

                  <div className="flex items-center gap-2 flex-wrap text-sm">
                    <div className="flex items-center gap-1 px-2 py-1 bg-muted rounded">
                      <Activity className="w-3 h-3" />
                      <span className="font-medium">{getEquipmentName(rule.equipment, rule.equipment_name)}</span>
                      <span className="text-muted-foreground">({getEquipmentTag(rule.equipment)})</span>
                    </div>
                    <span className="text-muted-foreground">→</span>
                    <div className="flex items-center gap-1 px-2 py-1 bg-primary/10 rounded">
                      <span className="font-mono text-xs">{formatRuleSummary(rule)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Criada: {new Date(rule.created_at).toLocaleDateString('pt-BR')}
                    </div>
                    <div className="flex items-center gap-1">
                      Ações: {rule.actions.join(', ')}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  <Switch
                    checked={rule.enabled}
                    onCheckedChange={() => handleToggleRule(rule.id)}
                  />
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEditRule(rule)} className="gap-2">
                        <Edit className="w-4 h-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDeleteRule(rule.id)}
                        className="gap-2 text-destructive focus:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add/Edit Rule Modal */}
      <AddRuleModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        editingRule={editingRule}
      />
    </div>
  );
};