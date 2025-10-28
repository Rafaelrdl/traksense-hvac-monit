# Guia de Integração - Multi-Tenant Frontend

## 📋 Implementação Completa

### ✅ Arquivos Criados

1. **`src/lib/tenant.ts`** - Sistema de detecção e configuração de tenant
2. **`src/lib/tenantStorage.ts`** - LocalStorage isolado por tenant
3. **`src/hooks/useTenantBranding.ts`** - Hooks React para branding
4. **`src/services/tenantAuthService.ts`** - Autenticação com tenant awareness
5. **`src/components/providers/TenantProvider.tsx`** - Provider React para branding
6. **`src/components/tenant/TenantLogo.tsx`** - Componente de logo dinâmico

### ✅ Arquivos Modificados

1. **`src/lib/api.ts`** - API com suporte a multi-tenant
   - Base URL dinâmica por tenant
   - Token storage isolado
   - Função `reconfigureApiForTenant()`

---

## 🚀 Como Usar

### 1. Integrar TenantProvider no App

```tsx
// src/App.tsx
import { TenantProvider } from '@/components/providers/TenantProvider';

function App() {
  return (
    <TenantProvider>
      {/* Resto da aplicação */}
      <Router>
        <Routes>
          {/* ... */}
        </Routes>
      </Router>
    </TenantProvider>
  );
}
```

### 2. Atualizar Login para usar tenantAuthService

```tsx
// src/components/pages/LoginPage.tsx (ou onde estiver seu login)
import { tenantAuthService } from '@/services/tenantAuthService';

const handleLogin = async (credentials: LoginCredentials) => {
  try {
    const response = await tenantAuthService.login(credentials);
    
    // Usuário autenticado e tenant configurado!
    console.log('✅ Login OK:', response.user);
    
    // Redirecionar para dashboard
    navigate('/');
  } catch (error) {
    console.error('❌ Erro no login:', error);
    setError('Credenciais inválidas');
  }
};
```

### 3. Atualizar Logout

```tsx
const handleLogout = async () => {
  await tenantAuthService.logout();
  navigate('/login');
};
```

### 4. Usar TenantLogo no Header

```tsx
// src/components/layout/Header.tsx
import { TenantLogo } from '@/components/tenant/TenantLogo';

export const Header = () => {
  return (
    <header>
      <TenantLogo size="md" showName />
      {/* Resto do header */}
    </header>
  );
};
```

### 5. Acessar Branding em Componentes

```tsx
import { useTenantBranding } from '@/hooks/useTenantBranding';

export const MyComponent = () => {
  const branding = useTenantBranding();
  
  return (
    <div style={{ borderColor: branding.primaryColor }}>
      <h1>{branding.name}</h1>
    </div>
  );
};
```

### 6. Usar Tenant Storage

```tsx
import { tenantStorage } from '@/lib/tenantStorage';

// Salvar preferências (isoladas por tenant)
tenantStorage.set('user_preferences', {
  theme: 'dark',
  language: 'pt-BR'
});

// Ler preferências
const prefs = tenantStorage.get('user_preferences');

// Verificar se existe
if (tenantStorage.has('onboarding_completed')) {
  // ...
}

// Listar todas as chaves do tenant
const keys = tenantStorage.keys();
console.log('Keys do tenant:', keys);

// Limpar todos os dados do tenant
tenantStorage.clear();
```

---

## 🎨 Customização de Branding

### Adicionar Novo Tenant

```typescript
// src/lib/tenant.ts - adicionar em TENANT_BRANDINGS

const TENANT_BRANDINGS: Record<string, TenantBranding> = {
  // ... existentes
  
  acme: {
    name: 'ACME Corporation',
    shortName: 'ACME',
    primaryColor: '#FF6B00',
    secondaryColor: '#F97316',
    logo: '/logos/acme.svg',
    favicon: '/favicons/acme.ico',
  },
  
  // Adicionar novo tenant
  hospital_abc: {
    name: 'Hospital ABC',
    shortName: 'ABC',
    primaryColor: '#10B981',
    secondaryColor: '#34D399',
    logo: '/logos/hospital-abc.svg',
    favicon: '/favicons/hospital-abc.ico',
  },
};
```

### CSS Customizado por Tenant

