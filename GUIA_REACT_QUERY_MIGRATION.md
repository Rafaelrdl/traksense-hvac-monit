# Guia de Migração para React Query

## ✅ Infraestrutura Completa

### Instalado
- `@tanstack/react-query` v5
- `@tanstack/react-query-devtools`

### Criado
- `src/providers/QueryProvider.tsx` - Provider global
- `src/hooks/queries/` - 5 arquivos de hooks:
  - `useSitesQuery.ts` - Sites e estatísticas
  - `useSensorsQuery.ts` - Telemetria e sensores
  - `useAlertsQuery.ts` - Alertas e ações
  - `useAssetsQuery.ts` - Assets CRUD
  - `useRulesQuery.ts` - Regras com optimistic updates
  - `index.ts` - Exports centralizados

### Integrado
- ✅ `App.tsx` wrapped com `<QueryProvider>`
- ✅ DevTools habilitadas (apenas em DEV)

---

## 📖 Padrões de Migração

### 1. Queries (Leitura de Dados)

#### Antes (useState + useEffect)
```tsx
const [data, setData] = useState(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);

useEffect(() => {
  const fetchData = async () => {
    try {
      setLoading(true);
      const result = await assetsService.getAll();
      setData(result);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };
  fetchData();
}, []);

if (loading) return <Loading />;
if (error) return <Error />;
```

#### Depois (React Query)
```tsx
import { useAssetsQuery } from '@/hooks/queries';

const { data, isLoading, error } = useAssetsQuery();

if (isLoading) return <Loading />;
if (error) return <Error />;
```

**Benefícios:**
- 70% menos código boilerplate
- Cache automático (5 min staleTime)
- Deduplicação de requests
- Background refetch
- Error retry (3x)

---

### 2. Mutations (Criação/Atualização/Deleção)

#### Antes
```tsx
const [saving, setSaving] = useState(false);

const handleSave = async (data) => {
  try {
    setSaving(true);
    await assetsService.create(data);
    // Reload manual
    refetch();
  } catch (err) {
    toast.error('Erro ao salvar');
  } finally {
    setSaving(false);
  }
};
```

#### Depois
```tsx
import { useCreateAssetMutation } from '@/hooks/queries';

const createMutation = useCreateAssetMutation();

const handleSave = (data) => {
  createMutation.mutate(data, {
    onSuccess: () => {
      toast.success('Asset criado!');
      // Cache invalidado automaticamente
    },
    onError: (error) => {
      toast.error('Erro ao salvar');
    }
  });
};

// Loading state: createMutation.isPending
```

**Benefícios:**
- Invalidação automática de cache
- Estados de loading/error integrados
- Callbacks onSuccess/onError
- Optimistic updates (regras)

---

### 3. Polling (Atualização Automática)

#### Antes
```tsx
useEffect(() => {
  const interval = setInterval(async () => {
    const data = await alertsService.getActive();
    setAlerts(data);
  }, 10000);
  
  return () => clearInterval(interval);
}, []);
```

#### Depois
```tsx
import { useActiveAlertsQuery } from '@/hooks/queries';

// Polling configurado no hook (10s)
const { data: alerts } = useActiveAlertsQuery();
```

**Benefícios:**
- Pausa automática quando tab inativa
- Pausa quando não há internet
- Configurável por hook

---

### 4. Filtragem e Parâmetros

#### Antes
```tsx
const [filters, setFilters] = useState({ status: 'active' });
const [data, setData] = useState([]);

useEffect(() => {
  fetchData(filters);
}, [filters]);
```

#### Depois
```tsx
const [filters, setFilters] = useState({ status: 'active' });

// Query key muda automaticamente → refetch
const { data } = useAlertsQuery(filters);
```

**Benefícios:**
- Refetch automático quando filtros mudam
- Cache separado por filtro
- Deduplicação se mesmos filtros

---

### 5. Infinite Scroll / Paginação

#### Antes
```tsx
const [page, setPage] = useState(1);
const [data, setData] = useState([]);
const [hasMore, setHasMore] = useState(true);

const loadMore = async () => {
  const newData = await service.getPage(page);
  setData([...data, ...newData]);
  setPage(page + 1);
};
```

#### Depois
```tsx
import { useSensorHistoryInfiniteQuery } from '@/hooks/queries';

const {
  data,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage
} = useSensorHistoryInfiniteQuery(deviceId, params);

// data.pages contém todas as páginas carregadas
const allData = data?.pages.flatMap(page => page.series) ?? [];
```

---

## 🎯 Checklist de Migração por Componente

### Para cada componente:

1. **Identificar padrões de data fetching:**
   - [ ] useState para dados
   - [ ] useState para loading
   - [ ] useState para error
   - [ ] useEffect com fetch
   - [ ] setInterval para polling

