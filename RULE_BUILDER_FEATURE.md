# ⚡ Construtor de Regras de Monitoramento

## 📋 Visão Geral

Sistema completo para criar, editar e gerenciar regras de monitoramento automático que geram alertas baseados em condições de equipamentos HVAC.

## 🎯 Funcionalidades Implementadas

### **1️⃣ Criação de Regras**
Interface visual para configurar regras de alerta com:
- ✅ Nome e descrição personalizados
- ✅ Seleção de tipo de equipamento
- ✅ Escolha de parâmetro a monitorar
- ✅ Operador de comparação
- ✅ Valor limite (threshold)
- ✅ Duração da condição
- ✅ Nível de severidade
- ✅ Ações automáticas ao disparar

### **2️⃣ Edição de Regras**
- ✅ Modificar qualquer parâmetro da regra
- ✅ Preview em tempo real da lógica
- ✅ Validação de campos obrigatórios

### **3️⃣ Gerenciamento de Regras**
- ✅ Listar todas as regras configuradas
- ✅ Ativar/Desativar regras via Switch
- ✅ Excluir regras
- ✅ Visualizar histórico de disparo
- ✅ Cards informativos com status

---

## 🏗️ Estrutura de uma Regra

### **Modelo de Dados:**
```typescript
interface MonitoringRule {
  id: string                    // Identificador único
  name: string                  // Nome da regra
  description: string           // Descrição do propósito
  enabled: boolean              // Ativa/Inativa
  assetType: string            // Tipo de equipamento
  parameter: string            // Parâmetro monitorado
  operator: string             // Operador (>, <, ==, >=, <=)
  threshold: number            // Valor limite
  unit: string                 // Unidade de medida
  duration: number             // Duração em minutos
  severity: string             // Critical/High/Medium/Low
  actions: string[]            // Lista de ações
  createdAt: Date              // Data de criação
  lastTriggered?: Date         // Último disparo
}
```

---

## 🎨 Tipos de Equipamentos Suportados

```typescript
1. AHU - Air Handling Unit
2. Chiller
3. VRF - Variable Refrigerant Flow
4. RTU - Rooftop Unit
5. Boiler
6. Cooling Tower
```

---

## 📊 Parâmetros Monitoráveis

| Parâmetro | Descrição | Unidade |
|-----------|-----------|---------|
| **temp_supply** | Temperatura de Fornecimento | °C |
| **temp_return** | Temperatura de Retorno | °C |
| **pressure_suction** | Pressão de Sucção | psi |
| **pressure_discharge** | Pressão de Descarga | psi |
| **dp_filter** | ΔP Filtro (diferencial) | Pa |
| **power_kw** | Consumo de Energia | kW |
| **vibration** | Vibração | mm/s |
| **humidity** | Umidade | % |
| **flow_rate** | Vazão | L/min |
| **speed_rpm** | Velocidade | RPM |

---

## 🔢 Operadores Disponíveis

```
>   Maior que
<   Menor que
==  Igual a
>=  Maior ou igual
<=  Menor ou igual
```

---

## 🚨 Níveis de Severidade

### **🔴 Crítico (Critical)**
- Cor: Vermelho
- Uso: Requer ação imediata
- Exemplos: Falha de equipamento, temperatura extrema

### **🟠 Alto (High)**
- Cor: Laranja
- Uso: Necessita atenção prioritária
- Exemplos: Consumo anormal, pressão alta

### **🟡 Médio (Medium)**
- Cor: Amarelo
- Uso: Atenção moderada necessária
- Exemplos: Manutenção próxima, filtro em alerta

### **🔵 Baixo (Low)**
- Cor: Azul
- Uso: Informativo
- Exemplos: Status normal, informações gerais

---

## 📧 Ações Automáticas

### **Tipos de Ações:**
```
✉️  Email        - Enviar notificação por email
📱  SMS          - Enviar mensagem de texto
🔔  Push         - Notificação no navegador/app
📝  Log          - Registrar no sistema de logs
🔗  Webhook      - Chamar endpoint HTTP externo
```

### **Configuração Multi-Ação:**
Uma regra pode executar **múltiplas ações simultaneamente** ao disparar.

---

## 🎯 Exemplos de Regras

### **Exemplo 1: Alta Pressão Chiller**
```yaml
Nome: Alta Pressão Chiller
Descrição: Alerta quando pressão de descarga excede limite
Equipamento: Chiller
Condição: Pressão de Descarga > 300 psi
Duração: 5 minutos
Severidade: Crítico
Ações: [Email, Push, Log]
```

