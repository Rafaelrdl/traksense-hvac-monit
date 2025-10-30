# 🏭 INTEGRAÇÃO ASSETS - FASE 2 (Catálogo de Ativos)

## 📋 **OBJETIVO**

Substituir dados mockados de **Assets/Ativos** (AHUs, Chillers, etc.) por dados reais da API REST Django implementada na FASE 2.

**Status Atual**:
- ✅ Backend FASE 2: 20+ endpoints funcionando (Sites, Assets, Devices, Sensors)
- ⚠️ Frontend: Usando `SimulationEngine` em `src/lib/simulation.ts` com 7 AHUs mockados
- 🎯 Meta: Remover todos os mocks e usar dados reais da API

---

## 🗺️ **MAPEAMENTO BACKEND ↔ FRONTEND**

### **Estrutura Hierárquica**

```
Backend (Django)          Frontend (React)
─────────────────         ────────────────
Site                      (novo - adicionar)
 └─ Asset                 → HVACAsset
     └─ Device            → (iotDeviceId)
         └─ Sensor        → Sensor
```

### **Tabela de Campos: Asset ↔ HVACAsset**

| Backend (Django) | Tipo | Frontend (TypeScript) | Tipo | Notas |
|------------------|------|----------------------|------|-------|
| `id` | int | `id` | string | Converter para string |
| `tag` | string | `tag` | string | ✅ Compatível |
| `name` | string | - | - | Não usado no frontend |
| `asset_type` | string | `type` | enum | Mapear valores |
| `site` | FK | - | - | Usado para `company`, `sector` |
| `site_name` | string | - | - | Somente leitura |
| `full_location` | string | `location` | string | ✅ Compatível |
| `location_description` | string | `location` | string | Alternativa |
| `manufacturer` | string | `specifications.brand` | string | Mapear para `brand` |
| `model` | string | `specifications.model` | string | ✅ Compatível |
| `serial_number` | string | `specifications.serialNumber` | string | Mapear snake_case |
| `status` | string | `status` | enum | Mapear valores |
| `health_score` | int (0-100) | `healthScore` | number | ✅ Compatível |
| `specifications` | JSON | `specifications` | object | Merge com outros campos |
| `installation_date` | date | - | - | Não usado |
| `last_maintenance` | date | `lastMaintenance` | Date | ✅ Compatível |
| `device_count` | int | - | - | Calculado no backend |
| `sensor_count` | int | - | - | Calculado no backend |
| `created_at` | datetime | - | - | Não usado |
| `updated_at` | datetime | - | - | Não usado |
| - | - | `powerConsumption` | number | ⚠️ Calcular ou mock |
| - | - | `operatingHours` | number | ⚠️ Calcular ou mock |
| - | - | `company` | string | De `site.company` |
| - | - | `sector` | string | De `site.sector` |
| - | - | `subsector` | string | De `site.subsector` |

### **Mapeamento de Enums**

#### Asset Type

| Backend | Frontend |
|---------|----------|
| `AHU` | `'AHU'` |
| `CHILLER` | `'Chiller'` |
| `VRF` | `'VRF'` |
| `RTU` | `'RTU'` |
| `BOILER` | `'Boiler'` |
| `COOLING_TOWER` | `'CoolingTower'` |
| `FAN_COIL` | `'FanCoil'` |
| `PUMP` | `'Pump'` |
| `AHU_COMPACTO` | `'CompactAHU'` |
| `SPLIT` | `'Split'` |

#### Status

| Backend | Frontend |
|---------|----------|
| `OK` | `'OK'` |
| `MAINTENANCE` | `'Maintenance'` |
| `STOPPED` | `'Stopped'` |
| `ALERT` | `'Alert'` |

---

## 📁 **ARQUIVOS A CRIAR/MODIFICAR**

### **1. Criar Services** (NOVO)

```
src/services/
├── assetsService.ts       (CRIAR)
├── sitesService.ts        (CRIAR)
├── devicesService.ts      (CRIAR)
└── sensorsService.ts      (CRIAR)
```

### **2. Criar Types** (NOVO)

```
src/types/
└── api.ts                 (CRIAR - tipos da API)
```

### **3. Criar Mappers** (NOVO)

```
src/lib/mappers/
└── assetMapper.ts         (CRIAR)
```

