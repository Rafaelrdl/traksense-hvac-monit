# Alteração: Nome do Site de "Data Center Principal" para "OncoCentro"

## Contexto da Alteração

O usuário solicitou que o texto exibido no topo da página, ao lado do logo "TrakSense", fosse alterado de **"Data Center Principal"** para **"OncoCentro"**.

## Localização na Interface

### Posição Visual
```
┌─────────────────────────────────────────────────────────────┐
│  🏢 TrakSense  |  OncoCentro        🕐 14:33:15  🔔  👤     │
│                                                              │
│  Visão Geral | Dashboards | Ativos (HVAC) | ...           │
└─────────────────────────────────────────────────────────────┘
              ↑
         Texto alterado aqui
```

### Componente Responsável
**Arquivo:** `src/components/layout/Header.tsx`
**Linha:** ~114

```tsx
<div className="hidden md:flex items-center space-x-2 text-sm opacity-90">
  <span>|</span>
  <span>{user?.site || 'Site não definido'}</span>
  {/* ↑ Exibe o valor de user.site */}
</div>
```

## Modificação Realizada

### Arquivo Alterado
**`src/store/auth.ts`** - Linha 33

### Antes ❌
```typescript
const DEMO_USERS: Record<string, { password: string; user: User }> = {
  'admin@traksense.com': {
    password: 'admin123',
    user: {
      id: '1',
      email: 'admin@traksense.com',
      name: 'Admin TrakSense',
      role: 'admin',
      site: 'Data Center Principal',  // ← Valor antigo
      tenant: 'traksense'
    }
  },
  // ...
};
```

### Depois ✅
```typescript
const DEMO_USERS: Record<string, { password: string; user: User }> = {
  'admin@traksense.com': {
    password: 'admin123',
    user: {
      id: '1',
      email: 'admin@traksense.com',
      name: 'Admin TrakSense',
      role: 'admin',
      site: 'OncoCentro',  // ← Valor novo
      tenant: 'traksense'
    }
  },
  // ...
};
```

## Fluxo de Dados

```
┌──────────────────┐
│  Usuário faz     │
│  login           │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  useAuthStore    │
│  (auth.ts)       │
│                  │
│  DEMO_USERS      │
│  site: 'Onco... │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  localStorage    │
│  'traksense:user'│
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Header.tsx      │
│  {user?.site}    │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  UI exibe:       │
│  "OncoCentro"    │
└──────────────────┘
```

## Impacto da Alteração

### Usuários Afetados
- ✅ **Admin** (admin@traksense.com): Agora exibe "OncoCentro"
- ⚠️ **Viewer** (viewer@traksense.com): Continua exibindo "Fábrica Industrial" (não alterado)

### Onde Aparece
1. **Header superior** - Ao lado do logo TrakSense
2. **Edit Profile Dialog** - Campo "Site/Local" (read-only)
3. **Team Management Dialog** - Informações dos membros

### Componentes Relacionados

#### 1. Header (Exibição Principal)
```tsx
// src/components/layout/Header.tsx - Linha ~114
<span>{user?.site || 'Site não definido'}</span>
```

#### 2. Edit Profile Dialog
```tsx
// src/components/auth/EditProfileDialog.tsx - Linha ~293
<Input
  id="site"
  value={user?.site || ''}
  disabled
  placeholder="Data Center Principal"  // ← Placeholder pode ser atualizado
/>
```

#### 3. Team Management Dialog
```tsx
// src/components/auth/TeamManagementDialog.tsx - Linhas 80, 89
const mockTeamMembers: TeamMember[] = [
  {
    id: '1',
    name: 'João Silva',
    email: 'joao@traksense.com',
    role: 'admin',
    site: 'Data Center Principal',  // ← Valor mockado (separado do auth)
    // ...
  }
];
```

## Observações Importantes

### 1. Dados Mockados vs Dados Reais
- O valor alterado afeta apenas o **usuário autenticado** (admin)
- Membros da equipe no `TeamManagementDialog` têm valores mockados **separados**
- Se quiser consistência, também atualize `TeamManagementDialog.tsx`

### 2. Persistência com localStorage
Usuários que já fizeram login anteriormente terão o valor antigo em `localStorage`.

**Para ver a mudança:**
- Fazer **logout**
- Fazer **login novamente**
- Ou limpar `localStorage`: `localStorage.removeItem('traksense:user')`

### 3. Placeholder no Edit Profile
O placeholder do campo "Site/Local" ainda menciona "Data Center Principal".

**Para atualizar:**
```tsx
// src/components/auth/EditProfileDialog.tsx
<Input
  id="site"
  value={user?.site || ''}
  disabled
  placeholder="OncoCentro"  // ← Atualizar aqui se desejado
/>
```

## Teste de Validação

