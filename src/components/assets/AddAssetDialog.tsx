import React, { useState } from 'react';
import { Plus } from 'lucide-react';
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
import { HVACAsset, EquipmentType } from '@/types/hvac';
import { EquipmentTypeField } from './EquipmentTypeField';
import { assetsService } from '@/services/assetsService';
import { sitesService } from '@/services/sitesService';
import { mapHVACAssetToApiAsset, mapApiAssetToHVACAsset } from '@/lib/mappers/assetMapper';
import { useAppStore } from '@/store/app';

interface AddAssetDialogProps {
  onAddAsset: (asset: Omit<HVACAsset, 'id' | 'healthScore' | 'powerConsumption' | 'status' | 'operatingHours' | 'lastMaintenance'>) => Promise<void>;
  editingAsset?: HVACAsset | null;
  onClose?: () => void;
  onEditSuccess?: () => void;
}

export const AddAssetDialog: React.FC<AddAssetDialogProps> = ({ onAddAsset, editingAsset, onClose, onEditSuccess }) => {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');

  // Informações Básicas
  const [tag, setTag] = useState('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [capacity, setCapacity] = useState('');
  const [serialNumber, setSerialNumber] = useState('');

  // Tipo expandido de equipamento
  const [equipmentType, setEquipmentType] = useState<EquipmentType>('AHU');
  const [equipmentTypeOther, setEquipmentTypeOther] = useState('');

  // Informações de Localização
  const [company, setCompany] = useState('');
  const [sector, setSector] = useState('');
  const [subsector, setSubsector] = useState('');
  const [location, setLocation] = useState('');

  // Especificações Técnicas Adicionais
  const [voltage, setVoltage] = useState('');
  const [maxCurrent, setMaxCurrent] = useState('');
  const [refrigerant, setRefrigerant] = useState('none');

  // Preencher formulário quando estiver editando
  React.useEffect(() => {
    if (editingAsset) {
      // Buscar dados mais recentes da API
      const fetchAssetData = async () => {
        try {
          const assetId = typeof editingAsset.id === 'number' ? editingAsset.id : parseInt(editingAsset.id);
          console.log('🔄 Carregando dados atualizados do ativo:', assetId);
          
          const apiAsset = await assetsService.getById(assetId);
          const updatedAsset = mapApiAssetToHVACAsset(apiAsset);
          
          console.log('✅ Dados atualizados carregados:', {
            asset_type: apiAsset.asset_type,
            type: updatedAsset.type,
            specifications: updatedAsset.specifications
          });
          
          // Mapear o type do ativo para equipmentType do formulário
          const typeToEquipmentType = (type: HVACAsset['type']): EquipmentType => {
            const mapping: Record<HVACAsset['type'], EquipmentType> = {
              'AHU': 'AHU',
              'Chiller': 'CHILLER',
              'VRF': 'VRF',
              'RTU': 'RTU',
              'Boiler': 'BOILER',
              'CoolingTower': 'COOLING_TOWER',
            };
            return mapping[type] || 'AHU';
          };
          
          setTag(updatedAsset.tag || '');
          setBrand(updatedAsset.specifications?.brand || '');
          setModel(updatedAsset.specifications?.model || '');
          setCapacity(updatedAsset.specifications?.capacity?.toString() || '');
          setSerialNumber(updatedAsset.specifications?.serialNumber || '');
          setEquipmentType(typeToEquipmentType(updatedAsset.type));
          setEquipmentTypeOther(updatedAsset.specifications?.equipmentTypeOther || '');
          setCompany(updatedAsset.company || '');
          setSector(updatedAsset.sector || '');
          setSubsector(updatedAsset.subsector || '');
          setLocation(updatedAsset.location || '');
          setVoltage(updatedAsset.specifications?.voltage?.toString() || '');
          setMaxCurrent(updatedAsset.specifications?.maxCurrent?.toString() || '');
          setRefrigerant(updatedAsset.specifications?.refrigerant || 'none');
          setOpen(true);
        } catch (error) {
          console.error('❌ Erro ao carregar dados do ativo:', error);
          toast.error('Erro ao carregar dados do ativo');
        }
      };
      
      fetchAssetData();
    }
  }, [editingAsset]);

  const resetForm = () => {
    setTag('');
    setBrand('');
    setModel('');
    setCapacity('');
    setSerialNumber('');
    setEquipmentType('AHU');
    setEquipmentTypeOther('');
    setCompany('');
    setSector('');
    setSubsector('');
    setLocation('');
    setVoltage('');
    setMaxCurrent('');
    setRefrigerant('none');
    setActiveTab('basic');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validação básica
    if (!tag.trim()) {
      toast.error('Tag do equipamento é obrigatória');
      setActiveTab('basic');
      return;
    }

    // Validação do tipo de equipamento
    if (equipmentType === 'OTHER' && (!equipmentTypeOther.trim() || equipmentTypeOther.trim().length < 3)) {
      toast.error('Especifique o tipo de equipamento (mínimo 3 caracteres)');
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

    // Mapear equipmentType para type legado
    const mapEquipmentTypeToLegacy = (eqType: EquipmentType): HVACAsset['type'] => {
      const mapping: Record<string, HVACAsset['type']> = {
        'CHILLER': 'Chiller',
        'AHU': 'AHU',
        'VRF': 'VRF',
        'RTU': 'RTU',
        'BOILER': 'Boiler',
        'COOLING_TOWER': 'CoolingTower',
      };
      return mapping[eqType] || 'AHU'; // Fallback para AHU
    };

    // Criar novo ativo
    const newAsset: Omit<HVACAsset, 'id' | 'healthScore' | 'powerConsumption' | 'status' | 'operatingHours' | 'lastMaintenance'> = {
      tag: tag.trim(),
      type: mapEquipmentTypeToLegacy(equipmentType),
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
        equipmentType: equipmentType,
        equipmentTypeOther: equipmentType === 'OTHER' ? equipmentTypeOther.trim() : undefined,
      },
    };

    try {
      if (editingAsset) {
        // Modo de edição - buscar siteId e atualizar
        let siteId = 1; // Default
        
        try {
          const sites = await sitesService.getAllComplete();
          if (sites.length > 0) {
            siteId = sites[0].id;
          }
        } catch (siteError) {
          console.warn('⚠️ Não foi possível buscar sites, usando ID padrão:', siteError);
        }

        // Converter para formato da API
        const apiAssetData = mapHVACAssetToApiAsset(
          {
            ...newAsset,
            id: editingAsset.id,
            healthScore: editingAsset.healthScore,
            status: editingAsset.status,
            lastMaintenance: editingAsset.lastMaintenance,
            powerConsumption: editingAsset.powerConsumption,
            operatingHours: editingAsset.operatingHours,
          },
          siteId
        );

        console.log('🔄 Atualizando ativo:', {
          id: editingAsset.id,
          tag: tag,
          newAssetType: newAsset.type,
          equipmentTypeFromForm: equipmentType,
          apiData: apiAssetData,
          asset_type_sent: apiAssetData.asset_type
        });

        // Atualizar na API
        const updatedApiAsset = await assetsService.update(
          typeof editingAsset.id === 'number' ? editingAsset.id : parseInt(editingAsset.id),
          apiAssetData
        );
        
        console.log('✅ Ativo atualizado na API:', {
          id: updatedApiAsset.id,
          tag: updatedApiAsset.tag,
          asset_type: updatedApiAsset.asset_type,
          manufacturer: updatedApiAsset.manufacturer,
          model: updatedApiAsset.model,
          specifications: updatedApiAsset.specifications
        });
        
        // Converter resposta para formato frontend
        const updatedHVACAsset = mapApiAssetToHVACAsset(updatedApiAsset);
        
        // Atualizar no store
        const { assets } = useAppStore.getState();
        const updatedAssets = assets.map(a => 
          a.id === editingAsset.id ? updatedHVACAsset : a
        );
        useAppStore.setState({ assets: updatedAssets });
        
        toast.success(`Ativo ${tag} atualizado com sucesso!`);
        
        // Chamar callback de sucesso para recarregar dados
        if (onEditSuccess) {
          onEditSuccess();
        }
      } else {
        // Modo de criação
        await onAddAsset(newAsset);
        toast.success(`Ativo ${tag} adicionado com sucesso!`);
      }
      
      setOpen(false);
      resetForm();
      if (onClose) {
        onClose(); // Limpar editingAsset no componente pai
      }
    } catch (error) {
      toast.error(editingAsset ? 'Erro ao atualizar ativo.' : 'Erro ao adicionar ativo. Tente novamente.');
      console.error('Erro ao processar ativo:', error);
    }
  };

  return (
    <Dialog 
      open={open} 
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) {
          resetForm();
          if (onClose) {
            onClose(); // Limpar editingAsset no componente pai
          }
        }
      }}
    >
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
            <span>{editingAsset ? 'Editar' : 'Adicionar'} Ativo</span>
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

                <EquipmentTypeField
                  value={equipmentType}
                  onChange={setEquipmentType}
                  otherValue={equipmentTypeOther}
                  onChangeOther={setEquipmentTypeOther}
                  required
                />

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
                      {equipmentType === 'CHILLER' ? 'Toneladas de refrigeração (TR)' : 'Potência (kW)'}
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
                    <Label htmlFor="maxCurrent">Corrente Nominal (A)</Label>
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
                  {editingAsset ? 'Salvar Alterações' : 'Adicionar Ativo'}
                </Button>
              )}
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
