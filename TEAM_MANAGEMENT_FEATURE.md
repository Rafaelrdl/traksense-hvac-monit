# 👥 Funcionalidade de Gerenciamento de Equipe

## 📋 Visão Geral

Funcionalidade exclusiva para **administradores** que permite gerenciar membros da equipe, enviar convites e controlar permissões de acesso à plataforma TrakSense HVAC.

## 🎯 Acesso

### Localização
- **Menu de Usuário** → Item "**Equipe**"
- Visível apenas para usuários com `role: 'admin'`

### Requisitos
- ✅ Usuário autenticado
- ✅ Permissão de administrador (`user.role === 'admin'`)

---

## 🚀 Funcionalidades Implementadas

### 1️⃣ **Visualizar Membros da Equipe**

#### Features:
- 📋 Lista completa de todos os membros
- 🔍 **Busca em tempo real** por nome ou email
- 👤 Avatar com iniciais
- 🏷️ Badge de identificação ("Você" para o usuário atual)
- 📍 Exibição do site/local de cada membro
- 📊 Status visual (ativo, pendente, inativo)

#### Informações Exibidas:
```typescript
{
  name: string           // Nome completo
  email: string          // Email corporativo
  role: string           // admin | operator | viewer
  status: string         // active | pending | inactive
  joinedAt: Date        // Data de ingresso
  site?: string         // Local/Site atribuído
}
```

---

### 2️⃣ **Gerenciar Permissões**

#### Níveis de Permissão:
| Nível | Descrição | Ícone |
|-------|-----------|-------|
| **Administrador** | Acesso total ao sistema, pode gerenciar equipe | 🛡️ Shield |
| **Operador** | Pode visualizar e gerenciar alertas, manutenção | 👥 Users |
| **Visualizador** | Apenas visualização, sem permissões de edição | 👁️ Users |

#### Funcionalidade:
- 🔄 **Dropdown de permissões** em cada membro
- ⚡ Alteração em tempo real
- 🔒 Proteção: usuário não pode alterar suas próprias permissões
- ✅ Notificação de sucesso ao alterar

#### Uso:
```tsx
<Select
  value={member.role}
  onValueChange={(value) => handleChangeRole(member.id, value)}
  disabled={member.id === user.id}
>
  <SelectItem value="admin">Administrador</SelectItem>
  <SelectItem value="operator">Operador</SelectItem>
  <SelectItem value="viewer">Visualizador</SelectItem>
</Select>
```

---

### 3️⃣ **Convidar Novos Membros**

#### Formulário de Convite:
- 📧 **Campo de email** com validação
- 🛡️ **Seletor de permissão** com descrições
- ✉️ Botão "Enviar Convite"

#### Validações Implementadas:
```typescript
✅ Formato de email válido (regex)
✅ Email não duplicado (membros existentes)
✅ Email não duplicado (convites pendentes)
✅ Tamanho máximo de 5MB para arquivos
```

#### Mensagens de Feedback:
- ✅ Sucesso: "Convite enviado! Um convite foi enviado para [email]"
- ❌ Erro: "Email inválido", "Email já cadastrado"

#### Descrições das Permissões:
```typescript
admin:    "Acesso total ao sistema"
operator: "Pode visualizar e gerenciar alertas"
viewer:   "Apenas visualização"
```

---

### 4️⃣ **Gerenciar Convites Pendentes**

#### Features:
- ⏰ Lista de convites aguardando aceitação
- 📊 Badge com contador de pendências
- 🗑️ Botão para cancelar convite
- 📅 Data do convite
- 👤 Nome de quem convidou

#### Estrutura de Convite Pendente:
```typescript
interface PendingInvite {
  id: string
  email: string
  role: 'admin' | 'operator' | 'viewer'
  invitedAt: Date
  invitedBy: string
}
```

#### Ações:
- **Cancelar Convite**: Remove da lista de pendentes
- **Feedback Visual**: Estado vazio com ícone e mensagem

---

### 5️⃣ **Remover Membros**

#### Proteções:
- 🔒 Usuário **não pode remover a si mesmo**
- ⚠️ Confirmação necessária (via menu dropdown)
- 🗑️ Remoção permanente da equipe

#### Fluxo:
1. Clicar no menu "⋮" (três pontos)
2. Selecionar "Remover da equipe" (texto vermelho)
3. Confirmar ação
4. Notificação: "Membro removido - [Nome] foi removido da equipe"

---

## 🎨 Interface do Usuário

### **Tabs de Navegação**
```
┌─────────────────────────────────────┐
│  [Membros (3)]  │  [Convidar 🔴1]  │
└─────────────────────────────────────┘
```

