import React, { useState } from 'react';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Plus,
  Trash2,
  Edit,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Zap,
  Clock,
  TrendingUp,
  TrendingDown,
  Equal,
  MoreVertical,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';

interface MonitoringRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  assetType: string;
  parameter: string;
  operator: string;
  threshold: number;
  unit: string;
  duration: number;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  actions: string[];
  createdAt: Date;
  lastTriggered?: Date;
}

const ASSET_TYPES = [
  { value: 'AHU', label: 'AHU - Air Handling Unit' },
  { value: 'Chiller', label: 'Chiller' },
  { value: 'VRF', label: 'VRF - Variable Refrigerant Flow' },
  { value: 'RTU', label: 'RTU - Rooftop Unit' },
  { value: 'Boiler', label: 'Boiler' },
  { value: 'CoolingTower', label: 'Cooling Tower' },
];

const PARAMETERS = [
  { value: 'temp_supply', label: 'Temperatura de Fornecimento', unit: '°C' },
  { value: 'temp_return', label: 'Temperatura de Retorno', unit: '°C' },
  { value: 'pressure_suction', label: 'Pressão de Sucção', unit: 'psi' },
  { value: 'pressure_discharge', label: 'Pressão de Descarga', unit: 'psi' },
  { value: 'dp_filter', label: 'ΔP Filtro', unit: 'Pa' },
  { value: 'power_kw', label: 'Consumo de Energia', unit: 'kW' },
  { value: 'vibration', label: 'Vibração', unit: 'mm/s' },
  { value: 'humidity', label: 'Umidade', unit: '%' },
  { value: 'flow_rate', label: 'Vazão', unit: 'L/min' },
  { value: 'speed_rpm', label: 'Velocidade', unit: 'RPM' },
];

const OPERATORS = [
  { value: '>', label: 'Maior que', icon: TrendingUp },
  { value: '<', label: 'Menor que', icon: TrendingDown },
  { value: '==', label: 'Igual a', icon: Equal },
  { value: '>=', label: 'Maior ou igual', icon: TrendingUp },
  { value: '<=', label: 'Menor ou igual', icon: TrendingDown },
];

