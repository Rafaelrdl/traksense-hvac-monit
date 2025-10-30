# 🧪 GUIA DE TESTE - INTEGRAÇÃO ASSETS API

## ✅ **ARQUIVOS CRIADOS**

### 1. Tipos da API
- **Arquivo**: `src/types/api.ts`
- **Conteúdo**: Interfaces TypeScript (ApiSite, ApiAsset, ApiDevice, ApiSensor)
- **Status**: ✅ Criado

### 2. Services
- **Arquivo**: `src/services/assetsService.ts`
- **Conteúdo**: CRUD completo de Assets (getAll, getById, create, update, delete, getDevices, getSensors)
- **Status**: ✅ Criado

- **Arquivo**: `src/services/sitesService.ts`
- **Conteúdo**: CRUD completo de Sites
- **Status**: ✅ Criado

### 3. Mappers
- **Arquivo**: `src/lib/mappers/assetMapper.ts`
- **Conteúdo**: Conversão API ↔ Frontend (snake_case ↔ camelCase)
- **Status**: ✅ Criado

### 4. Store Atualizada
- **Arquivo**: `src/store/app.ts`
- **Conteúdo**: Adicionado `loadAssetsFromApi()` e `setUseApiData()`
- **Status**: ✅ Modificado

---

## 🚀 **COMO TESTAR A INTEGRAÇÃO**

### **Opção 1: Teste Manual no Console do Navegador**

1. **Abrir DevTools** (F12)
2. **Ir para Console**
3. **Executar comandos**:

```javascript
// 1. Importar o store
const { useAppStore } = await import('./src/store/app');

// 2. Verificar estado inicial (usando mocks)
const state = useAppStore.getState();
console.log('Assets mockados:', state.assets.length); // Deve mostrar ~7

// 3. Ativar modo API
useAppStore.getState().setUseApiData(true);

// 4. Aguardar carregamento
// Olhar no console por: "✅ Carregados X assets da API"

// 5. Verificar novos assets
const newState = useAppStore.getState();
console.log('Assets da API:', newState.assets.length);
console.log('Primeiro asset:', newState.assets[0]);

// 6. Desativar modo API (voltar para mocks)
useAppStore.getState().setUseApiData(false);
```

---

### **Opção 2: Criar Componente de Teste**

Criar arquivo temporário: `src/pages/TestApiIntegration.tsx`

```typescript
import { useEffect, useState } from 'react';
import { useAppStore } from '@/store/app';

export function TestApiIntegration() {
  const { 
    assets, 
    isLoadingAssets, 
    error, 
    useApiData,
    setUseApiData,
    loadAssetsFromApi 
  } = useAppStore();
  
  const [mode, setMode] = useState<'mock' | 'api'>(useApiData ? 'api' : 'mock');

  const handleToggleMode = () => {
    const newMode = mode === 'mock' ? 'api' : 'mock';
    setMode(newMode);
    setUseApiData(newMode === 'api');
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">🧪 Teste de Integração API</h1>
      
      {/* Status */}
      <div className="mb-4 p-4 bg-gray-100 rounded">
        <p><strong>Modo:</strong> {mode === 'api' ? '🌐 API' : '🎭 Mock'}</p>
        <p><strong>Assets carregados:</strong> {assets.length}</p>
        <p><strong>Loading:</strong> {isLoadingAssets ? '⏳ Sim' : '✅ Não'}</p>
        {error && <p className="text-red-500"><strong>Erro:</strong> {error}</p>}
      </div>

      {/* Controles */}
      <div className="mb-4 space-x-2">
        <button 
          onClick={handleToggleMode}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Alternar para {mode === 'api' ? 'Mock' : 'API'}
        </button>
        
        {mode === 'api' && (
          <button 
            onClick={loadAssetsFromApi}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            🔄 Recarregar da API
          </button>
        )}
      </div>

      {/* Lista de Assets */}
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">Assets:</h2>
        {assets.map(asset => (
          <div key={asset.id} className="p-3 border rounded">
            <p><strong>Tag:</strong> {asset.tag}</p>
            <p><strong>Type:</strong> {asset.type}</p>
            <p><strong>Location:</strong> {asset.location}</p>
            <p><strong>Health Score:</strong> {asset.healthScore}%</p>
            <p><strong>Status:</strong> {asset.status}</p>
            <p><strong>Company:</strong> {asset.company || 'N/A'}</p>
            <p><strong>Brand:</strong> {asset.specifications?.brand || 'N/A'}</p>
            <p><strong>Model:</strong> {asset.specifications?.model || 'N/A'}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
```