### **4. Atualizar Stores**

```
src/store/
├── app.ts                 (MODIFICAR - remover simEngine)
└── equipment.ts           (MODIFICAR - remover mocks)
```

### **5. Atualizar Simulation** (REMOVER APÓS)

```
src/lib/
└── simulation.ts          (MANTER temporariamente, remover depois)
```

---

## 🔧 **IMPLEMENTAÇÃO PASSO A PASSO**

### **PASSO 1: Criar Tipos da API** ⏱️ 15 min

Arquivo: `src/types/api.ts`

```typescript
/**
 * Tipos de resposta da API Django REST Framework
 */

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

/**
 * Site (localização física)
 */
export interface ApiSite {
  id: number;
  name: string;
  full_name: string;
  company: string;
  sector: string;
  subsector: string;
  address: string;
  latitude: string | null;
  longitude: string | null;
  timezone: string;
  asset_count: number;
  created_at: string;
  updated_at: string;
}

/**
 * Asset (equipamento HVAC)
 */
export interface ApiAsset {
  id: number;
  tag: string;
  name: string;
  site: number;
  site_name: string;
  full_location: string;
  asset_type: 
    | 'AHU' 
    | 'CHILLER' 
    | 'VRF' 
    | 'RTU' 
    | 'BOILER' 
    | 'COOLING_TOWER'
    | 'FAN_COIL'
    | 'PUMP'
    | 'AHU_COMPACTO'
    | 'SPLIT'
    | 'VAV'
    | 'HEAT_EXCHANGER'
    | 'DAMPER'
    | 'HUMIDIFIER'
    | 'DEHUMIDIFIER';
  asset_type_other: string | null;
  manufacturer: string;
  model: string;
  serial_number: string;
  location_description: string;
  installation_date: string | null;
  last_maintenance: string | null;
  status: 'OK' | 'MAINTENANCE' | 'STOPPED' | 'ALERT';
  health_score: number;
  specifications: Record<string, any>;
  device_count: number;
  sensor_count: number;
  created_at: string;
  updated_at: string;
}

/**
 * Device (dispositivo IoT)
 */
export interface ApiDevice {
  id: number;
  name: string;
  serial_number: string;
  asset: number;
  asset_tag: string;
  device_type: string;
  mqtt_client_id: string;
  status: 'ONLINE' | 'OFFLINE' | 'ERROR' | 'MAINTENANCE';
  firmware_version: string;
  last_seen: string | null;
  sensor_count: number;
  created_at: string;
  updated_at: string;
}

/**
 * Sensor (sensor físico)
 */
export interface ApiSensor {
  id: number;
  tag: string;
  device: number;
  device_name: string;
  asset_tag: string;
  metric_type: string;
  unit: string;
  thresholds: Record<string, any>;
  is_online: boolean;
  last_value: number | null;
  last_reading_at: string | null;
  availability: number | null;
  created_at: string;
  updated_at: string;
}
```

---

### **PASSO 2: Criar Assets Service** ⏱️ 20 min

Arquivo: `src/services/assetsService.ts`

```typescript
import { api } from '@/lib/api';
import type { ApiAsset, PaginatedResponse } from '@/types/api';

/**
 * Service para gerenciar Assets (equipamentos HVAC)
 */
export const assetsService = {
  /**
   * Lista todos os assets com paginação e filtros
   */
  async getAll(params?: {
    site?: number;
    asset_type?: string;
    status?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<PaginatedResponse<ApiAsset>> {
    const response = await api.get<PaginatedResponse<ApiAsset>>('/assets/', { 
      params 
    });
    return response.data;
  },

  /**
   * Busca um asset por ID
   */
  async getById(id: number): Promise<ApiAsset> {
    const response = await api.get<ApiAsset>(`/assets/${id}/`);
    return response.data;
  },

  /**
   * Cria um novo asset
   */
  async create(data: Partial<ApiAsset>): Promise<ApiAsset> {
    const response = await api.post<ApiAsset>('/assets/', data);
    return response.data;
  },

  /**
   * Atualiza um asset parcialmente
   */
  async update(id: number, data: Partial<ApiAsset>): Promise<ApiAsset> {
    const response = await api.patch<ApiAsset>(`/assets/${id}/`, data);
    return response.data;
  },

  /**
   * Deleta um asset
   */
  async delete(id: number): Promise<void> {
    await api.delete(`/assets/${id}/`);
  },

  /**
   * Lista devices de um asset
   */
  async getDevices(assetId: number): Promise<any[]> {
    const response = await api.get(`/assets/${assetId}/devices/`);
    return response.data;
  },

  /**
   * Lista sensors de um asset
   */
  async getSensors(assetId: number): Promise<any[]> {
    const response = await api.get(`/assets/${assetId}/sensors/`);
    return response.data;
  },
};
```

