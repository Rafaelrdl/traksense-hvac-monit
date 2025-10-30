# Implementação do Seletor de Sites no Header

## 📋 Visão Geral

Implementação completa do seletor de sites no header do frontend, permitindo que usuários do Uberlândia Medical Center (ou qualquer tenant) alternem entre diferentes unidades/sites para visualizar dados específicos de cada localização.

## 🎯 Funcionalidades Implementadas

### 1. **Gerenciamento de Sites no Store** (`src/store/app.ts`)

#### Estado Adicionado:
```typescript
interface AppState {
  // Site management
  availableSites: any[];      // Lista de sites disponíveis do tenant
  currentSite: any | null;    // Site atualmente selecionado
  isLoadingSites: boolean;    // Loading state
}
```

#### Ações Adicionadas:
```typescript
// Carrega todos os sites disponíveis do tenant
loadAvailableSites: () => Promise<void>

// Define o site atual e recarrega dados filtrados
setCurrentSite: (site: any | null) => void
```

#### Comportamento:
- **Auto-seleção**: Quando sites são carregados e nenhum está selecionado, o primeiro é automaticamente escolhido
- **Filtro automático**: Ao mudar de site, os assets são automaticamente recarregados filtrados pelo site selecionado
- **Persistência**: O site selecionado pode ser persistido (se necessário, adicionar ao localStorage)

### 2. **Seletor de Sites no Header** (`src/components/layout/Header.tsx`)

#### UI Implementada:

**Caso 1: Site Único**
```
| 🏢 Uberlandia Medical Center
```
- Ícone de prédio + nome do site
- Sem dropdown (não é necessário)

**Caso 2: Múltiplos Sites**
```
| 🏢 Hospital Central ▼
  ┌─────────────────────────────┐
  │ Hospital Central            │
  │ Saúde                      │
  ├─────────────────────────────┤
  │ UTI - Unidade Norte         │
  │ Saúde                      │
  ├─────────────────────────────┤
  │ Laboratório Central         │
  │ Diagnóstico                │
  └─────────────────────────────┘
```
- Dropdown com todos os sites
- Site atual destacado (background diferente)
- Exibe nome do site e setor/empresa
- Hover states para melhor UX

#### Componentes Utilizados:
- `DropdownMenu` do shadcn/ui
- `Building2` icon do lucide-react
- Estilos alinhados com o design system

### 3. **Filtro de Assets por Site**

#### Modificação no `loadAssetsFromApi`:
```typescript
const assetsResponse = await assetsService.getAll({ 
  limit: 100,
  ...(currentSite ? { site: currentSite.id } : {})
});
```

#### Comportamento:
- **Com site selecionado**: Retorna apenas assets daquele site
- **Sem site selecionado**: Retorna todos os assets
- **Ao trocar de site**: Recarrega automaticamente os assets filtrados

## 🔗 Fluxo de Dados

```
┌─────────────────────────────────────────────────────────────┐
│                     INICIALIZAÇÃO                           │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    loadAvailableSites()
                              │
                              ▼
               GET /api/sites/ (Django Backend)
                              │
                              ▼
          ┌──────────────────────────────────────┐
          │  availableSites = [...sites]        │
          │  currentSite = sites[0] (primeiro)  │
          └──────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   TROCA DE SITE                              │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
            Usuário clica no dropdown e seleciona site
                              │
                              ▼
                    setCurrentSite(site)
                              │
                              ▼
          ┌──────────────────────────────────────┐
          │  currentSite = site                  │
          │  loadAssetsFromApi()                 │
          └──────────────────────────────────────┘
                              │
                              ▼
      GET /api/assets/?site={site.id} (Django Backend)
                              │
                              ▼
          ┌──────────────────────────────────────┐
          │  assets = [...filtered assets]       │
          │  UI atualizada automaticamente       │
          └──────────────────────────────────────┘
```

## 📡 Endpoints Backend Utilizados

### 1. **Listar Sites**
```http
GET /api/sites/
Query params:
  - limit: número de resultados (padrão: 100)
  - company: filtrar por empresa
  - sector: filtrar por setor
  - search: busca por nome, endereço, etc.

Resposta:
{
  "count": 3,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 1,
      "name": "Hospital Central",
      "company": "Uberlândia Medical Center",
      "sector": "Saúde",
      "subsector": "",
      "address": "Rua Principal, 123",
      "timezone": "America/Sao_Paulo",
      "asset_count": 12,
      "created_at": "2025-10-20T10:00:00Z",
      "updated_at": "2025-10-20T10:00:00Z"
    },
    ...
  ]
}
```

### 2. **Listar Assets Filtrados por Site**
```http
GET /api/assets/?site={site_id}
Query params:
  - site: ID do site (filtro)
  - limit: número de resultados
  - asset_type: filtrar por tipo
  - status: filtrar por status

Resposta:
{
  "count": 12,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 1,
      "tag": "AHU-001",
      "name": "Air Handling Unit 1",
      "site": 1,
      "site_name": "Hospital Central",
      "asset_type": "AHU",
      ...
    },
    ...
  ]
}
```

## 🎨 Exemplo de Uso

### Cenário: Uberlândia Medical Center com 3 unidades

```typescript
// Sites disponíveis:
[
  {
    id: 1,
    name: "Hospital Central",
    sector: "Saúde",
    company: "Uberlândia Medical Center"
  },
  {
    id: 2,
    name: "UTI - Unidade Norte",
    sector: "Saúde",
    company: "Uberlândia Medical Center"
  },
  {
    id: 3,
    name: "Laboratório Central",
    sector: "Diagnóstico",
    company: "Uberlândia Medical Center"
  }
]
```

