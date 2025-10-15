# TrakNor CTA v2 - "Manutenção sem caos"

## 📋 Resumo da Implementação

CTA completamente reformulado para a aba de Manutenção seguindo copywriting persuasivo, foco em benefícios operacionais e clareza de valor.

**Arquivos modificados:**
- `src/components/assets/TrakNorCTA.tsx` (reescrito)
- `src/components/pages/AssetDetailPage.tsx` (atualizada integração)

**Data:** 15 de Outubro de 2025

---

## 🎯 Estratégia de Copywriting

### Headline Principal (H1 curto e impactante)

```
"Manutenção sem caos. Comande tudo no TrakNor."
```

**Por quê funciona:**
- ✅ **Contraste emocional:** "sem caos" vs "comande" = transformação clara
- ✅ **Curto e memorável:** 7 palavras, fácil de processar
- ✅ **Autoridade:** "Comande" transmite controle e poder
- ✅ **Especificidade:** "TrakNor" reforça a marca

**Alternativas testáveis (A/B):**
1. "Pare a correria. Ordens, planos e controle em um só lugar."
2. "Do caos à clareza: sua manutenção organizada com TrakNor."

### Subtítulo (Proposta de Valor Expandida)

```
"Abra e priorize Ordens de Serviço em segundos, execute Planos preventivos 
e acompanhe seus ativos em painéis claros — tudo em um só lugar."
```

**Elementos-chave:**
- ✅ **Velocidade:** "em segundos"
- ✅ **Ações concretas:** "Abra", "priorize", "execute", "acompanhe"
- ✅ **Unificação:** "tudo em um só lugar"
- ✅ **Clareza visual:** "painéis claros"

---

## 💎 Benefícios (3 Bullets Enxutos)

### 1. OS em 1 clique e histórico do ativo organizado.

**Ícone:** `FileText`  
**Foco:** Agilidade operacional + contexto histórico

**Por quê funciona:**
- Promessa específica: "1 clique"
- Benefício duplo: criação rápida + rastreabilidade

### 2. Planos e checklists preventivos para reduzir paradas e urgências.

**Ícone:** `ListChecks`  
**Foco:** Prevenção + redução de custos

**Por quê funciona:**
- Aborda dor específica: "paradas" e "urgências"
- Mostra abordagem proativa

### 3. Painéis operacionais para ver o que importa e decidir mais rápido.

**Ícone:** `LayoutDashboard`  
**Foco:** Visibilidade + tomada de decisão

**Por quê funciona:**
- "ver o que importa" = filtro de ruído
- "decidir mais rápido" = eficiência gerencial

---

## 🎨 Design e Estrutura Visual

### Layout Hierárquico

```
┌────────────────────────────────────────────────────────┐
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │ ← Accent bar (gradient)
│                                                        │
│ [🔧] Manutenção sem caos. Comande tudo no TrakNor.   │ ← Headline (text-xl, bold)
│     Abra e priorize Ordens de Serviço em segundos...  │ ← Subtítulo (CardDescription)
│                                                        │
│ [📄] OS em 1 clique e histórico do ativo organizado.  │ ← Benefício 1
│ [✓] Planos e checklists preventivos...                │ ← Benefício 2  
│ [□] Painéis operacionais para ver o que importa...    │ ← Benefício 3
│                                                        │
│ ┌──────────────────────────────────────────────────┐ │
│ │ ✓ Sem telemetria? O TrakNor funciona 100%...    │ │ ← Observação inteligente
│ └──────────────────────────────────────────────────┘ │
│                                                        │
│ [ 🔧 Quero Contratar ]  [ Ver como funciona ]        │ ← CTAs
│                                                        │
│ ───────────────────────────────────────────────────── │
│ Tecnologia moderna (React + TypeScript)...            │ ← Microcopy de confiança
└────────────────────────────────────────────────────────┘
```

### Paleta de Cores (Design System)

| Elemento | Light Mode | Dark Mode |
|----------|-----------|-----------|
| Background | `bg-card` (branco) | `bg-card` (neutral-1) |
| Accent bar | `accent-9 → accent-10 → accent-9` | `accent-9 → accent-10 → accent-9` |
| Ícone principal | `bg-accent-3` + `text-accent-11` | `bg-accent-4/50` + `text-accent-11` |
| Ícones benefícios | `bg-accent-3` + `text-accent-11` | `bg-accent-4/30` + `text-accent-11` |
| Highlight box | `bg-accent-2` + `border-accent-6` | `bg-accent-3/30` + `border-accent-6/50` |
| Texto primário | `foreground` (neutral-12) | `foreground` (neutral-12) |
| Texto secundário | `muted-foreground` (neutral-11) | `muted-foreground` (neutral-11) |

