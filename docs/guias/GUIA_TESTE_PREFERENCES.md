# 🧪 Guia de Teste - Preferências de Regionalização

**⏱️ Tempo estimado:** 3 minutos  
**🎯 Objetivo:** Validar seleção de idioma e fuso horário

---

## 📋 Pré-requisitos

- ✅ Backend rodando (docker traksense-api)
- ✅ Frontend rodando (npm run dev)
- ✅ Login funcionando

---

## 🧪 Roteiro de Teste

### TESTE 1: Abrir Preferências ✅

1. Faça login com **test@umc.com** / **TestPass123!**
2. Clique no **avatar/nome** no canto superior direito
3. Clique em **"Preferências"**
4. **✅ Verificar:**
   - Dialog abre com título "Preferências"
   - Existem 2 abas: **"Notificações"** e **"Regionalização"**

---

### TESTE 2: Verificar Valores Atuais 👀

1. Clique na aba **"Regionalização"**
2. **✅ Verificar:**
   - Campo "Idioma da Interface" existe
   - Campo "Fuso Horário" existe
   - Valores atuais estão selecionados:
     - Idioma: 🇧🇷 Português (Brasil)
     - Timezone: Brasília (GMT-3)
   - Box cinza mostra "Horário local atual" com data/hora

---

### TESTE 3: Alterar Idioma 🌐

1. Clique no select de **"Idioma da Interface"**
2. Selecione **🇺🇸 English (US)**
3. **✅ Verificar:**
   - Seleção muda para English (US)
   - Dropdown fecha

4. Clique em **"Salvar Preferências"**
5. **✅ Verificar:**
   - Botão mostra spinner e "Salvando..."
   - Toast verde: "Preferências salvas!"
   - Dialog fecha

6. **🔄 Teste de persistência:**
   - Abra "Preferências" novamente
   - Vá para aba "Regionalização"
   - **✅ Idioma está "English (US)"** ✅

7. **Restaure para português:**
   - Selecione 🇧🇷 Português (Brasil)
   - Clique "Salvar Preferências"

---

### TESTE 4: Alterar Fuso Horário 🕐

1. Abra **"Preferências"** → **"Regionalização"**
2. Clique no select de **"Fuso Horário"**
3. **✅ Verificar:** Lista com múltiplos timezones aparece

4. Selecione **"Tokyo (GMT+9)"**
5. **✅ Verificar:** 
   - Box de preview atualiza imediatamente
   - Horário mostrado é diferente (12h de diferença)
   - Exemplo: Se no Brasil são 14:30, em Tokyo são 02:30

6. Clique em **"Salvar Preferências"**
7. **✅ Verificar:**
   - Toast verde: "Preferências salvas!"
   - Dialog fecha

8. **🔄 Teste de persistência:**
   - Abra "Preferências" novamente
   - **✅ Timezone está "Tokyo (GMT+9)"** ✅

9. **Restaure para Brasília:**
   - Selecione "Brasília (GMT-3)"
   - Clique "Salvar Preferências"

---

### TESTE 5: Testar Todos os Idiomas 🇧🇷🇺🇸🇪🇸

1. Teste cada idioma disponível:
   - 🇧🇷 Português (Brasil)
   - 🇺🇸 English (US)
   - 🇪🇸 Español

2. Para cada um:
   - Selecione
   - Salve
   - Reabra preferências
   - **✅ Verifique que persistiu**

---

### TESTE 6: Testar Timezones do Brasil 🇧🇷

1. Teste timezones brasileiros:
   - Brasília (GMT-3)
   - Manaus (GMT-4)
   - Fortaleza (GMT-3)
   - Recife (GMT-3)
   - Fernando de Noronha (GMT-2)

2. Para cada um:
   - Observe o preview de horário mudar
   - **✅ Verifique que o horário é diferente**

---

### TESTE 7: Restaurar Padrões 🔄

1. Altere idioma para **English**
2. Altere timezone para **Tokyo**
3. Clique em **"Restaurar Padrões"**
4. **✅ Verificar:**
   - Toast: "Preferências restauradas"
   - Idioma volta para pt-br (ou valor original)
   - Timezone volta para America/Sao_Paulo (ou valor original)
   - **NÃO salva automaticamente** (precisa clicar "Salvar")

---

### TESTE 8: Cancelar Alterações ❌

1. Altere idioma e timezone
2. Clique em **"Cancelar"**
3. **✅ Verificar:**
   - Dialog fecha
   - Alterações são descartadas
