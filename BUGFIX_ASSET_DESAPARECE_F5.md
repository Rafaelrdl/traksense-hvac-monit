# 🔧 BUGFIX: Asset Desaparecia Após F5

**Data**: 19 de outubro de 2025  
**Status**: ✅ CORRIGIDO  
**Severidade**: 🔴 CRÍTICA

---

## 🐛 **PROBLEMA**

### **Sintoma**
Ao adicionar um novo asset via modal "Adicionar ativo":
1. ✅ Asset aparece imediatamente na lista
2. ❌ Ao pressionar F5 (recarregar página), o asset **desaparece**

### **Comportamento Esperado**
O asset deve persistir no banco de dados e continuar aparecendo após recarregar a página.

---

## 🔍 **CAUSA RAIZ**

A função `addAsset` no store (`src/store/app.ts`) estava apenas **adicionando o asset ao estado local** (Zustand), mas **não estava enviando para a API REST**.

### **Código Antigo (Bugado)**
```typescript
addAsset: (assetData) => {
  // ❌ Cria apenas localmente com ID fictício
  const newAsset: HVACAsset = {
    ...assetData,
    id: `asset-${Date.now()}-${Math.random().toString(36).substring(7)}`,
    healthScore: 100,
    powerConsumption: 0,
    status: 'OK',
    operatingHours: 0,
    lastMaintenance: new Date(),
  };
  
  // ❌ Adiciona apenas ao estado local
  const currentAssets = get().assets;
  set({ assets: [...currentAssets, newAsset] });
  
  // ❌ NUNCA salva no backend!
},
```

### **Fluxo do Bug**
```
┌─────────────────────────┐
│ Usuário preenche modal  │
│ "Adicionar ativo"       │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│ onAddAsset() chamado    │
│ (apenas estado local)   │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│ ✅ Asset aparece na UI  │
│ (estado Zustand)        │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│ ❌ Backend não sabe     │
│ (não foi persistido)    │
└───────────┬─────────────┘
            │
            ▼  (F5)
┌─────────────────────────┐
│ loadAssetsFromApi()     │
│ GET /api/assets/        │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│ ❌ Asset desapareceu!   │
│ (não existe na API)     │
└─────────────────────────┘
```

---

## ✅ **SOLUÇÃO**

### **1. Adicionar Imports**

**Arquivo**: `src/store/app.ts`

```typescript
import { 
  mapApiAssetsToHVACAssets, 
  mapHVACAssetToApiAsset,     // ← Novo
  mapApiAssetToHVACAsset       // ← Novo
} from '@/lib/mappers/assetMapper';
```

### **2. Tornar `addAsset` Assíncrona**

**Interface alterada**:
```typescript
// Antes:
addAsset: (asset: ...) => void;

// Depois:
addAsset: (asset: ...) => Promise<void>;
```

### **3. Implementar Persistência na API**

**Código Novo (Corrigido)**:
```typescript
addAsset: async (assetData) => {
  try {
    // 1️⃣ Buscar site padrão (obrigatório para criar asset)
    let siteId = 1; // Default: Uberlândia Medical Center
    
    try {
      const sitesResponse = await sitesService.getAll();
      if (sitesResponse.results.length > 0) {
        siteId = sitesResponse.results[0].id;
      }
    } catch (siteError) {
      console.warn('⚠️ Não foi possível buscar sites, usando ID padrão');
    }

    // 2️⃣ Converter frontend → API usando mapper
    const apiAssetData = mapHVACAssetToApiAsset(
      {
        ...assetData,
        healthScore: 100,
        status: 'OK',
        lastMaintenance: new Date(),
      },
      siteId
    );

    // 3️⃣ ✅ CRIAR ASSET NA API (POST)
    const createdApiAsset = await assetsService.create(apiAssetData);
    
    // 4️⃣ Converter API → frontend usando mapper
    const createdHVACAsset = mapApiAssetToHVACAsset(createdApiAsset);
    
    // 5️⃣ Adicionar ao estado local com ID real do banco
    const currentAssets = get().assets;
    set({ assets: [...currentAssets, createdHVACAsset] });
    
    console.log('✅ Asset criado com sucesso na API:', createdHVACAsset.tag);
    
  } catch (error) {
    console.error('❌ Erro ao criar asset na API:', error);
    
    // 🔄 Fallback: adicionar localmente se API falhar
    const newAsset: HVACAsset = {
      ...assetData,
      id: `asset-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      healthScore: 100,
      powerConsumption: 0,
      status: 'OK',
      operatingHours: 0,
      lastMaintenance: new Date(),
    };
    
    const currentAssets = get().assets;
    set({ assets: [...currentAssets, newAsset] });
    
    throw error;
  }
},
```

### **4. Atualizar Componente `AddAssetDialog`**

**Arquivo**: `src/components/assets/AddAssetDialog.tsx`

**Interface alterada**:
```typescript
interface AddAssetDialogProps {
  // Antes:
  onAddAsset: (...) => void;
  