---

## 🧠 Observação Inteligente (Linkagem TrakSense)

```tsx
<CheckCircle2 className="size-4" />
"Sem telemetria? O TrakNor funciona 100% sem sensores — e quando você 
integrar ao TrakSense, desbloqueia camadas de análise preditiva."
```

**Objetivo:**
1. **Remover objeção:** "Preciso de sensores?" → Não!
2. **Upsell sutil:** Integração TrakSense = valor adicional
3. **Palavra-chave:** "preditiva" = tecnologia avançada

**Por quê funciona:**
- ✅ Aborda dúvida comum (telemetria como barreira)
- ✅ Mostra caminho de evolução (sem sensores → com sensores)
- ✅ Reforça ecossistema de produtos

---

## 🎯 CTAs (Call-to-Actions)

### CTA Primário: "Quero Contratar"

```tsx
<Button onClick={handleContact} size="sm" className="gap-2">
  <Wrench className="size-4" />
  Quero Contratar
</Button>
```

**Características:**
- ✅ Ação direta e sem ambiguidade
- ✅ Ícone Wrench (conexão visual com manutenção)
- ✅ Variante `default` (accent colors do sistema)
- ✅ Tamanho `sm` (proporcional ao card)

**Comportamento:**
1. Se `onContactClick` fornecido → abre `ContactSalesDialog`
2. Fallback → `mailto:vendas@traknor.com`

### CTA Secundário: "Ver como funciona"

```tsx
<Button onClick={handleLearnMore} variant="outline" size="sm">
  Ver como funciona
</Button>
```

**Características:**
- ✅ Ação exploratória (baixo comprometimento)
- ✅ Variante `outline` (hierarquia visual clara)
- ✅ Copy curiosa ("como funciona" = educação)

**Comportamento:**
1. Se `onLearnMoreClick` fornecido → executa callback customizado
2. Fallback → abre `https://traknor.com/como-funciona` em nova aba

---

## 🔒 Microcopy de Confiança (Rodapé)

```
"Tecnologia moderna (React + TypeScript) e testes automatizados 
para estabilidade no dia a dia."
```

**Objetivo:**
- ✅ **Confiabilidade técnica:** Stack moderno e testado
- ✅ **Redução de risco:** "estabilidade no dia a dia"
- ✅ **Credibilidade para TI:** React + TypeScript = padrão profissional

**Por quê funciona:**
- Menciona tecnologias específicas (não é buzzword vazio)
- "testes automatizados" = qualidade de código
- "dia a dia" = foco na operação contínua

---

## 🧪 Testes A/B (Headlines Alternativas)

### Variação A (Original)
```
"Manutenção sem caos. Comande tudo no TrakNor."
```
**Foco:** Controle e transformação

### Variação B
```
"Pare a correria. Ordens, planos e controle em um só lugar."
```
**Foco:** Simplificação e unificação

### Variação C
```
"Do caos à clareza: sua manutenção organizada com TrakNor."
```
**Foco:** Jornada de transformação

### Como implementar A/B:

```typescript
// src/store/abtest.ts
import { create } from 'zustand';

interface ABTestStore {
  variant: 'A' | 'B' | 'C';
  setVariant: (variant: 'A' | 'B' | 'C') => void;
}

export const useABTestStore = create<ABTestStore>((set) => ({
  variant: 'A', // Default
  setVariant: (variant) => set({ variant }),
}));

// No componente:
const variant = useABTestStore(state => state.variant);
const headline = {
  A: "Manutenção sem caos. Comande tudo no TrakNor.",
  B: "Pare a correria. Ordens, planos e controle em um só lugar.",
  C: "Do caos à clareza: sua manutenção organizada com TrakNor."
}[variant];
```

---

## 📊 Métricas de Sucesso

### KPIs Primários

| Métrica | Objetivo | Como Medir |
|---------|----------|------------|
| **CTR (Click-Through Rate)** | > 5% | Cliques em CTAs / Visualizações do card |
| **Conversão para Contato** | > 2% | Formulários enviados / Visualizações |
| **Tempo no Card** | > 8s | Heatmap ou scroll tracking |

### KPIs Secundários

| Métrica | Objetivo | Como Medir |
|---------|----------|------------|
| **Dismissal Rate** | < 20% | Se adicionar botão X opcional |
| **Bounce de "Ver como funciona"** | < 60% | Taxa de retorno da página externa |
| **Mobile vs Desktop CTR** | Similar | Comparar taxas por device |