```css
/* src/index.css */

/* Cores globais do tenant (injetadas via JS) */
:root {
  --tenant-primary: #0A5F7F; /* Default */
  --tenant-secondary: #0EA5E9;
}

/* CSS específico por tenant */
[data-tenant="umc"] {
  /* Estilos específicos para UMC */
}

[data-tenant="acme"] {
  /* Estilos específicos para ACME */
}

/* Usar cores do tenant */
.btn-primary {
  background-color: var(--tenant-primary);
}
```

---

## 🧪 Testando Multi-Tenant

### Teste 1: Login em Diferentes Tenants

```typescript
// 1. Fazer login no tenant UMC
await tenantAuthService.login({
  username_or_email: 'admin@umc.com',
  password: 'admin123'
});

// Verificar tenant
const config = getTenantConfig();
console.log('Tenant:', config.tenantSlug); // "umc"

// Verificar token isolado
const token = tenantStorage.get('access_token');
console.log('Token UMC:', token);

// 2. Logout
await tenantAuthService.logout();

// 3. Login em outro tenant (se existir)
await tenantAuthService.login({
  username_or_email: 'admin@acme.com',
  password: 'admin123'
});

// Verificar tenant mudou
const newConfig = getTenantConfig();
console.log('Tenant:', newConfig.tenantSlug); // "acme"
```

### Teste 2: Isolamento de Storage

```typescript
// Login como UMC
await tenantAuthService.login({ ... });

tenantStorage.set('test', 'dados do UMC');
console.log(tenantStorage.get('test')); // "dados do UMC"

// Logout
await tenantAuthService.logout();

// Login como ACME
await tenantAuthService.login({ ... });

console.log(tenantStorage.get('test')); // null (isolado!)

tenantStorage.set('test', 'dados do ACME');
console.log(tenantStorage.get('test')); // "dados do ACME"
```

---

## 🔧 Configuração Nginx (Opcional - Multi-Domain)

Se quiser usar diferentes domínios:

```nginx
# /etc/nginx/sites-available/traksense-frontend

server {
    listen 80;
    server_name umc.localhost;
    
    location / {
        proxy_pass http://localhost:5173;
        proxy_set_header Host $host;
    }
}

server {
    listen 80;
    server_name acme.localhost;
    
    location / {
        proxy_pass http://localhost:5173;
        proxy_set_header Host $host;
    }
}
```

**Hosts file:**
```
# C:\Windows\System32\drivers\etc\hosts
127.0.0.1 umc.localhost
127.0.0.1 acme.localhost
```

**Acessar:**
- `http://umc.localhost` → Tenant UMC
- `http://acme.localhost` → Tenant ACME

---

## 📊 Fluxo Completo

```
1. Usuário acessa http://localhost:5173
   ↓
2. getTenantConfig() detecta tenant padrão (UMC)
   ↓
3. API configurada para http://umc.localhost:8000/api
   ↓
4. Usuário faz login (admin@umc.com)
   ↓
5. JWT retorna com tenant_slug = "umc"
   ↓
6. reconfigureApiForTenant("umc") confirma configuração
   ↓
7. Tokens salvos em tenantStorage ("umc:access_token")
   ↓
8. Branding aplicado (logo UMC, cores UMC)
   ↓
9. Todas as requisições usam http://umc.localhost:8000/api
   ↓
10. Dados isolados por tenant no localStorage
```

---

## ✅ Checklist de Integração

- [ ] Wrap App com `<TenantProvider>`
- [ ] Atualizar login para usar `tenantAuthService.login()`
- [ ] Atualizar logout para usar `tenantAuthService.logout()`
- [ ] Substituir `localStorage` por `tenantStorage` onde apropriado
- [ ] Adicionar `<TenantLogo>` no header/sidebar
- [ ] Testar login/logout com isolamento de dados
- [ ] Adicionar brandings de novos tenants em `TENANT_BRANDINGS`
- [ ] (Opcional) Configurar Nginx para multi-domain

---

## 🎯 Resultado Final

- ✅ **Isolamento completo** de dados por tenant
- ✅ **Branding dinâmico** (logo, cores, nome)
- ✅ **API reconfigurável** após login
- ✅ **LocalStorage isolado** por tenant
- ✅ **Escalável** para múltiplos tenants
- ✅ **Compatível** com localStorage legado (fallback)