**Adicionar rota** em `src/App.tsx` ou router:

```typescript
import { TestApiIntegration } from './pages/TestApiIntegration';

// No router:
<Route path="/test-api" element={<TestApiIntegration />} />
```

**Acessar**: http://localhost:5173/test-api

---

### **Opção 3: Modificar Página Existente**

**Exemplo**: Adicionar toggle na página principal de Assets

```typescript
// Em qualquer página que usa assets
import { useAppStore } from '@/store/app';

export function AssetsPage() {
  const { 
    assets, 
    isLoadingAssets, 
    useApiData,
    setUseApiData 
  } = useAppStore();

  return (
    <div>
      {/* Toggle API/Mock */}
      <div className="mb-4">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={useApiData}
            onChange={(e) => setUseApiData(e.target.checked)}
          />
          <span>Usar dados da API (ao invés de mock)</span>
        </label>
      </div>

      {/* Loading state */}
      {isLoadingAssets && (
        <div className="text-center py-8">
          Carregando assets da API...
        </div>
      )}

      {/* Assets list */}
      <div className="grid grid-cols-3 gap-4">
        {assets.map(asset => (
          <AssetCard key={asset.id} asset={asset} />
        ))}
      </div>
    </div>
  );
}
```

---

## ✅ **CHECKLIST DE VALIDAÇÃO**

### **Backend**
- [ ] Backend rodando em `http://umc.localhost:8000`
- [ ] Endpoint `/api/sites/` retorna dados (GET)
- [ ] Endpoint `/api/assets/` retorna dados (GET)
- [ ] Autenticação JWT funcionando (token válido)

**Como validar**:
```powershell
# No terminal PowerShell
Invoke-WebRequest -Uri "http://umc.localhost:8000/api/sites/" `
  -Headers @{
    "Host" = "umc.localhost"
    "Authorization" = "Bearer SEU_TOKEN_AQUI"
  }
