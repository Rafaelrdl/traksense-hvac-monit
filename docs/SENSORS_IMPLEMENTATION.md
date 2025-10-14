# Sensors & Telemetria - Nova Funcionalidade

## Resumo das Implementações

### 1. Filtros por Status (Online/Offline)
- **Localização**: Cabeçalho da página Sensores
- **Funcionalidade**: Filtrar sensores por status de conectividade
- **Opções**: Todos, Online, Offline
- **Persistência**: Estado salvo na URL para compartilhamento

### 2. Paginação Numérica no Header
- **Localização**: Cabeçalho da página Sensores
- **Funcionalidade**: Navegação por páginas numeradas
- **Seletor de tamanho**: 25, 50, 100 itens por página
- **Persistência**: Página e tamanho salvos na URL

### 3. Link para Página do Equipamento
- **Localização**: Coluna "Equipamento" na tabela
- **Funcionalidade**: Clique no nome do equipamento navega para a página de detalhes
- **Estilo**: Texto em azul com hover e cursor pointer

## Estrutura de Arquivos

```
src/
├── types/sensor.ts              # Tipos para sensor melhorado
├── store/sensors.ts             # Store Zustand para sensores
├── hooks/useSensorsURLParams.ts # Hook para gerenciar parâmetros da URL
└── modules/sensors/
    ├── SensorsHeaderControls.tsx # Controles de filtro e paginação
    └── SensorsGrid.tsx          # Tabela de sensores com navegação
```

## Como Usar

### 1. Integração na Página Sensores

```tsx
// src/components/pages/SensorsPage.tsx
import { SensorsHeaderControls } from '@/modules/sensors/SensorsHeaderControls'
import { SensorsGrid } from '@/modules/sensors/SensorsGrid'
import { useSensorsStore } from '@/store/sensors'
import { useAppStore } from '@/store/app'

export function SensorsPage() {
  const { getPaginatedSensors } = useSensorsStore()
  const { setSelectedAsset, setCurrentPage } = useAppStore()
  
  const { sensors, pagination } = getPaginatedSensors()
  
  const handleNavigateToEquipment = (equipmentId: string) => {
    setSelectedAsset(equipmentId)
    setCurrentPage('assets')
  }
  
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Sensores & Telemetria</h1>
      
      <SensorsHeaderControls 
        totalSensors={pagination.total}
        pagination={pagination}
      />
      
      <SensorsGrid 
        sensors={sensors}
        onNavigateToEquipment={handleNavigateToEquipment}
      />
    </div>
  )
}
```

### 2. Inicialização do Store

```tsx
// src/App.tsx ou componente principal
import { useEffect } from 'react'
import { useSensorsStore } from '@/store/sensors'
import { useAppStore } from '@/store/app'

function App() {
  const { initializeFromAppStore } = useSensorsStore()
  const { sensors, assets } = useAppStore()
  
  useEffect(() => {
    initializeFromAppStore(sensors, assets)
  }, [sensors, assets, initializeFromAppStore])
  
  // resto da aplicação...
}
```

### 3. Parâmetros de URL Suportados

```
/sensors?status=online&page=2&size=50
```

- **status**: `all` | `online` | `offline` (padrão: `all`)
- **page**: número da página (padrão: `1`)
- **size**: itens por página `25` | `50` | `100` (padrão: `25`)

## Funcionalidades Detalhadas

### Filtros de Status

```tsx
// Como o filtro funciona internamente
const getFilteredSensors = () => {
  return items.filter(sensor => {
    if (filter.status === 'all') return true
    return sensor.status === filter.status
  })
}
```

### Cálculo de Paginação

```tsx
// Como a paginação é calculada
const getPaginatedSensors = () => {
  const filtered = getFilteredSensors()
  const startIndex = (filter.page - 1) * filter.size
  const endIndex = startIndex + filter.size
  
  return {
    sensors: filtered.slice(startIndex, endIndex),
    pagination: {
      page: filter.page,
      size: filter.size,
      total: filtered.length,
      totalPages: Math.max(1, Math.ceil(filtered.length / filter.size))
    }
  }
}
```