---

### **PASSO 3: Criar Sites Service** ⏱️ 15 min

Arquivo: `src/services/sitesService.ts`

```typescript
import { api } from '@/lib/api';
import type { ApiSite, PaginatedResponse } from '@/types/api';

/**
 * Service para gerenciar Sites (localizações físicas)
 */
export const sitesService = {
  /**
   * Lista todos os sites
   */
  async getAll(params?: {
    company?: string;
    sector?: string;
    timezone?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<PaginatedResponse<ApiSite>> {
    const response = await api.get<PaginatedResponse<ApiSite>>('/sites/', { 
      params 
    });
    return response.data;
  },

  /**
   * Busca um site por ID
   */
  async getById(id: number): Promise<ApiSite> {
    const response = await api.get<ApiSite>(`/sites/${id}/`);
    return response.data;
  },

  /**
   * Cria um novo site
   */
  async create(data: Partial<ApiSite>): Promise<ApiSite> {
    const response = await api.post<ApiSite>('/sites/', data);
    return response.data;
  },

  /**
   * Atualiza um site
   */
  async update(id: number, data: Partial<ApiSite>): Promise<ApiSite> {
    const response = await api.patch<ApiSite>(`/sites/${id}/`, data);
    return response.data;
  },

  /**
   * Deleta um site
   */
  async delete(id: number): Promise<void> {
    await api.delete(`/sites/${id}/`);
  },
};
```

---

### **PASSO 4: Criar Asset Mapper** ⏱️ 30 min

Arquivo: `src/lib/mappers/assetMapper.ts`

