# 🧪 Guia de Teste - Navegação Horizontal Responsiva

## 🎯 Como Testar a Responsividade

### **URL de Acesso:**
```
http://localhost:5001
```

---

## 📋 Checklist de Testes

### **1. Desktop Extra Large (≥ 1400px)**

**Como testar:**
1. Abra a aplicação em fullscreen
2. Redimensione janela para 1920px ou maior

**Comportamentos esperados:**
- ✅ Todos os 8 itens visíveis
- ✅ Labels completos em todos itens
- ❌ Sem botões de scroll
- ❌ Sem dropdown "Mais"
- ✅ Espaçamento confortável entre itens

**Itens visíveis:**
```
[Visão Geral] [Dashboard Custom] [Ativos] [Sensores] 
[Alertas] [Manutenção] [Relatórios] [Configurações]
```

---

### **2. Desktop Large (1200-1399px)**

**Como testar:**
1. Redimensione janela do navegador para ~1300px
2. Use DevTools Responsive Mode

**Comportamentos esperados:**
- ✅ 7 itens visíveis com labels
- ✅ Dropdown "Mais" aparece
- ✅ 1 item no dropdown (Configurações)
- ⚠️ Botões de scroll podem aparecer se necessário
- ✅ Layout ainda confortável

**Itens visíveis:**
```
[Visão Geral] [Dashboard Custom] [Ativos] [Sensores] 
[Alertas] [Manutenção] [Relatórios] [⋯ Mais ▼]
```

**No dropdown:**
```
⚙️ Configurações
```

---

### **3. Medium Screens (1024-1199px)**

**Como testar:**
1. Redimensione para 1100px
2. Teste em iPad Pro landscape

**Comportamentos esperados:**
- ✅ 6 itens visíveis com labels
- ✅ Dropdown "Mais" com 2 itens
- ✅ Botões de scroll aparecem se necessário
- ✅ Labels ainda legíveis
- ✅ Layout compacto mas funcional

**Itens visíveis:**
```
[Visão Geral] [Dashboard Custom] [Ativos] 
[Sensores] [Alertas] [Manutenção] [⋯ Mais ▼]
```

**No dropdown:**
```
📄 Relatórios
⚙️ Configurações
```

---

### **4. Tablet (768-1023px)**

**Como testar:**
1. Redimensione para 900px
2. Teste em iPad portrait
3. DevTools: iPad (768x1024)

**Comportamentos esperados:**
- ✅ 5 itens visíveis com labels
- ✅ Dropdown "Mais" com 3 itens
- ✅ Botões de scroll ativos
- ✅ Scroll horizontal suave funciona
- ✅ Labels compactos mas presentes

**Itens visíveis:**
```
[Visão Geral] [Dashboard Custom] [Ativos] 
[Sensores] [Alertas] [⋯ Mais ▼]
```

**No dropdown:**
```
🔧 Manutenção
📄 Relatórios
⚙️ Configurações
```

**Teste os botões de scroll:**
- ⬅️ Clique no botão esquerdo → scroll suave para esquerda
- ➡️ Clique no botão direito → scroll suave para direita
- ✅ Botões aparecem/desaparecem automaticamente

---

### **5. Small Tablet (640-767px)**

**Como testar:**
1. Redimensione para 700px
2. Teste em tablets pequenos

**Comportamentos esperados:**
- ✅ 4 itens visíveis (APENAS ÍCONES)
- ❌ Labels ocultos nos botões
- ✅ Dropdown "Mais" com 4 itens
- ✅ Botões de scroll bem visíveis
- ✅ Ícones grandes e clicáveis

**Itens visíveis:**
```
[🏠] [📊] [❄️] [📡] [⋯ Mais ▼]
```

**No dropdown:**
```
🔔 Alertas & Regras
🔧 Manutenção
📄 Relatórios
⚙️ Configurações
```

---

### **6. Mobile (< 640px)**

**Como testar:**
1. Redimensione para 375px (iPhone)
2. DevTools: iPhone 12/13/14
3. Teste em dispositivo real