### Navegação:
1. **Página carrega**: Automaticamente seleciona "Hospital Central" (primeiro site)
2. **Assets carregam**: Somente os 12 assets do Hospital Central são exibidos
3. **Usuário clica no dropdown**: Vê os 3 sites disponíveis
4. **Usuário seleciona "UTI - Unidade Norte"**:
   - Header atualiza para mostrar "UTI - Unidade Norte"
   - Assets são recarregados automaticamente
   - Agora mostra apenas os 8 assets da UTI
5. **Sensores e telemetria**: Também serão filtrados pelo site (implementação futura)

## 🔒 Isolamento Multi-Tenant

### Como funciona:
```
Tenant: Uberlândia Medical Center (schema: 'umc')
  ├── Site 1: Hospital Central
  │   ├── Asset 1: Chiller Principal
  │   ├── Asset 2: AHU Sala 101
  │   └── ...
  │
  ├── Site 2: UTI - Unidade Norte
  │   ├── Asset 1: VRF UTI
  │   ├── Asset 2: Fan Coil 201
  │   └── ...
  │
  └── Site 3: Laboratório Central
      ├── Asset 1: Split Lab A
      └── ...

Tenant: Outro Cliente (schema: 'outro_cliente')
  ├── Site 1: Fábrica Sul
  └── ...
```

### Garantias:
- ✅ Django Tenants garante isolamento no backend (schemas PostgreSQL)
- ✅ Frontend só recebe dados do tenant autenticado
- ✅ Filtro por site é adicional (dentro do mesmo tenant)
- ✅ Não há risco de vazamento de dados entre tenants

## 📝 Próximos Passos (Opcional)

### 1. **Persistir seleção de site**
```typescript
// Em app.ts, usar persist do zustand
persist(
  (set, get) => ({
    // ...existing state
  }),
  {
    name: 'app-storage',
    partialize: (state) => ({
      currentSite: state.currentSite,
      // ...outros campos
    }),
  }
)
```

### 2. **Filtrar sensores por site**
```typescript
// Em sensorsService.ts
async getAll(params?: SensorFilters): Promise<PaginatedResponse<ApiSensor>> {
  const currentSite = useAppStore.getState().currentSite;
  
  return api.get('/sensors/', {
    params: {
      ...params,
      ...(currentSite ? { site: currentSite.id } : {})
    }
  });
}
```

### 3. **Adicionar indicador de loading**
```tsx
{isLoadingSites ? (
  <span className="flex items-center gap-2">
    <Loader2 className="w-4 h-4 animate-spin" />
    <span>Carregando sites...</span>
  </span>
) : (
  // ...dropdown
)}
```

### 4. **Breadcrumb com site atual**
```tsx
<Breadcrumb>
  <BreadcrumbItem>
    <Building2 className="w-4 h-4" />
    {currentSite?.name}
  </BreadcrumbItem>
  <BreadcrumbItem>
    {currentPage}
  </BreadcrumbItem>
</Breadcrumb>
```

### 5. **Badge com contador de assets**
```tsx
<DropdownMenuItem>
  <div className="flex items-center justify-between w-full">
    <div>
      <span className="font-medium">{site.name}</span>
      <span className="text-xs text-muted-foreground">{site.sector}</span>
    </div>
    <Badge variant="secondary">{site.asset_count}</Badge>
  </div>
</DropdownMenuItem>
```

## ✅ Checklist de Implementação

- [x] Adicionar estado `availableSites`, `currentSite` e `isLoadingSites` ao store
- [x] Implementar `loadAvailableSites()` e `setCurrentSite()`
- [x] Modificar `loadAssetsFromApi()` para filtrar por site
- [x] Adicionar seletor de sites no Header.tsx
- [x] Importar ícone `Building2` do lucide-react
- [x] Implementar dropdown com `DropdownMenu` do shadcn/ui
- [x] Carregar sites automaticamente ao montar o header
- [x] Selecionar primeiro site automaticamente
- [x] Recarregar assets ao trocar de site
- [x] Estilizar site atual no dropdown (bg-muted)
- [x] Adicionar loading state para sites

## 🧪 Como Testar

### 1. **Criar múltiplos sites no Django Admin**
```
1. Acesse: http://localhost:8000/admin/tenants/tenant/3/sites/
2. Clique em "➕ Adicionar Site"
3. Crie 3 sites:
   - Hospital Central
   - UTI - Unidade Norte
   - Laboratório Central
```

### 2. **Criar assets em diferentes sites**
```
1. Acesse: http://localhost:8000/admin/tenants/tenant/3/assets/
2. Crie alguns assets para cada site
3. Varie o site_id para distribuir os assets
```

### 3. **Testar no Frontend**
```
1. Acesse: http://localhost:5173/
2. Faça login
3. Observe o header:
   - Deve mostrar o primeiro site (Hospital Central)
   - Deve ter um dropdown (ícone ▼)
4. Clique no dropdown:
   - Deve mostrar os 3 sites
   - Site atual deve estar destacado
5. Selecione outro site (UTI):
   - Header deve atualizar para "UTI - Unidade Norte"
   - Assets devem recarregar (veja no console)
   - Lista de assets deve mostrar apenas os da UTI
6. Navegue entre páginas:
   - Site selecionado deve persistir
   - Filtro deve continuar ativo
```

## 🎉 Resultado Final

O usuário agora pode:
- ✅ Ver qual site está visualizando atualmente
- ✅ Alternar entre diferentes unidades/sites do tenant
- ✅ Ver dados filtrados automaticamente por site
- ✅ Navegar entre páginas mantendo o contexto do site
- ✅ Experiência fluida e intuitiva para multi-site management

---

**Implementado em**: 20 de outubro de 2025  
**Versão**: FASE 3 - Multi-Site Support