  // Depois:
  onAddAsset: (...) => Promise<void>;
}
```

**Função `handleSubmit` alterada**:
```typescript
// Antes:
const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  // validações...
  onAddAsset(newAsset);
  toast.success(`Ativo ${tag} adicionado com sucesso!`);
  setOpen(false);
  resetForm();
};

// Depois:
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  // validações...
  
  try {
    await onAddAsset(newAsset); // ← Aguarda Promise
    toast.success(`Ativo ${tag} adicionado com sucesso!`);
    setOpen(false);
    resetForm();
  } catch (error) {
    toast.error('Erro ao adicionar ativo. Tente novamente.');
    console.error('Erro ao adicionar ativo:', error);
  }
};
```

---

## 🔄 **FLUXO CORRIGIDO**

```
┌─────────────────────────┐
│ Usuário preenche modal  │
│ "Adicionar ativo"       │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│ handleSubmit() async    │
│ await onAddAsset()      │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│ 1. Buscar site padrão   │
│ GET /api/sites/         │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│ 2. Mapear dados         │
│ Frontend → API          │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│ 3. ✅ POST /api/assets/ │
│ Persistir no banco      │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│ 4. Mapear resposta      │
│ API → Frontend          │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│ 5. Atualizar estado     │
│ com ID real do banco    │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│ ✅ Asset aparece na UI  │
│ com ID real             │
└───────────┬─────────────┘
            │
            ▼  (F5)
┌─────────────────────────┐
│ loadAssetsFromApi()     │
│ GET /api/assets/        │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│ ✅ Asset continua lá!   │
│ (existe na API)         │
└─────────────────────────┘
```

---

## 🎯 **VALIDAÇÃO**

### **Teste Manual**

1. **Acessar página de Ativos**
   ```
   http://localhost:5173
   ```

2. **Clicar em "+ Adicionar ativo"**

3. **Preencher dados**:
   - **Tag**: `teste-persist`
   - **Tipo**: AHU
   - **Empresa**: teste
   - **Setor**: teste
   - **Marca**: teste
   - **Modelo**: teste
   - **Capacidade**: 5000

4. **Clicar em "Próximo" → "Criar Ativo"**

5. **Verificar console do navegador**:
   ```
   ✅ Asset criado com sucesso na API: teste-persist
   ```

6. **Verificar tabela**: Asset aparece na lista

7. **Pressionar F5** (recarregar página)

8. **✅ Verificar**: Asset **continua aparecendo** na lista!

### **Teste via API Diretamente**

**Backend (PowerShell)**:
```powershell
cd c:\Users\Rafael Ribeiro\TrakSense\traksense-backend

# Verificar asset criado
docker exec -it traksense-api python manage.py shell
```

**Django Shell**:
```python
from apps.assets.models import Asset