### Sincronização com URL

```tsx
// Como os parâmetros são sincronizados
const updateParams = (newParams: Partial<SensorURLParams>) => {
  // Se mudou status ou tamanho, resetar para página 1
  if ('status' in newParams || 'size' in newParams) {
    newParams.page = 1
  }
  
  // Atualizar URL
  const searchParams = new URLSearchParams()
  // ... lógica de construção da URL
  
  window.history.replaceState({}, '', `${pathname}${search}`)
}
```

## Componentes Principais

### SensorsHeaderControls

**Responsabilidades:**
- Exibir filtros de status (botões All/Online/Offline)
- Mostrar seletor de tamanho de página
- Exibir navegação numérica de páginas
- Sincronizar com parâmetros da URL

**Props:**
```tsx
interface SensorsHeaderControlsProps {
  totalSensors: number
  pagination: SensorsPagination
}
```

### SensorsGrid

**Responsabilidades:**
- Renderizar tabela de sensores
- Exibir status visual (online/offline)
- Criar links clicáveis para equipamentos
- Mostrar métricas de disponibilidade

**Props:**
```tsx
interface SensorsGridProps {
  sensors: EnhancedSensor[]
  onNavigateToEquipment: (equipmentId: string) => void
}
```

### useSensorsURLParams

**Responsabilidades:**
- Ler parâmetros da URL atual
- Validar valores dos parâmetros
- Atualizar URL quando parâmetros mudam
- Resetar página para 1 quando necessário

**Retorno:**
```tsx
interface UseSensorsURLParamsReturn {
  params: SensorURLParams
  updateParams: (newParams: Partial<SensorURLParams>) => void
}
```

## Tipos Importantes

### EnhancedSensor
```tsx
interface EnhancedSensor {
  id: string
  name: string
  tag: string
  status: 'online' | 'offline'
  equipmentId: string
  equipmentName: string
  type: string
  unit: string
  lastReading: { value: number; timestamp: Date } | null
  availability: number
  lastSeenAt: number
}
```

### SensorsState
```tsx
interface SensorsState {
  items: EnhancedSensor[]
  filter: {
    status: SensorStatusFilter
    page: number
    size: number
  }
  
  // Métodos
  initializeFromAppStore: (sensors: Sensor[], assets: HVACAsset[]) => void
  setFilter: (filter: Partial<SensorsFilter>) => void
  resetFilters: () => void
  getFilteredSensors: () => EnhancedSensor[]
  getPaginatedSensors: () => { sensors: EnhancedSensor[]; pagination: SensorsPagination }
}
```

## Persistência

### LocalStorage
O store usa `persist` do Zustand para salvar:
- Filtros aplicados
- Tamanho de página preferido
- Estado de inicialização

### URL Query String
Os parâmetros são mantidos na URL para:
- Permitir compartilhamento de links
- Navegação no histórico do browser
- Bookmarking de estados específicos

## Testes

Execute os testes com:
```bash
npm run test src/__tests__/sensors.test.ts
```

Os testes cobrem:
- Filtros de status
- Cálculos de paginação
- Sincronização com URL
- Navegação para equipamentos
- Estados de erro e casos extremos

## Troubleshooting

### Problema: Filtros não persistem após refresh
**Solução**: Verificar se `useSensorsURLParams` está sendo usado corretamente

### Problema: Paginação mostra páginas incorretas
**Solução**: Verificar se `totalPages` está sendo calculado com base nos itens filtrados

### Problema: Links de equipamento não funcionam
**Solução**: Verificar se `onNavigateToEquipment` callback está sendo passado corretamente

### Problema: Store não inicializa
**Solução**: Verificar se `initializeFromAppStore` está sendo chamado no useEffect principal

## Próximos Passos

1. **Testes de Integração**: Testar fluxo completo no browser
2. **Otimizações**: Implementar debounce para filtros se necessário
3. **Acessibilidade**: Adicionar ARIA labels para componentes de paginação
4. **Responsividade**: Ajustar layout para dispositivos móveis