```

### **Frontend**
- [ ] Compilação sem erros (`npm run dev`)
- [ ] Arquivo `src/types/api.ts` existe
- [ ] Arquivo `src/services/assetsService.ts` existe
- [ ] Arquivo `src/services/sitesService.ts` existe
- [ ] Arquivo `src/lib/mappers/assetMapper.ts` existe
- [ ] Store `src/store/app.ts` tem `loadAssetsFromApi`
- [ ] Store `src/store/app.ts` tem `setUseApiData`
- [ ] Store `src/store/app.ts` tem `isLoadingAssets`
- [ ] Store `src/store/app.ts` tem `error`

### **Integração**
- [ ] `useApiData = false`: Mostra 7 assets mockados
- [ ] `useApiData = true`: Chama API e carrega assets reais
- [ ] Loading state aparece durante carregamento
- [ ] Erro é exibido se API falhar
- [ ] Assets da API têm todos os campos mapeados
- [ ] Health score é exibido corretamente
- [ ] Status badge tem cor correta
- [ ] Company e Sector são preenchidos

---

## 🐛 **TROUBLESHOOTING**

### **Problema 1: "Network Error" ao ativar API**

**Causa**: Frontend não consegue acessar backend

**Solução**:
1. Verificar se backend está rodando:
   ```powershell
   docker ps | Select-String traksense-api
   ```

2. Verificar se `umc.localhost` está no hosts:
   ```
   C:\Windows\System32\drivers\etc\hosts
   127.0.0.1 umc.localhost
   ```

3. Testar backend diretamente:
   ```powershell
   curl http://umc.localhost:8000/api/sites/
   ```

---

### **Problema 2: "401 Unauthorized"**

**Causa**: Token JWT inválido ou ausente

**Solução**:
1. Fazer login primeiro na aplicação
2. Verificar token no DevTools > Application > LocalStorage
3. Deve ter `access_token` e `refresh_token`

---

### **Problema 3: Assets aparecem vazios**

**Causa**: Backend não tem dados cadastrados

**Solução**:
1. Criar assets via Django Admin:
   - Acessar: http://umc.localhost:8000/admin/
   - Logar com superuser
   - Ir para "Sites" e criar um site
   - Ir para "Assets" e criar alguns assets

2. Ou usar script de teste:
   ```powershell
   cd c:\Users\Rafael Ribeiro\TrakSense\traksense-backend
   docker exec -it traksense-api python test_assets_simple.py
   ```

---

### **Problema 4: Campos faltando (powerConsumption, operatingHours)**

**Causa**: Estes campos não existem no backend ainda

**Solução**: Normal! Esses campos estão com valor 0 no mapper.
Serão implementados quando houver telemetria real.

---

## 📝 **PRÓXIMOS PASSOS**

### **1. Popular Backend com Dados de Teste**

```python
# No backend Django
python manage.py shell

from apps.assets.models import Site, Asset

# Criar site
site = Site.objects.create(
    name='Oncologia',
    company='UMC',
    sector='Oncologia',
    subsector='Quimioterapia',
    address='Rua Exemplo, 123',
    timezone='America/Sao_Paulo'
)

# Criar assets
Asset.objects.create(
    tag='AHU-001-ONCO',
    name='AHU Principal Oncologia',
    site=site,
    asset_type='AHU',
    manufacturer='Carrier',
    model='30RB',
    serial_number='SN123456',
    status='OK',
    health_score=95
)
```

### **2. Implementar Auto-Load**

Modificar `src/App.tsx` para carregar automaticamente:

```typescript
function App() {
  const { setUseApiData, loadAssetsFromApi } = useAppStore();

  useEffect(() => {
    // Ativar API e carregar dados na inicialização
    setUseApiData(true);
    // ou apenas: loadAssetsFromApi();
  }, []);

  return <Router>...</Router>;
}
```

### **3. Remover Mocks (quando validado)**

Depois de testar completamente:
1. Remover/comentar `simEngine` de `src/lib/simulation.ts`
2. Remover imports de `simEngine` em `src/store/app.ts`
3. Definir `useApiData: true` como padrão
4. Remover código condicional de toggle

---

## 🎯 **COMANDOS RÁPIDOS**

```powershell
# Iniciar backend (se não estiver rodando)
cd c:\Users\Rafael Ribeiro\TrakSense\traksense-backend
docker-compose up -d

# Iniciar frontend
cd c:\Users\Rafael Ribeiro\TrakSense\traksense-hvac-monit
npm run dev

# Ver logs do backend
docker logs -f traksense-api

# Testar endpoint da API
curl http://umc.localhost:8000/api/assets/

# Popular dados de teste
docker exec -it traksense-api python test_assets_simple.py
```

---

## ✅ **RESULTADO ESPERADO**

Ao ativar `useApiData = true`:

1. ⏳ Loading state aparece
2. 🌐 Requisição GET para `/api/assets/` e `/api/sites/`
3. 🔄 Mappers convertem dados da API para formato do frontend
4. ✅ Assets são exibidos na tela
5. 📊 Contadores atualizam (ex: "3 assets" ao invés de "7 assets")
6. 🎨 UI permanece igual, apenas dados mudam

---

**Pronto para testar!** 🚀

Execute um dos métodos acima e verifique se os assets carregam da API.
