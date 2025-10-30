# 🧪 Comandos de Teste - Multi-Tenant Frontend

## Console do Navegador - Testar Sistema

### 1. Verificar Configuração Atual

```javascript
// Importar funções (se não estiverem globais)
import { getTenantConfig, getTenantBranding } from '@/lib/tenant';
import { tenantStorage } from '@/lib/tenantStorage';
import { tenantAuthService } from '@/services/tenantAuthService';

// Ver configuração do tenant
const config = getTenantConfig();
console.log('🏢 Tenant Config:', config);

// Ver branding
const branding = getTenantBranding();
console.log('🎨 Branding:', branding);

// Ver se está autenticado
console.log('🔐 Autenticado?', tenantAuthService.isAuthenticated());

// Ver usuário atual
console.log('👤 Usuário:', tenantAuthService.getCurrentUser());
```

### 2. Testar Storage Isolado

```javascript
// Salvar no tenant atual
tenantStorage.set('test_key', { valor: 'teste', timestamp: new Date() });

// Ler do tenant atual
const value = tenantStorage.get('test_key');
console.log('💾 Valor salvo:', value);

// Listar todas as keys do tenant
const keys = tenantStorage.keys();
console.log('📋 Keys:', keys);

// Ver tamanho do storage
const size = tenantStorage.size();
console.log('📊 Tamanho:', (size / 1024).toFixed(2), 'KB');

// Verificar se key existe
console.log('❓ Tem test_key?', tenantStorage.has('test_key'));

// Remover key
tenantStorage.remove('test_key');

// Limpar tudo (CUIDADO!)
// tenantStorage.clear();
```

### 3. Testar Login Manual

```javascript
// Login
await tenantAuthService.login({
  username_or_email: 'admin@traksense.com',
  password: 'admin123'
});

// Verificar tokens
console.log('🎫 Access Token:', tenantAuthService.getAccessToken()?.substring(0, 50) + '...');
console.log('🔄 Refresh Token:', tenantAuthService.getRefreshToken()?.substring(0, 50) + '...');

// Verificar usuário
console.log('👤 User:', tenantAuthService.getCurrentUser());

// Logout
await tenantAuthService.logout();
```

### 4. Testar Migração de Storage

```javascript
import { runStorageMigration, revertStorageMigration } from '@/lib/migrations/storageMigration';

// Executar migração
runStorageMigration();

// Ver resultado
console.log('📋 Keys após migração:', tenantStorage.keys());

// Reverter (se necessário)
// revertStorageMigration();
```

### 5. Simular Troca de Tenant

```javascript
// 1. Login como UMC
await tenantAuthService.login({
  username_or_email: 'admin@umc.com',
  password: 'admin123'
});

// Salvar algo no UMC
tenantStorage.set('meu_dado', 'Este é do UMC');
console.log('UMC - Dado salvo:', tenantStorage.get('meu_dado'));

// Verificar tenant
console.log('🏢 Tenant atual:', getTenantConfig().tenantSlug); // "umc"

// 2. Logout
await tenantAuthService.logout();

// 3. Login como outro tenant (se tiver)
// await tenantAuthService.login({
//   username_or_email: 'admin@acme.com',
//   password: 'admin123'
// });

// Verificar isolamento
console.log('❓ Dado do UMC visível?', tenantStorage.get('meu_dado')); // null (isolado!)
console.log('🏢 Tenant atual:', getTenantConfig().tenantSlug); // "acme"
```

### 6. Inspecionar localStorage Raw

```javascript
// Ver TODAS as keys do localStorage (incluindo tenants)
const allKeys = Object.keys(localStorage);
console.log('🗂️ Todas as keys:', allKeys);

// Filtrar por tenant
const umcKeys = allKeys.filter(k => k.startsWith('umc:'));
console.log('🏢 Keys do UMC:', umcKeys);

const acmeKeys = allKeys.filter(k => k.startsWith('acme:'));
console.log('🏢 Keys do ACME:', acmeKeys);

// Ver valor raw
console.log('📦 UMC access_token:', localStorage.getItem('umc:access_token'));
```

### 7. Backup e Restore

```javascript
import { backupTenantStorage, restoreTenantStorage } from '@/lib/tenantStorage';

// Fazer backup
const backup = backupTenantStorage();
console.log('💾 Backup criado:', backup);

// Salvar backup (copiar JSON para arquivo)
const json = JSON.stringify(backup, null, 2);
console.log(json);

// Restaurar backup
restoreTenantStorage(backup);
console.log('✅ Backup restaurado');
```

---

## 🐛 Debug - Verificar Estado Completo

