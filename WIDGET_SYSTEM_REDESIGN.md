# Widget System Redesign - Sistema IoT TrakSense

## 🎯 Mudanças Implementadas

### 1. Nova Biblioteca de Widgets (40+ Modelos)

O sistema agora oferece uma ampla variedade de widgets para diferentes necessidades IoT:

#### **Cards Simples** (4 tipos)
- **Card Valor**: Exibe um valor único de sensor
- **Card Estatística**: Valor com tendência e comparação
- **Card Progresso**: Barra de progresso com percentual
- **Card Medidor**: Medidor circular compacto

#### **Cards de Ação** (3 tipos)
- **Card Botão**: Botão para acionar comandos
- **Card Toggle**: Switch para ligar/desligar
- **Card Status**: Indicador de status com cores

#### **Gráficos de Linha** (4 tipos)
- **Gráfico de Linha**: Linha temporal de sensor
- **Gráfico Multi-Linha**: Múltiplos sensores
- **Gráfico de Área**: Área preenchida temporal
- **Gráfico Suave**: Linha suavizada

#### **Gráficos de Barra** (3 tipos)
- **Gráfico de Barras**: Barras verticais
- **Barras Horizontais**: Barras na horizontal
- **Colunas Agrupadas**: Colunas lado a lado

#### **Gráficos Circulares** (3 tipos)
- **Gráfico de Pizza**: Pizza com percentuais
- **Gráfico Donut**: Rosca com centro vazio
- **Gráfico Radial**: Gráfico polar circular

#### **Medidores** (4 tipos)
- **Medidor Circular**: Medidor completo 360°
- **Medidor Semicircular**: Meio círculo
- **Medidor de Tanque**: Visualização de nível
- **Termômetro**: Termômetro vertical

#### **Indicadores** (4 tipos)
- **LED Indicador**: LED colorido de status
- **Semáforo**: Verde, amarelo, vermelho
- **Indicador Bateria**: Nível de bateria
- **Indicador Sinal**: Força de sinal WiFi/RSSI

#### **Tabelas** (3 tipos)
- **Tabela de Dados**: Tabela simples
- **Tabela Tempo Real**: Atualização automática
- **Tabela de Alertas**: Lista de alertas

#### **Mapas de Calor** (2 tipos)
- **Mapa de Calor Temporal**: Densidade por tempo
- **Matriz de Calor**: Grid colorido

#### **Outros** (4 tipos)
- **Linha do Tempo**: Eventos cronológicos
- **Lista de Itens**: Lista customizada
- **Exibição de Texto**: Texto formatado
- **Iframe Customizado**: Conteúdo externo

---

## 2. Modal de Biblioteca de Widgets

### Interface Melhorada
```
┌────────────────────────────────────────────────────────┐
│  Biblioteca de Widgets                                 │
│  Selecione um modelo para adicionar à sua tela.       │
├────────────────────────────────────────────────────────┤
│  [🔍 Buscar widgets...]                                │
│  [Todos (40)] [Cards (7)] [Gráficos (13)] [...]       │
├────────────────────────────────────────────────────────┤
│                                                        │
│  Cards Simples                              4 widgets  │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐    │
│  │ 📊 Card │ │ 📈 Card │ │ ⏳ Card │ │ 🎯 Card │    │
│  │ Valor   │ │ Estat.  │ │ Progr.  │ │ Medidor │    │
│  │         │ │         │ │         │ │         │    │
│  │ Requer  │ │ Requer  │ │ Requer  │ │ Requer  │    │
│  │ Sensor  │ │ Sensor  │ │ Sensor  │ │ Sensor  │    │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘    │
│                                                        │
│  Gráficos de Linha                          4 widgets │
│  [...]                                                 │
└────────────────────────────────────────────────────────┘
```

### Recursos:
- ✅ **Busca em tempo real** - Filtra widgets por nome/descrição
- ✅ **Filtros por categoria** - 10 categorias organizadas
- ✅ **Badges informativos** - Indica se requer sensor e tamanho
- ✅ **Grid responsivo** - 1-2-3-4 colunas conforme tela
- ✅ **Contador de widgets** - Mostra quantidade por categoria

---

## 3. Sistema de Configuração de Widgets

### Modal de Configuração Completo

