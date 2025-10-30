# 🧪 Guia Rápido de Teste - EditProfileDialog

**⏱️ Tempo estimado:** 5-10 minutos  
**🎯 Objetivo:** Validar integração completa do perfil do usuário

---

## 📋 Pré-requisitos

### ✅ Verificar se o backend está rodando:
```powershell
docker ps
```
**Esperado:** Container `traksense-api` em `UP` status, porta `8000`

### ✅ Verificar se o frontend está rodando:
```powershell
cd "c:\Users\Rafael Ribeiro\TrakSense\traksense-hvac-monit"
npm run dev
```
**Esperado:** Frontend em `http://localhost:5173` ou `http://localhost:5000`

---

## 🧪 Roteiro de Testes

### TESTE 1: Login ✅
1. Acesse: `http://umc.localhost:5173/`
2. Faça login:
   - **Email:** test@umc.com
   - **Senha:** TestPass123!
3. **✅ Sucesso:** Você deve ser redirecionado para o dashboard

---

### TESTE 2: Visualizar Perfil Atual 👀
1. Clique no **avatar/nome do usuário** no canto superior direito
2. Clique em **"Editar Perfil"**
3. **✅ Verificar:**
   - Dialog abre com 2 abas: "Informações Pessoais" e "Segurança"
   - Campos estão preenchidos com dados atuais
   - Avatar mostra iniciais ou foto atual

---

### TESTE 3: Atualizar Dados Pessoais 📝
1. Na aba **"Informações Pessoais"**:
   - Altere o **Nome** para: "Rafael"
   - Altere o **Sobrenome** para: "Ribeiro"
   - Altere o **Telefone** para: "(34) 99999-1234"
   - Altere **Sobre você** para: "Desenvolvedor Full Stack"

2. Clique em **"Salvar Alterações"**

3. **✅ Verificar:**
   - Toast verde aparece: "Perfil atualizado com sucesso!"
   - Dialog fecha automaticamente
   - Nome no Header atualiza para "Rafael Ribeiro"

4. **🔄 Teste de Persistência:**
   - Pressione **F5** para recarregar a página
   - **✅ Verificar:** Nome ainda está "Rafael Ribeiro"

---

### TESTE 4: Upload de Avatar 📸

#### 4.1. Preparar uma imagem de teste:
- Baixe qualquer imagem da internet (JPG, PNG, GIF)
- Ou tire uma screenshot e salve como imagem

#### 4.2. Fazer upload:
1. Abra **"Editar Perfil"** novamente
2. Clique no **avatar** ou no botão **"Escolher Foto"**
3. Selecione a imagem que você preparou
4. **✅ Verificar:**
   - Mensagem: "Foto processada com sucesso"
   - Preview aparece com crop quadrado
   - Botão mostra "Salvando..." temporariamente

5. Clique em **"Salvar Alterações"**

6. **✅ Verificar:**
   - Toast verde: "Avatar atualizado!"
   - Toast verde: "Perfil atualizado com sucesso!"
   - Avatar no Header agora mostra a foto
   - Foto persiste após F5

---

### TESTE 5: Alterar Senha 🔒

1. Abra **"Editar Perfil"**
2. Vá para aba **"Segurança"**
3. Preencha os campos:
   - **Senha Atual:** TestPass123!
   - **Nova Senha:** NovaSenh@123
   - **Confirmar Nova Senha:** NovaSenh@123

4. **✅ Verificar em tempo real:**
   - Indicador de força da senha (deve mostrar "Forte")
   - Barra de progresso com 4 níveis
   - Validação de coincidência de senhas

5. Clique em **"Alterar Senha"**

6. **✅ Verificar:**
   - Toast verde: "Senha alterada com sucesso!"
   - Campos são limpos automaticamente

7. **🔄 Testar nova senha:**
   - Faça **logout** (menu do usuário → "Sair")
   - Tente login com senha antiga (TestPass123!) → **❌ Deve falhar**
   - Tente login com senha nova (NovaSenh@123) → **✅ Deve funcionar**

8. **⚠️ IMPORTANTE:** Volte a senha para TestPass123! para próximos testes:
   - Faça login com NovaSenh@123
   - Vá em "Editar Perfil" → "Segurança"
   - Altere de volta para TestPass123!

---

### TESTE 6: Validações de Erro ❌

#### 6.1. Senha muito curta:
1. Abra **"Editar Perfil"** → **"Segurança"**
2. Digite senha nova com apenas 5 caracteres
3. **✅ Verificar:**
   - Mensagem vermelha: "A senha deve ter no mínimo 8 caracteres"
   - Botão "Alterar Senha" está **desabilitado**

#### 6.2. Senhas não coincidem:
1. Nova senha: "SenhaForte123"
2. Confirmar senha: "SenhaForte456" (diferente)
3. **✅ Verificar:**
   - Mensagem vermelha: "As senhas não coincidem"
   - Botão "Alterar Senha" está **desabilitado**

#### 6.3. Arquivo muito grande:
1. Prepare um arquivo > 5MB (ou edite temporariamente o código)
2. Tente fazer upload
3. **✅ Verificar:**
   - Toast vermelho: "Erro ao carregar imagem"
   - Descrição: "O arquivo deve ter no máximo 5MB"

