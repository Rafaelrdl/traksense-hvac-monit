# 🧪 Guia de Teste - Team Management (FASE 5)

## ⚡ Teste Rápido - 5 Minutos

### Pré-requisitos
```bash
# 1. Backend deve estar rodando
cd c:\Users\Rafael Ribeiro\TrakSense\traksense-backend
docker-compose up -d

# 2. Frontend deve estar rodando
cd c:\Users\Rafael Ribeiro\TrakSense\traksense-hvac-monit
npm run dev
```

---

## 📋 Checklist de Testes

### ✅ Teste 1: Acessar Página de Equipe (30s)

**Passos:**
1. Abrir navegador: `http://umc.localhost:5173`
2. Fazer login:
   - Email: `admin@umc.com`
   - Senha: `senha123`
3. Clicar em **"Equipe"** no menu de navegação horizontal
4. Verificar página carrega sem erros

**Resultado Esperado:**
- ✅ Página "Gerenciamento de Equipe" aparece
- ✅ 4 cards de estatísticas visíveis
- ✅ Tabela com lista de membros
- ✅ Seção "Convites Pendentes" (pode estar vazia)
- ✅ Botão "Convidar Membro" visível

**Screenshot esperado:**
```
╔════════════════════════════════════════╗
║  Gerenciamento de Equipe               ║
╠════════════════════════════════════════╣
║  [📊] Total    [✉️] Pendentes          ║
║     2              0                    ║
║  [👑] Owners   [🔧] Operators          ║
║     1              1                    ║
╠════════════════════════════════════════╣
║  Membros da Equipe       [+ Convidar]  ║
║  ┌──────────────────────────────────┐  ║
║  │ 👤 Admin UMC    👑 Owner  🟢 Ativo│  ║
║  │    admin@umc.com                  │  ║
║  └──────────────────────────────────┘  ║
╚════════════════════════════════════════╝
```

---

### ✅ Teste 2: Criar Convite (1min)

**Passos:**
1. Clicar no botão **"Convidar Membro"**
2. Preencher formulário:
   - **Email:** `joao.silva@example.com`
   - **Função (Role):** Selecionar **"Operator"** 🔧
   - **Mensagem:** (opcional) `Bem-vindo à equipe!`
3. Clicar em **"Enviar Convite"**

**Resultado Esperado:**
- ✅ Toast verde aparece: "Convite enviado!"
- ✅ Modal fecha automaticamente
- ✅ Convite aparece em "Convites Pendentes"
- ✅ Card "Convites Pendentes" incrementa de 0 → 1
- ✅ Email enviado (verificar no Mailpit)

**Validar Email (Mailpit):**
1. Abrir: `http://localhost:8025`
2. Ver email mais recente
3. Verificar:
   - ✅ Para: joao.silva@example.com
   - ✅ Assunto: "Convite para UMC"
   - ✅ Contém link de aceitação
   - ✅ Mensagem personalizada aparece

---

### ✅ Teste 3: Gerenciar Convite (30s)

**Passos:**
1. Na seção "Convites Pendentes"
2. Localizar convite criado: `joao.silva@example.com`
3. Testar **"Reenviar"**:
   - Clicar no botão "Reenviar"
   - Verificar toast: "Convite reenviado!"
   - Verificar novo email no Mailpit
4. Testar **"Cancelar"**:
   - Clicar no botão "Cancelar"
   - Confirmar ação
   - Verificar toast: "Convite cancelado"
   - Verificar convite sumiu da lista

**Resultado Esperado:**
- ✅ Reenviar funciona (novo email)
- ✅ Cancelar remove da lista
- ✅ Card "Convites Pendentes" volta para 0
- ✅ Sem erros no console

---

### ✅ Teste 4: Editar Membro (1min)

**Passos:**
1. Na tabela de "Membros da Equipe"
2. Localizar um membro (ex: admin@umc.com)
3. Clicar no menu de ações (⋮ três pontos verticais)
4. Selecionar **"Editar"**
5. No modal:
   - **Função:** Trocar para **"Admin"** 🔑
   - **Status:** Manter "Ativo"
6. Clicar em **"Salvar Alterações"**

**Resultado Esperado:**
- ✅ Toast verde: "Membro atualizado!"
- ✅ Modal fecha
- ✅ Badge do membro muda de 👑 Owner (roxo) → 🔑 Admin (azul)
- ✅ Dados atualizados na tabela
- ✅ Card "Owners/Admins" pode mudar

**Reverter mudança:**
1. Editar novamente
2. Voltar para "Owner"
3. Salvar

---

### ✅ Teste 5: Testar Permissões (2min)