```javascript
// Função helper para dump completo
function debugTenantState() {
  console.group('🏢 DEBUG TENANT STATE');
  
  console.log('=== CONFIGURAÇÃO ===');
  console.log(getTenantConfig());
  
  console.log('\n=== BRANDING ===');
  console.log(getTenantBranding());
  
  console.log('\n=== AUTENTICAÇÃO ===');
  console.log('Autenticado?', tenantAuthService.isAuthenticated());
  console.log('Usuário:', tenantAuthService.getCurrentUser());
  
  console.log('\n=== STORAGE ===');
  console.log('Keys:', tenantStorage.keys());
  console.log('Tamanho:', tenantStorage.size(), 'bytes');
  
  console.log('\n=== TOKENS ===');
  const access = tenantAuthService.getAccessToken();
  const refresh = tenantAuthService.getRefreshToken();
  console.log('Access:', access ? access.substring(0, 50) + '...' : 'N/A');
  console.log('Refresh:', refresh ? refresh.substring(0, 50) + '...' : 'N/A');
  
  console.log('\n=== DADOS ===');
  tenantStorage.keys().forEach(key => {
    const value = tenantStorage.get(key);
    console.log(`${key}:`, value);
  });
  
  console.groupEnd();
}

// Executar
debugTenantState();
```

---

## 🧹 Limpeza - Resetar Tudo

```javascript
// ATENÇÃO: Isso vai limpar TUDO!
function resetAll() {
  if (confirm('⚠️ Tem certeza? Isso vai limpar TODOS os dados!')) {
    // Limpar tenant storage
    tenantStorage.clear();
    
    // Limpar localStorage global
    localStorage.clear();
    
    // Recarregar página
    window.location.reload();
  }
}

// Executar reset
resetAll();
```

---

## 📊 Monitoramento - Watch Storage Changes

```javascript
// Criar watcher para mudanças no storage
function watchStorageChanges() {
  const originalSet = Storage.prototype.setItem;
  
  Storage.prototype.setItem = function(key, value) {
    console.log('💾 localStorage.setItem:', key, value?.substring(0, 100));
    originalSet.apply(this, arguments);
  };
  
  console.log('👀 Watching storage changes...');
}

watchStorageChanges();
```

---

## 🎯 Cenários de Teste

### Cenário 1: Login → Navegação → Logout

```javascript
// 1. Login
await tenantAuthService.login({
  username_or_email: 'admin@traksense.com',
  password: 'admin123'
});

// 2. Verificar estado
debugTenantState();

// 3. Navegar e salvar dados
tenantStorage.set('last_page', '/assets');

// 4. Logout
await tenantAuthService.logout();

// 5. Verificar limpeza
debugTenantState();
```

### Cenário 2: Múltiplos Tabs (mesmo tenant)

```javascript
// Tab 1: Login
await tenantAuthService.login({ ... });
tenantStorage.set('tab1_data', 'Dados do Tab 1');

// Tab 2: Verificar dados compartilhados
console.log('Tab 2 vê dados do Tab 1?', tenantStorage.get('tab1_data')); // Sim! (mesmo tenant)
```

### Cenário 3: Token Expiration

```javascript
// Forçar expiração do token
localStorage.setItem('access_token', 'token_invalido');

// Tentar fazer requisição
await api.get('/assets/');
// → Deve tentar refresh automático
// → Se refresh falhar, deve redirecionar para login
```

---

## 🔧 Ferramentas Dev

### Ver API Base URL Atual

```javascript
import { api } from '@/lib/api';
console.log('🌐 API Base URL:', api.defaults.baseURL);
```

### Reconfigurar API Manualmente

```javascript
import { reconfigureApiForTenant } from '@/lib/api';

reconfigureApiForTenant('umc');
console.log('✅ API reconfigurada para UMC');
```

### Ver Headers da Próxima Requisição

```javascript
// Interceptor temporário
api.interceptors.request.use(config => {
  console.log('📤 Request Headers:', config.headers);
  console.log('📤 Request URL:', config.url);
  return config;
});
```

---

## 💡 Dicas

1. **Usar Debug Panel** - Mais visual e fácil que console
2. **Copiar comandos** - Salvar snippets úteis
3. **Criar atalhos** - Adicionar funções úteis no window:

```javascript
// Adicionar helpers globais (desenvolvimento)
window.debugTenant = debugTenantState;
window.resetTenant = resetAll;
window.tenantConfig = getTenantConfig;
window.tenantBranding = getTenantBranding;

// Usar:
debugTenant();
tenantConfig();
```