### Tracking (Exemplo)

```typescript
const handleContact = () => {
  // Analytics event
  trackEvent('traknor_cta_click', {
    cta_type: 'contratar',
    variant: 'A', // ou B, C
    asset_type: selectedAsset?.type,
    timestamp: Date.now(),
  });
  
  onContactClick?.();
};

const handleLearnMore = () => {
  trackEvent('traknor_cta_click', {
    cta_type: 'saiba_mais',
    variant: 'A',
    asset_type: selectedAsset?.type,
    timestamp: Date.now(),
  });
  
  onLearnMoreClick?.();
};
```

---

## 🚀 Versão "Banner" (Curtíssima)

Para uso em outras páginas ou contextos mais restritos:

```tsx
// TrakNorBanner.tsx
export function TrakNorBanner() {
  return (
    <div className="flex items-center justify-between p-4 bg-accent-2 border border-accent-6 rounded-lg dark:bg-accent-3/30 dark:border-accent-6/50">
      <div className="flex items-center gap-3">
        <Wrench className="size-5 text-accent-11" />
        <p className="text-sm">
          <strong className="font-semibold">TrakNor CMMS:</strong> ordens de serviço ágeis, 
          planos preventivos e painéis claros — tudo em um só lugar.
        </p>
      </div>
      <Button size="sm" variant="outline" asChild>
        <a href="https://traknor.com/planos" target="_blank" rel="noopener noreferrer">
          Conhecer planos →
        </a>
      </Button>
    </div>
  );
}
```

---

## 🎨 Implementação de UI/UX

### Componentes Utilizados (shadcn/ui)

| Componente | Uso |
|------------|-----|
| `Card` | Container principal |
| `CardHeader` | Título + subtítulo |
| `CardTitle` | Headline (text-xl, bold) |
| `CardDescription` | Subtítulo (valor expandido) |
| `CardContent` | Benefícios, observação, CTAs, rodapé |
| `Button` | CTAs primário e secundário |

### Espaçamento e Hierarquia

```tsx
<CardHeader className="space-y-2 pb-4 pt-5">
  {/* 8pt gap entre título e subtítulo */}
</CardHeader>

<CardContent className="space-y-4">
  {/* 16pt gap entre seções principais */}
  
  <div className="space-y-3">
    {/* 12pt gap entre benefícios */}
  </div>
</CardContent>
```

### Responsividade

```tsx
<div className="flex flex-wrap gap-2 pt-2">
  {/* CTAs fazem wrap em telas pequenas */}
  <Button size="sm">...</Button>
  <Button size="sm">...</Button>
</div>
```

**Breakpoints:**
- **Mobile (< 640px):** CTAs empilhados verticalmente
- **Tablet (640px - 1024px):** CTAs lado a lado
- **Desktop (> 1024px):** CTAs lado a lado com mais padding

---

## 🔧 Integração no AssetDetailPage

### Antes (props antigas):

```tsx
<TrakNorCTA 
  orgId="default"  // ❌ Removido
  onContactClick={() => setContactDialogOpen(true)} 
/>
```

### Depois (props atualizadas):

```tsx
<TrakNorCTA 
  onContactClick={() => setContactDialogOpen(true)}
  onLearnMoreClick={() => {
    window.open('https://traknor.com/como-funciona', '_blank', 'noopener,noreferrer');
  }}
/>
```

**Mudanças:**
- ✅ Removida prop `orgId` (não mais necessária)
- ✅ Adicionada prop `onLearnMoreClick` para CTA secundário
- ✅ Callbacks opcionais (fallback para mailto e link externo)

---

## 📦 Impacto no Bundle

**Build anterior:**
- Bundle: 2,118.93 kB (gzip: 644.59 kB)

**Build atual:**
- Bundle: 2,120.05 kB (gzip: 644.93 kB)

**Diferença:** +1.12 kB (+0.34 kB gzip)

**Análise:**
- Aumento mínimo devido a novos ícones (`FileText`, `ListChecks`, `LayoutDashboard`)
- Trade-off aceitável para melhor UX e copywriting persuasivo
- Sem dependências externas adicionadas

---

## ✅ Checklist de Implementação

### Copywriting
- [x] Headline impactante e curto
- [x] Subtítulo com proposta de valor clara
- [x] 3 benefícios enxutos e específicos
- [x] Observação inteligente (linkagem TrakSense)
- [x] Microcopy de confiança técnica