### **Tab 1: Membros**
```
┌─────────────────────────────────────┐
│  🔍 Buscar membros...               │
├─────────────────────────────────────┤
│  👤 Admin TrakSense       [Você]    │
│     admin@traksense.com             │
│     Data Center Principal           │
│     [Administrador ▼]  [⋮]         │
├─────────────────────────────────────┤
│  👤 João Silva                      │
│     joao@traksense.com              │
│     Data Center Principal           │
│     [Operador ▼]  [⋮]              │
├─────────────────────────────────────┤
│  👤 Maria Santos                    │
│     maria@traksense.com             │
│     Data Center Secundário          │
│     [Visualizador ▼]  [⋮]          │
└─────────────────────────────────────┘
```

### **Tab 2: Convidar**
```
┌─────────────────────────────────────┐
│  📧 Email do Membro                 │
│  [membro@empresa.com____________]   │
│                                     │
│  🛡️ Nível de Permissão              │
│  [Visualizador ▼________________]   │
│                                     │
│  [➕ Enviar Convite]                │
├─────────────────────────────────────┤
│  ⏰ Convites Pendentes (1)          │
│                                     │
│  📧 novo@traksense.com              │
│  [Operador] Convidado por Admin... │
│  09/10/2024                    [❌] │
└─────────────────────────────────────┘
```

---

## 💻 Arquitetura Técnica

### **Componente Principal**
```typescript
// src/components/auth/TeamManagementDialog.tsx
interface TeamManagementDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}
```

### **Integração no Header**
```typescript
// src/components/layout/Header.tsx

// Estado
const [isTeamManagementOpen, setIsTeamManagementOpen] = useState(false);

// Menu Item (condicional)
{user.role === 'admin' && (
  <DropdownMenuItem onClick={() => setIsTeamManagementOpen(true)}>
    <Users className="mr-2 h-4 w-4" />
    <span>Equipe</span>
  </DropdownMenuItem>
)}

// Dialog
<TeamManagementDialog 
  open={isTeamManagementOpen} 
  onOpenChange={setIsTeamManagementOpen} 
/>
```

### **Componentes shadcn/ui Utilizados**
```typescript
✅ Dialog, DialogContent, DialogHeader, DialogTitle
✅ Tabs, TabsContent, TabsList, TabsTrigger
✅ Select, SelectContent, SelectItem, SelectTrigger
✅ DropdownMenu, DropdownMenuItem
✅ Avatar, AvatarFallback
✅ Badge
✅ Button
✅ Input
✅ Label
✅ Separator
✅ ScrollArea
```

### **Ícones Lucide React**
```typescript
Users, Mail, UserPlus, Shield, Trash2, Search,
MoreVertical, CheckCircle2, Clock, XCircle
```

---

## 🔧 Funcionalidades Futuras (TODO)

### Backend Integration
```typescript
// TODO: Implementar APIs

// Buscar membros da equipe
GET /api/team/members

// Convidar membro
POST /api/team/invite
{
  email: string,
  role: 'admin' | 'operator' | 'viewer'
}

// Alterar permissão
PATCH /api/team/members/:id
{
  role: 'admin' | 'operator' | 'viewer'
}

// Remover membro
DELETE /api/team/members/:id

// Cancelar convite
DELETE /api/team/invites/:id

// Listar convites pendentes
GET /api/team/invites
```

### Funcionalidades Adicionais
- [ ] Envio real de email de convite
- [ ] Link de ativação de conta
- [ ] Expiração de convites (7 dias)
- [ ] Histórico de ações (audit log)
- [ ] Filtros avançados (role, status, site)
- [ ] Exportar lista de membros (CSV/Excel)
- [ ] Importação em massa de membros
- [ ] Permissões granulares por site/equipamento
- [ ] Notificações push para convites

---

## 🧪 Testes Recomendados

### Testes de Usuário

#### Como Administrador:
1. ✅ Abrir menu de usuário
2. ✅ Verificar item "Equipe" visível
3. ✅ Clicar em "Equipe"
4. ✅ Ver lista de membros (mock data)
5. ✅ Buscar membro por nome
6. ✅ Buscar membro por email
7. ✅ Alterar permissão de um membro
8. ✅ Tentar remover a si mesmo (deve bloquear)
9. ✅ Remover outro membro
10. ✅ Ir para aba "Convidar"
11. ✅ Preencher email válido
12. ✅ Selecionar permissão
13. ✅ Enviar convite
14. ✅ Ver convite na lista de pendentes
15. ✅ Cancelar convite pendente

