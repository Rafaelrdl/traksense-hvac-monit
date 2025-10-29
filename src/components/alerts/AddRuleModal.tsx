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

import { useEquipmentStore } from '@/store/equipment';
import { useRuleStore } from '@/store/rule';
import { useIoTParams, getParameterLabel } from '@/hooks/useIoTParams';
import { ASSET_TYPES } from '@/types/equipment';
import { OPERATORS, SEVERITIES, AVAILABLE_ACTIONS, type Rule } from '@/types/rule';

interface AddRuleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingRule?: Rule | null;
}

export function AddRuleModal({ open, onOpenChange, editingRule }: AddRuleModalProps) {
  const equipments = useEquipmentStore(s => s.equipments);
  const { addRule, updateRule } = useRuleStore();

  // Estados dos campos do formulário
  const [equipmentId, setEquipmentId] = useState<string>('');
  const [parameterKey, setParameterKey] = useState<string>('');
  const [variableKey, setVariableKey] = useState<string>('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    operator: '>' as (">" | ">=" | "<" | "<=" | "==" | "!="),
    threshold: '',
    duration: '5',
    severity: 'Medium' as ('Critical' | 'High' | 'Medium' | 'Low'),
    actions: ['IN_APP'] as ('EMAIL' | 'IN_APP' | 'SMS' | 'WHATSAPP')[],
  });

  // Dados derivados do equipamento selecionado
  const equipment = useMemo(() => 
    equipments.find(e => e.id === equipmentId), [equipments, equipmentId]
  );

  // Hook para carregar parâmetros IoT
  const { params, loading: paramsLoading } = useIoTParams(equipment?.iotDeviceId);

  // Parâmetro selecionado e suas variáveis
  const selectedParam = useMemo(() => 
    params.find(p => p.key === parameterKey), [params, parameterKey]
  );

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
      setEquipmentId(editingRule.equipmentId);
      setParameterKey(editingRule.parameterKey);
      setVariableKey(editingRule.variableKey || '');
      setFormData({
        name: editingRule.name,
        description: editingRule.description,
        operator: editingRule.operator,
        threshold: editingRule.threshold.toString(),
        duration: editingRule.duration.toString(),
        severity: editingRule.severity,
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
        severity: 'Medium',
        actions: ['IN_APP'],
      });
    }
  }, [editingRule, open]);

  const handleSaveRule = () => {
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

    const ruleData = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      equipmentId,
      assetTypeId: equipment!.assetTypeId,
      parameterKey,
      variableKey: variableKey || undefined,
      operator: formData.operator,
      threshold: parseFloat(formData.threshold),
      unit: selectedParam?.unit,
      duration: parseInt(formData.duration),
      severity: formData.severity,
      actions: formData.actions,
      enabled: true,
    };

    if (editingRule) {
      updateRule(editingRule.id, ruleData);
      toast.success('Regra atualizada!', {
        description: `A regra "${formData.name}" foi atualizada com sucesso.`,
      });
    } else {
      addRule(ruleData);
      toast.success('Regra criada!', {
        description: `A regra "${formData.name}" foi criada com sucesso.`,
      });
    }

    onOpenChange(false);
  };

  const toggleAction = (action: 'EMAIL' | 'IN_APP' | 'SMS' | 'WHATSAPP') => {
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
                  {equipments
                    .filter(e => e.status === 'active')
                    .map(e => (
                      <SelectItem key={e.id} value={e.id}>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{e.name}</span>
                          <span className="text-muted-foreground">({e.tag})</span>
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
                  <strong>Tipo de ativo:</strong> {resolveAssetTypeName(equipment.assetTypeId)}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Derivado automaticamente do equipamento selecionado
                </div>
              </div>
            )}

            {/* Parâmetro */}
            <div className="space-y-2">
              <Label>Parâmetros a monitor *</Label>
              <Select 
                value={parameterKey} 
                onValueChange={setParameterKey} 
                disabled={!equipment || paramsLoading}
              >
                <SelectTrigger>
                  <SelectValue 
                    placeholder={
                      paramsLoading 
                        ? "Carregando parâmetros..." 
                        : !equipment 
                          ? "Selecione um equipamento primeiro"
                          : "Selecione o parâmetro"
                    } 
                  />
                </SelectTrigger>
                <SelectContent>
                  {params.map(p => (
                    <SelectItem key={p.key} value={p.key}>
                      <div className="flex items-center gap-2">
                        <span>{p.label}</span>
                        {p.unit && <span className="text-muted-foreground">({p.unit})</span>}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {paramsLoading && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Carregando parâmetros IoT...
                </div>
              )}

              {equipment && !paramsLoading && params.length === 0 && (
                <div className="flex items-center gap-2 text-sm text-amber-600">
                  <AlertCircle className="w-4 h-4" />
                  Nenhum parâmetro IoT encontrado para este equipamento
                </div>
              )}
            </div>

            {/* Variável (campo condicional) */}
            {selectedParam?.variables && selectedParam.variables.length > 0 && (
              <div className="space-y-2">
                <Label>Variável *</Label>
                <Select value={variableKey} onValueChange={setVariableKey}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a variável" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedParam.variables.map(v => (
                      <SelectItem key={v.key} value={v.key}>
                        {v.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="text-xs text-muted-foreground">
                  Especifica como o parâmetro deve ser avaliado (ex: valor atual, média, máximo)
                </div>
              </div>
            )}

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
                {AVAILABLE_ACTIONS.map(action => (
                  <div
                    key={action.value}
                    className="flex items-center justify-between p-3 rounded-lg border"
                  >
                    <span className="text-sm">{action.label}</span>
                    <Switch
                      checked={formData.actions.includes(action.value)}
                      onCheckedChange={() => toggleAction(action.value)}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Preview da regra */}
            {formData.name && equipmentId && parameterKey && formData.threshold && (
              <div className="bg-muted/50 rounded-lg p-4 border">
                <p className="text-xs font-medium text-muted-foreground mb-2">Preview da Regra:</p>
                <div className="space-y-1 text-sm">
                  <div>
                    <strong>SE</strong> {equipment?.name} →{' '}
                    {getParameterLabel(parameterKey, equipment?.iotDeviceId)}
                    {variableKey && ` (${selectedParam?.variables?.find(v => v.key === variableKey)?.label})`}{' '}
                    <strong>{getOperatorLabel(formData.operator)}</strong>{' '}
                    <strong>{formData.threshold}</strong>{' '}
                    {selectedParam?.unit}
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
          <Button onClick={handleSaveRule} disabled={paramsLoading}>
            <CheckCircle2 className="w-4 h-4 mr-2" />
            {editingRule ? 'Salvar Alterações' : 'Criar Regra'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}