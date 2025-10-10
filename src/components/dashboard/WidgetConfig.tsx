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
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Configurar Widget
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Configure o widget e vincule um sensor para exibir dados em tempo real
          </p>
        </DialogHeader>
        
        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-6 py-2">
            {/* Informações Básicas */}
            <div className="space-y-4">
              <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                Informações Básicas
              </h3>
              
              <div className="space-y-2">
                <Label htmlFor="widget-title">Título do Widget</Label>
                <Input
                  id="widget-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Temperatura Sala 01"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="widget-size">Tamanho</Label>
                <Select value={size} onValueChange={(value) => setSize(value as any)}>
                  <SelectTrigger id="widget-size">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Pequeno (1 coluna)</SelectItem>
                    <SelectItem value="medium">Médio (3 colunas)</SelectItem>
                    <SelectItem value="large">Grande (6 colunas)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Vinculação de Sensor */}
            <div className="space-y-4 pt-4 border-t">
              <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Fonte de Dados
              </h3>
              
              <div className="space-y-2">
                <Label htmlFor="sensor">Sensor</Label>
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
                  <SelectTrigger id="sensor">
                    <SelectValue placeholder="Selecione um sensor" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableSensors.map(sensor => {
                      const asset = assets.find(a => a.id === sensor.assetId);
                      return (
                        <SelectItem key={sensor.id} value={sensor.id}>
                          {sensor.tag} • {asset?.tag} • {sensor.unit}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                {selectedSensor && (
                  <p className="text-sm text-green-600">
                    ✓ Último valor: {selectedSensor.lastReading?.value?.toFixed(2)} {selectedSensor.unit}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="label">Label (opcional)</Label>
                  <Input
                    id="label"
                    value={config.label || ''}
                    onChange={(e) => setConfig({ ...config, label: e.target.value })}
                    placeholder="Ex: Temperatura"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="unit">Unidade</Label>
                  <Input
                    id="unit"
                    value={config.unit || selectedSensor?.unit || ''}
                    onChange={(e) => setConfig({ ...config, unit: e.target.value })}
                    placeholder="Ex: °C, kW, %"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="decimals">Casas Decimais</Label>
                <Select
                  value={config.decimals?.toString() || '2'}
                  onValueChange={(value) => setConfig({ ...config, decimals: parseInt(value) })}
                >
                  <SelectTrigger id="decimals">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">0 casas</SelectItem>
                    <SelectItem value="1">1 casa</SelectItem>
                    <SelectItem value="2">2 casas</SelectItem>
                    <SelectItem value="3">3 casas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Aparência */}
            <div className="space-y-4 pt-4 border-t">
              <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                Aparência
              </h3>
              
              <div className="space-y-2">
                <Label>Cor do Widget</Label>
                <div className="flex gap-2 flex-wrap">
                  {['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'].map(color => (
                    <button
                      key={color}
                      onClick={() => setConfig({ ...config, color })}
                      className={`w-10 h-10 rounded-md border-2 transition-all ${
                        config.color === color ? 'border-primary scale-110 shadow-md' : 'border-gray-200'
                      }`}
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                  <Input
                    type="color"
                    value={config.color || '#3b82f6'}
                    onChange={(e) => setConfig({ ...config, color: e.target.value })}
                    className="w-10 h-10 p-1"
                  />
                </div>
              </div>
            </div>

            {/* Limites e Alertas */}
            <div className="space-y-4 pt-4 border-t">
              <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                Limites e Alertas
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="minValue">Valor Mínimo</Label>
                  <Input
                    id="minValue"
                    type="number"
                    value={config.minValue || ''}
                    onChange={(e) => setConfig({ ...config, minValue: parseFloat(e.target.value) || undefined })}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxValue">Valor Máximo</Label>
                  <Input
                    id="maxValue"
                    type="number"
                    value={config.maxValue || ''}
                    onChange={(e) => setConfig({ ...config, maxValue: parseFloat(e.target.value) || undefined })}
                    placeholder="100"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="warningThreshold">
                    <span className="text-yellow-600">⚠</span> Limite de Aviso
                  </Label>
                  <Input
                    id="warningThreshold"
                    type="number"
                    value={config.warningThreshold || ''}
                    onChange={(e) => setConfig({ ...config, warningThreshold: parseFloat(e.target.value) || undefined })}
                    placeholder="80"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="criticalThreshold">
                    <span className="text-red-600">⚠</span> Limite Crítico
                  </Label>
                  <Input
                    id="criticalThreshold"
                    type="number"
                    value={config.criticalThreshold || ''}
                    onChange={(e) => setConfig({ ...config, criticalThreshold: parseFloat(e.target.value) || undefined })}
                    placeholder="90"
                  />
                </div>
              </div>
            </div>

            {/* Opções de Gráfico (se aplicável) */}
            {widget.type.includes('chart') && (
              <div className="space-y-4 pt-4 border-t">
                <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                  Opções de Gráfico
                </h3>
                
                <div className="space-y-2">
                  <Label htmlFor="timeRange">Período de Tempo</Label>
                  <Select
                    value={config.timeRange || '24h'}
                    onValueChange={(value: any) => setConfig({ ...config, timeRange: value })}
                  >
                    <SelectTrigger id="timeRange">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1h">Última 1 hora</SelectItem>
                      <SelectItem value="6h">Últimas 6 horas</SelectItem>
                      <SelectItem value="24h">Últimas 24 horas</SelectItem>
                      <SelectItem value="7d">Últimos 7 dias</SelectItem>
                      <SelectItem value="30d">Últimos 30 dias</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Ações */}
        <div className="flex justify-end gap-2 border-t pt-4 mt-4">
          <Button variant="outline" onClick={onClose}>
            <X className="w-4 h-4 mr-2" />
            Cancelar
          </Button>
          <Button onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />
            Salvar Configurações
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};