**Objetivo:** Verificar que apenas Owner/Admin podem acessar a página.

**Cenário A: Usuário Operator (sem permissão)**
1. Criar um usuário operator:
   ```bash
   docker exec -it traksense-api python manage.py shell
   ```
   ```python
   from apps.accounts.models import User, TenantMembership
   from tenant_schemas.utils import schema_context
   
   with schema_context('umc'):
       user = User.objects.create_user(
           email='operator@umc.com',
           full_name='Operator Test',
           password='senha123'
       )
       TenantMembership.objects.create(
           user=user,
           role='operator',
           status='active'
       )
   exit()
   ```

2. Logout do admin
3. Login como `operator@umc.com` / `senha123`
4. Tentar acessar página "Equipe"

**Resultado Esperado:**
- ✅ Página não aparece OU
- ✅ Erro 403 Forbidden OU
- ✅ Redirect para outra página

**Cenário B: Usuário Admin (com permissão)**
1. Fazer login como admin novamente
2. Verificar acesso total à página Team

---

## 🔍 Testes de Edge Cases

### Teste 6: Convite Duplicado

**Passos:**
1. Criar convite para `teste@example.com`
2. Tentar criar outro convite para o **mesmo email**

**Resultado Esperado:**
- ✅ Toast de erro: "Já existe um convite pendente para este email" OU
- ✅ Aceita mas mostra apenas 1 convite (backend valida)

---

### Teste 7: Email Inválido

**Passos:**
1. Criar convite com email inválido: `joao.silva@`

**Resultado Esperado:**
- ✅ Validação HTML5 impede submit OU
- ✅ Toast de erro: "Email inválido"

---

### Teste 8: Remover Próprio Usuário

**Passos:**
1. Tentar remover o próprio usuário logado (admin@umc.com)

**Resultado Esperado:**
- ✅ Toast de erro: "Você não pode remover a si mesmo" OU
- ✅ Botão desabilitado para próprio usuário

---

### Teste 9: Remover Último Owner

**Passos:**
1. Se houver apenas 1 owner na organização
2. Tentar remover esse owner

**Resultado Esperado:**
- ✅ Toast de erro: "Não é possível remover o último owner" OU
- ✅ Backend impede ação

---

## 📊 Verificação de Dados no Backend

### Verificar Membros no Banco

```bash
docker exec -it traksense-api python manage.py shell
```

```python
from apps.accounts.models import TenantMembership, Invite
from tenant_schemas.utils import schema_context

# Listar membros do tenant UMC
with schema_context('umc'):
    print("\n=== MEMBROS ===")
    for m in TenantMembership.objects.all():
        print(f"- {m.user.full_name} ({m.user.email})")
        print(f"  Role: {m.role} | Status: {m.status}")
    
    print("\n=== CONVITES ===")
    for i in Invite.objects.filter(status='pending'):
        print(f"- {i.email}")
        print(f"  Role: {i.role} | Criado por: {i.created_by.full_name}")

exit()
```

---

## 🌐 Teste de Requisições API (Opcional)

### Usando Postman ou cURL

**1. Login e obter token:**
```bash
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -H "X-Tenant: umc" \
  -d '{
    "email": "admin@umc.com",
    "password": "senha123"
  }'
```

**Copiar `access` token do response.**

**2. Listar membros:**
```bash
curl -X GET http://localhost:8000/api/team/members/ \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -H "X-Tenant: umc"
```

**3. Criar convite:**
```bash
curl -X POST http://localhost:8000/api/team/invites/ \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -H "X-Tenant: umc" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "maria@example.com",
    "role": "viewer",
    "message": "Bem-vinda!"
  }'
```

**4. Listar convites:**
```bash
curl -X GET http://localhost:8000/api/team/invites/ \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -H "X-Tenant: umc"
```

---

## ⚠️ Troubleshooting

### Erro: "Página Team não encontrada"

**Verificar:**
```bash
# 1. Frontend compilando sem erros
cd traksense-hvac-monit
npm run dev

# 2. Ver console do navegador (F12)
# 3. Verificar URL está correto: http://umc.localhost:5173
```

---

### Erro: "403 Forbidden" ao criar convite

**Verificar:**
1. Usuário logado tem role `owner` ou `admin`
2. Token JWT válido (não expirado)
3. Header `X-Tenant` correto

**Solucionar:**
```bash
# Verificar role do usuário
docker exec -it traksense-api python manage.py shell
```
```python
from apps.accounts.models import TenantMembership
from tenant_schemas.utils import schema_context

with schema_context('umc'):
    m = TenantMembership.objects.get(user__email='admin@umc.com')
    print(f"Role: {m.role}")
    
    # Se não for owner/admin, alterar:
    m.role = 'owner'
    m.save()

exit()
```