```typescript
import type { ApiAsset, ApiSite } from '@/types/api';
import type { HVACAsset } from '@/types/hvac';

/**
 * Converte Asset da API para HVACAsset do frontend
 */
export function mapApiAssetToHVACAsset(
  apiAsset: ApiAsset,
  site?: ApiSite
): HVACAsset {
  return {
    id: apiAsset.id.toString(),
    tag: apiAsset.tag,
    type: mapAssetTypeToFrontend(apiAsset.asset_type),
    location: apiAsset.location_description || apiAsset.full_location,
    healthScore: apiAsset.health_score,
    
    // TODO: Calcular via telemetria real
    powerConsumption: 0,
    operatingHours: 0,
    
    status: mapStatusToFrontend(apiAsset.status),
    
    lastMaintenance: apiAsset.last_maintenance 
      ? new Date(apiAsset.last_maintenance) 
      : new Date(),
    
    specifications: {
      capacity: apiAsset.specifications?.capacity,
      brand: apiAsset.manufacturer,
      model: apiAsset.model,
      serialNumber: apiAsset.serial_number,
      voltage: apiAsset.specifications?.voltage,
      refrigerant: apiAsset.specifications?.refrigerant,
      ...apiAsset.specifications,
    },
    
    // Dados do site
    company: site?.company || extractCompanyFromSiteName(apiAsset.site_name),
    sector: site?.sector,
    subsector: site?.subsector,
  };
}

/**
 * Converte HVACAsset do frontend para dados da API
 */
export function mapHVACAssetToApiAsset(
  asset: Partial<HVACAsset>,
  siteId: number
): Partial<ApiAsset> {
  return {
    tag: asset.tag,
    name: asset.tag, // ou pode usar outro campo
    site: siteId,
    asset_type: mapAssetTypeToApi(asset.type),
    manufacturer: asset.specifications?.brand || '',
    model: asset.specifications?.model || '',
    serial_number: asset.specifications?.serialNumber || '',
    location_description: asset.location,
    status: mapStatusToApi(asset.status),
    health_score: asset.healthScore,
    specifications: {
      capacity: asset.specifications?.capacity,
      voltage: asset.specifications?.voltage,
      refrigerant: asset.specifications?.refrigerant,
      ...asset.specifications,
    },
  };
}

/**
 * Mapeia tipo de asset API → Frontend
 */
function mapAssetTypeToFrontend(
  apiType: ApiAsset['asset_type']
): HVACAsset['type'] {
  const typeMap: Record<string, HVACAsset['type']> = {
    'AHU': 'AHU',
    'CHILLER': 'Chiller',
    'VRF': 'VRF',
    'RTU': 'RTU',
    'BOILER': 'Boiler',
    'COOLING_TOWER': 'CoolingTower',
    'FAN_COIL': 'FanCoil',
    'PUMP': 'Pump',
    'AHU_COMPACTO': 'CompactAHU',
    'SPLIT': 'Split',
  };
  
  return typeMap[apiType] || 'AHU';
}

/**
 * Mapeia tipo de asset Frontend → API
 */
function mapAssetTypeToApi(
  frontendType?: HVACAsset['type']
): ApiAsset['asset_type'] {
  if (!frontendType) return 'AHU';
  
  const typeMap: Record<HVACAsset['type'], ApiAsset['asset_type']> = {
    'AHU': 'AHU',
    'Chiller': 'CHILLER',
    'VRF': 'VRF',
    'RTU': 'RTU',
    'Boiler': 'BOILER',
    'CoolingTower': 'COOLING_TOWER',
    'FanCoil': 'FAN_COIL',
    'Pump': 'PUMP',
    'CompactAHU': 'AHU_COMPACTO',
    'Split': 'SPLIT',
  };
  
  return typeMap[frontendType] || 'AHU';
}

/**
 * Mapeia status API → Frontend
 */
function mapStatusToFrontend(
  apiStatus: ApiAsset['status']
): HVACAsset['status'] {
  const statusMap: Record<string, HVACAsset['status']> = {
    'OK': 'OK',
    'MAINTENANCE': 'Maintenance',
    'STOPPED': 'Stopped',
    'ALERT': 'Alert',
  };
  
  return statusMap[apiStatus] || 'OK';
}

/**
 * Mapeia status Frontend → API
 */
function mapStatusToApi(
  frontendStatus?: HVACAsset['status']
): ApiAsset['status'] {
  if (!frontendStatus) return 'OK';
  
  const statusMap: Record<HVACAsset['status'], ApiAsset['status']> = {
    'OK': 'OK',
    'Maintenance': 'MAINTENANCE',
    'Stopped': 'STOPPED',
    'Alert': 'ALERT',
  };
  
  return statusMap[frontendStatus] || 'OK';
}

/**
 * Extrai o nome da company do site_name
 * Exemplo: "UMC - Oncologia" → "UMC"
 */
function extractCompanyFromSiteName(siteName: string): string {
  const parts = siteName.split(' - ');
  return parts[0] || siteName;
}
```

---

### **PASSO 5: Atualizar Store** ⏱️ 45 min

Arquivo: `src/store/app.ts` (MODIFICAR)