#### Como Operador/Visualizador:
1. ✅ Abrir menu de usuário
2. ✅ Verificar item "Equipe" **não aparece**

### Testes de Validação:
```typescript
// Email inválido
❌ "teste" → Erro: "Email inválido"
❌ "teste@" → Erro: "Email inválido"
✅ "teste@empresa.com" → Sucesso

// Email duplicado
❌ "admin@traksense.com" → Erro: "Email já cadastrado"

// Proteções
❌ Remover a si mesmo → Erro: "Ação não permitida"
❌ Alterar própria permissão → Campo desabilitado
```

---

## 📊 Dados Mock (Desenvolvimento)

### Membros Padrão:
```typescript
[
  {
    id: '1',
    name: 'Admin TrakSense',
    email: 'admin@traksense.com',
    role: 'admin',
    status: 'active',
    joinedAt: new Date('2024-01-15'),
    site: 'Data Center Principal'
  },
  {
    id: '2',
    name: 'João Silva',
    email: 'joao@traksense.com',
    role: 'operator',
    status: 'active',
    joinedAt: new Date('2024-03-20'),
    site: 'Data Center Principal'
  },
  {
    id: '3',
    name: 'Maria Santos',
    email: 'maria@traksense.com',
    role: 'viewer',
    status: 'active',
    joinedAt: new Date('2024-05-10'),
    site: 'Data Center Secundário'
  }
]
```

### Convites Pendentes:
```typescript
[
  {
    id: 'inv-1',
    email: 'novo@traksense.com',
    role: 'operator',
    invitedAt: new Date('2024-10-01'),
    invitedBy: 'Admin TrakSense'
  }
]
```

---

## 🎯 Benefícios da Funcionalidade

### Para Administradores:
- ⚡ Controle total sobre acesso à plataforma
- 👥 Gestão centralizada de equipe
- 🔒 Segurança com níveis de permissão
- 📊 Visibilidade de membros e convites

### Para a Organização:
- 🏢 Onboarding rápido de novos membros
- 🔐 Auditoria de acessos
- 📍 Segregação por sites/locais
- 🚀 Escalabilidade de equipe

---

## 🔗 Arquivos Relacionados

```
src/
├── components/
│   ├── auth/
│   │   ├── TeamManagementDialog.tsx  ← Novo componente
│   │   └── EditProfileDialog.tsx
│   └── layout/
│       └── Header.tsx                ← Atualizado
├── store/
│   └── auth.ts
└── types/
    └── hvac.ts
```

---

## 🚀 Como Testar

### 1. Login como Admin
```
Email: admin@traksense.com
Senha: admin123
```

### 2. Acessar Menu de Equipe
```
1. Clicar no avatar no canto superior direito
2. Menu dropdown abre
3. Clicar em "Equipe" (ícone 👥)
```

### 3. Explorar Funcionalidades
```
✓ Ver membros existentes
✓ Buscar membros
✓ Alterar permissões
✓ Convidar novo membro
✓ Gerenciar convites pendentes
```

---

## 📝 Notas de Implementação

### Estado Atual: ✅ **COMPLETO (Frontend)**
- Interface totalmente funcional
- Validações implementadas
- Feedback visual com toasts
- Responsivo e acessível

### Próximos Passos: 🔄 **Backend Integration**
- Conectar com APIs reais
- Persistir dados no banco
- Implementar envio de emails
- Adicionar autenticação de convites

---

## 🎨 Personalização

### Cores e Badges:
```typescript
admin:    variant="default"    // Cor primária (teal)
operator: variant="secondary"  // Cor secundária (cinza)
viewer:   variant="outline"    // Contorno apenas
```

### Scroll Area:
```typescript
height: 400px  // Tab Membros
height: 250px  // Tab Convites Pendentes
```

---

## ✅ Checklist de Funcionalidades

- [x] Item "Equipe" visível apenas para admins
- [x] Dialog modal responsivo
- [x] Tabs: Membros e Convidar
- [x] Lista de membros com avatars
- [x] Busca em tempo real
- [x] Dropdown de permissões
- [x] Botão remover membro
- [x] Proteção: não remover a si mesmo
- [x] Formulário de convite
- [x] Validação de email
- [x] Lista de convites pendentes
- [x] Cancelar convite
- [x] Contador de pendências (badge)
- [x] Feedback com toasts (Sonner)
- [x] ScrollArea para listas longas
- [x] Estados vazios com ícones
- [x] Tooltips e descrições
- [x] Responsividade mobile

---

**Desenvolvido para TrakSense HVAC Monitoring Platform** 🏢❄️