---

### Erro: Email não é enviado

**Verificar Mailpit:**
```bash
# 1. Container rodando?
docker ps | grep mailpit

# 2. Acessível?
# Abrir: http://localhost:8025

# 3. Ver logs
docker logs mailpit
```

**Verificar configuração do Django:**
```bash
docker exec -it traksense-api cat .env | grep EMAIL
```

Deve ter:
```
EMAIL_HOST=mailpit
EMAIL_PORT=1025
```

---

### Erro: "Cannot read property of undefined" no frontend

**Verificar:**
1. API retornou dados corretos?
2. TypeScript types estão corretos?
3. Console do navegador mostra erro específico?

**Debug:**
```typescript
// Adicionar console.log em TeamPage.tsx → loadData()
const loadData = async () => {
  try {
    const [members, invites, stats] = await Promise.all([...]);
    console.log('Members:', members);
    console.log('Invites:', invites);
    console.log('Stats:', stats);
    // ...
  }
}
```

---

## ✅ Checklist Final

Antes de considerar o teste completo, verificar:

- [ ] Página Team carrega sem erros
- [ ] Cards de estatísticas mostram valores corretos
- [ ] Tabela de membros exibe dados
- [ ] Criar convite funciona
- [ ] Email de convite é enviado (Mailpit)
- [ ] Reenviar convite funciona
- [ ] Cancelar convite funciona
- [ ] Editar membro funciona
- [ ] Badges de role estão corretos (cores e ícones)
- [ ] Badges de status estão corretos
- [ ] Toasts aparecem em ações (sucesso/erro)
- [ ] Menu "Equipe" aparece na navegação
- [ ] Sem erros no console do navegador
- [ ] Sem erros no console do Docker (backend)

---

## 📸 Screenshots Esperados

### Página Principal
```
┌─────────────────────────────────────────────┐
│ Gerenciamento de Equipe        [+ Convidar] │
├─────────────────────────────────────────────┤
│ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐       │
│ │Total │ │Pend. │ │Owner │ │Oper. │       │
│ │  2   │ │  1   │ │  1   │ │  1   │       │
│ └──────┘ └──────┘ └──────┘ └──────┘       │
├─────────────────────────────────────────────┤
│ Membros da Equipe                           │
│ ┌───────────────────────────────────────┐  │
│ │ [👤] Admin UMC                   [⋮] │  │
│ │      admin@umc.com                    │  │
│ │      👑 Owner        🟢 Ativo         │  │
│ │      Desde: 15/01/2024                │  │
│ ├───────────────────────────────────────┤  │
│ │ [👤] Operator                    [⋮] │  │
│ │      operator@umc.com                 │  │
│ │      🔧 Operator      🟢 Ativo        │  │
│ │      Desde: 20/01/2024                │  │
│ └───────────────────────────────────────┘  │
├─────────────────────────────────────────────┤
│ Convites Pendentes                          │
│ ┌───────────────────────────────────────┐  │
│ │ joao.silva@example.com                │  │
│ │ 🔧 Operator                           │  │
│ │ Enviado em: 25/01/2024                │  │
│ │ [🔄 Reenviar] [❌ Cancelar]          │  │
│ └───────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
```

### Modal de Convite
```
┌─────────────────────────────┐
│ Convidar Novo Membro    [X] │
├─────────────────────────────┤
│ Email *                     │
│ ┌─────────────────────────┐ │
│ │ joao@example.com        │ │
│ └─────────────────────────┘ │
│                             │
│ Função *                    │
│ ┌─────────────────────────┐ │
│ │ 🔧 Operator         ▼  │ │
│ └─────────────────────────┘ │
│                             │
│ Mensagem (opcional)         │
│ ┌─────────────────────────┐ │
│ │ Bem-vindo à equipe!     │ │
│ │                         │ │
│ └─────────────────────────┘ │
│                             │
│       [Cancelar] [Enviar]   │
└─────────────────────────────┘
```

---

## 🎯 Resultado Esperado Final

Após completar todos os testes:

✅ **Sistema de Team Management totalmente funcional**
✅ **UI responsiva e intuitiva**
✅ **Integração completa Backend ↔ Frontend**
✅ **Emails sendo enviados corretamente**
✅ **Permissões RBAC funcionando**
✅ **Sem erros de compilação ou runtime**

---

**Tempo total de teste: ~10 minutos**

**Status: PRONTO PARA PRODUÇÃO! 🚀**
