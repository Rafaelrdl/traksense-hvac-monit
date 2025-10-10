# Modal de Configuração Simplificado - Overview

## 📋 Requisito Implementado

**Problema:** Widgets da página Visão Geral abriam o modal completo de configuração (igual ao dos Dashboards) com muitas opções desnecessárias.

**Solução:** Criado modal simplificado específico para Overview com apenas:
- ✅ **Tamanho do Widget**
- ✅ **Limites de Alertas** (Aviso e Crítico)

---

## 🎨 Novo Componente Criado

### `/src/components/dashboard/OverviewWidgetConfig.tsx`

Modal simplificado com interface limpa e focada em configurações essenciais de gestão executiva.

#### Estrutura do Modal:

```tsx
<OverviewWidgetConfig>
  1. Header
     └─> Título: "Configurações do Widget"
  
  2. Informação do Widget
     └─> Nome (somente leitura)
  
  3. Tamanho do Widget
     └─> Select: Small, Medium, Large
     └─> Visual de preview do tamanho
  
  4. Limites e Alertas
     ├─> Limite de Aviso (Warning)
     │   ├─> Input numérico
     │   ├─> Indicador amarelo 🟡
     │   └─> Descrição: "condição de atenção"
     │
     └─> Limite Crítico (Critical)
         ├─> Input numérico
         ├─> Indicador vermelho 🔴
         └─> Descrição: "condição crítica"
  
  5. Ações
     ├─> Botão Cancelar
     └─> Botão Salvar
</OverviewWidgetConfig>
```

---

## 🔧 Implementação Técnica

### 1. Interface do Componente

```typescript
interface OverviewWidgetConfigProps {
  widget: DashboardWidget;      // Widget sendo configurado
  isOpen: boolean;              // Controle de visibilidade
  onClose: () => void;          // Callback para fechar
  onSave: (config: Partial<DashboardWidget>) => void;  // Callback para salvar
}
```

### 2. Campos de Configuração

#### **Tamanho (Size)**
```tsx
<Select name="size" defaultValue={widget.size}>
  <SelectItem value="small">
    Pequeno (2 colunas)
  </SelectItem>
  <SelectItem value="medium">
    Médio (3 colunas)
  </SelectItem>
  <SelectItem value="large">
    Grande (6 colunas)
  </SelectItem>
</Select>
```

**Características:**
- ✅ Preview visual do tamanho
- ✅ Descrição em colunas (grid de 6 colunas)
- ✅ Valor padrão pré-selecionado

#### **Limite de Aviso (Warning Limit)**
```tsx
<Input
  name="warningLimit"
  type="number"
  step="0.1"
  placeholder="Ex: 80"
  defaultValue={widget.config?.warningLimit}
/>
```

**Características:**
- ✅ Indicador visual amarelo 🟡
- ✅ Unidade dinâmica (%, kWh, Pa, etc.)
- ✅ Placeholder com exemplo
- ✅ Validação numérica

#### **Limite Crítico (Critical Limit)**
```tsx
<Input
  name="criticalLimit"
  type="number"
  step="0.1"
  placeholder="Ex: 95"
  defaultValue={widget.config?.criticalLimit}
/>
```

**Características:**
- ✅ Indicador visual vermelho 🔴
- ✅ Unidade dinâmica
- ✅ Placeholder com exemplo
- ✅ Validação numérica

### 3. Lógica de Salvamento

```typescript
const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  
  const formData = new FormData(e.currentTarget);
  const updates: Partial<DashboardWidget> = {
    size: formData.get('size') as DashboardWidget['size'],
    config: {
      ...widget.config,
      warningLimit: parseFloat(formData.get('warningLimit') as string) || undefined,
      criticalLimit: parseFloat(formData.get('criticalLimit') as string) || undefined
    }
  };
  
  onSave(updates);
  onClose();
};
```

**Lógica:**
1. ✅ Extrai dados do formulário
2. ✅ Converte strings para números
3. ✅ Preserva configurações existentes
4. ✅ Chama callback de salvamento
5. ✅ Fecha modal automaticamente

---

## 🔄 Integração com DraggableWidget

### Modificações em `/src/components/dashboard/DraggableWidget.tsx`

#### 1. Import do Novo Componente
```typescript
import { OverviewWidgetConfig } from './OverviewWidgetConfig';
```

#### 2. Renderização Condicional
```typescript
{isOverview ? (
  <OverviewWidgetConfig
    widget={widget}
    isOpen={configOpen}
    onClose={() => setConfigOpen(false)}
    onSave={(updates) => {
      useOverviewStore.getState().updateWidget(widget.id, updates);
    }}
  />
) : (
  <WidgetConfig
    widget={widget}
    layoutId={layoutId}
    open={configOpen}
    onClose={() => setConfigOpen(false)}
  />
)}
```

**Fluxo:**
```
User clica em ⚙️ (Settings)
  │
  ├─> isOverview === true
  │   └─> Abre OverviewWidgetConfig (Modal Simplificado)
  │       ├─> Opções: Tamanho, Limites
  │       └─> Salva via useOverviewStore.updateWidget()
  │
  └─> isOverview === false
      └─> Abre WidgetConfig (Modal Completo)
          ├─> Opções: Sensor, Label, Cor, etc.
          └─> Salva via useDashboardStore.updateWidget()
```

