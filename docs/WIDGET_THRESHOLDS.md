# 🎨 Limites de Aviso e Crítico em Widgets

## 📋 Visão Geral

Os widgets agora suportam **limites de aviso (warning)** e **limites críticos (critical)** que alteram automaticamente a aparência visual quando os valores ultrapassam os thresholds configurados.

## ✨ Comportamento Visual

### Estados dos Widgets

#### 🟢 Normal (Valor < Limite de Aviso)
- Background: Branco/Padrão (`bg-card`)
- Cor do valor: Verde ou cor personalizada configurada
- Border: Padrão

#### 🟡 Aviso (Limite de Aviso ≤ Valor < Limite Crítico)
- Background: Amarelo claro (`bg-yellow-50`)
- Border: Amarelo (`border-yellow-300`)
- Cor do valor: Laranja (`#f59e0b`)

#### 🔴 Crítico (Valor ≥ Limite Crítico)
- Background: Vermelho claro (`bg-red-50`)
- Border: Vermelho (`border-red-300`)
- Cor do valor: Vermelho (`#ef4444`)

## 🎯 Widgets Suportados

Os seguintes tipos de widgets suportam thresholds:

1. **card-kpi** - Cards KPI do Overview
2. **card-value** - Cards com valor único
3. **card-stat** - Cards com estatística e tendência
4. **card-progress** - Cards com barra de progresso
5. **card-gauge** - Medidores circulares
6. **card-status** - Cards de status

## ⚙️ Como Configurar

### 1. Acessar Configurações do Widget

1. Ative o **Modo de Edição** no dashboard
2. Clique no ícone de **engrenagem (⚙️)** no widget
3. Role até a seção **"Limites e Alertas"**

### 2. Definir os Limites

#### Limite de Aviso (⚠️)
```
Valor: 80
Descrição: Widget ficará amarelo ao atingir este valor
```

#### Limite Crítico (🚨)
```
Valor: 90
Descrição: Widget ficará vermelho ao atingir este valor
```

### 3. Exemplo de Configuração

**Cenário: Monitoramento de Temperatura**

```typescript
{
  sensorTag: "temp_sala_1",
  assetId: "123",
  label: "Temperatura Sala 1",
  unit: "°C",
  warningThreshold: 25,    // Amarelo a partir de 25°C
  criticalThreshold: 30,   // Vermelho a partir de 30°C
  color: "#3b82f6"         // Azul quando normal
}
```

**Resultados:**
- ✅ 22°C → Card azul (normal)
- ⚠️ 27°C → Card amarelo (aviso)
- 🚨 32°C → Card vermelho (crítico)

## 🔧 Implementação Técnica

### Funções Principais

#### `getThresholdColor()`
Calcula a cor baseada nos limites:
```typescript
function getThresholdColor(
  value: number | null | undefined,
  warningThreshold?: number,
  criticalThreshold?: number,
  defaultColor: string = '#10b981'
): string
```

**Retorna:**
- `#ef4444` (vermelho) se `value >= criticalThreshold`
- `#f59e0b` (amarelo) se `value >= warningThreshold`
- `defaultColor` caso contrário

#### `getThresholdBackgroundClass()`
Retorna a classe CSS de background:
```typescript
function getThresholdBackgroundClass(
  value: number | null | undefined,
  warningThreshold?: number,
  criticalThreshold?: number
): string
```

**Retorna:**
- `'bg-red-50 border-red-300'` se crítico
- `'bg-yellow-50 border-yellow-300'` se aviso
- `'bg-card'` se normal

### Exemplo de Uso no Código

```tsx
// Card Value com thresholds
const cardValueNumber = Number(cardValue);
const cardColor = getThresholdColor(
  cardValueNumber,
  widget.config?.warningThreshold,
  widget.config?.criticalThreshold,
  '#3b82f6' // cor padrão
);
const cardBgClass = getThresholdBackgroundClass(
  cardValueNumber,
  widget.config?.warningThreshold,
  widget.config?.criticalThreshold
);

<div className={cn("rounded-xl p-6", cardBgClass)}>
  <div style={{ color: cardColor }}>
    {cardValue}
  </div>
</div>
```

## 📊 Casos de Uso Comuns

### 1. Monitoramento de Temperatura
```typescript
warningThreshold: 25,   // Aviso de calor
criticalThreshold: 30   // Superaquecimento
```

### 2. Consumo de Energia
```typescript
warningThreshold: 80,   // 80% da capacidade
criticalThreshold: 95   // 95% da capacidade
```

### 3. Pressão de Filtros
```typescript
warningThreshold: 250,  // 250 Pa - tempo de trocar
criticalThreshold: 300  // 300 Pa - troca urgente
```

### 4. Uptime de Dispositivos
```typescript
warningThreshold: 90,   // 90% - atenção
criticalThreshold: 95   // 95% - crítico (invertido)
```

## 🎨 Personalização Avançada

### Cores Customizadas

As cores padrão são:
- 🟢 Normal: `#10b981` (verde)
- 🟡 Aviso: `#f59e0b` (laranja/amarelo)
- 🔴 Crítico: `#ef4444` (vermelho)

Para personalizar a cor normal, configure o campo `color` no widget:
```typescript
config: {
  color: "#3b82f6", // Azul personalizado para estado normal
  warningThreshold: 80,
  criticalThreshold: 90
}
```

### Limites Invertidos

Para sensores onde valores **baixos** são críticos (ex: uptime, bateria):

Configure thresholds invertidos via lógica customizada ou use valores negativos com fórmula de transformação.

## 🐛 Troubleshooting

### ❌ Widget não muda de cor

**Verifique:**
1. Limites estão configurados corretamente
2. Valor do sensor está sendo recebido (`sensorData.value !== null`)
3. Tipo de widget suporta thresholds (ver lista acima)
4. Valor ultrapassa o threshold configurado

### ❌ Cores incorretas

**Possíveis causas:**
1. `warningThreshold` maior que `criticalThreshold` (ordem errada)
2. Valores muito próximos (ex: warning=90, critical=91)
3. Cache do navegador - force refresh (Ctrl+F5)

### ❌ Background não muda

**Solução:**
Certifique-se que o widget está usando `cn()` e `getThresholdBackgroundClass()`:
```tsx
<div className={cn("rounded-xl", getThresholdBackgroundClass(...))}>
```

## 📝 Changelog

### v1.0.0 (2025-11-18)
- ✅ Implementado suporte a thresholds em 6 tipos de widgets
- ✅ Cores automáticas baseadas em limites
- ✅ Background do card muda de cor
- ✅ Funciona com dados reais de sensores
- ✅ Integrado com WidgetConfig UI

## 🚀 Próximos Passos

- [ ] Adicionar suporte a múltiplos thresholds (ex: 3 níveis)
- [ ] Notificações visuais quando threshold for ultrapassado
- [ ] Histórico de quando thresholds foram atingidos
- [ ] Animação de transição entre estados
- [ ] Suporte a thresholds por faixa de horário

## 📚 Referências

- `src/components/dashboard/DraggableWidget.tsx` - Implementação principal
- `src/components/dashboard/WidgetConfig.tsx` - Interface de configuração
- `src/types/dashboard.ts` - Tipos TypeScript