const SEVERITIES = [
  { value: 'Critical', label: 'Crítico', color: 'bg-red-100 text-red-800 border-red-200' },
  { value: 'High', label: 'Alto', color: 'bg-orange-100 text-orange-800 border-orange-200' },
  { value: 'Medium', label: 'Médio', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  { value: 'Low', label: 'Baixo', color: 'bg-blue-100 text-blue-800 border-blue-200' },
];

const ACTIONS = [
  { value: 'email', label: 'Enviar Email' },
  { value: 'sms', label: 'Enviar SMS' },
  { value: 'push', label: 'Notificação Push' },
  { value: 'log', label: 'Registrar no Log' },
  { value: 'webhook', label: 'Webhook' },
];

export const RuleBuilder: React.FC = () => {
  const [rules, setRules] = useState<MonitoringRule[]>([
    {
      id: 'rule-1',
      name: 'Alta Pressão Chiller',
      description: 'Alerta quando pressão de descarga excede limite',
      enabled: true,
      assetType: 'Chiller',
      parameter: 'pressure_discharge',
      operator: '>',
      threshold: 300,
      unit: 'psi',
      duration: 5,
      severity: 'Critical',
      actions: ['email', 'push', 'log'],
      createdAt: new Date('2024-09-15'),
      lastTriggered: new Date('2024-10-08'),
    },
    {
      id: 'rule-2',
      name: 'ΔP Filtro Elevado',
      description: 'Necessidade de troca de filtro',
      enabled: true,
      assetType: 'AHU',
      parameter: 'dp_filter',
      operator: '>',
      threshold: 250,
      unit: 'Pa',
      duration: 10,
      severity: 'High',
      actions: ['email', 'log'],
      createdAt: new Date('2024-09-20'),
      lastTriggered: new Date('2024-10-09'),
    },
    {
      id: 'rule-3',
      name: 'Baixa Temperatura',
      description: 'Temperatura abaixo do setpoint',
      enabled: false,
      assetType: 'AHU',
      parameter: 'temp_supply',
      operator: '<',
      threshold: 10,
      unit: '°C',
      duration: 15,
      severity: 'Medium',
      actions: ['push', 'log'],
      createdAt: new Date('2024-10-01'),
    },
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<MonitoringRule | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    assetType: '',
    parameter: '',
    operator: '>',
    threshold: '',
    duration: '5',
    severity: 'Medium' as 'Critical' | 'High' | 'Medium' | 'Low',
    actions: [] as string[],
  });

  const handleCreateRule = () => {
    setEditingRule(null);
    setFormData({
      name: '',
      description: '',
      assetType: '',
      parameter: '',
      operator: '>',
      threshold: '',
      duration: '5',
      severity: 'Medium',
      actions: ['log'],
    });
    setIsDialogOpen(true);
  };

  const handleEditRule = (rule: MonitoringRule) => {
    setEditingRule(rule);
    setFormData({
      name: rule.name,
      description: rule.description,
      assetType: rule.assetType,
      parameter: rule.parameter,
      operator: rule.operator,
      threshold: rule.threshold.toString(),
      duration: rule.duration.toString(),
      severity: rule.severity,
      actions: rule.actions,
    });
    setIsDialogOpen(true);
  };

  const handleSaveRule = () => {
    if (!formData.name || !formData.assetType || !formData.parameter || !formData.threshold) {
      toast.error('Campos obrigatórios', {
        description: 'Preencha todos os campos obrigatórios.',
      });
      return;
    }

    const parameter = PARAMETERS.find(p => p.value === formData.parameter);

    if (editingRule) {
      // Editar regra existente
      setRules(rules.map(rule =>
        rule.id === editingRule.id
          ? {
              ...rule,
              name: formData.name,
              description: formData.description,
              assetType: formData.assetType,
              parameter: formData.parameter,
              operator: formData.operator,
              threshold: parseFloat(formData.threshold),
              unit: parameter?.unit || '',
              duration: parseInt(formData.duration),
              severity: formData.severity,
              actions: formData.actions,
            }
          : rule
      ));
      toast.success('Regra atualizada!', {
        description: `A regra "${formData.name}" foi atualizada.`,
      });
    } else {
      // Criar nova regra
      const newRule: MonitoringRule = {
        id: `rule-${Date.now()}`,
        name: formData.name,
        description: formData.description,
        enabled: true,
        assetType: formData.assetType,
        parameter: formData.parameter,
        operator: formData.operator,
        threshold: parseFloat(formData.threshold),
        unit: parameter?.unit || '',
        duration: parseInt(formData.duration),
        severity: formData.severity,
        actions: formData.actions,
        createdAt: new Date(),
      };
      setRules([...rules, newRule]);
      toast.success('Regra criada!', {
        description: `A regra "${formData.name}" foi criada com sucesso.`,
      });
    }

    setIsDialogOpen(false);
  };

  const handleDeleteRule = (ruleId: string) => {
    const rule = rules.find(r => r.id === ruleId);
    setRules(rules.filter(r => r.id !== ruleId));
    toast.success('Regra removida', {
      description: `A regra "${rule?.name}" foi removida.`,
    });
  };

  const handleToggleRule = (ruleId: string) => {
    setRules(rules.map(rule =>
      rule.id === ruleId ? { ...rule, enabled: !rule.enabled } : rule
    ));
    const rule = rules.find(r => r.id === ruleId);
    toast.success(rule?.enabled ? 'Regra desativada' : 'Regra ativada', {
      description: `A regra "${rule?.name}" foi ${rule?.enabled ? 'desativada' : 'ativada'}.`,
    });
  };

  const toggleAction = (action: string) => {
    setFormData({
      ...formData,
      actions: formData.actions.includes(action)
        ? formData.actions.filter(a => a !== action)
        : [...formData.actions, action],
    });
  };

  const getSeverityColor = (severity: string) => {
    const sev = SEVERITIES.find(s => s.value === severity);
    return sev?.color || '';
  };

  const getParameterLabel = (param: string) => {
    return PARAMETERS.find(p => p.value === param)?.label || param;
  };

  const getOperatorLabel = (op: string) => {
    return OPERATORS.find(o => o.value === op)?.label || op;
  };

  const formatRuleSummary = (rule: MonitoringRule) => {
    return `${getParameterLabel(rule.parameter)} ${rule.operator} ${rule.threshold} ${rule.unit} por ${rule.duration} min`;
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

      {/* Rules List */}
      <div className="space-y-3">
        {rules.length === 0 ? (
          <div className="text-center py-12 bg-muted/30 rounded-lg border-2 border-dashed">
            <Activity className="w-12 h-12 mx-auto mb-4 opacity-50 text-muted-foreground" />
            <p className="text-muted-foreground font-medium">Nenhuma regra configurada</p>
            <p className="text-sm text-muted-foreground mt-1">
              Clique em "Nova Regra" para começar
            </p>
          </div>
        ) : (
          rules.map((rule) => (
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
                      <span className="font-medium">{rule.assetType}</span>
                    </div>
                    <span className="text-muted-foreground">→</span>
                    <div className="flex items-center gap-1 px-2 py-1 bg-primary/10 rounded">
                      <span className="font-mono text-xs">{formatRuleSummary(rule)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Criada: {rule.createdAt.toLocaleDateString('pt-BR')}
                    </div>
                    {rule.lastTriggered && (
                      <div className="flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        Último disparo: {rule.lastTriggered.toLocaleDateString('pt-BR')}
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      Ações: {rule.actions.length}
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

      {/* Create/Edit Rule Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" />
              {editingRule ? 'Editar Regra' : 'Nova Regra de Monitoramento'}
            </DialogTitle>
            <DialogDescription>
              Configure os parâmetros para criação de alertas automáticos
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="max-h-[60vh] pr-4">
            <div className="space-y-4">
              {/* Nome */}
              <div className="space-y-2">
                <Label htmlFor="ruleName">Nome da Regra *</Label>
                <Input
                  id="ruleName"
                  placeholder="Ex: Alta Pressão Chiller"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              {/* Descrição */}
              <div className="space-y-2">
                <Label htmlFor="ruleDescription">Descrição</Label>
                <Input
                  id="ruleDescription"
                  placeholder="Descreva o propósito desta regra"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <Separator />

              {/* Tipo de Ativo */}
              <div className="space-y-2">
                <Label htmlFor="assetType">Tipo de Ativo *</Label>
                <Select value={formData.assetType} onValueChange={(value) => setFormData({ ...formData, assetType: value })}>
                  <SelectTrigger id="assetType">
                    <SelectValue placeholder="Selecione o tipo de equipamento" />
                  </SelectTrigger>
                  <SelectContent>
                    {ASSET_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Parâmetro */}
              <div className="space-y-2">
                <Label htmlFor="parameter">Parâmetro a Monitorar *</Label>
                <Select value={formData.parameter} onValueChange={(value) => setFormData({ ...formData, parameter: value })}>
                  <SelectTrigger id="parameter">
                    <SelectValue placeholder="Selecione o parâmetro" />
                  </SelectTrigger>
                  <SelectContent>
                    {PARAMETERS.map((param) => (
                      <SelectItem key={param.value} value={param.value}>
                        {param.label} ({param.unit})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Condição */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="operator">Operador</Label>
                  <Select value={formData.operator} onValueChange={(value) => setFormData({ ...formData, operator: value })}>
                    <SelectTrigger id="operator">
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

                <div className="space-y-2">
                  <Label htmlFor="threshold">Valor Limite *</Label>
                  <Input
                    id="threshold"
                    type="number"
                    step="0.1"
                    placeholder="Ex: 250"
                    value={formData.threshold}
                    onChange={(e) => setFormData({ ...formData, threshold: e.target.value })}
                  />
                </div>
              </div>

              {/* Duração */}
              <div className="space-y-2">
                <Label htmlFor="duration">Duração da Condição (minutos)</Label>
                <Input
                  id="duration"
                  type="number"
                  placeholder="Ex: 5"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  Tempo que a condição deve persistir antes de gerar alerta
                </p>
              </div>

              <Separator />

              {/* Severidade */}
              <div className="space-y-2">
                <Label>Severidade do Alerta</Label>
                <div className="grid grid-cols-2 gap-2">
                  {SEVERITIES.map((sev) => (
                    <button
                      key={sev.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, severity: sev.value as any })}
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

              {/* Ações */}
              <div className="space-y-2">
                <Label>Ações ao Disparar</Label>
                <div className="space-y-2">
                  {ACTIONS.map((action) => (
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

              {/* Preview */}
              {formData.parameter && formData.threshold && (
                <div className="bg-muted/50 rounded-lg p-4 border">
                  <p className="text-xs font-medium text-muted-foreground mb-2">Preview da Regra:</p>
                  <p className="text-sm font-mono">
                    SE <strong>{getParameterLabel(formData.parameter)}</strong>{' '}
                    <strong>{getOperatorLabel(formData.operator)}</strong>{' '}
                    <strong>{formData.threshold}</strong>{' '}
                    {PARAMETERS.find(p => p.value === formData.parameter)?.unit}{' '}
                    por <strong>{formData.duration}</strong> minutos
                    <br />
                    ENTÃO gerar alerta <strong>{formData.severity}</strong>
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveRule}>
              <CheckCircle2 className="w-4 h-4 mr-2" />
              {editingRule ? 'Salvar Alterações' : 'Criar Regra'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