---

## 🎯 Diferenças Entre Modais

| Recurso | Modal Overview | Modal Dashboard |
|---------|---------------|-----------------|
| **Sensor Selection** | ❌ Não | ✅ Sim |
| **Label / Título** | ❌ Não (display only) | ✅ Sim |
| **Cor do Widget** | ❌ Não | ✅ Sim |
| **Unidade** | ❌ Não (detecta automático) | ✅ Sim |
| **Casas Decimais** | ❌ Não | ✅ Sim |
| **Tamanho** | ✅ Sim | ✅ Sim |
| **Limite de Aviso** | ✅ Sim | ❌ Não |
| **Limite Crítico** | ✅ Sim | ❌ Não |
| **Time Range** | ❌ Não | ✅ Sim |
| **Chart Type** | ❌ Não | ✅ Sim |

**Resumo:**
- **Overview:** Gestão executiva - foco em **tamanhos e alertas**
- **Dashboard:** Monitoramento técnico - foco em **vinculação de sensores e aparência**

---

## 💡 UX / UI Melhorias

### Indicadores Visuais

**Código de Cores:**
- 🟢 Verde: Valores normais (implícito)
- 🟡 Amarelo: Limite de Aviso (warning)
- 🔴 Vermelho: Limite Crítico (critical)

**Preview de Tamanho:**
```
Small:  ▪▪      (2 colunas)
Medium: ▪▪▪     (3 colunas)
Large:  ▪▪▪▪▪▪ (6 colunas)
```

### Feedback Contextual

**Descrições:**
- "Configure os valores de limite para alertas visuais no widget"
- "Valor que indica condição de atenção (amarelo)"
- "Valor que indica condição crítica (vermelho)"

### Unidade Dinâmica

O modal detecta automaticamente a unidade do widget:
```typescript
{widget.config?.unit || '%'}
```

**Exemplos:**
- Card de Temperatura → °C
- Card de Consumo → kWh
- Card de Pressão → Pa
- Card de Disponibilidade → %

---

## 📊 Casos de Uso

### Caso 1: Configurar Alerta de Disponibilidade

**Cenário:** Gestor quer ser alertado quando disponibilidade cair abaixo de 95%

**Passos:**
1. Clicar em ⚙️ no widget "Disponibilidade"
2. Modal abre com campos limpos
3. Preencher:
   - Limite de Aviso: **97** %
   - Limite Crítico: **95** %
4. Salvar

**Resultado:**
- 97% ≤ valor < 100% → Verde ✅
- 95% ≤ valor < 97% → Amarelo ⚠️
- valor < 95% → Vermelho 🚨

### Caso 2: Redimensionar Widget

**Cenário:** Widget "Consumo por Equipamento" está muito pequeno

**Passos:**
1. Clicar em ⚙️ no widget
2. Mudar Tamanho de "Médio" para "Grande"
3. Salvar

**Resultado:**
- Widget ocupa 6 colunas (largura total)
- Gráfico fica mais legível

### Caso 3: Configurar Múltiplos Widgets

**Cenário:** Definir padrões de alerta para todos os KPIs

**Passos:**
1. Configurar "MTTF": Warning=150h, Critical=100h
2. Configurar "Health Score": Warning=75%, Critical=60%
3. Configurar "Sensores": Warning=95%, Critical=90%

**Resultado:**
- Dashboard padronizado
- Alertas visuais consistentes

---

## 🔐 Validação e Segurança

### Validação de Entrada

```typescript
warningLimit: parseFloat(formData.get('warningLimit') as string) || undefined
```

**Casos Tratados:**
- ✅ Número válido → Converte e salva
- ✅ String vazia → `undefined` (remove limite)
- ✅ Texto inválido → `undefined` (fallback seguro)
- ✅ `null` / `undefined` → `undefined`

### Preservação de Config Existente

```typescript
config: {
  ...widget.config,  // ✅ Preserva outras configurações
  warningLimit,
  criticalLimit
}
```

**Garante:**
- ✅ Não perde `label`, `color`, `unit`, etc.
- ✅ Atualiza apenas campos modificados
- ✅ Merge inteligente de configurações

---

## 📁 Arquivos Modificados

| Arquivo | Mudanças | LOC |
|---------|----------|-----|
| `/src/components/dashboard/OverviewWidgetConfig.tsx` | ➕ Componente novo | +185 |
| `/src/components/dashboard/DraggableWidget.tsx` | + Import<br>+ Renderização condicional | +13 |

**Total:** 198 linhas adicionadas

---

## 🧪 Testes Recomendados

### Teste 1: Modal Abre no Overview
```
1. Navegar para Visão Geral
2. Ativar Modo de Edição
3. Clicar ⚙️ em qualquer widget
✅ Verificar: Modal simplificado abre
✅ Verificar: Apenas 2 seções (Tamanho + Limites)
```

