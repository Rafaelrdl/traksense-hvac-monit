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
import { Loader2, Plus, Trash2, AlertCircle, Info, Mail, Bell, Volume2, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';

import { useAppStore } from '@/store/app';
import { useRulesStore } from '@/store/rulesStore';
import { useCreateRuleMutation, useUpdateRuleMutation } from '@/hooks/queries';
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
  const createMutation = useCreateRuleMutation();
  const updateMutation = useUpdateRuleMutation();

  // Estados básicos da regra
  const [equipmentId, setEquipmentId] = useState<string>('');
  const [ruleName, setRuleName] = useState('');
  const [ruleDescription, setRuleDescription] = useState('');
  const [actions, setActions] = useState<NotificationAction[]>(['IN_APP']);

  // Estado dos parâmetros (múltiplos)
  const [parameters, setParameters] = useState<RuleParameter[]>([]);

  // Estados para devices e sensores disponíveis
  const [availableDevices, setAvailableDevices] = useState<Array<{
    id: number;
    name: string;
    displayName: string; // Sufixo do serial (ex: C857, C873, 08B2)
    mqtt_client_id: string;
  }>>([]);
  const [availableSensorsByDevice, setAvailableSensorsByDevice] = useState<Record<number, Array<{
    key: string; 
    label: string; 
    type: string;
    sensorId: number;
    sensorTag: string;
    deviceId: number;
  }>>>({});
  const [loadingDevices, setLoadingDevices] = useState(false);
  const [loadingSensors, setLoadingSensors] = useState<Record<number, boolean>>({});

  // Flag de inicialização
  const [isInitializing, setIsInitializing] = useState(false);

  // Buscar devices quando equipamento for selecionado
  useEffect(() => {
    const loadDevices = async () => {
      if (!equipmentId) {
        setAvailableDevices([]);
        setAvailableSensorsByDevice({});
        return;
      }

      setLoadingDevices(true);
      try {
        const { assetsService } = await import('@/services/assetsService');
        const devices = await assetsService.getDevices(parseInt(equipmentId));
        
        // Extrair sufixo do serial_number (últimos 4 caracteres ou nome curto)
        const devicesWithDisplay = devices.map(device => {
          // Tentar extrair sufixo do serial_number (ex: "IOT-DEV-C857" -> "C857")
          let displayName = device.name;
          if (device.serial_number) {
            const parts = device.serial_number.split('-');
            displayName = parts[parts.length - 1] || device.serial_number.slice(-4);
          }
          
          return {
            id: device.id,
            name: device.name,
            displayName: `Device ${displayName}`,
            mqtt_client_id: device.mqtt_client_id,
          };
        });
        
        setAvailableDevices(devicesWithDisplay);
      } catch (error) {
        console.error('Erro ao carregar devices:', error);
        toast.error('Erro ao carregar dispositivos do equipamento');
        setAvailableDevices([]);
      } finally {
        setLoadingDevices(false);
      }
    };

    loadDevices();
  }, [equipmentId]);

  // Função para carregar sensores de um device específico
  const loadSensorsForDevice = async (deviceId: number) => {
    if (availableSensorsByDevice[deviceId]) {
      return; // Já carregado
    }

    setLoadingSensors(prev => ({ ...prev, [deviceId]: true }));
    try {
      const { api } = await import('@/lib/api');
      const response = await api.get<any[]>(`/devices/${deviceId}/sensors/`);
      const sensors = response.data;
      
      const sensorsList = sensors.map(sensor => ({
        key: `sensor_${sensor.id}`,
        label: `${sensor.tag} - ${sensor.metric_type}`,
        type: sensor.metric_type,
        sensorId: sensor.id,
        sensorTag: sensor.tag,
        deviceId: deviceId,
      }));
      
      setAvailableSensorsByDevice(prev => ({
        ...prev,
        [deviceId]: sensorsList,
      }));
    } catch (error) {
      console.error('Erro ao carregar sensores do device:', error);
      toast.error('Erro ao carregar sensores do dispositivo');
    } finally {
      setLoadingSensors(prev => ({ ...prev, [deviceId]: false }));
    }
  };

  // Preencher formulário quando editando
  useEffect(() => {
    if (editingRule && open) {
      setIsInitializing(true);
      
      setEquipmentId(String(editingRule.equipment));
      setRuleName(editingRule.name);
      setRuleDescription(editingRule.description);
      setActions(editingRule.actions);

      // Mapa para converter severity do backend (Capital Case) para frontend (UPPERCASE)
      const severityBackendToFrontend: Record<string, Severity> = {
        'Critical': 'CRITICAL',
        'High': 'HIGH',
        'Medium': 'MEDIUM',
        'Low': 'LOW',
      };

      // Se a regra tem o novo formato (array de parameters)
      if (editingRule.parameters && editingRule.parameters.length > 0) {
        // Converter severidades do backend para o formato esperado pelo frontend
        const convertedParameters = editingRule.parameters.map(param => ({
          ...param,
          severity: severityBackendToFrontend[param.severity] || param.severity.toUpperCase() as Severity,
        }));
        setParameters(convertedParameters);
        
        // Carregar os sensores para descobrir o device de cada parâmetro
        loadSensorsAndRecoverDevices(editingRule.equipment, convertedParameters);
      } 
      // Se é regra antiga (campo único), converter para array
      else if (editingRule.parameter_key) {
        const params = [{
          parameter_key: editingRule.parameter_key,
          variable_key: editingRule.variable_key || '',
          operator: editingRule.operator!,
          threshold: editingRule.threshold!,
          duration: editingRule.duration!,
          severity: severityBackendToFrontend[editingRule.severity!] || editingRule.severity!.toUpperCase() as Severity,
          message_template: DEFAULT_MESSAGE_TEMPLATE,
          unit: editingRule.unit,
        }];
        setParameters(params);
        loadSensorsAndRecoverDevices(editingRule.equipment, params);
      }
      
      setTimeout(() => setIsInitializing(false), 500);
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

  // Função para carregar todos os sensores e recuperar device_id dos parâmetros
  const loadSensorsAndRecoverDevices = async (eqId: number, params: any[]) => {
    try {
      const { assetsService } = await import('@/services/assetsService');
      const { api } = await import('@/lib/api');
      
      setLoadingDevices(true);
      
      // Carregar devices do equipamento
      const devices = await assetsService.getDevices(eqId);
      
      // Converter devices para o formato usado pelo select
      const devicesWithDisplay = devices.map(device => {
        let displayName = device.name;
        if (device.serial_number) {
          const parts = device.serial_number.split('-');
          displayName = parts[parts.length - 1] || device.serial_number.slice(-4);
        }
        return {
          id: device.id,
          name: device.name,
          displayName: `Device ${displayName}`,
          mqtt_client_id: device.mqtt_client_id,
        };
      });
      
      // Popular availableDevices para o select funcionar
      setAvailableDevices(devicesWithDisplay);
      setLoadingDevices(false);
      
      // Carregar sensores de todos os devices em paralelo
      const sensorsByDevice: Record<number, any[]> = {};
      await Promise.all(devices.map(async (device) => {
        try {
          const response = await api.get<any[]>(`/devices/${device.id}/sensors/`);
          sensorsByDevice[device.id] = response.data.map(sensor => ({
            key: `sensor_${sensor.id}`,
            label: `${sensor.tag} - ${sensor.metric_type}`,
            type: sensor.metric_type,
            sensorId: sensor.id,
            sensorTag: sensor.tag,
            deviceId: device.id,
          }));
        } catch (error) {
          console.error(`Erro ao carregar sensores do device ${device.id}:`, error);
          sensorsByDevice[device.id] = [];
        }
      }));
      
      setAvailableSensorsByDevice(sensorsByDevice);
      
      // Agora recuperar o device_id de cada parâmetro
      const updatedParams = params.map(param => {
        // Procurar em qual device está o sensor
        for (const [deviceId, sensors] of Object.entries(sensorsByDevice)) {
          const sensor = sensors.find((s: any) => s.key === param.parameter_key);
          if (sensor) {
            return { ...param, device_id: parseInt(deviceId) };
          }
        }
        return param;
      });
      
      console.log('📡 Parâmetros recuperados com device_id:', updatedParams);
      setParameters(updatedParams);
    } catch (error) {
      console.error('Erro ao recuperar devices dos parâmetros:', error);
      setLoadingDevices(false);
    }
  };

  // Adicionar novo parâmetro
  const addParameter = () => {
    const newParam: RuleParameter & { device_id?: number } = {
      parameter_key: '',
      variable_key: '',
      operator: '>',
      threshold: 0,
      duration: 5,
      severity: 'MEDIUM',
      message_template: DEFAULT_MESSAGE_TEMPLATE,
      device_id: undefined, // Device será selecionado depois
    };
    setParameters([...parameters, newParam as RuleParameter]);
  };

  // Remover parâmetro
  const removeParameter = (index: number) => {
    setParameters(parameters.filter((_, i) => i !== index));
  };

  // Atualizar parâmetro específico
  const updateParameter = (index: number, field: keyof RuleParameter | 'device_id', value: any) => {
    const updated = [...parameters];
    updated[index] = { ...updated[index], [field]: value };
    
    // Se estamos selecionando um device, carregar seus sensores
    if (field === 'device_id') {
      const deviceId = parseInt(value);
      if (!isNaN(deviceId)) {
        loadSensorsForDevice(deviceId);
        // Resetar parameter_key pois mudou o device
        updated[index].parameter_key = '';
      }
    }
    
    // Se estamos atualizando o parameter_key, também atualizar o variable_key com o tipo do sensor
    if (field === 'parameter_key') {
      const deviceId = (updated[index] as any).device_id;
      const deviceSensors = deviceId ? availableSensorsByDevice[deviceId] : [];
      const selectedParam = deviceSensors?.find(p => p.key === value);
      if (selectedParam) {
        updated[index].variable_key = selectedParam.type; // Ex: "temperature", "humidity"
        updated[index].unit = selectedParam.type === 'temperature' ? '°C' : 
                              selectedParam.type === 'humidity' ? '%' : '';
      }
    }
    
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
      const param = parameters[i] as any;
      
      if (!param.device_id) {
        toast.error(`Parâmetro ${i + 1}: Selecione um dispositivo`);
        return;
      }
      
      if (!param.parameter_key) {
        toast.error(`Parâmetro ${i + 1}: Selecione uma variável`);
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

    // Converter parâmetros para formato backend
    const convertedParams = parameters.map(param => ({
      parameter_key: param.parameter_key,
      variable_key: param.variable_key || '',
      operator: param.operator,
      threshold: param.threshold,
      unit: param.unit || '',
      duration: param.duration,
      severity: severityMap[param.severity] || param.severity,
      message_template: param.message_template,
    }));

    const ruleData = {
      name: ruleName.trim(),
      description: ruleDescription.trim(),
      equipment: parseInt(equipmentId),
      parameters: convertedParams,
      actions: actions,
      enabled: true,
    };

    console.log('📤 Enviando regra para backend:', ruleData);

    if (editingRule) {
      updateMutation.mutate(
        { id: editingRule.id, data: ruleData },
        {
          onSuccess: () => {
            toast.success('Regra atualizada!', {
              description: `A regra "${ruleName}" foi atualizada com sucesso.`,
            });
            onOpenChange(false);
          }
        }
      );
    } else {
      createMutation.mutate(ruleData, {
        onSuccess: () => {
          toast.success('Regra criada!', {
            description: `A regra "${ruleName}" foi criada com sucesso.`,
          });
          onOpenChange(false);
        }
      });
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

  const getSensorLabel = (paramKey: string, deviceId?: number) => {
    if (!deviceId) return paramKey;
    const deviceSensors = availableSensorsByDevice[deviceId] || [];
    const param = deviceSensors.find(p => p.key === paramKey);
    return param?.label || paramKey;
  };

  const getDeviceLabel = (deviceId?: number) => {
    if (!deviceId) return 'Nenhum dispositivo';
    const device = availableDevices.find(d => d.id === deviceId);
    return device?.displayName || `Device ${deviceId}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] h-[90vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4 shrink-0 border-b">
          <DialogTitle className="text-lg font-semibold">
            {editingRule ? 'Editar Regra de Alerta' : 'Criar Nova Regra de Alerta'}
          </DialogTitle>
          <DialogDescription className="text-sm">
            Configure múltiplos parâmetros para monitoramento em tempo real
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 min-h-0">
          <div className="space-y-6 pb-4">
            
            {/* Informações Básicas */}
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Informações Básicas</h3>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="rule-name" className="text-xs font-medium">
                        Nome da Regra <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="rule-name"
                        placeholder="Ex: Monitoramento Chiller Principal"
                        className="h-9"
                        value={ruleName}
                        onChange={(e) => setRuleName(e.target.value)}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="equipment" className="text-xs font-medium">
                        Equipamento <span className="text-destructive">*</span>
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
                    <Label htmlFor="description" className="text-xs font-medium">
                      Descrição <span className="text-muted-foreground font-normal">(opcional)</span>
                    </Label>
                    <Textarea
                      id="description"
                      placeholder="Adicione uma descrição para identificar facilmente esta regra"
                      value={ruleDescription}
                      onChange={(e) => setRuleDescription(e.target.value)}
                      rows={2}
                      className="text-sm resize-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            <Separator className="my-6" />

            {/* Parâmetros (Múltiplos) */}
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-gray-900">Parâmetros de Monitoramento</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Configure as condições que dispararão alertas para cada sensor
                  </p>
                </div>
                <Button
                  type="button"
                  onClick={addParameter}
                  disabled={!equipmentId || loadingDevices}
                  size="sm"
                  className="h-9 px-3 ml-4 shrink-0"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Parâmetro
                </Button>
              </div>

              {!equipmentId && (
                <div className="border-2 border-dashed border-blue-300 bg-blue-50/50 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Info className="w-4 h-4 text-blue-600 shrink-0" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-blue-900 mb-1">Selecione um equipamento</p>
                      <p className="text-xs text-blue-700">
                        Escolha um equipamento acima para visualizar seus sensores disponíveis
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {parameters.length === 0 && equipmentId && (
                <div className="border-2 border-dashed border-gray-300 bg-gray-50 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <AlertCircle className="w-4 h-4 text-gray-600 shrink-0" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 mb-1">Nenhum parâmetro configurado</p>
                      <p className="text-xs text-gray-600">
                        Clique em "Adicionar Parâmetro" para começar a configurar os alertas
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Lista de Parâmetros */}
              <div className="space-y-3">
                {parameters.map((param, index) => (
                  <Card key={index} className="border border-gray-200 bg-white/40 backdrop-blur-sm hover:border-gray-300 hover:bg-white/60 transition-all shadow-sm">
                    <CardHeader className="pb-3 pt-3 px-4 border-b border-gray-100">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-xs font-semibold text-primary">{index + 1}</span>
                          </div>
                          <CardTitle className="text-sm font-semibold text-gray-900">
                            Parâmetro {index + 1}
                          </CardTitle>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeParameter(index)}
                          className="h-8 w-8 p-0 text-gray-500 hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4 px-4 pb-4 pt-4">
                      
                      {/* Seletor de Dispositivo */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <Label className="text-xs font-medium flex items-center gap-1">
                            <span>Dispositivo</span>
                            <span className="text-destructive">*</span>
                          </Label>
                          <Select
                            value={(param as any).device_id ? String((param as any).device_id) : ''}
                            onValueChange={(value) => updateParameter(index, 'device_id', value)}
                            disabled={loadingDevices}
                          >
                            <SelectTrigger className="h-9 bg-white/80">
                              <SelectValue placeholder="Selecione o dispositivo" />
                            </SelectTrigger>
                            <SelectContent>
                              {loadingDevices ? (
                                <div className="p-3 text-center">
                                  <Loader2 className="w-4 h-4 animate-spin mx-auto mb-2" />
                                  <p className="text-xs text-muted-foreground">Carregando dispositivos...</p>
                                </div>
                              ) : availableDevices.length === 0 ? (
                                <div className="p-3 text-center">
                                  <p className="text-xs text-muted-foreground">Nenhum dispositivo disponível</p>
                                </div>
                              ) : (
                                availableDevices.map((device) => (
                                  <SelectItem key={device.id} value={String(device.id)}>
                                    {device.displayName}
                                  </SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Seletor de Variável do Dispositivo */}
                        <div className="space-y-1.5">
                          <Label className="text-xs font-medium flex items-center gap-1">
                            <span>Variável do Dispositivo</span>
                            <span className="text-destructive">*</span>
                          </Label>
                          <Select
                            value={param.parameter_key}
                            onValueChange={(value) => updateParameter(index, 'parameter_key', value)}
                            disabled={!(param as any).device_id || loadingSensors[(param as any).device_id]}
                          >
                            <SelectTrigger className="h-9 bg-white/80">
                              <SelectValue placeholder="Selecione a variável" />
                            </SelectTrigger>
                            <SelectContent>
                              {!(param as any).device_id ? (
                                <div className="p-3 text-center">
                                  <p className="text-xs text-muted-foreground">Selecione um dispositivo primeiro</p>
                                </div>
                              ) : loadingSensors[(param as any).device_id] ? (
                                <div className="p-3 text-center">
                                  <Loader2 className="w-4 h-4 animate-spin mx-auto mb-2" />
                                  <p className="text-xs text-muted-foreground">Carregando variáveis...</p>
                                </div>
                              ) : (
                                (() => {
                                  const deviceSensors = availableSensorsByDevice[(param as any).device_id] || [];
                                  return deviceSensors.length === 0 ? (
                                    <div className="p-3 text-center">
                                      <p className="text-xs text-muted-foreground">Nenhuma variável disponível</p>
                                    </div>
                                  ) : (
                                    deviceSensors.map((sensor) => (
                                      <SelectItem key={sensor.key} value={sensor.key}>
                                        {sensor.label}
                                      </SelectItem>
                                    ))
                                  );
                                })()
                              )}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Condição e Valor */}
                      <div className="space-y-2">
                        <Label className="text-xs font-medium text-gray-700">Condição de Disparo</Label>
                        <div className="grid grid-cols-3 gap-2">
                          <div className="space-y-1.5">
                            <Label className="text-xs font-medium">
                              Operador <span className="text-destructive">*</span>
                            </Label>
                            <Select
                              value={param.operator}
                              onValueChange={(value) => updateParameter(index, 'operator', value as Operator)}
                            >
                              <SelectTrigger className="h-9 bg-white/80">
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
                            <Label className="text-xs font-medium">
                              Valor Limite <span className="text-destructive">*</span>
                            </Label>
                            <Input
                              type="number"
                              step="0.1"
                              placeholder="Ex: 250"
                              className="h-9 bg-white/80"
                              value={param.threshold}
                              onChange={(e) => updateParameter(index, 'threshold', parseFloat(e.target.value) || 0)}
                            />
                          </div>

                          <div className="space-y-1.5">
                            <Label className="text-xs font-medium">
                              Cooldown (min) <span className="text-destructive">*</span>
                            </Label>
                            <Input
                              type="number"
                              min="1"
                              placeholder="5"
                              className="h-9 bg-white/80"
                              value={param.duration}
                              onChange={(e) => updateParameter(index, 'duration', parseInt(e.target.value) || 5)}
                            />
                          </div>
                        </div>
                        <p className="text-[10px] text-muted-foreground pl-0.5">
                          O alerta será disparado quando o valor do sensor atender à condição configurada
                        </p>
                      </div>

                      {/* Severidade */}
                      <div className="space-y-2">
                        <Label className="text-xs font-medium flex items-center gap-2">
                          Nível de Severidade <span className="text-destructive">*</span>
                          <span className="text-[10px] font-normal text-muted-foreground">(Define a prioridade do alerta)</span>
                        </Label>
                        <div className="grid grid-cols-4 gap-1.5">
                          {SEVERITIES.map((sev) => (
                            <button
                              key={sev.value}
                              type="button"
                              onClick={() => updateParameter(index, 'severity', sev.value)}
                              className={`
                                px-2 py-2 rounded-md border-2 text-xs font-semibold transition-all
                                hover:scale-[1.02] active:scale-[0.98]
                                ${param.severity === sev.value
                                  ? `${sev.color} ring-2 ring-offset-1 shadow-sm`
                                  : 'bg-white/80 border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-white'
                                }
                              `}
                            >
                              {sev.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Mensagem Personalizada */}
                      <div className="space-y-2">
                        <Label htmlFor={`message-${index}`} className="text-xs font-medium">
                          Mensagem Personalizada do Alerta <span className="text-destructive">*</span>
                        </Label>
                        <Textarea
                          id={`message-${index}`}
                          placeholder="Ex: Temperatura de {value}°C ultrapassou o limite de {threshold}°C no sensor {sensor}"
                          value={param.message_template}
                          onChange={(e) => updateParameter(index, 'message_template', e.target.value)}
                          rows={3}
                          className="text-sm resize-none bg-white/80"
                        />
                        <div className="bg-blue-50/30 border border-blue-200/50 rounded-md p-2 space-y-1">
                          <p className="text-[10px] font-medium text-blue-900">Variáveis disponíveis:</p>
                          <div className="flex flex-wrap gap-1.5">
                            <code className="text-[10px] px-1.5 py-0.5 bg-blue-100/80 text-blue-800 rounded">{"{sensor}"}</code>
                            <code className="text-[10px] px-1.5 py-0.5 bg-blue-100/80 text-blue-800 rounded">{"{value}"}</code>
                            <code className="text-[10px] px-1.5 py-0.5 bg-blue-100/80 text-blue-800 rounded">{"{threshold}"}</code>
                            <code className="text-[10px] px-1.5 py-0.5 bg-blue-100/80 text-blue-800 rounded">{"{operator}"}</code>
                            <code className="text-[10px] px-1.5 py-0.5 bg-blue-100/80 text-blue-800 rounded">{"{unit}"}</code>
                          </div>
                          <p className="text-[10px] text-blue-700/90 mt-1">Use as variáveis entre chaves para personalizar a mensagem</p>
                        </div>
                      </div>

                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <Separator />

            {/* Ações ao disparar */}
            <div className="space-y-2">
              <div className="space-y-1">
                <Label className="text-sm font-semibold text-gray-900">
                  Ações ao Disparar <span className="text-destructive">*</span>
                </Label>
                <p className="text-xs text-muted-foreground">
                  Selecione como deseja ser notificado quando o alerta for acionado
                </p>
              </div>
              <div className="space-y-2">
                {AVAILABLE_ACTIONS.map((action) => {
                  // Mapear labels e ícones
                  const actionConfig: Record<NotificationAction, { label: string; icon: React.ReactNode }> = {
                    'EMAIL': { 
                      label: 'Email', 
                      icon: <Mail className="w-4 h-4" />
                    },
                    'IN_APP': { 
                      label: 'Push', 
                      icon: <Bell className="w-4 h-4" />
                    },
                    'SMS': { 
                      label: 'Som', 
                      icon: <Volume2 className="w-4 h-4" />
                    },
                    'WHATSAPP': { 
                      label: 'WhatsApp', 
                      icon: <MessageSquare className="w-4 h-4" />
                    }
                  };

                  const config = actionConfig[action];
                  
                  return (
                    <div 
                      key={action} 
                      className="bg-white/50 backdrop-blur-sm border border-gray-200 rounded-lg p-3 hover:border-gray-300 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-1.5 bg-gray-100 rounded-md">
                            {config.icon}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{config.label}</p>
                            <p className="text-xs text-muted-foreground">
                              {action === 'EMAIL' && 'Receber notificações por email'}
                              {action === 'IN_APP' && 'Notificações no navegador e aplicativo'}
                              {action === 'SMS' && 'Reproduzir som ao receber alertas'}
                              {action === 'WHATSAPP' && 'Receber mensagens no WhatsApp'}
                            </p>
                          </div>
                        </div>
                        <Switch
                          checked={actions.includes(action)}
                          onCheckedChange={() => toggleAction(action)}
                        />
                      </div>
                    </div>
                  );
                })}
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