**Comportamentos esperados:**
- ❌ Navegação horizontal **totalmente oculta**
- ✅ Botão hamburger (☰) visível no header
- ✅ Drawer lateral abre da esquerda
- ✅ Todos os 8 itens no drawer
- ✅ Labels completos e grandes
- ✅ Item ativo destacado em teal

**No hamburger menu:**
```
☰ [Clique aqui]
```

**Drawer lateral:**
```
Navegação
─────────────────
🏠 Visão Geral
📊 Dashboard Custom
❄️ Ativos (HVAC)
📡 Sensores & Telemetria
🔔 Alertas & Regras
🔧 Manutenção
📄 Relatórios
⚙️ Configurações
```

---

## 🎮 Testes Interativos

### **Teste 1: Botões de Scroll**

**Passos:**
1. Redimensione para 1024px
2. Observe os botões ⬅️ ➡️
3. Clique no botão direito
4. Veja o scroll suave acontecer
5. Clique no botão esquerdo
6. Retorne à posição inicial

**Resultado esperado:**
- ✅ Scroll acontece suavemente (300ms)
- ✅ Botões aparecem/desaparecem conforme scroll
- ✅ Não há "saltos" ou glitches

---

### **Teste 2: Dropdown "Mais"**

**Passos:**
1. Redimensione para 1200px
2. Veja o botão "⋯ Mais" aparecer
3. Clique no botão
4. Veja o dropdown abrir
5. Clique em "Configurações"
6. Navegue para a página

**Resultado esperado:**
- ✅ Dropdown abre suavemente
- ✅ Itens são clicáveis
- ✅ Navegação funciona
- ✅ Dropdown fecha após clique
- ✅ Item fica destacado na navegação

---

### **Teste 3: Resize Dinâmico**

**Passos:**
1. Comece em 1920px (fullscreen)
2. Vá redimensionando gradualmente
3. Observe as mudanças em tempo real
4. Volte a expandir

**Resultado esperado:**
- ✅ Itens desaparecem gradualmente
- ✅ Dropdown aparece quando necessário
- ✅ Botões de scroll aparecem/somem
- ✅ Sem layout quebrado em nenhum momento
- ✅ Transições suaves

---

### **Teste 4: Mobile Drawer**

**Passos:**
1. Redimensione para 375px (mobile)
2. Clique no ícone hamburger ☰
3. Veja o drawer abrir da esquerda
4. Navegue para "Alertas & Regras"
5. Veja o drawer fechar automaticamente
6. Confirme que está na página correta

**Resultado esperado:**
- ✅ Drawer abre suavemente (300ms)
- ✅ Overlay escurece o fundo
- ✅ Todos os itens visíveis
- ✅ Item ativo em destaque (fundo teal)
- ✅ Drawer fecha ao clicar em item
- ✅ Navegação funciona perfeitamente

---

### **Teste 5: Hover States**

**Passos:**
1. Em qualquer tamanho de tela
2. Passe o mouse sobre cada botão
3. Observe as mudanças visuais

