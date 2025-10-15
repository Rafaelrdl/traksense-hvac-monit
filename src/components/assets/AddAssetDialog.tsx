import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { HVACAsset } from '@/types/hvac';

interface AddAssetDialogProps {
  onAddAsset: (asset: Omit<HVACAsset, 'id' | 'healthScore' | 'powerConsumption' | 'status' | 'operatingHours' | 'lastMaintenance'>) => void;
}

export const AddAssetDialog: React.FC<AddAssetDialogProps> = ({ onAddAsset }) => {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');

  // Informações Básicas
  const [tag, setTag] = useState('');
  const [type, setType] = useState<HVACAsset['type']>('AHU');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [capacity, setCapacity] = useState('');
  const [serialNumber, setSerialNumber] = useState('');

  // Informações de Localização
  const [company, setCompany] = useState('');
  const [sector, setSector] = useState('');
  const [subsector, setSubsector] = useState('');
  const [location, setLocation] = useState('');

  // Especificações Técnicas Adicionais
  const [voltage, setVoltage] = useState('');
  const [maxCurrent, setMaxCurrent] = useState('');
  const [refrigerant, setRefrigerant] = useState('none');

  const resetForm = () => {
    setTag('');
    setType('AHU');
    setBrand('');
    setModel('');
    setCapacity('');
    setSerialNumber('');
    setCompany('');
    setSector('');
    setSubsector('');
    setLocation('');
    setVoltage('');
    setMaxCurrent('');
    setRefrigerant('none');
    setActiveTab('basic');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validação básica
    if (!tag.trim()) {
      toast.error('Tag do equipamento é obrigatória');
      setActiveTab('basic');
      return;
    }

    if (!company.trim() || !sector.trim()) {
      toast.error('Empresa e Setor são obrigatórios');
      setActiveTab('location');
      return;
    }

    // Criar localização completa
    const fullLocation = [company, sector, subsector].filter(Boolean).join(' - ');

    // Criar novo ativo
    const newAsset: Omit<HVACAsset, 'id' | 'healthScore' | 'powerConsumption' | 'status' | 'operatingHours' | 'lastMaintenance'> = {
      tag: tag.trim(),
      type,
      location: location.trim() || fullLocation,
      company: company.trim(),
      sector: sector.trim(),
      subsector: subsector.trim() || undefined,
      specifications: {
        capacity: capacity ? parseFloat(capacity) : undefined,
        voltage: voltage ? parseFloat(voltage) : undefined,
        maxCurrent: maxCurrent ? parseFloat(maxCurrent) : undefined,
        refrigerant: refrigerant !== 'none' ? refrigerant : undefined,
        brand: brand.trim() || undefined,
        model: model.trim() || undefined,
        serialNumber: serialNumber.trim() || undefined,
      },
    };

    onAddAsset(newAsset);
    toast.success(`Ativo ${tag} adicionado com sucesso!`);
    setOpen(false);
    resetForm();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2">
          <Plus className="size-4" />
          Adicionar ativo
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Plus className="w-5 h-5" />
            <span>Adicionar Novo Ativo HVAC</span>
          </DialogTitle>
          <DialogDescription>
            Preencha as informações do equipamento. Os campos marcados com * são obrigatórios.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Informações Básicas</TabsTrigger>
              <TabsTrigger value="location">Localização</TabsTrigger>
              <TabsTrigger value="specs">Especificações</TabsTrigger>
            </TabsList>

            <ScrollArea className="h-[400px] mt-4">
              {/* Informações Básicas */}
              <TabsContent value="basic" className="space-y-4 px-1">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="tag">
                      Tag do Equipamento <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="tag"
                      placeholder="Ex: AHU-001"
                      value={tag}
                      onChange={(e) => setTag(e.target.value)}
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Identificador único do equipamento
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="type">
                      Tipo de Equipamento <span className="text-red-500">*</span>
                    </Label>
                    <Select value={type} onValueChange={(value: HVACAsset['type']) => setType(value)}>
                      <SelectTrigger id="type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="AHU">AHU - Air Handling Unit</SelectItem>
                        <SelectItem value="Chiller">Chiller</SelectItem>
                        <SelectItem value="VRF">VRF - Variable Refrigerant Flow</SelectItem>
                        <SelectItem value="RTU">RTU - Rooftop Unit</SelectItem>
                        <SelectItem value="Boiler">Boiler</SelectItem>
                        <SelectItem value="CoolingTower">Cooling Tower</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="brand">Marca</Label>
                    <Input
                      id="brand"
                      placeholder="Ex: Carrier, Trane, York"
                      value={brand}
                      onChange={(e) => setBrand(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="model">Modelo</Label>
                    <Input
                      id="model"
                      placeholder="Ex: 30XA-1002"
                      value={model}
                      onChange={(e) => setModel(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="capacity">Capacidade</Label>
                    <Input
                      id="capacity"
                      type="number"
                      step="0.1"
                      placeholder="Ex: 500"
                      value={capacity}
                      onChange={(e) => setCapacity(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      {type === 'Chiller' ? 'Toneladas de refrigeração (TR)' : 'Potência (kW)'}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="serialNumber">Número de Série</Label>
                    <Input
                      id="serialNumber"
                      placeholder="Ex: SN123456789"
                      value={serialNumber}
                      onChange={(e) => setSerialNumber(e.target.value)}
                    />
                  </div>
                </div>
              </TabsContent>

              {/* Informações de Localização */}
              <TabsContent value="location" className="space-y-4 px-1">
                <div className="space-y-2">
                  <Label htmlFor="company">
                    Empresa <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="company"
                    placeholder="Ex: Hospital Central"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Nome da empresa ou unidade
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sector">
                      Setor <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="sector"
                      placeholder="Ex: Centro Cirúrgico"
                      value={sector}
                      onChange={(e) => setSector(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subsector">Subsetor</Label>
                    <Input
                      id="subsector"
                      placeholder="Ex: Sala 01"
                      value={subsector}
                      onChange={(e) => setSubsector(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Localização Descritiva (Opcional)</Label>
                  <Input
                    id="location"
                    placeholder="Ex: 3º Andar - Ala Leste"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Se não preenchido, será gerado automaticamente: Empresa - Setor - Subsetor
                  </p>
                </div>

                <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <h4 className="font-medium text-sm mb-2">Prévia da Localização:</h4>
                  <p className="text-sm text-muted-foreground">
                    {location.trim() || [company, sector, subsector].filter(Boolean).join(' - ') || 'Preencha os campos acima'}
                  </p>
                </div>
              </TabsContent>

              {/* Especificações Técnicas */}
              <TabsContent value="specs" className="space-y-4 px-1">
                <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-4">
                  <p className="text-sm text-amber-800 dark:text-amber-200">
                    ℹ️ Estas especificações são opcionais, mas ajudam no monitoramento e manutenção do equipamento.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="voltage">Tensão Nominal (V)</Label>
                    <Input
                      id="voltage"
                      type="number"
                      placeholder="Ex: 380"
                      value={voltage}
                      onChange={(e) => setVoltage(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="maxCurrent">Corrente Máxima (A)</Label>
                    <Input
                      id="maxCurrent"
                      type="number"
                      step="0.1"
                      placeholder="Ex: 150.5"
                      value={maxCurrent}
                      onChange={(e) => setMaxCurrent(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="refrigerant">Fluido Refrigerante (Opcional)</Label>
                  <Select value={refrigerant} onValueChange={setRefrigerant}>
                    <SelectTrigger id="refrigerant">
                      <SelectValue placeholder="Selecione o refrigerante" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Nenhum</SelectItem>
                      <SelectItem value="R-22">R-22</SelectItem>
                      <SelectItem value="R-134a">R-134a</SelectItem>
                      <SelectItem value="R-404A">R-404A</SelectItem>
                      <SelectItem value="R-407C">R-407C</SelectItem>
                      <SelectItem value="R-410A">R-410A</SelectItem>
                      <SelectItem value="R-32">R-32</SelectItem>
                      <SelectItem value="R-717">R-717 (Amônia)</SelectItem>
                      <SelectItem value="R-744">R-744 (CO₂)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Tipo de gás refrigerante utilizado no sistema
                  </p>
                </div>
              </TabsContent>
            </ScrollArea>
          </Tabs>

          <div className="flex justify-between mt-6 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setOpen(false);
                resetForm();
              }}
            >
              Cancelar
            </Button>

            <div className="flex space-x-2">
              {activeTab !== 'basic' && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    const tabs = ['basic', 'location', 'specs'];
                    const currentIndex = tabs.indexOf(activeTab);
                    if (currentIndex > 0) {
                      setActiveTab(tabs[currentIndex - 1]);
                    }
                  }}
                >
                  Anterior
                </Button>
              )}

              {activeTab !== 'specs' ? (
                <Button
                  type="button"
                  onClick={() => {
                    const tabs = ['basic', 'location', 'specs'];
                    const currentIndex = tabs.indexOf(activeTab);
                    if (currentIndex < tabs.length - 1) {
                      setActiveTab(tabs[currentIndex + 1]);
                    }
                  }}
                >
                  Próximo
                </Button>
              ) : (
                <Button type="submit">
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Ativo
                </Button>
              )}
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