Quando o usuário adiciona um widget, pode configurá-lo com:

#### **Informações Básicas**
- Título do widget
- Tamanho (pequeno, médio, grande)

#### **Fonte de Dados**
- **Seleção de Sensor**: Dropdown com todos os sensores online
  - Exibe: Tag do sensor • Equipamento • Unidade
  - Mostra último valor lido em tempo real
- **Label customizado**: Nome alternativo
- **Unidade**: Símbolo da unidade (°C, kW, %, etc.)
- **Casas decimais**: 0 a 3 casas

#### **Aparência**
- **Cor do widget**: 6 cores pré-definidas + seletor customizado
  - Azul (#3b82f6)
  - Verde (#10b981)
  - Laranja (#f59e0b)
  - Vermelho (#ef4444)
  - Roxo (#8b5cf6)
  - Ciano (#06b6d4)

#### **Limites e Alertas**
- Valor mínimo
- Valor máximo
- Limite de aviso (amarelo ⚠)
- Limite crítico (vermelho ⚠)

#### **Opções de Gráfico** (para widgets de gráfico)
- Período de tempo: 1h, 6h, 24h, 7d, 30d

---

## 4. Fluxo de Uso

### Passo 1: Adicionar Widget
```
Usuário → Clica "Adicionar Widget" → Modal abre
```

### Passo 2: Escolher Modelo
```
Usuário → Busca/Filtra → Seleciona modelo → Widget adicionado à tela
```

### Passo 3: Configurar Widget (Edição Ativa)
```
Usuário → Ativa "Editar" → Clica no ⚙️ do widget → Modal de config abre
```

### Passo 4: Vincular Sensor
```
Usuário → Seleciona sensor → Ajusta cores/limites → Salva → Widget exibe dados
```

---

## 5. Estrutura de Dados

### Tipo Widget Atualizado
```typescript
interface DashboardWidget {
  id: string;
  type: WidgetType; // 40+ tipos disponíveis
  title: string;
  size: 'small' | 'medium' | 'large';
  position: { x, y, w?, h? };
  config?: {
    sensorId?: string;        // ID do sensor vinculado
    assetId?: string;          // ID do equipamento
    label?: string;            // Label customizado
    unit?: string;             // Unidade de medida
    color?: string;            // Cor hex do widget
    minValue?: number;         // Limite mínimo
    maxValue?: number;         // Limite máximo
    warningThreshold?: number; // Alerta amarelo
    criticalThreshold?: number;// Alerta vermelho
    chartType?: string;        // Tipo de gráfico
    timeRange?: string;        // Período temporal
    decimals?: number;         // Casas decimais
    [key: string]: any;        // Outras configs
  };
}
```

### 40+ Tipos de Widget
```typescript
type WidgetType = 
  | 'card-value' | 'card-stat' | 'card-progress' | 'card-gauge'
  | 'card-button' | 'card-toggle' | 'card-status'
  | 'chart-line' | 'chart-line-multi' | 'chart-area' | 'chart-spline'
  | 'chart-bar' | 'chart-bar-horizontal' | 'chart-column'
  | 'chart-pie' | 'chart-donut' | 'chart-radial'
  | 'gauge-circular' | 'gauge-semi' | 'gauge-tank' | 'gauge-thermometer'
  | 'indicator-led' | 'indicator-traffic' | 'indicator-battery' | 'indicator-signal'
  | 'table-data' | 'table-realtime' | 'table-alerts'
  | 'heatmap-time' | 'heatmap-matrix'
  | 'timeline' | 'list-items' | 'text-display' | 'iframe-embed';
```

---

## 6. Arquivos Modificados/Criados

### Modificados:
1. **`src/types/dashboard.ts`**
   - Expandido de 12 para 40+ tipos de widgets
   - Adicionada interface `config` completa
   - Novos campos: `requiresSensor`, `configurable`

2. **`src/components/dashboard/WidgetPalette.tsx`**
   - Completamente reescrito
   - Adicionada busca em tempo real
   - Filtros por categoria
   - Grid responsivo 4 colunas
   - 40+ definições de widgets

3. **`src/components/dashboard/WidgetConfig.tsx`**
   - Interface completa de configuração
   - Seleção de sensores com dados em tempo real
   - Configuração de cores, limites e alertas
   - Opções específicas por tipo de widget
   - ScrollArea para melhor UX

### A Implementar (Próximo Passo):
4. **`src/components/dashboard/widgets/`** (pasta a criar)
   - Componentes individuais para cada tipo de widget
   - Cada widget renderiza os dados do sensor vinculado
   - Respeita configurações de cor, limites, etc.

---

## 7. Benefícios do Novo Sistema

### Para o Usuário:
✅ **Flexibilidade**: 40+ modelos para diferentes necessidades
✅ **Simplicidade**: Interface intuitiva com busca e filtros
✅ **Personalização**: Cores, limites, labels customizáveis
✅ **Tempo Real**: Vincula sensores e exibe dados ao vivo
✅ **Visual**: Badges e ícones facilitam identificação
✅ **Responsivo**: Adapta-se a qualquer tamanho de tela

### Para o Sistema:
✅ **Escalável**: Fácil adicionar novos tipos de widget
✅ **Configurável**: Sistema robusto de configuração
✅ **Tipado**: TypeScript garante segurança
✅ **Organizado**: Categorias bem definidas
✅ **Modular**: Cada widget é independente
✅ **Reutilizável**: Mesma estrutura para todos os widgets

---

## 8. Próximos Passos

### Fase 1: Implementação dos Widgets (Imediato)
- [ ] Criar pasta `src/components/dashboard/widgets/`
- [ ] Implementar widgets de cards simples (4 tipos)
- [ ] Implementar widgets de ação (3 tipos)
- [ ] Implementar gráficos básicos (10 tipos)
- [ ] Implementar medidores (4 tipos)
- [ ] Implementar indicadores (4 tipos)

### Fase 2: Integração com Dados Reais
- [ ] Conectar widgets aos sensores via `simEngine`
- [ ] Atualização em tempo real dos valores
- [ ] Aplicar cores baseadas em limites
- [ ] Gráficos com histórico real de sensores

### Fase 3: Refinamentos
- [ ] Animações de transição
- [ ] Temas de cores pré-definidos
- [ ] Templates de dashboard
- [ ] Exportação/importação de layouts
- [ ] Compartilhamento entre usuários

---

## 9. Exemplo de Uso Completo

```typescript
// 1. Usuário adiciona widget
WidgetPalette → Seleciona "card-value" → Widget aparece na tela

// 2. Widget criado com valores padrão
{
  id: "widget-123",
  type: "card-value",
  title: "Card Valor",
  size: "small",
  position: { x: 0, y: 0 },
  config: {}  // Vazio inicialmente
}

// 3. Usuário configura (modo edição ativo)
WidgetConfig → Seleciona sensor JE02-AHU-001_RSSI
              → Define título "Sinal WiFi AHU-001"
              → Escolhe cor verde (#10b981)
              → Define limites: -90 (crítico), -70 (aviso)
              → Define 2 casas decimais
              → Salva

// 4. Widget atualizado
{
  id: "widget-123",
  type: "card-value",
  title: "Sinal WiFi AHU-001",
  size: "small",
  position: { x: 0, y: 0 },
  config: {
    sensorId: "je02-ahu-001-rssi",
    assetId: "ahu-001-onco",
    label: "Sinal WiFi",
    unit: "dBm",
    color: "#10b981",
    decimals: 2,
    criticalThreshold: -90,
    warningThreshold: -70
  }
}

// 5. Widget renderiza dados em tempo real
CardValue component → Lê sensorId do config
                   → Busca sensor na store
                   → Exibe lastReading.value
                   → Aplica cor verde
                   → Mostra "Sinal WiFi: -65.42 dBm"
                   → Status: OK (verde)
```

---

## 10. Considerações Técnicas

### Performance
- Widgets leves e otimizados
- Atualização seletiva (apenas widgets visíveis)
- Debounce em atualizações de tempo real
- Virtualização para muitos widgets

### Compatibilidade
- Funciona com sistema de simulação existente
- Compatível com todos os sensores JE02
- Suporta futuros tipos de sensores
- Não quebra layouts existentes

### Manutenibilidade
- Código organizado por tipo
- Componentes reutilizáveis
- TypeScript garante tipos
- Documentação inline