**Resultado esperado:**
- ✅ Background muda para branco/70
- ✅ Texto fica teal (#076A75)
- ✅ Transição suave (150ms)
- ✅ Item ativo não muda no hover
- ✅ Cursor vira pointer

---

## 🐛 Testes de Edge Cases

### **Edge Case 1: Scroll no Limite**

**Cenário:**
- Usuário rola até o final à direita
- Clica no botão direito novamente

**Resultado esperado:**
- ✅ Botão direito desaparece
- ✅ Não há erro de scroll
- ✅ Scroll para no limite

---

### **Edge Case 2: Resize Rápido**

**Cenário:**
- Redimensionar janela rapidamente várias vezes

**Resultado esperado:**
- ✅ Layout se adapta sem travar
- ✅ Não há memory leaks
- ✅ Performance mantida

---

### **Edge Case 3: Muitas Abas Abertas**

**Cenário:**
- Abrir dropdown "Mais"
- Clicar fora sem selecionar

**Resultado esperado:**
- ✅ Dropdown fecha
- ✅ Nenhum item é navegado
- ✅ Estado mantido

---

## 📊 Tabela de Referência Rápida

| Largura | Itens | Labels | Scroll | Dropdown | Mobile |
|---------|-------|--------|--------|----------|--------|
| **1920px** | 8 | ✅ Sim | ❌ Não | ❌ Não | ❌ Não |
| **1400px** | 8 | ✅ Sim | ❌ Não | ❌ Não | ❌ Não |
| **1300px** | 7 | ✅ Sim | ⚠️ Talvez | ✅ Sim (1) | ❌ Não |
| **1100px** | 6 | ✅ Sim | ⚠️ Talvez | ✅ Sim (2) | ❌ Não |
| **900px** | 5 | ✅ Sim | ✅ Sim | ✅ Sim (3) | ❌ Não |
| **700px** | 4 | ❌ Não | ✅ Sim | ✅ Sim (4) | ❌ Não |
| **375px** | 0 | - | - | - | ✅ Sim |

---

## 🎯 Critérios de Sucesso

### **Visual:**
- [ ] Layout nunca quebra
- [ ] Itens sempre alinhados
- [ ] Espaçamento consistente
- [ ] Botões bem posicionados
- [ ] Dropdown alinhado à direita

### **Funcional:**
- [ ] Todos os itens acessíveis
- [ ] Navegação funciona em todos tamanhos
- [ ] Scroll suave
- [ ] Dropdown abre/fecha corretamente
- [ ] Mobile drawer completo

### **Performance:**
- [ ] Sem lag ao redimensionar
- [ ] Scroll fluido (60fps)
- [ ] Transições suaves
- [ ] Sem erros no console
- [ ] Memory leaks inexistentes

### **Acessibilidade:**
- [ ] Navegação por teclado funciona
- [ ] Aria labels corretos
- [ ] Focus visible
- [ ] Screen reader friendly
- [ ] Contraste adequado

---

## 🔧 Ferramentas de Teste

### **Chrome DevTools:**
```
1. F12 para abrir
2. Ctrl+Shift+M para modo responsivo
3. Selecione dispositivos:
   - Desktop: 1920x1080
   - Laptop: 1366x768
   - Tablet: iPad (768x1024)
   - Mobile: iPhone 12 (390x844)
```

### **Firefox Responsive Design:**
```
1. Ctrl+Shift+M
2. Teste em diferentes tamanhos
3. Use o slider de largura
```

### **Lighthouse (Performance):**
```
1. DevTools → Lighthouse
2. Mobile + Desktop
3. Verifique scores
```

---

## 📸 Screenshots Recomendados

### **Para documentação:**

1. **Desktop Full** (1920px)
   - Todos itens visíveis
   - Sem controles extras

2. **Desktop Medium** (1300px)
   - Dropdown "Mais" visível
   - 7 itens + dropdown

3. **Tablet** (900px)
   - Botões de scroll visíveis
   - 5 itens + dropdown

4. **Small Tablet** (700px)
   - Apenas ícones
   - Scroll buttons ativos

5. **Mobile Drawer** (375px)
   - Hamburger menu
   - Drawer aberto completo

6. **Hover State**
   - Item com hover ativo

7. **Active State**
   - Item selecionado destacado

8. **Dropdown Open**
   - Menu overflow expandido

---

## ✅ Resultado Final

Após passar por todos os testes, a navegação horizontal responsiva deve:

- ✅ Funcionar perfeitamente em **todos** os tamanhos de tela
- ✅ Manter **usabilidade completa** em todos breakpoints
- ✅ Ter **performance fluida** sem lag
- ✅ Apresentar **visual profissional** e polido
- ✅ Ser **acessível** (WCAG AA)

---

**Status dos Testes:** ⏳ **PRONTO PARA TESTAR**  
**Servidor:** `http://localhost:5001`  
**Versão:** 1.0.0