**Lógica:**
> SE `pressure_discharge` > 300 psi por 5 minutos  
> ENTÃO gerar alerta CRÍTICO e executar: Email + Push + Log

---

### **Exemplo 2: ΔP Filtro Elevado**
```yaml
Nome: ΔP Filtro Elevado
Descrição: Necessidade de troca de filtro
Equipamento: AHU
Condição: ΔP Filtro > 250 Pa
Duração: 10 minutos
Severidade: Alto
Ações: [Email, Log]
```

**Lógica:**
> SE `dp_filter` > 250 Pa por 10 minutos  
> ENTÃO gerar alerta ALTO e executar: Email + Log

---

### **Exemplo 3: Baixa Temperatura**
```yaml
Nome: Baixa Temperatura
Descrição: Temperatura abaixo do setpoint
Equipamento: AHU
Condição: Temperatura Fornecimento < 10°C
Duração: 15 minutos
Severidade: Médio
Ações: [Push, Log]
```

**Lógica:**
> SE `temp_supply` < 10°C por 15 minutos  
> ENTÃO gerar alerta MÉDIO e executar: Push + Log

---

## 🎨 Interface do Usuário

### **Listagem de Regras**

```
┌─────────────────────────────────────────────────────┐
│  ⚡ Construtor de Regras        [+ Nova Regra]     │
│  Configure regras de monitoramento...               │
├─────────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────────┐  │
│  │ Alta Pressão Chiller  [Ativa] [Crítico]      │  │
│  │ Alerta quando pressão excede limite          │  │
│  │ [Chiller] → pressure_discharge > 300 psi...  │  │
│  │ Criada: 15/09/2024  Último: 08/10/2024       │  │
│  │                                    [⚫][⋮]    │  │
│  └───────────────────────────────────────────────┘  │
│                                                      │
│  ┌───────────────────────────────────────────────┐  │
│  │ ΔP Filtro Elevado  [Ativa] [Alto]           │  │
│  │ Necessidade de troca de filtro               │  │
│  │ [AHU] → dp_filter > 250 Pa por 10 min       │  │
│  │ Criada: 20/09/2024  Último: 09/10/2024       │  │
│  │                                    [⚫][⋮]    │  │
│  └───────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

### **Dialog de Criação/Edição**

```
┌─────────────────────────────────────────┐
│  ⚡ Nova Regra de Monitoramento    [X] │
│  Configure os parâmetros...            │
├─────────────────────────────────────────┤
│  Nome da Regra *                       │
│  [Alta Pressão Chiller____________]    │
│                                        │
│  Descrição                             │
│  [Alerta quando...________________]    │
│                                        │
│  ──────────────────────────────────    │
│                                        │
│  Tipo de Ativo *                       │
│  [Chiller ▼]                           │
│                                        │
│  Parâmetro a Monitorar *               │
│  [Pressão de Descarga (psi) ▼]        │
│                                        │
│  Operador    Valor Limite *            │
│  [> ▼]       [300_________]            │
│                                        │
│  Duração (minutos)                     │
│  [5___]                                │
│                                        │
│  ──────────────────────────────────    │
│                                        │
│  Severidade do Alerta                  │
│  [Crítico] [Alto] [Médio] [Baixo]     │
│                                        │
│  Ações ao Disparar                     │
│  ☑ Enviar Email                        │
│  ☑ Notificação Push                    │
│  ☑ Registrar no Log                    │
│  ☐ Enviar SMS                          │
│  ☐ Webhook                             │
│                                        │
│  ──────────────────────────────────    │
│                                        │
│  Preview da Regra:                     │
│  SE Pressão de Descarga > 300 psi      │
│  por 5 minutos                         │
│  ENTÃO gerar alerta Crítico            │
│                                        │
├─────────────────────────────────────────┤
│              [Cancelar] [✓ Criar Regra]│
└─────────────────────────────────────────┘
```

---

## 🔧 Funcionalidades Detalhadas

### **Criar Nova Regra**
```typescript
1. Clicar em "Nova Regra"
2. Preencher formulário:
   - Nome (obrigatório)
   - Descrição (opcional)
   - Tipo de Ativo (obrigatório)
   - Parâmetro (obrigatório)
   - Operador (padrão: >)
   - Valor Limite (obrigatório)
   - Duração (padrão: 5 min)
   - Severidade (padrão: Medium)
   - Ações (mínimo 1)
