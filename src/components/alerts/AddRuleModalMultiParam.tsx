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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Plus, Trash2, AlertCircle, Info } from 'lucide-react';
import { toast } from 'sonner';

import { useAppStore } from '@/store/app';
import { useRulesStore } from '@/store/rulesStore';
import { ASSET_TYPES } from '@/types/equipment';
import { 
  Rule, 
  RuleParameter,
  type NotificationAction, 
  type Operator, 
  type Severity 
} from '@/services/api/alerts';

interface AddRuleModalMultiParamProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingRule?: Rule | null;
}

// Constantes
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

// Template padrão de mensagem
const DEFAULT_MESSAGE_TEMPLATE = "{sensor} está {operator} {threshold}{unit} (valor atual: {value}{unit})";

export function AddRuleModalMultiParam({ open, onOpenChange, editingRule }: AddRuleModalMultiParamProps) {
  const assets = useAppStore(s => s.assets);
  const { createRule, updateRule, fetchRules } = useRulesStore();

  // Estados básicos da regra
  const [equipmentId, setEquipmentId] = useState<string>('');
  const [ruleName, setRuleName] = useState('');
  const [ruleDescription, setRuleDescription] = useState('');
  const [actions, setActions] = useState<NotificationAction[]>(['IN_APP']);

  // Estado dos parâmetros (múltiplos)
  const [parameters, setParameters] = useState<RuleParameter[]>([]);

  // Estados para parâmetros disponíveis do equipamento
  const [availableParameters, setAvailableParameters] = useState<Array<{
    key: string; 
    label: string; 
    type: string;
    sensorId: number;
    sensorTag: string;
  }>>([]);
  const [loadingParams, setLoadingParams] = useState(false);

  // Flag de inicialização
  const [isInitializing, setIsInitializing] = useState(false);

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
        
        const params = sensors.map(sensor => ({
          key: `sensor_${sensor.id}`,
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

  // Preencher formulário quando editando
  useEffect(() => {
    if (editingRule && open) {
      setIsInitializing(true);
      
      setEquipmentId(String(editingRule.equipment));
      setRuleName(editingRule.name);
      setRuleDescription(editingRule.description);
      setActions(editingRule.actions);

      // Se a regra tem o novo formato (array de parameters)
      if (editingRule.parameters && editingRule.parameters.length > 0) {
        setParameters(editingRule.parameters);
      } 
      // Se é regra antiga (campo único), converter para array
      else if (editingRule.parameter_key) {
        const severityMap: Record<string, Severity> = {
          'Critical': 'CRITICAL',
          'High': 'HIGH',
          'Medium': 'MEDIUM',
          'Low': 'LOW',
        };
        
        setParameters([{
          parameter_key: editingRule.parameter_key,
          variable_key: editingRule.variable_key || '',
          operator: editingRule.operator!,
          threshold: editingRule.threshold!,
          duration: editingRule.duration!,
          severity: severityMap[editingRule.severity!] || editingRule.severity!.toUpperCase() as Severity,
          message_template: DEFAULT_MESSAGE_TEMPLATE,
          unit: editingRule.unit,
        }]);
      }
      
      setTimeout(() => setIsInitializing(false), 0);
    } else {
      // Reset para nova regra
      setIsInitializing(false);
      setEquipmentId('');
      setRuleName('');
      setRuleDescription('');
      setActions(['IN_APP']);
      setParameters([]);
    }
  }, [editingRule, open]);

  // Adicionar novo parâmetro
  const addParameter = () => {
    const newParam: RuleParameter = {
      parameter_key: '',
      variable_key: '',
      operator: '>',
      threshold: 0,
      duration: 5,
      severity: 'MEDIUM',
      message_template: DEFAULT_MESSAGE_TEMPLATE,
    };
    setParameters([...parameters, newParam]);
  };

  // Remover parâmetro
  const removeParameter = (index: number) => {
    setParameters(parameters.filter((_, i) => i !== index));
  };

  // Atualizar parâmetro específico
  const updateParameter = (index: number, field: keyof RuleParameter, value: any) => {
    const updated = [...parameters];
    updated[index] = { ...updated[index], [field]: value };
    setParameters(updated);
  };

  // Validar e salvar regra
  const handleSaveRule = async () => {
    // Validações básicas
    if (!ruleName.trim()) {
      toast.error('Nome da regra é obrigatório');
      return;
    }

    if (!equipmentId) {
      toast.error('Selecione um equipamento');
      return;
    }

    if (parameters.length === 0) {
      toast.error('Adicione pelo menos um parâmetro');
      return;
    }

    // Validar cada parâmetro
    for (let i = 0; i < parameters.length; i++) {
      const param = parameters[i];
      
      if (!param.parameter_key) {
        toast.error(`Parâmetro ${i + 1}: Selecione um sensor`);
        return;
      }
      
      if (!param.message_template.trim()) {
        toast.error(`Parâmetro ${i + 1}: Mensagem é obrigatória`);
        return;
      }
    }

    if (actions.length === 0) {
      toast.error('Selecione pelo menos uma ação');
      return;
    }

    // Converter severidades para formato backend
    const severityMap: Record<string, Severity> = {
      'CRITICAL': 'Critical' as Severity,
      'HIGH': 'High' as Severity,
      'MEDIUM': 'Medium' as Severity,
      'LOW': 'Low' as Severity,
    };

    const convertedParams = parameters.map(param => ({
      ...param,
      severity: severityMap[param.severity] || param.severity,
    }));

    const ruleData = {
      name: ruleName.trim(),
      description: ruleDescription.trim(),
      equipment: parseInt(equipmentId),
      parameters: convertedParams,
      actions: actions,
      enabled: true,
    };

    if (editingRule) {
      const result = await updateRule(editingRule.id, ruleData);
      if (result) {
        toast.success('Regra atualizada!', {
          description: `A regra "${ruleName}" foi atualizada com sucesso.`,
        });
        await fetchRules();
        onOpenChange(false);
      }
    } else {
      const result = await createRule(ruleData);
      if (result) {
        toast.success('Regra criada!', {
          description: `A regra "${ruleName}" foi criada com sucesso.`,
        });
        await fetchRules();
        onOpenChange(false);
      }
    }
  };

  const toggleAction = (action: NotificationAction) => {
    setActions(prev =>
      prev.includes(action)
        ? prev.filter(a => a !== action)
        : [...prev, action]
    );
  };

  const getSeverityColor = (severity: string) => {
    const sev = SEVERITIES.find(s => s.value === severity);
    return sev?.color || '';
  };

  const getOperatorLabel = (op: string) => {
    return OPERATORS.find(o => o.value === op)?.label || op;
  };

  const getSensorLabel = (paramKey: string) => {
    const param = availableParameters.find(p => p.key === paramKey);
    return param?.label || paramKey;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] h-[90vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4 shrink-0">
          <DialogTitle className="flex items-center gap-2">
            {editingRule ? 'Editar Regra' : 'Criar Nova Regra'}
          </DialogTitle>
          <DialogDescription>
            Configure múltiplos parâmetros para monitoramento de um equipamento IoT
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 min-h-0">
          <div className="space-y-6 pb-4">
            
            {/* Informações Básicas */}
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="rule-name" className="text-xs">
                    Nome da Regra <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="rule-name"
                    placeholder="Ex: Alta Pressão Chiller"
                    className="h-9"
                    value={ruleName}
                    onChange={(e) => setRuleName(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="equipment" className="text-xs">
                    Equipamentos cadastrados <span className="text-destructive">*</span>
                  </Label>
                  <Select value={equipmentId} onValueChange={setEquipmentId}>
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Selecione um equipamento" />
                    </SelectTrigger>
                    <SelectContent>
                      {assets.map((asset) => (
                        <SelectItem key={asset.id} value={String(asset.id)}>
                          {asset.tag} ({asset.type})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="description" className="text-xs">Descrição</Label>
                <Textarea
                  id="description"
                  placeholder="Descreva o propósito desta regra"
                  value={ruleDescription}
                  onChange={(e) => setRuleDescription(e.target.value)}
                  rows={2}
                  className="text-sm resize-none"
                />
              </div>
            </div>

            <Separator />

            {/* Parâmetros (Múltiplos) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold">Parâmetros a Monitorar</h3>
                  <p className="text-xs text-muted-foreground">
                    Adicione um ou mais parâmetros para monitoramento
                  </p>
                </div>
                <Button
                  type="button"
                  onClick={addParameter}
                  disabled={!equipmentId || loadingParams}
                  size="sm"
                  className="h-8 text-xs"
                >
                  <Plus className="w-3.5 h-3.5 mr-1.5" />
                  Adicionar
                </Button>
              </div>

              {!equipmentId && (
                <Card className="border-blue-200 bg-blue-50">
                  <CardContent className="pt-3 pb-3 px-3">
                    <div className="flex items-start gap-2">
                      <Info className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                      <p className="text-xs text-blue-800">
                        Selecione um equipamento acima para adicionar parâmetros de monitoramento
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {parameters.length === 0 && equipmentId && (
                <Card className="border-orange-200 bg-orange-50">
                  <CardContent className="pt-3 pb-3 px-3">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-orange-600 mt-0.5 shrink-0" />
                      <p className="text-xs text-orange-800">
                        Nenhum parâmetro adicionado. Clique em "Adicionar" para começar.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Lista de Parâmetros */}
              <div className="space-y-3">
                {parameters.map((param, index) => (
                  <Card key={index} className="border-2 shadow-sm">
                    <CardHeader className="pb-3 pt-4 px-4">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-semibold">
                          Parâmetro {index + 1}
                        </CardTitle>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeParameter(index)}
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3 px-4 pb-4">
                      
                      {/* Seletor de Sensor */}
                      <div className="space-y-1.5">
                        <Label className="text-xs">
                          Sensor <span className="text-destructive">*</span>
                        </Label>
                        <Select
                          value={param.parameter_key}
                          onValueChange={(value) => updateParameter(index, 'parameter_key', value)}
                          disabled={loadingParams}
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue placeholder="Selecione um sensor" />
                          </SelectTrigger>
                          <SelectContent>
                            {loadingParams ? (
                              <div className="p-2 text-center text-sm text-muted-foreground">
                                <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                                Carregando sensores...
                              </div>
                            ) : availableParameters.length === 0 ? (
                              <div className="p-2 text-center text-sm text-muted-foreground">
                                Nenhum sensor disponível
                              </div>
                            ) : (
                              availableParameters.map((p) => (
                                <SelectItem key={p.key} value={p.key}>
                                  {p.label}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Condição e Valor */}
                      <div className="grid grid-cols-3 gap-2">
                        <div className="space-y-1.5">
                          <Label className="text-xs">
                            Operador <span className="text-destructive">*</span>
                          </Label>
                          <Select
                            value={param.operator}
                            onValueChange={(value) => updateParameter(index, 'operator', value as Operator)}
                          >
                            <SelectTrigger className="h-9">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {OPERATORS.map((op) => (
                                <SelectItem key={op.value} value={op.value}>
                                  {op.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-1.5">
                          <Label className="text-xs">
                            Valor Limite <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            type="number"
                            step="0.1"
                            placeholder="Ex: 250"
                            className="h-9"
                            value={param.threshold}
                            onChange={(e) => updateParameter(index, 'threshold', parseFloat(e.target.value) || 0)}
                          />
                        </div>

                        <div className="space-y-1.5">
                          <Label className="text-xs">
                            Duração (min) <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            type="number"
                            min="1"
                            placeholder="5"
                            className="h-9"
                            value={param.duration}
                            onChange={(e) => updateParameter(index, 'duration', parseInt(e.target.value) || 5)}
                          />
                        </div>
                      </div>

                      {/* Severidade */}
                      <div className="space-y-1.5">
                        <Label className="text-xs">
                          Severidade do Alerta <span className="text-destructive">*</span>
                        </Label>
                        <div className="grid grid-cols-4 gap-1.5">
                          {SEVERITIES.map((sev) => (
                            <button
                              key={sev.value}
                              type="button"
                              onClick={() => updateParameter(index, 'severity', sev.value)}
                              className={`
                                px-2 py-1.5 rounded-md border-2 text-xs font-medium transition-all
                                ${param.severity === sev.value
                                  ? `${sev.color} ring-2 ring-offset-1`
                                  : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                                }
                              `}
                            >
                              {sev.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Mensagem Personalizada */}
                      <div className="space-y-1.5">
                        <Label htmlFor={`message-${index}`} className="text-xs">
                          Mensagem do Alerta <span className="text-destructive">*</span>
                        </Label>
                        <Textarea
                          id={`message-${index}`}
                          placeholder="Ex: Temperatura de {value}°C acima do limite de {threshold}°C"
                          value={param.message_template}
                          onChange={(e) => updateParameter(index, 'message_template', e.target.value)}
                          rows={2}
                          className="text-sm resize-none"
                        />
                        <p className="text-[10px] text-muted-foreground leading-tight">
                          Variáveis: <code className="text-[10px]">{"{sensor}"}</code>, <code className="text-[10px]">{"{value}"}</code>, <code className="text-[10px]">{"{threshold}"}</code>, <code className="text-[10px]">{"{operator}"}</code>, <code className="text-[10px]">{"{unit}"}</code>
                        </p>
                      </div>

                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <Separator />

            {/* Ações ao disparar */}
            <div className="space-y-2">
              <Label className="text-xs">
                Ações ao disparar <span className="text-destructive">*</span>
              </Label>
              <p className="text-xs text-muted-foreground">
                Selecione os canais de notificação
              </p>
              <div className="grid grid-cols-2 gap-2">
                {AVAILABLE_ACTIONS.map((action) => (
                  <button
                    key={action}
                    type="button"
                    onClick={() => toggleAction(action)}
                    className={`
                      px-3 py-2 rounded-md border-2 text-xs font-medium transition-all flex items-center gap-2
                      ${actions.includes(action)
                        ? 'bg-primary/10 border-primary text-primary ring-2 ring-primary/20'
                        : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                      }
                    `}
                  >
                    {actions.includes(action) && (
                      <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                    )}
                    {action}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>

        <DialogFooter className="px-6 py-4 border-t shrink-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSaveRule}>
            {editingRule ? 'Salvar Alterações' : 'Criar Regra'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