4. Reabra preferências
5. **✅ Verificar:** Valores originais estão lá

---

### TESTE 9: Loading States ⏳

1. Altere qualquer configuração
2. Clique em "Salvar Preferências"
3. **✅ Verificar (rápido!):**
   - Botão "Salvar" mostra spinner
   - Texto muda para "Salvando..."
   - Botões ficam desabilitados
   - Após 1-2 segundos, dialog fecha

---

### TESTE 10: Preview de Horário em Tempo Real 🕐

1. Abra "Preferências" → "Regionalização"
2. Note o horário atual no box de preview
3. Mude para diferentes timezones:
   - **Brasília (GMT-3):** Ex: 14:30
   - **Manaus (GMT-4):** Ex: 13:30 (1h a menos)
   - **Tokyo (GMT+9):** Ex: 02:30 (12h a mais)
   - **London (GMT+0):** Ex: 17:30 (3h a mais)

4. **✅ Verificar:** 
   - Horário atualiza instantaneamente ao mudar timezone
   - Formato: `18/10/2025, 14:30:45`

---

## 📊 Checklist Final

Marque conforme você testa:

- [ ] Dialog de preferências abre
- [ ] Aba "Regionalização" existe
- [ ] Select de idioma funciona
- [ ] Select de timezone funciona
- [ ] Preview de horário aparece
- [ ] Preview atualiza ao mudar timezone
- [ ] Botão "Salvar" funciona
- [ ] Toast de sucesso aparece
- [ ] Idioma persiste após F5
- [ ] Timezone persiste após F5
- [ ] Botão "Restaurar Padrões" funciona
- [ ] Botão "Cancelar" descarta alterações
- [ ] Estados de loading aparecem
- [ ] Todos os 3 idiomas funcionam
- [ ] Todos os 10 timezones funcionam

---

## 🎯 Critério de Sucesso

**✅ TESTE PASSOU** se:
- Todos os 10 testes principais passam
- Pelo menos 12/15 itens do checklist marcados
- Valores persistem após refresh
- Preview de horário funciona corretamente

**❌ TESTE FALHOU** se:
- Qualquer teste principal falha completamente
- Valores não persistem
- Erros no console do navegador

---

## 🐛 Problemas Comuns

### ❌ Valores não persistem após F5
**Causa:** Backend não está salvando  
**Solução:** Verifique logs do backend: `docker logs traksense-api`

### ❌ Preview de horário não atualiza
**Causa:** JavaScript timezone inválido  
**Solução:** Verifique se timezone está no formato IANA correto

### ❌ Select não abre
**Causa:** Componente Select não importado  
**Solução:** Verificar erros no console do navegador

---

## 📸 Visual Esperado

### Aba "Regionalização"

```
┌──────────────────────────────────────┐
│ [Notificações] [Regionalização]      │
├──────────────────────────────────────┤
│                                      │
│ 🌐 Idioma da Interface               │
│ ────────────────────────────────────│
│ Escolha o idioma que será usado...   │
│                                      │
│ ┌──────────────────────────────────┐ │
│ │ 🇧🇷 Português (Brasil)         ▼ │ │
│ └──────────────────────────────────┘ │
│                                      │
│ ─────────────────────────────────────│
│                                      │
│ 🕐 Fuso Horário                      │
│ ────────────────────────────────────│
│ Defina seu fuso horário para...     │
│                                      │
│ ┌──────────────────────────────────┐ │
│ │ Brasília (GMT-3)               ▼ │ │
│ │ Brasil                            │ │
│ └──────────────────────────────────┘ │
│                                      │
│ ┌──────────────────────────────────┐ │
│ │ ℹ️ Horário local atual:           │ │
│ │ 18/10/2025, 14:30:45             │ │
│ └──────────────────────────────────┘ │
│                                      │
└──────────────────────────────────────┘

[Restaurar Padrões] [Cancelar] [Salvar]
```

---

## ✅ Após Testar

Se tudo funcionou:
- ✅ Marque como completo
- ✅ Informe que está pronto para testes E2E completos
- ✅ Prossiga para última validação

Se algo falhou:
- ❌ Anote exatamente qual teste falhou
- ❌ Copie erro do console
- ❌ Tire screenshot
- ❌ Relate para correção

---

**🎉 Boa sorte!**

**Tempo:** 3 minutos  
**Dificuldade:** ⭐ (Muito Fácil)