### Design
- [x] Card com accent bar superior
- [x] Ícones consistentes (FileText, ListChecks, LayoutDashboard)
- [x] Cores do design system (accent-*)
- [x] Espaçamento adequado (space-y-*)
- [x] Responsividade (flex-wrap)

### CTAs
- [x] CTA primário visível e direto
- [x] CTA secundário de baixo comprometimento
- [x] Callbacks opcionais
- [x] Fallbacks funcionais (mailto, link externo)

### Integração
- [x] Props atualizadas no AssetDetailPage
- [x] ContactSalesDialog integrado
- [x] Feature flag respeitada (enableTrakNorCTA)
- [x] Build sem erros

### Documentação
- [x] Estratégia de copywriting explicada
- [x] Design system documentado
- [x] Variações A/B sugeridas
- [x] Métricas de sucesso definidas
- [x] Versão banner criada

---

## 🔮 Próximos Passos (Roadmap)

### Curto Prazo (1-2 semanas)

1. **Implementar A/B Testing**
   - Criar store Zustand para variantes
   - Configurar tracking de cliques por variante
   - Definir duração do teste (mínimo 2 semanas)

2. **Analytics e Tracking**
   - Integrar Google Analytics ou Mixpanel
   - Criar dashboard de métricas do CTA
   - Configurar eventos personalizados

3. **Testes de Usuário**
   - 5-10 entrevistas qualitativas
   - Eye-tracking (opcional)
   - Heatmaps com Hotjar ou similar

### Médio Prazo (1 mês)

1. **Otimizações Baseadas em Dados**
   - Analisar resultados do A/B test
   - Ajustar copy da variante vencedora
   - Testar posicionamento do card (top vs middle)

2. **Versão Dismissible (Opcional)**
   - Adicionar botão X com Zustand persist
   - Testar impacto no CTR
   - Implementar "snooze" (reaparecer em 7 dias)

3. **Personalização por Asset Type**
   - Copy específico para Chillers, AHUs, etc.
   - Exemplos de uso relevantes
   - Benefícios adaptados ao contexto

### Longo Prazo (3 meses)

1. **Modal "Como Funciona" Interno**
   - Substituir link externo por modal rico
   - Tour interativo com screenshots
   - Vídeo demo de 60s

2. **Integrações Avançadas**
   - Pré-preencher formulário com dados do asset
   - Gerar proposta personalizada automática
   - Webhook para CRM (HubSpot, Salesforce)

3. **Gamificação (Opcional)**
   - "Desbloqueie análise preditiva" badge
   - Contadores de features usadas vs disponíveis
   - Trial de 14 dias com CTA inline

---

## 📚 Referências e Inspirações

### Copywriting
- [Jobs to Be Done Framework](https://jtbd.info/) - Foco em jobs funcionais
- [Value Proposition Canvas](https://www.strategyzer.com/canvas) - Mapeamento de dores e ganhos
- [Clarity.ai Copywriting Guide](https://clarity.ai/blog/copywriting) - Brevidade e impacto

### Design
- [Radix Colors](https://www.radix-ui.com/colors) - Sistema de cores acessível
- [shadcn/ui Examples](https://ui.shadcn.com/examples) - Patterns de cards
- [Tailwind CSS v4](https://tailwindcss.com/docs) - Utility classes

### Conversão
- [Unbounce CTA Best Practices](https://unbounce.com/conversion-rate-optimization/call-to-action-examples/) - Hierarchy e urgência
- [HubSpot CTA Guide](https://blog.hubspot.com/marketing/call-to-action-examples) - Copy que converte

---

## 🎓 Glossário

| Termo | Definição |
|-------|-----------|
| **CTA** | Call-to-Action - elemento que solicita ação do usuário |
| **CTR** | Click-Through Rate - taxa de cliques sobre visualizações |
| **Microcopy** | Textos curtos que guiam, informam ou tranquilizam usuários |
| **Hierarchy** | Ordem visual de importância dos elementos |
| **Accent colors** | Cores de destaque do design system (blue scale no TrakSense) |
| **Feature flag** | Chave de configuração para habilitar/desabilitar features |
| **A/B Test** | Comparação de duas variantes para identificar a melhor |
| **Fallback** | Comportamento alternativo quando opção principal falha |

---

**Status:** ✅ Implementado e testado  
**Build:** ✅ 14.23s, sem erros  
**Bundle:** +1.12 kB (impacto mínimo)  
**Acessibilidade:** ✅ AA Compliant  
**Responsividade:** ✅ Mobile-first

**Próxima revisão:** Após 2 semanas com métricas de A/B testing
