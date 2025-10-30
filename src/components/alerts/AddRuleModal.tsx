import React, { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

import { useAppStore } from '@/store/app';
import { useRulesStore } from '@/store/rulesStore';
import { useIoTParams, getParameterLabel } from '@/hooks/useIoTParams';
import { ASSET_TYPES } from '@/types/equipment';
import { Rule, type NotificationAction, type Operator, type Severity } from '@/services/api/alerts';

interface AddRuleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingRule?: Rule | null;
}

// Constantes para o modal
const SEVERITIES = [
  { value: 'CRITICAL', label: 'Crítico', color: 'bg-red-100 text-red-800 border-red-300' },
  { value: 'HIGH', label: 'Alto', color: 'bg-orange-100 text-orange-800 border-orange-300' },
  { value: 'MEDIUM', label: 'Médio', color: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
  { value: 'LOW', label: 'Baixo', color: 'bg-blue-100 text-blue-800 border-blue-300' },
] as const;

const OPERATORS = [
  { value: '>', label: 'Maior que' },
  { value: '>=', label: 'Maior ou igual' },
  { value: '<', label: 'Menor que' },
  { value: '<=', label: 'Menor ou igual' },
  { value: '==', label: 'Igual' },
  { value: '!=', label: 'Diferente' },
] as const;

const AVAILABLE_ACTIONS: NotificationAction[] = ['EMAIL', 'IN_APP', 'SMS', 'WHATSAPP'];

export function AddRuleModal({ open, onOpenChange, editingRule }: AddRuleModalProps) {
  const assets = useAppStore(s => s.assets);
  const { createRule, updateRule, fetchRules } = useRulesStore();

  // Estados dos campos do formulário
  const [equipmentId, setEquipmentId] = useState<string>('');
  const [parameterKey, setParameterKey] = useState<string>('');
  const [variableKey, setVariableKey] = useState<string>('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    operator: '>' as Operator,
    threshold: '',
    duration: '5',  // Minutos de cooldown
    severity: 'MEDIUM' as Severity,
    actions: ['IN_APP'] as NotificationAction[],
  });

  // Estados para parâmetros IoT
  const [availableParameters, setAvailableParameters] = useState<Array<{
    key: string; 
    label: string; 
    type: string;
    sensorId: number;
    sensorTag: string;
  }>>([]);
  const [loadingParams, setLoadingParams] = useState(false);

  // Dados derivados do equipamento selecionado
  const equipment = useMemo(() => 
    assets.find(e => String(e.id) === equipmentId), [assets, equipmentId]
  );

  // Parâmetro selecionado
  const selectedParam = useMemo(() => 
    availableParameters.find(p => p.key === parameterKey), [availableParameters, parameterKey]
  );

  // Buscar sensores quando equipamento for selecionado
  useEffect(() => {
    const loadSensors = async () => {
      if (!equipmentId) {
        setAvailableParameters([]);
        return;
      }

      setLoadingParams(true);
      try {
        const { assetsService } = await import('@/services/assetsService');
        const sensors = await assetsService.getSensors(parseInt(equipmentId));
        
        // Extrair parâmetros dos sensores (usar sensor.id como key para garantir unicidade)
        const params = sensors.map(sensor => ({
          key: `sensor_${sensor.id}`, // Chave única usando o ID do sensor
          label: `${sensor.tag} - ${sensor.metric_type}`,
          type: sensor.metric_type,
          sensorId: sensor.id,
          sensorTag: sensor.tag,
        }));
        
        setAvailableParameters(params);
      } catch (error) {
        console.error('Erro ao carregar sensores:', error);
        toast.error('Erro ao carregar parâmetros do equipamento');
        setAvailableParameters([]);
      } finally {
        setLoadingParams(false);
      }
    };

    loadSensors();
  }, [equipmentId]);

  // Função para resolver nome do tipo de ativo
  const resolveAssetTypeName = (assetTypeId: string) => {
    const assetType = ASSET_TYPES.find(at => at.id === assetTypeId);
    return assetType?.label || assetTypeId;
  };

  // Reset campos dependentes quando equipamento muda
  useEffect(() => {
    setParameterKey('');
    setVariableKey('');
  }, [equipmentId]);

  // Reset variável quando parâmetro muda
  useEffect(() => {
    setVariableKey('');
  }, [parameterKey]);

  // Preencher formulário quando editando
  useEffect(() => {
    if (editingRule && open) {
      setEquipmentId(String(editingRule.equipment));
      setParameterKey(editingRule.parameter_key);
      setVariableKey(editingRule.variable_key || '');
      
      // Converte severity de PascalCase (backend) para UPPERCASE (frontend)
      const severityMap: Record<string, Severity> = {
        'Critical': 'CRITICAL',
        'High': 'HIGH',
        'Medium': 'MEDIUM',
        'Low': 'LOW',
      };
      const frontendSeverity = severityMap[editingRule.severity] || editingRule.severity.toUpperCase() as Severity;
      
      setFormData({
        name: editingRule.name,
        description: editingRule.description,
        operator: editingRule.operator,
        threshold: editingRule.threshold.toString(),
        duration: editingRule.duration.toString(),
        severity: frontendSeverity,
        actions: editingRule.actions,
      });
    } else {
      // Reset para nova regra
      setEquipmentId('');
      setParameterKey('');
      setVariableKey('');
      setFormData({
        name: '',
        description: '',
        operator: '>',
        threshold: '',
        duration: '5',
        severity: 'MEDIUM',
        actions: ['IN_APP'],
      });
    }
  }, [editingRule, open]);

  const handleSaveRule = async () => {
    // Validações
    if (!formData.name.trim()) {
      toast.error('Nome da regra é obrigatório');
      return;
    }

    if (!equipmentId) {
      toast.error('Selecione um equipamento');
      return;
    }

    if (!parameterKey) {
      toast.error('Selecione um parâmetro');
      return;
    }

    if (!formData.threshold.trim()) {
      toast.error('Valor limite é obrigatório');
      return;
    }

    if (formData.actions.length === 0) {
      toast.error('Selecione pelo menos uma ação');
      return;
    }

    // Converte severity de UPPERCASE para PascalCase (backend Django)
    const severityMap: Record<string, Severity> = {
      'CRITICAL': 'Critical' as Severity,
      'HIGH': 'High' as Severity,
      'MEDIUM': 'Medium' as Severity,
      'LOW': 'Low' as Severity,
    };

    const ruleData = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      equipment: parseInt(equipmentId),
      parameter_key: parameterKey,
      variable_key: variableKey || '',
      operator: formData.operator,
      threshold: parseFloat(formData.threshold),
      duration: parseInt(formData.duration),
      severity: severityMap[formData.severity] || formData.severity,
      actions: formData.actions,
      enabled: true,
    };

    if (editingRule) {
      const result = await updateRule(editingRule.id, ruleData);
      if (result) {
        toast.success('Regra atualizada!', {
          description: `A regra "${formData.name}" foi atualizada com sucesso.`,
        });
        await fetchRules();
        onOpenChange(false);
      }
    } else {
      const result = await createRule(ruleData);
      if (result) {
        toast.success('Regra criada!', {
          description: `A regra "${formData.name}" foi criada com sucesso.`,
        });
        await fetchRules();
        onOpenChange(false);
      }
    }
  };

  const toggleAction = (action: NotificationAction) => {
    setFormData(prev => ({
      ...prev,
      actions: prev.actions.includes(action)
        ? prev.actions.filter(a => a !== action)
        : [...prev.actions, action],
    }));
  };

  const getSeverityColor = (severity: string) => {
    const sev = SEVERITIES.find(s => s.value === severity);
    return sev?.color || '';
  };

  const getOperatorLabel = (op: string) => {
    return OPERATORS.find(o => o.value === op)?.label || op;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {editingRule ? 'Editar Regra' : 'Adicionar Nova Regra'}
          </DialogTitle>
          <DialogDescription>
            Configure os parâmetros para criação de alertas automáticos baseados em equipamentos IoT
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-4">
            {/* Nome e Descrição */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ruleName">Nome da Regra *</Label>
                <Input
                  id="ruleName"
                  placeholder="Ex: Alta Pressão Chiller"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ruleDescription">Descrição</Label>
                <Input
                  id="ruleDescription"
                  placeholder="Descreva o propósito desta regra"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
            </div>

            <Separator />

            {/* Equipamento */}
            <div className="space-y-2">
              <Label>Equipamentos cadastrados *</Label>
              <Select value={equipmentId} onValueChange={setEquipmentId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um equipamento" />
                </SelectTrigger>
                <SelectContent>
                  {assets
                    .filter(e => e.status === 'OK' || e.status === 'Alert')
                    .map(e => (
                      <SelectItem key={e.id} value={String(e.id)}>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{e.tag}</span>
                          <span className="text-muted-foreground">({e.type})</span>
                        </div>
                      </SelectItem>
                    ))
                  }
                </SelectContent>
              </Select>
            </div>

            {/* Tipo de ativo (derivado e somente leitura) */}
            {equipment && (
              <div className="bg-muted/50 rounded-lg p-3 border">
                <div className="text-sm text-muted-foreground">
                  <strong>Tipo de ativo:</strong> {equipment.type}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Derivado automaticamente do equipamento selecionado
                </div>
              </div>
            )}

            {/* Parâmetro */}
            <div className="space-y-2">
              <Label>Parâmetros a monitorar *</Label>
              <Select 
                value={parameterKey} 
                onValueChange={setParameterKey} 
                disabled={!equipment || loadingParams}
              >
                <SelectTrigger>
                  <SelectValue 
                    placeholder={
                      loadingParams 
                        ? "Carregando parâmetros..." 
                        : !equipment 
                          ? "Selecione um equipamento primeiro"
                          : "Selecione o parâmetro"
                    } 
                  />
                </SelectTrigger>
                <SelectContent>
                  {availableParameters.map(p => (
                    <SelectItem key={p.key} value={p.key}>
                      <div className="flex items-center gap-2">
                        <span>{p.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {loadingParams && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Carregando parâmetros IoT...
                </div>
              )}

              {equipment && !loadingParams && availableParameters.length === 0 && (
                <div className="flex items-center gap-2 text-sm text-amber-600">
                  <AlertCircle className="w-4 h-4" />
                  Nenhum sensor encontrado para este equipamento
                </div>
              )}
            </div>

            <Separator />

            {/* Condição */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Operador *</Label>
                <Select value={formData.operator} onValueChange={(value: any) => setFormData(prev => ({ ...prev, operator: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {OPERATORS.map(op => (
                      <SelectItem key={op.value} value={op.value}>
                        {op.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Valor Limite *</Label>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="Ex: 250"
                  value={formData.threshold}
                  onChange={(e) => setFormData(prev => ({ ...prev, threshold: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label>Duração (min) *</Label>
                <Input
                  type="number"
                  min="1"
                  placeholder="Ex: 5"
                  value={formData.duration}
                  onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                />
              </div>
            </div>

            {/* Severidade */}
            <div className="space-y-2">
              <Label>Severidade do Alerta *</Label>
              <div className="grid grid-cols-2 gap-2">
                {SEVERITIES.map(sev => (
                  <button
                    key={sev.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, severity: sev.value as any }))}
                    className={`p-3 rounded-lg border-2 text-left transition-all ${
                      formData.severity === sev.value
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <span className={`text-sm font-medium px-2 py-1 rounded ${sev.color}`}>
                      {sev.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Ações ao disparar */}
            <div className="space-y-2">
              <Label>Ações ao disparar *</Label>
              <p className="text-xs text-muted-foreground">
                Selecione quais canais de notificação devem ser acionados quando esta regra disparar.
                As preferências individuais de cada usuário serão respeitadas.
              </p>
              <div className="space-y-2">
                {AVAILABLE_ACTIONS.map(action => {
                  const labels: Record<NotificationAction, string> = {
                    EMAIL: 'E-mail',
                    IN_APP: 'Notificação no App',
                    SMS: 'SMS',
                    WHATSAPP: 'WhatsApp',
                  };
                  return (
                    <div
                      key={action}
                      className="flex items-center justify-between p-3 rounded-lg border"
                    >
                      <span className="text-sm">{labels[action]}</span>
                      <Switch
                        checked={formData.actions.includes(action)}
                        onCheckedChange={() => toggleAction(action)}
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Preview da regra */}
            {formData.name && equipmentId && parameterKey && formData.threshold && (
              <div className="bg-muted/50 rounded-lg p-4 border">
                <p className="text-xs font-medium text-muted-foreground mb-2">Preview da Regra:</p>
                <div className="space-y-1 text-sm">
                  <div>
                    <strong>SE</strong> {equipment?.tag} →{' '}
                    {parameterKey}
                    {variableKey && ` (${variableKey})`}{' '}
                    <strong>{getOperatorLabel(formData.operator)}</strong>{' '}
                    <strong>{formData.threshold}</strong>
                  </div>
                  <div>
                    <strong>POR</strong> {formData.duration} minutos
                  </div>
                  <div>
                    <strong>ENTÃO</strong> gerar alerta{' '}
                    <Badge className={getSeverityColor(formData.severity)}>
                      {formData.severity}
                    </Badge>{' '}
                    com ações: {formData.actions.join(', ')}
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSaveRule} disabled={loadingParams}>
            <CheckCircle2 className="w-4 h-4 mr-2" />
            {editingRule ? 'Salvar Alterações' : 'Criar Regra'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}