2. **Substituir por hooks apropriados:**
   - [ ] Queries: `useXxxQuery()`
   - [ ] Mutations: `useXxxMutation()`
   - [ ] Infinite: `useXxxInfiniteQuery()`

3. **Remover código obsoleto:**
   - [ ] useState de dados/loading/error
   - [ ] useEffect com fetch
   - [ ] Timers/intervals manuais
   - [ ] Try-catch em handlers

4. **Validar:**
   - [ ] Compilação sem erros
   - [ ] Loading states funcionando
   - [ ] Error handling funcionando
   - [ ] Cache invalidation após mutations

---

## 📊 Hooks Disponíveis

### Sites
```tsx
useSitesQuery()              // Lista todos os sites
useSiteQuery(siteId)         // Detalhes de um site
useSiteStatsQuery(siteId)    // Estatísticas com polling 60s
```

### Sensors / Telemetry
```tsx
useSensorsQuery(assetId)                    // Lista sensores de um asset
useSensorDataQuery(deviceId, sensorId?)     // Telemetria latest (30s polling)
useSensorHistoryQuery(params)               // Histórico temporal
useSensorHistoryInfiniteQuery(deviceId)     // Paginação infinita
useDeviceSummaryQuery(deviceId)             // Resumo 24h (60s polling)
```

### Alerts
```tsx
useAlertsQuery(filters)              // Lista alertas (30s polling)
useActiveAlertsQuery()               // Alertas ativos (10s polling)
useAlertQuery(alertId)               // Detalhes de um alerta
useAlertHistoryQuery(ruleId)         // Histórico resolvidos
useAcknowledgeAlertMutation()        // Acknowledge
useResolveAlertMutation()            // Resolver
```

### Assets
```tsx
useAssetsQuery(filters)          // Lista assets
useAssetDetailsQuery(assetId)    // Detalhes completos
useAssetSensorsQuery(assetId)    // Sensores do asset
useCreateAssetMutation()         // Criar
useUpdateAssetMutation()         // Atualizar
useDeleteAssetMutation()         // Deletar
```

### Rules
```tsx
useRulesQuery(filters)               // Lista regras
useRuleQuery(ruleId)                 // Detalhes de regra
useRulesStatisticsQuery()            // Estatísticas
useCreateRuleMutation()              // Criar
useUpdateRuleMutation()              // Atualizar
useDeleteRuleMutation()              // Deletar
useToggleRuleMutation()              // Toggle enable (optimistic)
```

---

## 🚀 Próximos Passos

### Fase 2: Componentes High-Impact (Prioridade)
1. **AlertsPage** - Polling 10s, mutations de acknowledge/resolve
2. **AssetDetailPage** - Sensores, telemetria, resumo device
3. **SensorsPage** - Lista sensores, telemetria em tempo real
4. **RulesPage** - CRUD com optimistic updates

### Fase 3: Componentes Restantes
5. **AssetsPage** - Lista e filtros de assets
6. **EditableOverviewPage** - Widgets com dados reais
7. **DraggableWidget** - Migrar para React Query
8. **WidgetConfig** - Async loading de assets/sensors

### Fase 4: Otimizações
9. **Prefetching** - Carregar dados antes de navegação
10. **Suspense** - Boundaries para loading states
11. **Optimistic UI** - Expandir para mais mutations
12. **WebSocket** - Integrar com queries para real-time

---

## 🐛 Troubleshooting

### Cache não invalida após mutation
```tsx
// ✅ CERTO: Usar mutation hooks que já invalidam
const mutation = useUpdateAssetMutation();
mutation.mutate(data);

// ❌ ERRADO: Chamar service diretamente
await assetsService.update(id, data);
```

### Query não refetch quando deveria
```tsx
// Verificar query keys - devem incluir todos os parâmetros relevantes
queryKey: ['alerts', filters] // ✅ filters no key
queryKey: ['alerts']          // ❌ sempre usa cache
```

### Polling não para quando componente desmonta
```tsx
// React Query já gerencia isso automaticamente
// Se precisar desabilitar manualmente:
const { data } = useActiveAlertsQuery({ enabled: false });
```

### Type errors com API responses
```tsx
// Verificar tipos em src/types/api.ts
// Garantir que hooks retornam tipos corretos
const { data } = useAssetsQuery(); // data: ApiAsset[]
```

---

## 📚 Recursos

- [React Query v5 Docs](https://tanstack.com/query/v5/docs/react/overview)
- [DevTools](https://tanstack.com/query/v5/docs/react/devtools) - Abrir browser DevTools para ver queries ativas
- [Migration Guide v4→v5](https://tanstack.com/query/v5/docs/react/guides/migrating-to-v5)

---

**Status:** ✅ Infraestrutura completa, pronto para migração de componentes