```typescript
import { create } from 'zustand';
import type { HVACAsset, Sensor } from '../types/hvac';
import { assetsService } from '@/services/assetsService';
import { sitesService } from '@/services/sitesService';
import { mapApiAssetToHVACAsset } from '@/lib/mappers/assetMapper';

interface AppState {
  // Estado
  assets: HVACAsset[];
  sensors: Sensor[];
  isLoadingAssets: boolean;
  isLoadingSensors: boolean;
  error: string | null;
  
  // Filtros atuais
  selectedCompany: string | null;
  selectedSector: string | null;
  selectedStatus: string | null;
  
  // Actions
  loadAssets: () => Promise<void>;
  loadSensors: () => Promise<void>;
  addAsset: (asset: Partial<HVACAsset>) => Promise<void>;
  updateAsset: (id: string, asset: Partial<HVACAsset>) => Promise<void>;
  deleteAsset: (id: string) => Promise<void>;
  
  // Filtros
  setFilters: (filters: {
    company?: string | null;
    sector?: string | null;
    status?: string | null;
  }) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  // Estado inicial
  assets: [],
  sensors: [],
  isLoadingAssets: false,
  isLoadingSensors: false,
  error: null,
  
  selectedCompany: null,
  selectedSector: null,
  selectedStatus: null,
  
  /**
   * Carrega assets da API
   */
  loadAssets: async () => {
    set({ isLoadingAssets: true, error: null });
    
    try {
      // Buscar todos os assets (ajustar limit conforme necessário)
      const assetsResponse = await assetsService.getAll({ 
        limit: 100,
        status: get().selectedStatus || undefined,
      });
      
      // Buscar sites para enriquecer dados
      const sitesResponse = await sitesService.getAll({ limit: 100 });
      const sitesMap = new Map(
        sitesResponse.results.map(s => [s.id, s])
      );
      
      // Mapear para formato do frontend
      const assets = assetsResponse.results.map(apiAsset => {
        const site = sitesMap.get(apiAsset.site);
        return mapApiAssetToHVACAsset(apiAsset, site);
      });
      
      // Aplicar filtros locais
      let filteredAssets = assets;
      
      const { selectedCompany, selectedSector } = get();
      
      if (selectedCompany) {
        filteredAssets = filteredAssets.filter(
          a => a.company === selectedCompany
        );
      }
      
      if (selectedSector) {
        filteredAssets = filteredAssets.filter(
          a => a.sector === selectedSector
        );
      }
      
      set({ assets: filteredAssets, isLoadingAssets: false });
    } catch (error) {
      console.error('Erro ao carregar assets:', error);
      set({ 
        error: 'Falha ao carregar ativos. Verifique sua conexão.', 
        isLoadingAssets: false 
      });
    }
  },
  
  /**
   * Carrega sensors da API
   */
  loadSensors: async () => {
    set({ isLoadingSensors: true, error: null });
    
    try {
      // TODO: Implementar quando tiver endpoint de sensors
      // Por enquanto, mantém vazio
      set({ sensors: [], isLoadingSensors: false });
    } catch (error) {
      console.error('Erro ao carregar sensors:', error);
      set({ 
        error: 'Falha ao carregar sensores', 
        isLoadingSensors: false 
      });
    }
  },
  
  /**
   * Adiciona um novo asset
   */
  addAsset: async (asset: Partial<HVACAsset>) => {
    try {
      // TODO: Implementar criação
      // Recarregar lista após adicionar
      await get().loadAssets();
    } catch (error) {
      console.error('Erro ao adicionar asset:', error);
      throw error;
    }
  },
  
  /**
   * Atualiza um asset existente
   */
  updateAsset: async (id: string, asset: Partial<HVACAsset>) => {
    try {
      // TODO: Implementar atualização
      await assetsService.update(parseInt(id), {} as any);
      await get().loadAssets();
    } catch (error) {
      console.error('Erro ao atualizar asset:', error);
      throw error;
    }
  },
  
  /**
   * Deleta um asset
   */
  deleteAsset: async (id: string) => {
    try {
      await assetsService.delete(parseInt(id));
      await get().loadAssets();
    } catch (error) {
      console.error('Erro ao deletar asset:', error);
      throw error;
    }
  },
  
  /**
   * Define filtros e recarrega
   */
  setFilters: (filters) => {
    set({
      selectedCompany: filters.company ?? get().selectedCompany,
      selectedSector: filters.sector ?? get().selectedSector,
      selectedStatus: filters.status ?? get().selectedStatus,
    });
    
    // Recarregar assets com novos filtros
    get().loadAssets();
  },
}));
```

---

### **PASSO 6: Integrar na UI** ⏱️ 30 min

Exemplo: Página de Assets

```typescript
// src/pages/assets/AssetsPage.tsx (ou similar)
import { useEffect } from 'react';
import { useAppStore } from '@/store/app';

export function AssetsPage() {
  const { 
    assets, 
    isLoadingAssets, 
    error, 
    loadAssets 
  } = useAppStore();
  
  // Carrega dados ao montar
  useEffect(() => {
    loadAssets();
  }, [loadAssets]);
  
  if (isLoadingAssets) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg">Carregando ativos...</div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">
        Ativos ({assets.length})
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {assets.map((asset) => (
          <AssetCard key={asset.id} asset={asset} />
        ))}
      </div>
    </div>
  );
}
```

---

## 🧪 **VALIDAÇÃO E TESTES**

### **Checklist de Testes**