---

### TESTE 7: Estados de Loading ⏳

#### 7.1. Durante salvamento de perfil:
1. Altere qualquer campo
2. Clique em "Salvar Alterações"
3. **✅ Verificar (rápido!):**
   - Botão mostra **spinner** e texto "Salvando..."
   - Botão fica **desabilitado**
   - Botão "Cancelar" também fica **desabilitado**

#### 7.2. Durante upload de avatar:
1. Escolha uma imagem
2. **✅ Verificar:**
   - Botão "Escolher Foto" mostra **spinner** e "Processando..."
   - Overlay no avatar mostra **spinner**

#### 7.3. Durante alteração de senha:
1. Preencha os campos de senha
2. Clique em "Alterar Senha"
3. **✅ Verificar:**
   - Botão mostra **spinner** e texto "Alterando..."
   - Botão fica **desabilitado**

---

## 📊 Checklist Final

Marque conforme você testa:

- [ ] Login funciona com test@umc.com
- [ ] Dialog de edição de perfil abre
- [ ] Campos estão preenchidos corretamente
- [ ] Atualização de nome funciona
- [ ] Atualização de telefone funciona
- [ ] Atualização de bio funciona
- [ ] Upload de avatar funciona
- [ ] Preview de avatar aparece corretamente
- [ ] Avatar persiste no Header após salvar
- [ ] Avatar persiste após F5
- [ ] Alteração de senha funciona
- [ ] Nova senha permite login
- [ ] Validação de senha curta funciona
- [ ] Validação de senhas não coincidentes funciona
- [ ] Toast de sucesso aparece
- [ ] Toast de erro aparece (quando necessário)
- [ ] Spinners aparecem durante loading
- [ ] Botões são desabilitados durante ações
- [ ] Dados persistem após refresh

---

## 🐛 Problemas Comuns e Soluções

### ❌ "Network Error" ou "ERR_CONNECTION_REFUSED"
**Causa:** Backend não está rodando  
**Solução:**
```powershell
docker ps  # Verificar se container está UP
docker start traksense-api  # Se estiver parado
```

### ❌ "404 Not Found" ao acessar umc.localhost
**Causa:** DNS não configurado  
**Solução:** Verifique se `127.0.0.1 umc.localhost` está em `C:\Windows\System32\drivers\etc\hosts`

### ❌ "401 Unauthorized" após algumas ações
**Causa:** Token JWT expirou  
**Solução:** Faça logout e login novamente

### ❌ Avatar não aparece após upload
**Causa:** MinIO pode não estar configurado corretamente  
**Solução:** Verifique logs do container:
```powershell
docker logs traksense-api
```

### ❌ "CORS policy" error no console
**Causa:** Frontend está em porta diferente de 5000 ou 5173  
**Solução:** Reinicie o frontend com `npm run dev` e use a porta correta

---

## 🎯 Critério de Sucesso

**✅ TESTE PASSOU** se:
- Todos os 7 testes principais funcionam
- Pelo menos 15/19 itens do checklist estão marcados
- Nenhum erro crítico no console do navegador
- Dados persistem após refresh da página

**❌ TESTE FALHOU** se:
- Qualquer teste principal falha completamente
- Menos de 12/19 itens do checklist funcionam
- Erros 500 ou crashes do backend
- Dados não persistem após refresh

---

## 📸 O Que Esperar (Visual)

### Dialog de Edição de Perfil:
```
┌─────────────────────────────────────┐
│ 👤 Editar Perfil                    │
├─────────────────────────────────────┤
│ [Informações Pessoais] [Segurança] │
├─────────────────────────────────────┤
│                                     │
│   [Avatar]    Rafael Ribeiro        │
│               test@umc.com          │
│               [Escolher Foto]       │
│                                     │
│ ─────────────────────────────────   │
│                                     │
│ 👤 Nome: [Rafael____________]       │
│ 👤 Sobrenome: [Ribeiro_______]      │
│ ✉️  Email: [test@umc.com____]       │
│ 📞 Celular: [(34) 99999-1234]      │
│ 🏢 Sobre: [Desenvolvedor...]        │
│                                     │
│          [Cancelar] [Salvar ✓]     │
└─────────────────────────────────────┘
```

### Toast de Sucesso:
```
┌────────────────────────────────┐
│ ✅ Perfil atualizado com       │
│    sucesso!                    │
│    Suas informações foram      │
│    salvas.                     │
└────────────────────────────────┘
```

---

## ✅ Após Testar

Se tudo funcionou:
1. ✅ Marque a **Tarefa 11** como completa
2. ✅ Tire screenshots dos testes para documentação
3. ✅ Informe o desenvolvedor que está pronto para FASE 2
4. ✅ Faça backup do banco de dados (se necessário)

Se algo falhou:
1. ❌ Anote exatamente qual teste falhou
2. ❌ Copie a mensagem de erro do console
3. ❌ Tire screenshot do erro
4. ❌ Verifique os logs do backend: `docker logs traksense-api`
5. ❌ Relate os problemas para correção

---

**🎉 Boa sorte com os testes!**

**Tempo estimado:** 5-10 minutos  
**Dificuldade:** ⭐⭐ (Fácil)  
**Última atualização:** 2025-01-19