3. Visualizar preview da lógica
4. Clicar em "Criar Regra"
5. Toast de confirmação
6. Regra aparece na lista (ativa)
```

### **Editar Regra Existente**
```typescript
1. Clicar no menu "⋮" da regra
2. Selecionar "Editar"
3. Dialog abre com dados preenchidos
4. Modificar campos desejados
5. Clicar em "Salvar Alterações"
6. Toast de confirmação
7. Regra atualizada na lista
```

### **Ativar/Desativar Regra**
```typescript
1. Usar o Switch (⚫) no card da regra
2. Toggle entre Ativa/Inativa
3. Toast de confirmação
4. Card visual muda (opacidade)
5. Badge atualizado
```

### **Excluir Regra**
```typescript
1. Clicar no menu "⋮" da regra
2. Selecionar "Excluir" (texto vermelho)
3. Regra removida da lista
4. Toast de confirmação
```

---

## 🎯 Validações Implementadas

### **Campos Obrigatórios:**
```
✓ Nome da regra
✓ Tipo de ativo
✓ Parâmetro
✓ Valor limite
```

### **Validação de Formulário:**
```typescript
if (!name || !assetType || !parameter || !threshold) {
  toast.error('Campos obrigatórios')
  return // Não salva
}
```

### **Feedback Visual:**
- 🔴 Campos vazios: Falta preencher
- 🟢 Preview: Mostra lógica em tempo real
- 📝 Toast: Confirmação de todas as ações

---

## 📊 Dados Mock Incluídos

### **3 Regras de Exemplo:**

**1. Alta Pressão Chiller**
- ✅ Ativa
- 🔴 Crítico
- Último disparo: 08/10/2024

**2. ΔP Filtro Elevado**
- ✅ Ativa
- 🟠 Alto
- Último disparo: 09/10/2024

**3. Baixa Temperatura**
- ❌ Inativa
- 🟡 Médio
- Nunca disparou

---

## 💻 Arquitetura Técnica

### **Componente Principal**
```typescript
// src/components/alerts/RuleBuilder.tsx
export const RuleBuilder: React.FC
```

### **Estado Local**
```typescript
const [rules, setRules] = useState<MonitoringRule[]>([...])
const [isDialogOpen, setIsDialogOpen] = useState(false)
const [editingRule, setEditingRule] = useState<MonitoringRule | null>(null)
const [formData, setFormData] = useState({...})
```

### **Operações CRUD**
```typescript
handleCreateRule()    // Abre dialog vazio
handleEditRule(rule)  // Abre dialog preenchido
handleSaveRule()      // Cria ou atualiza
handleDeleteRule(id)  // Remove da lista
handleToggleRule(id)  // Ativa/desativa
```

---

## 🎨 Componentes shadcn/ui Utilizados

```typescript
✅ Dialog, DialogContent, DialogHeader, DialogFooter
✅ Button
✅ Input
✅ Label
✅ Select, SelectContent, SelectItem, SelectTrigger
✅ Badge
✅ Switch
✅ Separator
✅ ScrollArea
✅ DropdownMenu, DropdownMenuItem
```

### **Ícones Lucide React**
```typescript
Plus, Trash2, Edit, Activity, AlertTriangle,
CheckCircle2, Zap, Clock, TrendingUp, TrendingDown,
Equal, MoreVertical
```

---

## 🧪 Como Testar

### **1. Criar Nova Regra**
```bash
✓ Clicar "Nova Regra"
✓ Preencher nome: "Teste Alta Vibração"
✓ Selecionar Ativo: "Chiller"
✓ Selecionar Parâmetro: "Vibração (mm/s)"
✓ Operador: ">"
✓ Valor: "10"
✓ Duração: "3"
✓ Severidade: "Alto"
✓ Ações: Email + Push
✓ Ver preview atualizar
✓ Clicar "Criar Regra"
✓ Ver toast de sucesso
✓ Ver regra na lista
```

### **2. Editar Regra Existente**
```bash
✓ Clicar "⋮" em "Alta Pressão Chiller"
✓ Clicar "Editar"
✓ Mudar valor limite: 300 → 350
✓ Adicionar ação: SMS
✓ Clicar "Salvar Alterações"
✓ Ver toast de sucesso
✓ Ver mudanças no card
```

### **3. Ativar/Desativar**
```bash
✓ Clicar Switch da regra "Baixa Temperatura"
✓ Ver toast: "Regra ativada"
✓ Ver badge mudar para "Ativa"
✓ Ver card ficar opaco ao desativar
```

### **4. Excluir Regra**
```bash
✓ Clicar "⋮" em qualquer regra
✓ Clicar "Excluir" (vermelho)
✓ Ver toast: "Regra removida"
✓ Regra desaparece da lista
```

---

## 🔄 Fluxo de Trabalho Típico

### **Cenário: Monitorar Consumo de Energia**

```
1. Operador identifica necessidade
   "Quero saber quando Chillers gastam muito"