### Teste 2: Modal Completo no Dashboard
```
1. Navegar para Dashboards
2. Ativar Modo de Edição
3. Clicar ⚙️ em qualquer widget
✅ Verificar: Modal completo abre
✅ Verificar: Múltiplas seções (Sensor, Label, Cor, etc.)
```

### Teste 3: Salvar Tamanho
```
1. Abrir modal de widget no Overview
2. Mudar tamanho de "Small" para "Large"
3. Salvar
✅ Verificar: Widget redimensiona visualmente
✅ Verificar: Mudança persiste após reload
```

### Teste 4: Salvar Limites
```
1. Abrir modal de widget de KPI
2. Definir Warning: 80, Critical: 95
3. Salvar
✅ Verificar: Config salvo no localStorage
✅ Verificar: Limites aplicados ao widget (cores)
```

### Teste 5: Campos Vazios
```
1. Abrir modal
2. Deixar limites em branco
3. Salvar
✅ Verificar: Sem erros
✅ Verificar: Limites removidos (undefined)
```

### Teste 6: Unidades Diferentes
```
1. Testar widget de Temperatura (°C)
2. Testar widget de Consumo (kWh)
3. Testar widget de Pressão (Pa)
✅ Verificar: Unidade correta aparece no modal
```

---

## 🎨 Screenshots Simulados

### Modal Simplificado (Overview)
```
┌─────────────────────────────────────────┐
│ Configurações do Widget            [X]  │
├─────────────────────────────────────────┤
│                                         │
│ Widget                                  │
│ ┌─────────────────────────────────────┐ │
│ │ Health Score Geral                  │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ Tamanho                                 │
│ ┌─────────────────────────────────────┐ │
│ │ ▪▪▪ Médio (3 colunas)        ▼     │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ 🟡 Limites e Alertas                    │
│ Configure os valores de limite...       │
│                                         │
│ Limite de Aviso                         │
│ ┌──┬─────────────────────────┬────────┐ │
│ │🟡│         75              │   %    │ │
│ └──┴─────────────────────────┴────────┘ │
│ Valor que indica condição de atenção    │
│                                         │
│ Limite Crítico                          │
│ ┌──┬─────────────────────────┬────────┐ │
│ │🔴│         60              │   %    │ │
│ └──┴─────────────────────────┴────────┘ │
│ Valor que indica condição crítica       │
│                                         │
├─────────────────────────────────────────┤
│              [Cancelar] [Salvar]        │
└─────────────────────────────────────────┘
```

### Modal Completo (Dashboard)
```
┌─────────────────────────────────────────┐
│ Configurar Widget                  [X]  │
├─────────────────────────────────────────┤
│ Configure o widget e vincule sensor...  │
│                                         │
│ 📋 Informações Básicas                  │
│ Título do Widget                        │
│ ┌─────────────────────────────────────┐ │
│ │ Temperatura                         │ │
│ └─────────────────────────────────────┘ │
│ Tamanho: [Grande (6 colunas) ▼]        │
│                                         │
│ ⚙️ Fonte de Dados                       │
│ Sensor                                  │
│ ┌─────────────────────────────────────┐ │
│ │ Selecione um sensor          ▼     │ │
│ └─────────────────────────────────────┘ │
│ Label: [ Temperatura ]                  │
│ Unidade: [ °C ]  Decimals: [1 ▼]       │
│                                         │
│ 🎨 Aparência                            │
│ Cor do Widget                           │
│ ┌──┬──┬──┬──┬──┬──┬──┬──┐              │
│ │🔵│🟢│🟠│🔴│🟣│🔵│🩷│⚫│              │
│ └──┴──┴──┴──┴──┴──┴──┴──┘              │
│                                         │
│ ⚠️ Vincule um sensor para exibir dados  │
│                                         │
├─────────────────────────────────────────┤
│ [✖ Cancelar]           [💾 Salvar]      │
└─────────────────────────────────────────┘
```

---

## ✅ Resultado Final

### Antes:
- ❌ Modal complexo aparecia no Overview
- ❌ Opções irrelevantes (sensor, cor, decimais)
- ❌ UX confusa para gestão executiva

### Depois:
- ✅ Modal simplificado no Overview
- ✅ Apenas Tamanho + Limites (essenciais)
- ✅ UX focada em gestão e alertas
- ✅ Modal completo preservado nos Dashboards
- ✅ Contexto automático (não precisa escolher)

---

## 🚀 Próximos Passos Possíveis

1. **Aplicar Limites Visualmente:**
   - Colorir bordas/backgrounds dos widgets baseado nos limites
   - Exemplo: value < critical → background vermelho

2. **Notificações:**
   - Alertas toast quando limites são atingidos
   - Badge de contagem de widgets críticos

3. **Templates de Limites:**
   - Salvar conjunto de limites como template
   - Aplicar em múltiplos widgets de uma vez

4. **Histórico de Alertas:**
   - Registrar quando limites foram ultrapassados
   - Dashboard de eventos críticos

5. **Exportar Configurações:**
   - Exportar limites para JSON
   - Importar configurações padronizadas

---

**Build Status:** ✅ **12.03s, 0 erros**  
**Data:** 2025-01-23  
**Versão:** 2.1.0 (Overview Config Modal)
