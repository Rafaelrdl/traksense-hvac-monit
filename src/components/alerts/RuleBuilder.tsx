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

import { useRuleStore } from '@/store/rule';
import { useEquipmentStore } from '@/store/equipment';
import { getParameterLabel, getVariableLabel } from '@/hooks/useIoTParams';
import { ASSET_TYPES } from '@/types/equipment';
import { SEVERITIES, OPERATORS, type Rule } from '@/types/rule';

export const RuleBuilder: React.FC = () => {
  // Estados dos stores
  const { rules, removeRule, toggleRule, migrateRules, markRuleAsReviewed } = useRuleStore();
  const { equipments } = useEquipmentStore();
  
  // Estados locais
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<Rule | null>(null);
  const [selectedEquipmentId, setSelectedEquipmentId] = useState<string>('all');

  // Executar migração na inicialização
  useEffect(() => {
    migrateRules(equipments);
  }, [migrateRules, equipments]);

  // Filtrar regras por equipamento selecionado
  const filteredRules = useMemo(() => {
    if (selectedEquipmentId === 'all') {
      return rules;
    }
    return rules.filter(rule => rule.equipmentId === selectedEquipmentId);
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

  const handleDeleteRule = (ruleId: string) => {
    const rule = rules.find(r => r.id === ruleId);
    removeRule(ruleId);
    toast.success('Regra removida', {
      description: `A regra "${rule?.name}" foi removida.`,
    });
  };

  const handleToggleRule = (ruleId: string) => {
    toggleRule(ruleId);
    const rule = rules.find(r => r.id === ruleId);
    toast.success(rule?.enabled ? 'Regra desativada' : 'Regra ativada', {
      description: `A regra "${rule?.name}" foi ${rule?.enabled ? 'desativada' : 'ativada'}.`,
    });
  };

  const handleReviewRule = (ruleId: string) => {
    markRuleAsReviewed(ruleId);
    toast.success('Regra revisada', {
      description: 'A regra foi marcada como revisada.',
    });
  };

  // Helper functions
  const getSeverityColor = (severity: string) => {
    const sev = SEVERITIES.find(s => s.value === severity);
    return sev?.color || '';
  };

  const getOperatorLabel = (op: string) => {
    return OPERATORS.find(o => o.value === op)?.label || op;
  };

  const getEquipmentName = (equipmentId: string) => {
    const equipment = equipments.find(e => e.id === equipmentId);
    return equipment?.name || 'Equipamento não encontrado';
  };

  const getEquipmentTag = (equipmentId: string) => {
    const equipment = equipments.find(e => e.id === equipmentId);
    return equipment?.tag || '';
  };

  const resolveAssetTypeName = (assetTypeId: string) => {
    const assetType = ASSET_TYPES.find(at => at.id === assetTypeId);
    return assetType?.label || assetTypeId;
  };

  const formatRuleSummary = (rule: Rule) => {
    const equipment = equipments.find(e => e.id === rule.equipmentId);
    const paramLabel = getParameterLabel(rule.parameterKey, equipment?.iotDeviceId);
    const variableLabel = rule.variableKey ? getVariableLabel(rule.parameterKey, rule.variableKey, equipment?.iotDeviceId) : '';
    
    return `${paramLabel}${variableLabel ? ` (${variableLabel})` : ''} ${rule.operator} ${rule.threshold} ${rule.unit || ''} por ${rule.duration} min`;
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
            {equipments.map(equipment => (
              <SelectItem key={equipment.id} value={equipment.id}>
                <div className="flex items-center gap-2">
                  <span>{equipment.name}</span>
                  <span className="text-muted-foreground">({equipment.tag})</span>
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
                    {rule.needsReview && (
                      <Badge variant="outline" className="text-xs text-amber-600 border-amber-300">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        Requer revisão
                      </Badge>
                    )}
                  </div>

                  <p className="text-sm text-muted-foreground mb-3">{rule.description}</p>

                  <div className="flex items-center gap-2 flex-wrap text-sm">
                    <div className="flex items-center gap-1 px-2 py-1 bg-muted rounded">
                      <Activity className="w-3 h-3" />
                      <span className="font-medium">{getEquipmentName(rule.equipmentId)}</span>
                      <span className="text-muted-foreground">({getEquipmentTag(rule.equipmentId)})</span>
                    </div>
                    <span className="text-muted-foreground">→</span>
                    <div className="flex items-center gap-1 px-2 py-1 bg-primary/10 rounded">
                      <span className="font-mono text-xs">{formatRuleSummary(rule)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Criada: {new Date(rule.createdAt).toLocaleDateString('pt-BR')}
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
                      {rule.needsReview && (
                        <DropdownMenuItem onClick={() => handleReviewRule(rule.id)} className="gap-2">
                          <AlertCircle className="w-4 h-4" />
                          Marcar como revisado
                        </DropdownMenuItem>
                      )}
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