2. Abre Alertas & Regras → Construtor de Regras

3. Clica "Nova Regra"

4. Preenche:
   Nome: "Consumo Excessivo Chiller"
   Descrição: "Alerta de consumo anormal"
   Ativo: Chiller
   Parâmetro: Consumo de Energia (kW)
   Condição: > 500 kW
   Duração: 20 minutos
   Severidade: Médio
   Ações: Email + Log

5. Revisa preview:
   "SE Consumo de Energia > 500 kW por 20 minutos
    ENTÃO gerar alerta Médio"

6. Clica "Criar Regra"

7. Regra ativa e monitorando
   Quando condição for atendida → Alerta gerado
```

---

## 📝 TODO - Próximos Passos

### **Backend Integration**
```typescript
// APIs a implementar

// Listar regras
GET /api/monitoring/rules

// Criar regra
POST /api/monitoring/rules
{
  name: string,
  assetType: string,
  parameter: string,
  operator: string,
  threshold: number,
  duration: number,
  severity: string,
  actions: string[]
}

// Atualizar regra
PUT /api/monitoring/rules/:id

// Deletar regra
DELETE /api/monitoring/rules/:id

// Ativar/Desativar
PATCH /api/monitoring/rules/:id/toggle

// Histórico de disparos
GET /api/monitoring/rules/:id/triggers
```

### **Funcionalidades Futuras**
```typescript
// Lógica Avançada
- [ ] Regras compostas (AND/OR)
- [ ] Múltiplas condições
- [ ] Faixas de valores (entre X e Y)
- [ ] Comparação com média histórica
- [ ] Rate of change (taxa de variação)

// Ações Avançadas
- [ ] Escalonamento de alertas
- [ ] Ações sequenciais com delay
- [ ] Script customizado
- [ ] Integração com CMMS
- [ ] Criar ticket automaticamente

// UI/UX
- [ ] Drag & drop para reordenar
- [ ] Filtros e busca de regras
- [ ] Tags e categorias
- [ ] Duplicar regra
- [ ] Importar/Exportar regras (JSON)
- [ ] Template de regras comuns
- [ ] Wizard step-by-step
- [ ] Modo avançado (código)

// Analytics
- [ ] Dashboard de efetividade
- [ ] Taxa de disparo por regra
- [ ] Falsos positivos
- [ ] Tempo médio de resolução
- [ ] Heatmap de alertas

// Testes
- [ ] Testar regra antes de salvar
- [ ] Simular com dados históricos
- [ ] Modo sandbox
```

---

## 🎯 Benefícios do Sistema

### **Para Operadores:**
- ⚡ Alertas proativos automáticos
- 🎯 Configuração visual intuitiva
- 🔄 Flexibilidade total
- 📊 Visão clara das regras ativas

### **Para Gestores:**
- 📈 Monitoramento 24/7 automatizado
- 💰 Redução de custos operacionais
- 🛡️ Prevenção de falhas críticas
- 📋 Auditoria completa

### **Para Técnicos:**
- 🔧 Manutenção preventiva eficiente
- 📱 Notificações em tempo real
- 🗂️ Histórico de eventos
- 🎯 Priorização inteligente

---

## ✅ Status Final

- ✅ **Interface completa e funcional**
- ✅ **CRUD completo de regras**
- ✅ **10 parâmetros monitoráveis**
- ✅ **6 tipos de equipamentos**
- ✅ **4 níveis de severidade**
- ✅ **5 tipos de ações**
- ✅ **Validações implementadas**
- ✅ **Feedback com toasts**
- ✅ **Preview em tempo real**
- ✅ **Responsivo e acessível**
- ⏳ **Aguardando integração backend**

---

**Desenvolvido para TrakSense HVAC Monitoring Platform** 🏢❄️

*Construtor de Regras - Monitoramento Inteligente e Automático!* ⚡🎯