#### 1. Backend Funcionando
- [ ] Backend rodando em `http://umc.localhost:8000`
- [ ] Endpoints `/api/sites/` e `/api/assets/` retornando dados
- [ ] Autenticação JWT funcionando

#### 2. Listagem de Assets
- [ ] Página de ativos carrega dados da API
- [ ] Contador de ativos está correto
- [ ] Cards exibem informações corretas
- [ ] Loading state aparece durante carregamento

#### 3. Filtros
- [ ] Filtro por status funciona
- [ ] Filtro por company funciona
- [ ] Filtro por sector funciona
- [ ] URL atualiza ao filtrar (se implementado)

#### 4. Detalhes do Asset
- [ ] Clicar no card abre detalhes
- [ ] Todas as especificações são exibidas
- [ ] Health score é exibido corretamente
- [ ] Status badge tem cor correta

#### 5. Performance
- [ ] Carregamento inicial < 2s
- [ ] Sem erros no console
- [ ] Sem warnings de React

#### 6. Error Handling
- [ ] Mensagem de erro aparece se API falhar
- [ ] Retry funciona após erro de rede
- [ ] Token expired é tratado automaticamente

---

## ⚠️ **PONTOS DE ATENÇÃO**

### **1. Campos Faltantes no Backend**

| Campo Frontend | Status | Solução |
|----------------|--------|---------|
| `powerConsumption` | ⚠️ Ausente | Usar 0 por enquanto, implementar telemetria depois |
| `operatingHours` | ⚠️ Ausente | Usar 0 por enquanto, calcular depois |

### **2. Sensor JE02**

O frontend tem lógica específica para sensores JE02. Por enquanto:
- **Manter** a simulação de sensores JE02
- **Integrar** depois com endpoint `/api/sensors/`

### **3. Multi-tenancy**

A API usa schemas diferentes (public, umc). Certifique-se de:
- Usar `umc.localhost:8000` nas requisições
- Header `Host: umc.localhost` está sendo enviado

### **4. Sincronização com Backend**

Se backend ainda não tem dados:
1. Criar alguns assets de teste via Django Admin
2. Ou usar script Python para popular
3. Ou manter simulação temporariamente

---

## 🗑️ **REMOVER MOCKS (ÚLTIMA ETAPA)**

Após validação completa, remover:

### **1. SimulationEngine**

```typescript
// src/lib/simulation.ts

// ANTES: 1000+ linhas de mock data
export class SimulationEngine {
  // ...
}

// DEPOIS: Deletar arquivo ou deixar apenas comentário
// Este arquivo foi substituído pela integração com API REST
// Veja: src/services/assetsService.ts
```

### **2. Mock Equipment**

```typescript
// src/store/equipment.ts

// ANTES:
const mockEquipments = [
  { id: 'eq-001', tag: 'AHU-001', ... },
  // ...
];

// DEPOIS: Remover array e usar API
```

### **3. Verificar Importações**

Buscar e remover todas as importações de `SimulationEngine`:

```bash
# PowerShell
Select-String -Path "src/**/*.ts" -Pattern "SimulationEngine"
```

---

## ✅ **CHECKLIST FINAL**

### Implementação
- [ ] `src/types/api.ts` criado
- [ ] `src/services/assetsService.ts` criado
- [ ] `src/services/sitesService.ts` criado
- [ ] `src/lib/mappers/assetMapper.ts` criado
- [ ] `src/store/app.ts` atualizado
- [ ] Página de assets integrada

### Testes
- [ ] Assets carregam da API
- [ ] Filtros funcionam
- [ ] Detalhes abrem corretamente
- [ ] Performance adequada
- [ ] Sem erros no console

### Limpeza
- [ ] Mocks removidos
- [ ] `SimulationEngine` deletado
- [ ] Importações atualizadas
- [ ] Código revisado

---

## 🎯 **PRÓXIMOS PASSOS**

1. **Criar arquivos dos Passos 1-4**
2. **Atualizar store (Passo 5)**
3. **Integrar na UI (Passo 6)**
4. **Testar tudo**
5. **Remover mocks**
6. **Documentar em `FASE_2_COMPLETA.md`**

---

**Pronto para começar?** 🚀

Digite **"Começar implementação"** para criar todos os arquivos!
