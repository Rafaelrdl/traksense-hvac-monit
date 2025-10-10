import React, { useState } from 'react';
import { DashboardWidget } from '../../types/dashboard';
import { useAppStore } from '../../store/app';
import { useDashboardStore } from '../../store/dashboard';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { ScrollArea } from '../ui/scroll-area';
import { Settings, Save, X, Zap } from 'lucide-react';

interface WidgetConfigProps {
  widget: DashboardWidget;
  layoutId: string;
  open: boolean;
  onClose: () => void;
}

export const WidgetConfig: React.FC<WidgetConfigProps> = ({ widget, layoutId, open, onClose }) => {
  const { sensors, assets } = useAppStore();
  const updateWidget = useDashboardStore(state => state.updateWidget);
  
  const [title, setTitle] = useState(widget.title);
  const [size, setSize] = useState(widget.size);
  const [config, setConfig] = useState(widget.config || {});

  // Filtrar sensores disponíveis
  const availableSensors = sensors.filter(s => s.online);
  
  // Obter sensor selecionado
  const selectedSensor = config.sensorId 
    ? sensors.find(s => s.id === config.sensorId)
    : null;

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
                      <SelectItem value="small">📱 Pequeno (1 coluna)</SelectItem>
                      <SelectItem value="medium">📊 Médio (3 colunas)</SelectItem>
                      <SelectItem value="large">📈 Grande (6 colunas)</SelectItem>
                    </SelectContent>
                  </Select>
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
              
              <div className="space-y-2">
                <Label htmlFor="sensor" className="text-sm font-medium">Sensor</Label>
                <Select
                  value={config.sensorId || ''}
                  onValueChange={(value) => {
                    const sensor = sensors.find(s => s.id === value);
                    setConfig({
                      ...config,
                      sensorId: value,
                      assetId: sensor?.assetId,
                      unit: sensor?.unit,
                    });
                  }}
                >
                  <SelectTrigger id="sensor" className="h-10">
                    <SelectValue placeholder="🔍 Selecione um sensor" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {availableSensors.map(sensor => {
                      const asset = assets.find(a => a.id === sensor.assetId);
                      return (
                        <SelectItem key={sensor.id} value={sensor.id}>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{sensor.tag}</span>
                            <span className="text-muted-foreground">•</span>
                            <span className="text-muted-foreground text-sm">{asset?.tag}</span>
                            <span className="text-muted-foreground">•</span>
                            <span className="text-blue-600 font-medium">{sensor.unit}</span>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                {selectedSensor && (
                  <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-md">
                    <div className="flex-shrink-0 w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <p className="text-sm text-green-700 dark:text-green-400 font-medium">
                      Último valor: {selectedSensor.lastReading?.value?.toFixed(2)} {selectedSensor.unit}
                    </p>
                  </div>
                )}
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
                <Label className="text-sm font-medium">Cor do Widget</Label>
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
                  {[
                    { color: '#3b82f6', name: 'Azul' },
                    { color: '#10b981', name: 'Verde' },
                    { color: '#f59e0b', name: 'Laranja' },
                    { color: '#ef4444', name: 'Vermelho' },
                    { color: '#8b5cf6', name: 'Roxo' },
                    { color: '#06b6d4', name: 'Ciano' },
                    { color: '#ec4899', name: 'Rosa' },
                    { color: '#64748b', name: 'Cinza' }
                  ].map(({ color, name }) => (
                    <button
                      key={color}
                      onClick={() => setConfig({ ...config, color })}
                      className={`relative w-full aspect-square rounded-lg border-2 transition-all hover:scale-105 ${
                        config.color === color 
                          ? 'border-foreground ring-2 ring-offset-2 ring-primary scale-105 shadow-lg' 
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                      }`}
                      style={{ backgroundColor: color }}
                      title={name}
                    >
                      {config.color === color && (
                        <span className="absolute inset-0 flex items-center justify-center text-white text-xl font-bold">
                          ✓
                        </span>
                      )}
                    </button>
                  ))}
                </div>
                
                <div className="flex items-center gap-3 pt-2">
                  <Label htmlFor="custom-color" className="text-sm font-medium whitespace-nowrap">
                    Ou escolha uma cor customizada:
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
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
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

            {/* Opções de Gráfico (se aplicável) */}
            {widget.type.includes('chart') && (
              <div className="space-y-4">
                <h3 className="font-semibold text-base text-foreground flex items-center gap-2 pb-3 border-b">
                  <div className="w-1 h-5 bg-green-500 rounded-full"></div>
                  Opções de Gráfico
                </h3>
                
                <div className="space-y-2">
                  <Label htmlFor="timeRange" className="text-sm font-medium">Período de Tempo</Label>
                  <Select
                    value={config.timeRange || '24h'}
                    onValueChange={(value: any) => setConfig({ ...config, timeRange: value })}
                  >
                    <SelectTrigger id="timeRange" className="h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1h">⏱️ Última 1 hora</SelectItem>
                      <SelectItem value="6h">🕐 Últimas 6 horas</SelectItem>
                      <SelectItem value="24h">📅 Últimas 24 horas</SelectItem>
                      <SelectItem value="7d">📊 Últimos 7 dias</SelectItem>
                      <SelectItem value="30d">📈 Últimos 30 dias</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Define o período de dados históricos exibidos no gráfico
                  </p>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Ações */}
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 border-t px-6 py-4">
          <div className="text-sm text-muted-foreground">
            {config.sensorId ? (
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                Sensor vinculado
              </span>
            ) : (
              <span className="text-orange-600 flex items-center gap-2">
                <span className="text-lg">⚠️</span>
                Vincule um sensor para exibir dados
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