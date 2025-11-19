import React, { useState, useEffect } from 'react';
import { DashboardWidget } from '../../types/dashboard';
import { useAppStore } from '../../store/app';
import { useDashboardStore } from '../../store/dashboard';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { ScrollArea } from '../ui/scroll-area';
import { Settings, Save, X, Zap, Code, Loader2 } from 'lucide-react';
import { FORMULA_EXAMPLES } from '../../utils/formula-eval';
import { assetsService } from '../../services/assetsService';
import { ApiSensor } from '../../types/api';
import { mapApiAssetsToHVACAssets } from '../../lib/mappers/assetMapper';

interface WidgetConfigProps {
  widget: DashboardWidget;
  layoutId: string;
  open: boolean;
  onClose: () => void;
}

export const WidgetConfig: React.FC<WidgetConfigProps> = ({ widget, layoutId, open, onClose }) => {
  const { sensors, assets } = useAppStore();
  const updateWidget = useDashboardStore(state => state.updateWidget);
  
  // Estados locais para carregamento
  const [localAssets, setLocalAssets] = useState<typeof assets>([]);
  const [isLoadingLocalAssets, setIsLoadingLocalAssets] = useState(false);
  const [hasLoadedAssets, setHasLoadedAssets] = useState(false);
  
  // Carregar assets: primeiro tenta usar do store (cache), se vazio, busca da API
  React.useEffect(() => {
    if (!open) {
      // Reset quando fechar o modal
      return;
    }
    
    // Se já tem assets no store (cache), usa eles
    if (assets.length > 0) {
      console.log(`✅ WidgetConfig: Usando ${assets.length} assets do cache (store)`);
      setLocalAssets(assets);
      setHasLoadedAssets(true);
      return;
    }
    
    // Se já carregou localmente, não carrega novamente
    if (hasLoadedAssets) {
      return;
    }
    
    // Se não tem no cache e não carregou ainda, busca da API
    const loadAssetsDirectly = async () => {
      setIsLoadingLocalAssets(true);
      try {
        console.log('🔄 WidgetConfig: Cache vazio, buscando assets da API...');
        const response = await assetsService.getAllComplete();
        console.log(`✅ WidgetConfig: ${response.length} assets carregados da API`);
        const mappedAssets = mapApiAssetsToHVACAssets(response);
        setLocalAssets(mappedAssets);
        setHasLoadedAssets(true);
      } catch (error) {
        console.error('❌ Erro ao carregar assets:', error);
      } finally {
        setIsLoadingLocalAssets(false);
      }
    };
    
    loadAssetsDirectly();
  }, [open, assets.length, hasLoadedAssets]);
  
  // Usa localAssets se tiver, senão usa do store
  const displayAssets = localAssets.length > 0 ? localAssets : assets;
  
  const [title, setTitle] = useState(widget.title);
  const [size, setSize] = useState(widget.size);
  const [config, setConfig] = useState(widget.config || {});

  // Novo fluxo: Asset → Device (Sensor) → Variável(is)
  const [selectedAssetId, setSelectedAssetId] = useState<number | null>(
    config.assetId ? parseInt(config.assetId.toString()) : null
  );
  const [assetSensors, setAssetSensors] = useState<ApiSensor[]>([]);
  const [loadingSensors, setLoadingSensors] = useState(false);
  
  // Agrupar sensores por device (MAC address)
  const [selectedDeviceName, setSelectedDeviceName] = useState<string | null>(config.deviceName || null);
  const [selectedMetricType, setSelectedMetricType] = useState<string | null>(config.metricType || null);
  
  // 🔥 NOVO: Múltiplas variáveis para gráficos de linha/área/barras
  const isMultiVariableChart = widget.type === 'chart-line' || widget.type === 'chart-area' || widget.type === 'chart-bar' || widget.type === 'chart-bar-horizontal';
  const [selectedVariables, setSelectedVariables] = useState<string[]>(
    config.sensorTags || (config.sensorTag ? [config.sensorTag] : [])
  );
  
  // Obter devices únicos (agrupados por device ID para garantir unicidade)
  const availableDevices = React.useMemo(() => {
    const deviceMap = new Map<number, { displayName: string; fullSerial: string; deviceId: number }>();
    
    assetSensors.forEach(sensor => {
      if (!deviceMap.has(sensor.device)) {
        const displayName = sensor.device_display_name || sensor.device_serial.slice(-4);
        deviceMap.set(sensor.device, {
          displayName,
          fullSerial: sensor.device_serial,
          deviceId: sensor.device
        });
      }
    });
    
    const devices = Array.from(deviceMap.values());
    console.log(`📡 Devices disponíveis:`, devices);
    return devices;
  }, [assetSensors]);
  
  // Obter variáveis (metric_type) do device selecionado
  const availableVariables = React.useMemo(() => {
    if (!selectedDeviceName) return [];
    
    // Encontrar o deviceId correspondente ao displayName selecionado
    const selectedDevice = availableDevices.find(d => d.displayName === selectedDeviceName);
    if (!selectedDevice) {
      console.warn(`⚠️ Device ${selectedDeviceName} não encontrado`);
      return [];
    }
    
    console.log(`🔍 Filtrando sensores para device ID: ${selectedDevice.deviceId} (${selectedDeviceName})`);
    
    const filtered = assetSensors.filter(s => s.device === selectedDevice.deviceId);
    
    console.log(`📊 Sensores filtrados:`, filtered.map(s => ({ 
      tag: s.tag, 
      metric_type: s.metric_type,
      device_id: s.device,
      unit: s.unit 
    })));
    
    // NÃO remover duplicatas - cada sensor é uma variável única
    // Retornar todos os sensores do device selecionado
    console.log(`✅ Total de variáveis disponíveis: ${filtered.length}`);
    return filtered;
  }, [assetSensors, selectedDeviceName]);
  
  // Obter sensor selecionado completo
  const selectedSensor = selectedMetricType 
    ? availableVariables.find(s => s.tag === selectedMetricType)
    : null;

  // Carregar sensores quando o asset é selecionado
  useEffect(() => {
    if (!selectedAssetId) {
      setAssetSensors([]);
      setSelectedDeviceName(null);
      setSelectedMetricType(null);
      return;
    }

    const loadAssetSensors = async () => {
      setLoadingSensors(true);
      try {
        console.log(`🔍 Carregando sensores do asset ${selectedAssetId}`);
        const sensors = await assetsService.getSensors(selectedAssetId);
        setAssetSensors(sensors);
        console.log(`✅ ${sensors.length} sensores carregados`);
      } catch (error) {
        console.error('❌ Erro ao carregar sensores do asset:', error);
        setAssetSensors([]);
      } finally {
        setLoadingSensors(false);
      }
    };

    loadAssetSensors();
  }, [selectedAssetId]);

  // Resetar widget config quando mudar seleções
  useEffect(() => {
    if (isMultiVariableChart && selectedVariables.length > 0 && selectedAssetId) {
      // Para gráficos multi-linha: salvar array de sensor tags
      const selectedAsset = displayAssets.find(a => a.id.toString() === selectedAssetId?.toString());
      const selectedSensors = availableVariables.filter(s => selectedVariables.includes(s.tag));
      
      setConfig(prev => ({
        ...prev,
        assetId: selectedAssetId?.toString(),
        assetTag: selectedAsset?.tag,
        deviceName: selectedDeviceName,
        sensorTags: selectedVariables, // Array de tags
        sensorTag: selectedVariables[0], // Primeira para compatibilidade
        unit: selectedSensors[0]?.unit, // Unidade da primeira variável
      }));
    } else if (selectedSensor && selectedAssetId) {
      // Para outros widgets: salvar sensor único
      const selectedAsset = displayAssets.find(a => a.id.toString() === selectedAssetId?.toString());
      setConfig(prev => ({
        ...prev,
        assetId: selectedAssetId?.toString(),
        assetTag: selectedAsset?.tag,
        deviceName: selectedDeviceName,
        metricType: selectedMetricType,
        sensorId: selectedSensor.id?.toString(),
        sensorTag: selectedSensor.tag,
        unit: selectedSensor.unit,
      }));
    }
  }, [isMultiVariableChart, selectedVariables, selectedSensor, selectedAssetId, selectedDeviceName, selectedMetricType]);

  const handleSave = () => {
    updateWidget(layoutId, widget.id, {
      title,
      size: size as DashboardWidget['size'],
      config
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="!max-w-[95vw] sm:!max-w-[90vw] md:!max-w-4xl lg:!max-w-5xl !max-h-[90vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="flex items-center gap-3 text-xl">
            <div className="p-2 bg-blue-500 text-white rounded-lg">
              <Settings className="w-5 h-5" />
            </div>
            Configurar Widget
          </DialogTitle>
          <p className="text-sm text-muted-foreground mt-2">
            Configure o widget e vincule um sensor para exibir dados em tempo real
          </p>
        </DialogHeader>
        
        <ScrollArea className="flex-1 overflow-y-auto">
          <div className="space-y-6 py-6 px-6">
            {/* Informações Básicas */}
            <div className="space-y-4">
              <h3 className="font-semibold text-base text-foreground flex items-center gap-2 pb-3 border-b">
                <div className="w-1 h-5 bg-blue-500 rounded-full"></div>
                Informações Básicas
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="widget-title" className="text-sm font-medium">Título do Widget</Label>
                  <Input
                    id="widget-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ex: Temperatura Sala 01"
                    className="h-10"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="widget-size" className="text-sm font-medium">Tamanho</Label>
                  <Select value={size} onValueChange={(value) => setSize(value as any)}>
                    <SelectTrigger id="widget-size" className="h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="col-1">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-4 bg-primary rounded" />
                          <span>1 Coluna (Mínimo)</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="col-2">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-primary rounded" />
                          <span>2 Colunas (Pequeno)</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="col-3">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-4 bg-primary rounded" />
                          <span>3 Colunas (Médio)</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="col-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-4 bg-primary rounded" />
                          <span>4 Colunas</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="col-5">
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-4 bg-primary rounded" />
                          <span>5 Colunas</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="col-6">
                        <div className="flex items-center gap-2">
                          <div className="w-12 h-4 bg-primary rounded" />
                          <span>6 Colunas (Largura Total)</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    O layout usa um grid de 6 colunas. Escolha a largura ideal para o widget.
                  </p>
                </div>
              </div>
            </div>

            {/* Vinculação de Sensor */}
            <div className="space-y-4">
              <h3 className="font-semibold text-base text-foreground flex items-center gap-2 pb-3 border-b">
                <div className="p-1.5 bg-yellow-500 text-white rounded-md">
                  <Zap className="w-4 h-4" />
                </div>
                Fonte de Dados
              </h3>
              
              {/* Passo 1: Selecionar Equipamento */}
              <div className="space-y-2">
                <Label htmlFor="asset" className="text-sm font-medium">
                  1️⃣ Equipamento
                </Label>
                {isLoadingLocalAssets ? (
                  <div className="flex items-center justify-center h-10 border rounded-md bg-muted/50">
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    <span className="text-sm text-muted-foreground">Carregando equipamentos...</span>
                  </div>
                ) : (
                  <Select
                    value={selectedAssetId?.toString() || ''}
                    onValueChange={(value) => {
                      const assetId = parseInt(value);
                      setSelectedAssetId(assetId);
                      setSelectedDeviceName(null); // Reset device quando mudar equipamento
                      setSelectedMetricType(null); // Reset variável
                      setAssetSensors([]);
                    }}
                  >
                    <SelectTrigger id="asset" className="h-10">
                      <SelectValue placeholder="🏢 Selecione um equipamento" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      {displayAssets.length === 0 ? (
                        <div className="px-2 py-4 text-center text-sm text-muted-foreground">
                          ⚠️ Nenhum equipamento disponível
                        </div>
                      ) : (
                        displayAssets.map(asset => (
                          <SelectItem key={asset.id} value={asset.id.toString()}>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{asset.tag}</span>
                              <span className="text-muted-foreground">•</span>
                              <span className="text-muted-foreground text-sm">{asset.type}</span>
                              <span className="text-muted-foreground">•</span>
                              <span className="text-blue-600 text-sm">{asset.location}</span>
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                )}
              </div>

              {/* Passo 2: Selecionar Device (Sensor) - Apenas Sufixo do MAC */}
              {selectedAssetId && (
                <div className="space-y-2">
                  <Label htmlFor="device" className="text-sm font-medium">
                    2️⃣ Sensor (Device)
                  </Label>
                  {loadingSensors ? (
                    <div className="flex items-center justify-center h-10 border rounded-md bg-muted/50">
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      <span className="text-sm text-muted-foreground">Carregando sensores...</span>
                    </div>
                  ) : availableDevices.length > 0 ? (
                    <Select
                      value={selectedDeviceName || ''}
                      onValueChange={(value) => {
                        setSelectedDeviceName(value);
                        setSelectedMetricType(null); // Reset variável quando mudar device
                      }}
                    >
                      <SelectTrigger id="device" className="h-10">
                        <SelectValue placeholder="� Selecione um sensor" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[300px]">
                        {availableDevices.map(device => (
                          <SelectItem key={device.displayName} value={device.displayName}>
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-medium text-blue-600">Device {device.displayName}</span>
                              <span className="text-muted-foreground text-xs">({device.fullSerial})</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="flex items-center justify-center h-10 border rounded-md bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800">
                      <span className="text-sm text-orange-700 dark:text-orange-400">
                        ⚠️ Nenhum sensor encontrado para este equipamento
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Passo 3: Selecionar Variável (metric_type) */}
              {selectedDeviceName && availableVariables.length > 0 && (
                <div className="space-y-2">
                  <Label htmlFor="variable" className="text-sm font-medium">
                    3️⃣ Variável{isMultiVariableChart ? 's' : ''} {isMultiVariableChart && '(múltipla seleção)'}
                  </Label>
                  
                  {isMultiVariableChart ? (
                    // Seleção múltipla para gráficos de linha
                    <div className="border rounded-lg p-3 space-y-2 max-h-[300px] overflow-y-auto">
                      {availableVariables.map((sensor, index) => {
                        const varName = sensor.tag.includes('_') 
                          ? sensor.tag.split('_').slice(1).join('_')
                          : sensor.metric_type;
                        const formattedName = varName
                          .split('_')
                          .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                          .join(' ');
                        
                        const isSelected = selectedVariables.includes(sensor.tag);
                        
                        return (
                          <label
                            key={`${sensor.tag}-${index}`}
                            className={`flex items-center gap-3 p-2 rounded cursor-pointer transition-colors ${
                              isSelected 
                                ? 'bg-primary/10 border border-primary' 
                                : 'hover:bg-muted border border-transparent'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedVariables(prev => [...prev, sensor.tag]);
                                } else {
                                  setSelectedVariables(prev => prev.filter(t => t !== sensor.tag));
                                }
                              }}
                              className="w-4 h-4"
                            />
                            <div className="flex-1 flex items-center gap-2">
                              <span className="font-medium">{formattedName}</span>
                              <span className="text-muted-foreground">•</span>
                              <span className="text-green-600 font-medium text-sm">{sensor.unit}</span>
                            </div>
                          </label>
                        );
                      })}
                      {selectedVariables.length > 0 && (
                        <div className="pt-2 border-t">
                          <p className="text-xs text-muted-foreground">
                            {selectedVariables.length} variável(is) selecionada(s)
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    // Seleção única para outros widgets
                    <Select
                      value={selectedMetricType || ''}
                      onValueChange={(value) => setSelectedMetricType(value)}
                    >
                      <SelectTrigger id="variable" className="h-10">
                        <SelectValue placeholder="📊 Selecione uma variável" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[300px]">
                        {availableVariables.map((sensor, index) => {
                          const varName = sensor.tag.includes('_') 
                            ? sensor.tag.split('_').slice(1).join('_')
                            : sensor.metric_type;
                          const formattedName = varName
                            .split('_')
                            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                            .join(' ');
                          
                          return (
                            <SelectItem key={`${sensor.tag}-${index}`} value={sensor.tag}>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{formattedName}</span>
                                <span className="text-muted-foreground">•</span>
                                <span className="text-green-600 font-medium text-sm">{sensor.unit}</span>
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              )}

              {/* Informações da Variável Selecionada */}
              {(selectedSensor || (isMultiVariableChart && selectedVariables.length > 0)) && (
                <div className="space-y-2">
                  <div className="flex flex-col gap-3 p-4 border rounded-lg">
                    <div className="flex items-center gap-2 pb-2 border-b">
                      <div className="flex-shrink-0 w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <p className="text-sm font-semibold text-foreground">
                        Configuração Completa
                      </p>
                    </div>
                    <div className="text-sm text-muted-foreground space-y-2">
                      <div className="flex items-start gap-2">
                        <span className="text-base">🏢</span>
                        <div className="flex-1">
                          <span className="text-muted-foreground">Equipamento:</span>{' '}
                          <span className="font-medium text-foreground">{displayAssets.find(a => a.id.toString() === selectedAssetId?.toString())?.tag}</span>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-base">📡</span>
                        <div className="flex-1">
                          <span className="text-muted-foreground">Device:</span>{' '}
                          <span className="font-medium text-foreground">{selectedDeviceName}</span>
                        </div>
                      </div>
                      {isMultiVariableChart && selectedVariables.length > 0 ? (
                        <div className="flex items-start gap-2">
                          <span className="text-base">📊</span>
                          <div className="flex-1">
                            <span className="text-muted-foreground">Variáveis ({selectedVariables.length}):</span>
                            <div className="mt-2 space-y-1">
                              {selectedVariables.map((varTag, idx) => {
                                const sensor = availableVariables.find(s => s.tag === varTag);
                                if (!sensor) return null;
                                const varName = sensor.tag.includes('_') 
                                  ? sensor.tag.split('_').slice(1).join('_')
                                  : sensor.metric_type;
                                const formattedName = varName
                                  .split('_')
                                  .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
                                  .join(' ');
                                return (
                                  <div key={varTag} className="flex items-center gap-2 text-xs">
                                    <span className="font-medium text-foreground">{idx + 1}.</span>
                                    <span className="font-medium text-foreground">{formattedName}</span>
                                    <span className="text-green-600">({sensor.unit})</span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      ) : selectedSensor && (
                        <>
                          <div className="flex items-start gap-2">
                            <span className="text-base">📊</span>
                            <div className="flex-1">
                              <span className="text-muted-foreground">Variável:</span>{' '}
                              <span className="font-medium text-foreground">
                                {selectedSensor.tag.includes('_') 
                                  ? selectedSensor.tag.split('_').slice(1).join('_').split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')
                                  : selectedSensor.metric_type}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="text-base">📏</span>
                            <div className="flex-1">
                              <span className="text-muted-foreground">Unidade:</span>{' '}
                              <span className="font-medium text-foreground">{selectedSensor.unit}</span>
                            </div>
                          </div>
                        </>
                      )}
                      {selectedSensor && selectedSensor.last_value !== null && (
                        <div className="flex items-start gap-2">
                          <span className="text-base">🔢</span>
                          <div className="flex-1">
                            <span className="text-muted-foreground">Último Valor:</span>{' '}
                            <span className="font-medium text-foreground">{selectedSensor.last_value.toFixed(2)} {selectedSensor.unit}</span>
                          </div>
                        </div>
                      )}
                      {selectedSensor && (
                        <div className="flex items-start gap-2">
                          <span className="text-base">📡</span>
                          <div className="flex-1">
                            <span className="text-muted-foreground">Status:</span>{' '}
                            <span className={`font-medium ${selectedSensor.is_online ? 'text-green-600' : 'text-red-600'}`}>
                              {selectedSensor.is_online ? '🟢 Online' : '🔴 Offline'}
                            </span>
                          </div>
                        </div>
                      )}
                      {selectedSensor && selectedSensor.last_value !== null && (
                        <div className="flex items-start gap-2">
                          <span className="text-base">🔢</span>
                          <div className="flex-1">
                            <span className="text-muted-foreground">Último Valor:</span>{' '}
                            <span className="font-medium text-foreground">{selectedSensor.last_value.toFixed(2)} {selectedSensor.unit}</span>
                          </div>
                        </div>
                      )}
                      {selectedSensor && (
                        <div className="flex items-start gap-2">
                          <span className="text-base">📡</span>
                          <div className="flex-1">
                            <span className="text-muted-foreground">Status:</span>{' '}
                            <span className={`font-medium ${selectedSensor.is_online ? 'text-green-600' : 'text-red-600'}`}>
                              {selectedSensor.is_online ? '🟢 Online' : '🔴 Offline'}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}


              {/* Campo de Fórmula - Transformação de Valores */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Code className="w-4 h-4 text-muted-foreground" />
                  <Label htmlFor="formula" className="text-sm font-medium">
                    Fórmula de Transformação (opcional)
                  </Label>
                </div>
                
                <Textarea
                  id="formula"
                  value={config.transform?.formula || ''}
                  onChange={(e) => setConfig({ 
                    ...config, 
                    transform: { 
                      ...config.transform,
                      formula: e.target.value 
                    }
                  })}
                  placeholder="Use $VALUE$ para referenciar o valor do sensor

Exemplo: $VALUE$ == true ? &quot;Ligado&quot; : &quot;Desligado&quot;"
                  className="font-mono text-sm min-h-[80px] resize-y"
                  rows={3}
                />
                
                <p className="text-xs text-muted-foreground">
                  Transforme o valor do sensor usando expressões JavaScript. Use <code className="text-xs bg-muted px-1 py-0.5 rounded">$VALUE$</code> como placeholder.
                </p>
                
                <details className="text-xs">
                  <summary className="cursor-pointer font-medium text-foreground hover:text-accent-foreground transition-colors">
                    📚 Ver exemplos e operadores disponíveis
                  </summary>
                  
                  <div className="mt-3 space-y-3 pl-3 border-l-2 border-muted">
                    <div>
                      <p className="font-semibold text-foreground mb-2">Exemplos:</p>
                      <div className="space-y-2">
                        {FORMULA_EXAMPLES.slice(0, 6).map((example, idx) => (
                          <div key={idx} className="p-2 bg-muted/50 rounded border">
                            <p className="font-medium text-foreground">{example.label}</p>
                            <code className="text-xs text-accent-foreground block mt-1 break-all">
                              {example.formula}
                            </code>
                            <p className="text-muted-foreground mt-1">{example.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <p className="font-semibold text-foreground mb-2">Operadores suportados:</p>
                      <ul className="space-y-1 text-muted-foreground">
                        <li>• <code className="text-xs bg-muted px-1 py-0.5 rounded">+, -, *, /, %</code> - Aritméticos</li>
                        <li>• <code className="text-xs bg-muted px-1 py-0.5 rounded">==, !=, &lt;, &gt;, &lt;=, &gt;=</code> - Comparação</li>
                        <li>• <code className="text-xs bg-muted px-1 py-0.5 rounded">&amp;&amp;, ||, !</code> - Lógicos</li>
                        <li>• <code className="text-xs bg-muted px-1 py-0.5 rounded">cond ? a : b</code> - Ternário</li>
                        <li>• <code className="text-xs bg-muted px-1 py-0.5 rounded">helpers.clamp()</code>, <code className="text-xs bg-muted px-1 py-0.5 rounded">helpers.round()</code>, <code className="text-xs bg-muted px-1 py-0.5 rounded">helpers.toF()</code></li>
                      </ul>
                    </div>
                    
                    <div className="p-3 bg-muted/50 border rounded">
                      <p className="font-semibold text-foreground mb-1">⚠️ Segurança</p>
                      <p className="text-muted-foreground">
                        As fórmulas são avaliadas em um ambiente seguro. Operações perigosas como <code className="text-xs bg-background px-1 py-0.5 rounded">eval</code>, <code className="text-xs bg-background px-1 py-0.5 rounded">window</code>, <code className="text-xs bg-background px-1 py-0.5 rounded">document</code> são bloqueadas.
                      </p>
                    </div>
                  </div>
                </details>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="label" className="text-sm font-medium">Label (opcional)</Label>
                  <Input
                    id="label"
                    value={config.label || ''}
                    onChange={(e) => setConfig({ ...config, label: e.target.value })}
                    placeholder="Ex: Temperatura"
                    className="h-10"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="unit" className="text-sm font-medium">Unidade</Label>
                  <Input
                    id="unit"
                    value={config.unit || selectedSensor?.unit || ''}
                    onChange={(e) => setConfig({ ...config, unit: e.target.value })}
                    placeholder="Ex: °C, kW, %"
                    className="h-10"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="decimals" className="text-sm font-medium">Casas Decimais</Label>
                  <Select
                    value={config.decimals?.toString() || '2'}
                    onValueChange={(value) => setConfig({ ...config, decimals: parseInt(value) })}
                  >
                    <SelectTrigger id="decimals" className="h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">0️⃣ 0 casas (100)</SelectItem>
                      <SelectItem value="1">1️⃣ 1 casa (100.0)</SelectItem>
                      <SelectItem value="2">2️⃣ 2 casas (100.00)</SelectItem>
                      <SelectItem value="3">3️⃣ 3 casas (100.000)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Aparência */}
            <div className="space-y-4">
              <h3 className="font-semibold text-base text-foreground flex items-center gap-2 pb-3 border-b">
                <div className="w-1 h-5 bg-purple-500 rounded-full"></div>
                Aparência
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Label htmlFor="custom-color" className="text-sm font-medium whitespace-nowrap">
                    Cor do Widget:
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="custom-color"
                      type="color"
                      value={config.color || '#3b82f6'}
                      onChange={(e) => setConfig({ ...config, color: e.target.value })}
                      className="w-16 h-10 p-1 cursor-pointer"
                    />
                    <span className="text-sm font-mono text-muted-foreground">
                      {config.color || '#3b82f6'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Limites e Alertas */}
            <div className="space-y-4">
              <h3 className="font-semibold text-base text-foreground flex items-center gap-2 pb-3 border-b">
                <div className="w-1 h-5 bg-orange-500 rounded-full"></div>
                Limites e Alertas
              </h3>
              
              {/* Valor Mínimo e Máximo - NÃO mostrar para card-value e card-stat */}
              {widget.type !== 'card-value' && widget.type !== 'card-stat' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="minValue" className="text-sm font-medium flex items-center gap-2">
                      <span className="text-blue-600">📉</span>
                      Valor Mínimo
                    </Label>
                    <Input
                      id="minValue"
                      type="number"
                      value={config.minValue || ''}
                      onChange={(e) => setConfig({ ...config, minValue: parseFloat(e.target.value) || undefined })}
                      placeholder="0"
                      className="h-10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxValue" className="text-sm font-medium flex items-center gap-2">
                      <span className="text-blue-600">📈</span>
                      Valor Máximo
                    </Label>
                    <Input
                      id="maxValue"
                      type="number"
                      value={config.maxValue || ''}
                      onChange={(e) => setConfig({ ...config, maxValue: parseFloat(e.target.value) || undefined })}
                      placeholder="100"
                      className="h-10"
                    />
                  </div>
                </div>
              )}
              
              <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 ${widget.type !== 'card-value' && widget.type !== 'card-stat' ? 'pt-2' : ''}`}>
                <div className="space-y-2">
                  <Label htmlFor="warningThreshold" className="text-sm font-medium flex items-center gap-2">
                    <span className="text-yellow-600 text-lg">⚠️</span>
                    Limite de Aviso
                  </Label>
                  <Input
                    id="warningThreshold"
                    type="number"
                    value={config.warningThreshold || ''}
                    onChange={(e) => setConfig({ ...config, warningThreshold: parseFloat(e.target.value) || undefined })}
                    placeholder="80"
                    className="h-10 border-yellow-300 focus:border-yellow-500"
                  />
                  <p className="text-xs text-muted-foreground">
                    Widget ficará amarelo ao atingir este valor
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="criticalThreshold" className="text-sm font-medium flex items-center gap-2">
                    <span className="text-red-600 text-lg">🚨</span>
                    Limite Crítico
                  </Label>
                  <Input
                    id="criticalThreshold"
                    type="number"
                    value={config.criticalThreshold || ''}
                    onChange={(e) => setConfig({ ...config, criticalThreshold: parseFloat(e.target.value) || undefined })}
                    placeholder="90"
                    className="h-10 border-red-300 focus:border-red-500"
                  />
                  <p className="text-xs text-muted-foreground">
                    Widget ficará vermelho ao atingir este valor
                  </p>
                </div>
              </div>
            </div>

          </div>
        </ScrollArea>

        {/* Ações */}
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 border-t px-6 py-4">
          <div className="text-sm text-muted-foreground">
            {selectedSensor ? (
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                Configuração completa: <span className="font-medium">
                  {selectedDeviceName} → {selectedSensor.tag.includes('_') 
                    ? selectedSensor.tag.split('_').slice(1).join('_').split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')
                    : selectedSensor.metric_type}
                </span>
              </span>
            ) : selectedDeviceName ? (
              <span className="text-blue-600 flex items-center gap-2">
                <span className="text-lg">📊</span>
                Device selecionado. Escolha uma ou mais variáveis.
              </span>
            ) : selectedAssetId ? (
              <span className="text-blue-600 flex items-center gap-2">
                <span className="text-lg">📍</span>
                Equipamento selecionado. Escolha um sensor.
              </span>
            ) : (
              <span className="text-orange-600 flex items-center gap-2">
                <span className="text-lg">⚠️</span>
                Selecione um equipamento para começar
              </span>
            )}
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <Button 
              variant="outline" 
              onClick={onClose}
              className="w-full sm:w-auto h-10"
            >
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button 
              onClick={handleSave}
              className="w-full sm:w-auto h-10"
            >
              <Save className="w-4 h-4 mr-2" />
              Salvar Configurações
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};