### Passo a Passo
1. ✅ Fazer logout da aplicação
2. ✅ Fazer login com:
   - Email: `admin@traksense.com`
   - Senha: `admin123`
3. ✅ Verificar o header superior
4. ✅ Confirmar que aparece: `TrakSense | OncoCentro`

### Verificação Visual
```
Antes:
┌──────────────────────────────────────┐
│ TrakSense | Data Center Principal   │
└──────────────────────────────────────┘

Depois:
┌──────────────────────────────────────┐
│ TrakSense | OncoCentro               │
└──────────────────────────────────────┘
```

## Atualizações Opcionais

Se desejar completa consistência da nomenclatura "OncoCentro" em toda a aplicação:

### 1. Atualizar Placeholder do Edit Profile
```typescript
// src/components/auth/EditProfileDialog.tsx - Linha ~293
placeholder="OncoCentro"
```

### 2. Atualizar Team Management Mockado
```typescript
// src/components/auth/TeamManagementDialog.tsx - Linhas 80, 89
site: 'OncoCentro'
```

### 3. Atualizar Documentação
- `docs/TEAM_MANAGEMENT_FEATURE.md`
- `docs/EDIT_PROFILE_FEATURE.md`
- `src/components/layout/SETTINGS_MIGRATION.md`

## Interface do Usuário

### Desktop (> 768px)
```
┌────────────────────────────────────────────────────────────────┐
│  🏢 TrakSense  |  OncoCentro    🕐 14:33:15  ⟳ 14:29:59  🔔 👤│
│                                                                 │
│  ▢ Visão Geral  📊 Dashboards  🏭 Ativos  📡 Sensores  ...    │
└────────────────────────────────────────────────────────────────┘
```

### Mobile (< 768px)
```
┌─────────────────────────────────┐
│ ☰  🏢 TrakSense    🔔  👤       │
│                                 │
│ (Texto "OncoCentro" oculto)     │
└─────────────────────────────────┘
```
**Nota:** Em mobile (`hidden md:flex`), o texto do site não é exibido para economizar espaço.

## Compatibilidade

✅ **React 19**: Funciona sem problemas
✅ **TypeScript**: Tipo `User` tem propriedade opcional `site?: string`
✅ **localStorage**: Persistência funciona corretamente
✅ **Zustand**: State management não afetado
✅ **Hot Reload**: Mudança reflete após login

## Histórico de Alterações

| Data | Alteração | De | Para |
|------|-----------|-----|------|
| 2025-10-10 | Nome do site do admin | `Data Center Principal` | `OncoCentro` |

## Arquivos Modificados

### Principal
- ✅ `src/store/auth.ts` - Linha 33

### Relacionados (não modificados, mas relevantes)
- `src/components/layout/Header.tsx` - Exibe o valor
- `src/components/auth/EditProfileDialog.tsx` - Mostra em campo read-only
- `src/components/auth/TeamManagementDialog.tsx` - Dados mockados separados

## Notas Técnicas

### Propriedade `site` vs `tenant`
```typescript
interface User {
  // ...
  site?: string;    // Local físico (ex: "OncoCentro", "Fábrica Industrial")
  tenant?: string;  // Organização (ex: "traksense")
}
```

- **`site`**: Nome do local/unidade específica (exibido no UI)
- **`tenant`**: Identificador da organização (usado internamente)

### Fallback quando site não está definido
```tsx
{user?.site || 'Site não definido'}
```
Se `user.site` for `null`, `undefined` ou string vazia, exibe "Site não definido".

## Sugestões de Melhorias Futuras

### 1. Seletor de Site Dinâmico
Permitir que usuários troquem entre sites/locais:
```tsx
<Select value={currentSite} onValueChange={setSite}>
  <SelectItem value="oncocentro">OncoCentro</SelectItem>
  <SelectItem value="fabrica">Fábrica Industrial</SelectItem>
  <SelectItem value="datacenter">Data Center</SelectItem>
</Select>
```

### 2. Carregar Sites de API
```typescript
const sites = await fetch('/api/sites').then(r => r.json());
```

### 3. Configuração por Tenant
```typescript
const TENANT_CONFIG = {
  'traksense': {
    sites: ['OncoCentro', 'Fábrica Industrial'],
    defaultSite: 'OncoCentro'
  }
};
```

## Referências

- [Zustand Documentation](https://docs.pmnd.rs/zustand/getting-started/introduction)
- [localStorage API](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)
- [TypeScript Optional Properties](https://www.typescriptlang.org/docs/handbook/2/objects.html#optional-properties)

---

**Data da Alteração:** 2025-10-10  
**Autor:** GitHub Copilot  
**Tipo:** Configuração de Nomenclatura  
**Status:** ✅ Implementado  
**Impacto:** Baixo - Apenas visual, não afeta funcionalidade
