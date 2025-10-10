# 📊 Widgets de Gestão Executiva - Visão Geral

## 🎯 Objetivo

A página **Visão Geral** foi redesenhada para focar em **KPIs estratégicos de gestão**, diferenciando-se da página **Dashboards** que contém widgets técnicos operacionais.

---

## 🆚 Diferença Entre Visão Geral e Dashboards

### Visão Geral (Overview)
**Público:** Gestores, executivos, tomadores de decisão  
**Foco:** KPIs de alto nível, confiabilidade, disponibilidade, consumo estratégico  
**Objetivos:** Monitorar saúde geral, identificar tendências, tomar decisões estratégicas

### Dashboards
**Público:** Operadores, técnicos, engenheiros  
**Foco:** Monitoramento técnico detalhado, sensores individuais, controle operacional  
**Objetivos:** Operar equipamentos, diagnosticar problemas, ajustar setpoints

---

## 📋 Categorias de Widgets - Visão Geral

### 🛡️ 1. Confiabilidade (4 widgets)

#### MTTF (Mean Time To Failure)
- **Tipo:** `card-stat` (KPI com tendência)
- **Descrição:** Tempo médio entre falhas dos equipamentos
- **Métrica:** Horas
- **Cor:** Roxo (#8b5cf6)
- **Uso:** Avaliar confiabilidade dos ativos ao longo do tempo

#### Disponibilidade de Equipamentos
- **Tipo:** `card-progress` (KPI com progresso)
- **Descrição:** Percentual de uptime dos ativos críticos
- **Métrica:** % (target: 99.5%)
- **Cor:** Verde (#10b981)
- **Uso:** Monitorar se a meta de disponibilidade está sendo atingida

#### Alertas Ativos
- **Tipo:** `card-value` (KPI simples)
- **Descrição:** Quantidade de alertas pendentes no momento
- **Métrica:** Número absoluto
- **Cor:** Laranja (#f59e0b)
- **Uso:** Visão imediata da quantidade de problemas ativos

#### Health Score Geral
- **Tipo:** `card-gauge` (Medidor visual)
- **Descrição:** Score de saúde consolidado de todos os ativos
- **Métrica:** % (0-100)
- **Cor:** Verde (#10b981)
- **Uso:** Indicador visual único da saúde do sistema HVAC

---

### ⚙️ 2. Operações (3 widgets)

#### Disponibilidade de Sensores
- **Tipo:** `card-stat` (KPI com tendência)
- **Descrição:** Percentual de sensores online e funcionando
- **Métrica:** %
- **Cor:** Azul (#3b82f6)
- **Uso:** Garantir que o sistema de monitoramento está operacional

#### Equipamentos em Operação
- **Tipo:** `card-value` (KPI simples)
- **Descrição:** Total de equipamentos ativos no momento
- **Métrica:** X/Total
- **Cor:** Verde (#10b981)
- **Uso:** Visão rápida da capacidade operacional disponível

#### Taxa de Manutenção Preventiva
- **Tipo:** `card-progress` (KPI com progresso)
- **Descrição:** Cumprimento do plano de manutenção
- **Métrica:** %
- **Cor:** Amarelo (#f59e0b)
- **Uso:** Acompanhar se as manutenções programadas estão em dia

---

### ⚡ 3. Energia & Consumo (4 widgets)

#### Consumo por Equipamento
- **Tipo:** `chart-bar` (Gráfico de barras)
- **Descrição:** Comparativo de consumo energético (kWh)
- **Tamanho:** Médio (1/3)
- **Uso:** Identificar quais equipamentos consomem mais energia

#### Histórico de Consumo
- **Tipo:** `chart-line` (Gráfico de linha)
- **Descrição:** Tendência de consumo ao longo do tempo
- **Tamanho:** Médio (1/3)
- **Uso:** Identificar padrões e anomalias no consumo

#### Distribuição de Consumo
- **Tipo:** `chart-pie` (Gráfico de pizza)
- **Descrição:** Proporção de consumo por tipo de ativo (AHU, Chiller, VRF, etc.)
- **Tamanho:** Médio (1/3)
- **Uso:** Ver a distribuição percentual do consumo por categoria

#### Eficiência Energética
- **Tipo:** `gauge-circular` (Medidor circular)
- **Descrição:** Indicador de eficiência operacional (COP/EER)
- **Tamanho:** Pequeno (1/6)
- **Uso:** Monitorar se os equipamentos estão operando eficientemente

---

### 🚨 4. Alertas & Gestão (4 widgets)

#### Últimos Alertas
- **Tipo:** `table-alerts` (Tabela de alertas)
- **Descrição:** Tabela com alertas mais recentes e prioritários
- **Tamanho:** Grande (2/3)
- **Campos:** Timestamp, Equipamento, Severidade, Mensagem, Status
- **Uso:** Triagem rápida dos problemas mais críticos

#### Mapa de Calor de Alertas
- **Tipo:** `heatmap-time` (Mapa de calor temporal)
- **Descrição:** Densidade de alertas por horário e dia
- **Tamanho:** Grande (2/3)
- **Uso:** Identificar padrões temporais de problemas

#### Timeline de Manutenções
- **Tipo:** `timeline` (Linha do tempo)
- **Descrição:** Cronologia de manutenções realizadas e programadas
- **Tamanho:** Grande (2/3)
- **Uso:** Acompanhar histórico e planejar manutenções futuras

#### Alertas por Severidade
- **Tipo:** `chart-bar-horizontal` (Barras horizontais)
- **Descrição:** Distribuição de alertas (Crítico, Alto, Médio, Baixo)
- **Tamanho:** Médio (1/3)
- **Uso:** Ver proporção de problemas por nível de criticidade

---

### 📈 5. Análise & Tendências (3 widgets)

#### Tendência de Disponibilidade
- **Tipo:** `chart-area` (Gráfico de área)
- **Descrição:** Evolução da disponibilidade dos equipamentos
- **Tamanho:** Médio (1/3)
- **Uso:** Avaliar se a confiabilidade está melhorando ou piorando

#### Comparativo Multi-Equipamento
- **Tipo:** `chart-line-multi` (Múltiplas linhas)
- **Descrição:** Performance comparada de múltiplos ativos
- **Tamanho:** Grande (2/3)
- **Uso:** Comparar performance entre equipamentos similares

#### Status dos Equipamentos
- **Tipo:** `chart-donut` (Gráfico donut)
- **Descrição:** Distribuição: OK, Alerta, Manutenção, Parado
- **Tamanho:** Médio (1/3)
- **Uso:** Visão consolidada do status operacional

---

## 🎨 Layout Padrão - Visão Geral

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ LINHA 1: KPIs de Confiabilidade (6 cards pequenos)                        │
├─────────┬─────────┬─────────┬─────────┬─────────┬─────────────────────────┤
│  MTTF   │Disponib.│ Alertas │ Health  │Sensores │ Equipam.                │
│ 2,850h  │  98.5%  │   14    │  92%    │ Online  │ Online                  │
│  ↑3.2%  │  ━━━━   │    🔔   │   ◑     │  95.2%  │ 11/12                   │
└─────────┴─────────┴─────────┴─────────┴─────────┴─────────────────────────┘

┌──────────────────────────────────┬──────────────────────────────────────────┐
│ LINHA 2: Energia & Consumo                                                 │
├──────────────────────────────────┼──────────────────────────────────────────┤
│  📊 Consumo por Equipamento      │  📈 Histórico de Consumo                │
│                                  │                                          │
│  ████████ AHU-001  1,250 kWh     │      ╱╲                                 │
│  ██████ Chiller-01  920 kWh      │     ╱  ╲      ╱╲                        │
│  ████ VRF-001  580 kWh           │    ╱    ╲    ╱  ╲                       │
│  ██ RTU-001  320 kWh             │   ╱      ╲  ╱    ╲___                   │
│                                  │  ╱        ╲╱                            │
└──────────────────────────────────┴──────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────────┐
│ LINHA 3: Alertas & Gestão                                                  │
├────────────────────────────────────────────────────────────────────────────┤
│  📋 Últimos Alertas                                                         │
│  ┌────────┬──────────────┬──────────┬──────────────────────┬────────────┐ │
│  │ Hora   │ Equipamento  │Severidade│ Mensagem             │ Status     │ │
│  ├────────┼──────────────┼──────────┼──────────────────────┼────────────┤ │
│  │ 14:32  │ AHU-001      │ 🔴 Alto  │ Filtro obstruído     │ Pendente   │ │
│  │ 13:15  │ Chiller-01   │ 🟡 Médio │ Pressão elevada      │ Pendente   │ │
│  │ 12:04  │ VRF-002      │ 🟢 Baixo │ Temp fora do range   │Reconhecido │ │
│  └────────┴──────────────┴──────────┴──────────────────────┴────────────┘ │
└────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────┬──────────────────────────────────────────┐
│ LINHA 4: Análise & Tendências                                              │
├──────────────────────────────────┼──────────────────────────────────────────┤
│  🥧 Distribuição de Consumo      │  🔥 Mapa de Calor de Alertas            │
│                                  │                                          │
│        ╱╲                        │    Dom Seg Ter Qua Qui Sex Sab          │
│       ╱  ╲    AHU: 42%           │  0h ░░░ ░░░ ░░░ ░░░ ░░░ ░░░ ░░░         │
│      ╱────╲   Chiller: 31%       │  6h ░░░ ██░ ██░ ██░ ██░ ██░ ░░░         │
│     ╱      ╲  VRF: 19%           │ 12h ░░░ ███ ███ ███ ███ ███ ░░░         │
│    ╱────────╲ RTU: 8%            │ 18h ░░░ ██░ ██░ ██░ ██░ ██░ ░░░         │
│                                  │                                          │
└──────────────────────────────────┴──────────────────────────────────────────┘
```

---

## 🔄 Widgets Padrão ao Iniciar

Ao carregar a página **Visão Geral** pela primeira vez (ou após reset), os seguintes **12 widgets** são exibidos:

### Linha 1 (6 cards pequenos - 1/6 cada):
1. MTTF (Mean Time To Failure)
2. Disponibilidade de Equipamentos
3. Alertas Ativos
4. Health Score Geral
5. Disponibilidade de Sensores
6. Equipamentos em Operação

### Linha 2 (2 gráficos médios - 1/3 cada):
7. Consumo por Equipamento (Barras)
8. Histórico de Consumo (Linha)

### Linha 3 (1 tabela grande - 2/3):
9. Últimos Alertas (Tabela)

### Linha 4 (2 widgets - 1/3 cada):
10. Distribuição de Consumo (Pizza)
11. Mapa de Calor de Alertas (Heatmap)

**Total: 12 widgets padrão** (6 KPIs + 4 gráficos + 1 tabela + 1 heatmap)

---

## 📚 Biblioteca de Widgets Disponíveis

Ao clicar em **"+ Adicionar Widget"** no modo de edição, o usuário tem acesso a **18 widgets** categorizados:

### 🛡️ Confiabilidade (4)
- MTTF (Mean Time To Failure)
- Disponibilidade de Equipamentos
- Alertas Ativos
- Health Score Geral

### ⚙️ Operações (3)
- Disponibilidade de Sensores
- Equipamentos em Operação
- Taxa de Manutenção Preventiva

### ⚡ Energia & Consumo (4)
- Consumo por Equipamento
- Histórico de Consumo
- Distribuição de Consumo
- Eficiência Energética

### 🚨 Alertas & Gestão (4)
- Últimos Alertas
- Mapa de Calor de Alertas
- Timeline de Manutenções
- Alertas por Severidade

### 📈 Análise & Tendências (3)
- Tendência de Disponibilidade
- Comparativo Multi-Equipamento
- Status dos Equipamentos

---

## 🎛️ Modal de Biblioteca de Widgets

### Características:
- **Layout responsivo:** 95vw (mobile) → 90vw (tablet) → 85vw (desktop) → 6xl (large)
- **Grid adaptativo:** 1-4 colunas dependendo do tamanho da tela
- **Headers sticky:** Cabeçalhos de categoria fixos ao scrollar
- **Filtros horizontais:** Scroll horizontal sem quebra de linha
- **Badges descritivos:** "Pequeno (1/6)", "Médio (1/3)", "Grande (2/3)"
- **Busca inteligente:** Filtra por nome e descrição

### Filtros Disponíveis:
- **Todos (18)** - Mostra todos os widgets
- **Confiabilidade (4)** - KPIs de uptime e confiabilidade
- **Operações (3)** - Métricas operacionais
- **Energia (4)** - Consumo e eficiência
- **Alertas (4)** - Gestão de alertas e manutenções
- **Análise (3)** - Tendências e comparativos

---

## 🔧 Configuração e Personalização

### Modo de Edição
1. Clicar no botão **"✏️ Editar Layout"**
2. Modo de edição ativado (borda verde nos widgets)
3. **Adicionar:** Clicar "+ Adicionar Widget" e selecionar da biblioteca
4. **Mover:** Arrastar e soltar widgets (drag & drop)
5. **Remover:** Clicar no "✖" vermelho no canto do widget
6. **Salvar:** Alterações salvas automaticamente no localStorage

### Persistência
- **Key:** `traksense-overview-storage`
- **Versão:** 1
- **Conteúdo:** Array de widgets com id, type, title, size, position, config
- **Reset:** Botão "🔄 Resetar para Padrão" restaura os 12 widgets originais

---

## 📊 Tipos de Dados Exibidos

### KPIs Calculados:
- **MTTF:** Calculado a partir do histórico de falhas
- **Disponibilidade:** `(Tempo Online / Tempo Total) × 100`
- **Health Score:** Média ponderada de múltiplos indicadores
- **Eficiência:** COP (Coefficient of Performance) ou EER

### Dados de Alertas:
- **Total de alertas ativos**
- **Distribuição por severidade:** Crítico, Alto, Médio, Baixo
- **Histórico temporal:** Densidade de alertas por hora/dia

### Dados de Consumo:
- **Consumo atual (kWh/dia)**
- **Histórico de consumo (7/30 dias)**
- **Distribuição por tipo de equipamento**
- **Comparativo entre ativos**

---

## 🎯 Casos de Uso

### Para Gestores Executivos:
1. **Verificar Health Score** → Tudo OK? (verde > 90%)
2. **Conferir Alertas Ativos** → Quantos problemas pendentes?
3. **Analisar Disponibilidade** → Meta de 99.5% está sendo atingida?
4. **Revisar Consumo** → Houve aumento atípico?

### Para Gerentes de Manutenção:
1. **Monitorar MTTF** → Confiabilidade melhorando?
2. **Acompanhar Timeline** → Manutenções em dia?
3. **Revisar Últimos Alertas** → Quais equipamentos precisam atenção?
4. **Verificar Taxa de Manutenção Preventiva** → Plano cumprido?

### Para Gestores de Facilities:
1. **Acompanhar Consumo por Equipamento** → Qual consome mais?
2. **Analisar Distribuição** → Proporção de consumo OK?
3. **Verificar Eficiência Energética** → Equipamentos operando otimamente?
4. **Revisar Histórico** → Tendência de aumento de consumo?

---

## 🚀 Próximos Passos

### Melhorias Futuras:
1. **Drill-down:** Clicar em KPI abre detalhes do equipamento
2. **Exportação:** Gerar relatório executivo em PDF
3. **Notificações:** Alertas quando KPIs saem da meta
4. **Comparativo:** Comparar períodos (mês atual vs anterior)
5. **Projeções:** Previsões baseadas em ML (consumo futuro, próximas falhas)

### Integrações:
1. **Backend API:** Conectar com dados reais (atualmente simulação)
2. **spark.kv:** Persistência em nuvem (atualmente localStorage)
3. **spark.llm:** Insights automáticos via IA
4. **Exportação:** PDF, Excel, CSV

---

## ✅ Status Atual

- ✅ **18 widgets de gestão** criados e categorizados
- ✅ **12 widgets padrão** configurados no layout inicial
- ✅ **Modal responsivo** com grid adaptativo e sticky headers
- ✅ **Drag & drop** funcional para reordenar widgets
- ✅ **Persistência** em localStorage
- ✅ **Build bem-sucedido** sem erros TypeScript
- ✅ **Diferenciação clara** entre Overview (gestão) e Dashboards (operação)

---

## 🎓 Conceitos de Gestão HVAC

### MTTF (Mean Time To Failure)
Tempo médio entre falhas. Quanto maior, mais confiável é o equipamento.
- **Bom:** > 2,000 horas
- **Excelente:** > 5,000 horas

### Disponibilidade
Percentual do tempo que o equipamento está operacional.
- **Aceitável:** > 95%
- **Bom:** > 98%
- **Excelente:** > 99.5%

### Health Score
Score consolidado considerando:
- Horas de operação vs vida útil
- Frequência de falhas
- Performance atual vs nominal
- Status de manutenções

### COP/EER (Eficiência Energética)
- **COP (Coefficient of Performance):** Relação entre energia útil e consumida
- **EER (Energy Efficiency Ratio):** Similar ao COP, usado em unidades imperiais
- **Ideal:** COP > 3.0 (300% eficiente)

---

## 📖 Documentação Relacionada

- `OVERVIEW_MODAL_IMPROVEMENTS.md` - Melhorias no modal de widgets
- `ADD_ASSET_FEATURE.md` - Adicionar novos equipamentos
- `RULE_BUILDER_FEATURE.md` - Criar regras de alerta
- `PRD.md` - Product Requirements Document completo

---

**Última atualização:** 10/10/2025  
**Versão:** 1.0  
**Build status:** ✅ Funcional