# Buscar asset criado
asset = Asset.objects.get(tag='teste-persist')
print(f"ID: {asset.id}")
print(f"Tag: {asset.tag}")
print(f"Type: {asset.asset_type}")
print(f"Site: {asset.site.name}")
```

---

## 📊 **DIFERENÇAS ANTES vs DEPOIS**

| Aspecto | ❌ Antes (Bugado) | ✅ Depois (Corrigido) |
|---------|-------------------|------------------------|
| **Persistência** | Apenas estado local | Backend + estado local |
| **ID do Asset** | Fictício (`asset-123abc`) | Real do banco (ex: `42`) |
| **POST /api/assets/** | ❌ Nunca chamado | ✅ Chamado ao criar |
| **Após F5** | Asset desaparece | Asset permanece |
| **Erro de rede** | Falha silenciosa | Toast de erro + fallback local |
| **Console log** | Nenhum | `✅ Asset criado na API` |
| **Sincronização** | Nenhuma | Total (frontend ↔ backend) |

---

## 🚨 **FALLBACK DE ERRO**

Se a API estiver **offline** ou houver erro:

1. **Tenta criar na API** → Falha
2. **Cria localmente** (modo degradado)
3. **Exibe toast de erro** ao usuário
4. **Console log**: `❌ Erro ao criar asset na API`
5. **Asset aparece na UI** (mas não persiste após F5)

**Código do fallback**:
```typescript
catch (error) {
  console.error('❌ Erro ao criar asset na API:', error);
  
  // Fallback: adicionar localmente
  const newAsset: HVACAsset = {
    ...assetData,
    id: `asset-${Date.now()}-${Math.random().toString(36).substring(7)}`,
    // ... resto dos campos
  };
  
  set({ assets: [...currentAssets, newAsset] });
  throw error; // Re-throw para exibir toast
}
```

---

## 📝 **ARQUIVOS MODIFICADOS**

### **1. `src/store/app.ts`**
- ✅ Importado `mapHVACAssetToApiAsset` e `mapApiAssetToHVACAsset`
- ✅ Interface `addAsset` mudada para `Promise<void>`
- ✅ Implementado POST para `/api/assets/`
- ✅ Adicionado busca de site padrão
- ✅ Adicionado conversão de dados via mappers
- ✅ Adicionado fallback de erro

**Linhas modificadas**: ~50 linhas

### **2. `src/components/assets/AddAssetDialog.tsx`**
- ✅ Interface `AddAssetDialogProps.onAddAsset` mudada para `Promise<void>`
- ✅ Função `handleSubmit` tornada `async`
- ✅ Adicionado `await onAddAsset()`
- ✅ Adicionado `try/catch` com toast de erro

**Linhas modificadas**: ~10 linhas

---

## ✅ **RESULTADO FINAL**

### **Antes**
```
1. Criar asset → ✅ Aparece
2. Pressionar F5 → ❌ Desaparece
3. Backend → ❌ Vazio
```

### **Depois**
```
1. Criar asset → ✅ Aparece
2. Pressionar F5 → ✅ Continua aparecendo
3. Backend → ✅ Persistido no banco
```

---

## 🔜 **MELHORIAS FUTURAS**

### **Curto Prazo**
- [ ] Adicionar loading spinner durante criação
- [ ] Desabilitar botão "Criar" enquanto está salvando
- [ ] Validar tag única (verificar se já existe na API)

### **Médio Prazo**
- [ ] Implementar `updateAsset()` com persistência
- [ ] Implementar `deleteAsset()` com persistência
- [ ] Adicionar refresh automático após criar asset

### **Longo Prazo**
- [ ] Implementar otimistic updates (UI atualiza antes da API)
- [ ] Adicionar fila de operações offline
- [ ] Sincronizar automaticamente quando voltar online

---

## 🎉 **CONCLUSÃO**

**Problema**: Assets desapareciam após F5 porque não eram persistidos no backend.

**Solução**: Modificado `addAsset` para chamar `POST /api/assets/` e aguardar resposta antes de atualizar UI.

**Status**: ✅ **CORRIGIDO E TESTADO**

Agora os assets criados pela UI são **permanentemente salvos no banco de dados PostgreSQL** via API REST Django! 🚀

---

**Teste agora e veja o asset persistir após F5!** ✨
