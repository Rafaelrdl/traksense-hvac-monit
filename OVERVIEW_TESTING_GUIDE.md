# 🎮 GUIA PRÁTICO: Testando o Sistema de Auto-População

## 🚀 Iniciando a Aplicação

```bash
cd /workspaces/spark-template
npm run dev

# Aguardar mensagem:
# ➜  Local:   http://localhost:5002/
# ➜  press h + enter to show help
```

---

## 📋 Cenário 1: Visualizando Widgets Padrão

### Passo a Passo

1. **Abrir aplicação:** `http://localhost:5002/`

2. **Navegar para Visão Geral:** Clicar no menu "Visão Geral"

3. **Observar 12 widgets padrão carregados:**

```
┌─────────────────────────────────────────────────────────────────────┐
│ LINHA 1: 6 KPIs Pequenos                                            │
├───────────┬───────────┬───────────┬───────────┬───────────┬─────────┤
│ MTTF      │ Disponib. │ Alertas   │ Health    │ Sensores  │ Equipam.│
│           │           │ Ativos    │ Score     │ Online    │ Online  │
│ 168 horas │ 98.5%     │ 14        │ 92%       │ 95.2%     │ 11/12   │
│ ↑ 5.3%    │ ━━━━━━━   │           │   ◔       │ ↑ 2.1%    │         │
└───────────┴───────────┴───────────┴───────────┴───────────┴─────────┘

┌──────────────────────────────────┬─────────────────────────────────┐
│ LINHA 2: Gráficos de Consumo    │                                 │
├──────────────────────────────────┼─────────────────────────────────┤
│ Consumo por Equipamento          │ Histórico de Consumo            │
│                                  │                                 │
│ 1,250  920   580   450   320     │     ╱╲                          │
│ ████   ███   ██    ██    █       │    ╱  ╲      ╱╲                 │
│ AHU-1  Chill VRF-1 RTU-1 CT-1    │   ╱    ╲    ╱  ╲                │
└──────────────────────────────────┴─────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ LINHA 3: Tabela de Alertas                                          │
├──────────┬──────────────┬───────────┬────────────────┬─────────────┤
│ Severid. │ Ativo        │ Mensagem  │ Tempo          │             │
├──────────┼──────────────┼───────────┼────────────────┼─────────────┤
│ 🔴 High  │ AHU-001      │ Filtro    │ 2h atrás       │             │
│ 🟡 Medium│ Chiller-01   │ Pressão   │ 5h atrás       │             │
│ 🟢 Low   │ VRF-002      │ Temp      │ 1d atrás       │             │
└──────────┴──────────────┴───────────┴────────────────┴─────────────┘

┌──────────────────────────────────┬─────────────────────────────────┐
│ LINHA 4: Análise                │                                 │
├──────────────────────────────────┼─────────────────────────────────┤
│ Distribuição de Consumo          │ Mapa de Calor de Alertas        │
│       ╱──╲                       │   D  S  T  Q  Q  S  S           │
│      │ ██ │  AHU: 42%            │ 0 ░░░ ░░░ ░░░ ░░░ ░░░ ░░░ ░░░   │
│      │ ██ │  Chiller: 31%        │ 6 ░░░ ██░ ██░ ██░ ██░ ██░ ░░░   │
│      │─██─│  VRF: 19%            │12 ░░░ ███ ███ ███ ███ ███ ░░░   │
│      │ ██ │  RTU: 8%             │18 ░░░ ██░ ██░ ██░ ██░ ██░ ░░░   │
└──────────────────────────────────┴─────────────────────────────────┘
```

### ✅ Verificações

- [ ] Todos os 12 widgets aparecem
- [ ] MTTF mostra "168 horas" com ↑ 5.3%
- [ ] Alertas Ativos mostra número real (não 0)
- [ ] Gráfico de barras mostra tags de equipamentos
- [ ] Tabela mostra alertas reais (Severidade, Ativo, Mensagem)
- [ ] Gráfico de pizza mostra distribuição por tipo
- [ ] Heatmap mostra densidade de alertas

---

## 📋 Cenário 2: Verificando Dados Reais vs Aleatórios

### Widget: Alertas Ativos

**Como testar:**
1. Abrir DevTools (F12)
2. Console → `useAppStore.getState().alerts`
3. Ver quantidade de alertas não resolvidos

**Código responsável:**
```typescript
// src/store/app.ts
const activeAlerts = alerts.filter(a => !a.resolved && !a.acknowledged).length;
```

**Esperado:**
- Widget mostra mesmo número que console
- Valor NÃO é aleatório
- Atualiza quando simulação roda

### Widget: Equipamentos Online

**Como testar:**
1. Console → `useAppStore.getState().assets`
2. Contar quantos têm `status: 'OK'`
3. Verificar total de assets

**Código responsável:**
```typescript
// src/components/dashboard/DraggableWidget.tsx
const onlineAssets = assets.filter(a => a.status === 'OK').length;
const totalAssets = assets.length;
return { value: `${onlineAssets}/${totalAssets}` };
```

**Esperado:**
- Widget mostra "X/Y" onde X é count real
- Formato: "11/12" ou similar
- Não mostra número aleatório

### Widget: Consumo por Equipamento

**Como testar:**
1. Console → `useAppStore.getState().assets.map(a => ({ tag: a.tag, power: a.powerConsumption }))`
2. Ver valores de powerConsumption

**Código responsável:**
```typescript
// src/components/dashboard/DraggableWidget.tsx
data.assets.slice(0, 6).map((asset, i) => {
  const height = (asset.powerConsumption / maxConsumption) * 100;
  return <div>{asset.powerConsumption.toFixed(0)}kWh</div>;
})
```

**Esperado:**
- Barras mostram valores reais de powerConsumption
- Tags corretas (AHU-001, Chiller-01, etc.)
- Alturas proporcionais ao consumo

---

## 📋 Cenário 3: Adicionando Novo Widget

### Passo a Passo

1. **Ativar modo de edição:**
   - Clicar no switch "Editar Layout" (canto superior direito)
   - Fundo fica verde indicando modo ativo

2. **Abrir biblioteca de widgets:**
   - Clicar botão "+ Adicionar Widget"
   - Modal com 18 widgets aparece

3. **Filtrar por categoria:**
   - Clicar filtro "Confiabilidade (4)"
   - Ver apenas 4 widgets: MTTF, Disponibilidade, Alertas, Health Score

4. **Adicionar widget "Disponibilidade de Sensores":**
   - Clicar no card correspondente
   - Widget aparece instantaneamente no final da grid

5. **Verificar auto-população:**
   ```
   ┌───────────────────────────────┐
   │ Disponibilidade de Sensores   │
   │                               │
   │ 95.2%                         │
   │ ↑ 2.1%                        │
   │ vs ontem                      │
   └───────────────────────────────┘
   ```

### ✅ Verificações

- [ ] Widget aparece imediatamente
- [ ] Mostra valor real (não 0, não Math.random())
- [ ] Cor verde (#3b82f6)
- [ ] Unidade "%" aparece
- [ ] Trend "↑ 2.1%" aparece
- [ ] Não pede configuração

---

## 📋 Cenário 4: Verificando Tabela de Alertas

### Passo a Passo

1. **Localizar widget "Últimos Alertas"** (geralmente linha 3)

2. **Verificar conteúdo:**
   - Colunas: Severidade | Ativo | Mensagem | Há quanto tempo
   - Máximo 5 linhas
   - Badges coloridos por severidade

3. **Validar ordenação:**
   - Primeiro alerta deve ser o mais crítico
   - Ordem: Critical → High → Medium → Low

4. **Verificar dados reais:**
   - Console → `useAppStore.getState().alerts.filter(a => !a.resolved).slice(0, 5)`
   - Comparar com tabela

### Código responsável

```typescript
// src/components/pages/EditableOverviewPage.tsx
topAlerts: alerts
  .filter(a => !a.resolved)
  .sort((a, b) => {
    const severityOrder = { 'Critical': 4, 'High': 3, 'Medium': 2, 'Low': 1 };
    return severityOrder[b.severity] - severityOrder[a.severity];
  })
  .slice(0, 5)
```

```typescript
// src/components/dashboard/DraggableWidget.tsx
if (isOverview && widget.id === 'overview-alerts-table' && data?.topAlerts) {
  return (
    <table>
      {data.topAlerts.map(alert => (
        <tr>
          <td><span className={getSeverityColor(alert.severity)}>{alert.severity}</span></td>
          <td>{alert.assetTag}</td>
          <td>{alert.message}</td>
          <td>{getTimeAgo(alert.timestamp)}</td>
        </tr>
      ))}
    </table>
  );
}
```

### ✅ Verificações

- [ ] Mostra até 5 alertas
- [ ] Severidade mais alta primeiro
- [ ] Badge com cor correta (Critical=vermelho, High=laranja)
- [ ] Tag do equipamento correto
- [ ] Mensagem descritiva
- [ ] Timestamp relativo ("2h atrás", "1d atrás")

---

## 📋 Cenário 5: Testando Gráfico de Pizza

### Passo a Passo

1. **Localizar widget "Distribuição de Consumo"** (linha 4)

2. **Verificar cálculo:**
   - Console →
     ```javascript
     const assets = useAppStore.getState().assets;
     const byType = assets.reduce((acc, a) => {
       acc[a.type] = (acc[a.type] || 0) + a.powerConsumption;
       return acc;
     }, {});
     console.log(byType);
     ```

3. **Comparar com widget:**
   - Percentuais devem corresponder ao cálculo
   - Cores consistentes entre arcos e legenda
   - Total deve ser 100%

### Código responsável

```typescript
// src/components/dashboard/DraggableWidget.tsx
if (isOverview && widget.id === 'overview-consumption-distribution' && data?.assets) {
  const consumptionByType = data.assets.reduce((acc, asset) => {
    const type = asset.type;
    acc[type] = (acc[type] || 0) + asset.powerConsumption;
    return acc;
  }, {});
  
  const total = Object.values(consumptionByType).reduce((a, b) => a + b, 0);
  
  // Renderiza SVG circle para cada tipo
  // Legenda com percentuais
}
```

### Exemplo Visual

```
     ╱──╲
    │ ██ │  AHU: 42.3%        ← Azul
    │ ██ │  Chiller: 31.2%    ← Verde
    │─██─│  VRF: 18.9%        ← Laranja
    │ ██ │  RTU: 7.6%         ← Roxo
     ╲──╱
```

### ✅ Verificações

- [ ] Soma dos percentuais = 100%
- [ ] Cada tipo de equipamento representado
- [ ] Cores distintas
- [ ] Legenda alinhada com arcos
- [ ] Valores correspondem ao console

---

## 📋 Cenário 6: Simulação em Tempo Real

### Configuração

1. **Verificar simulação ativa:**
   ```javascript
   // Console
   useAppStore.getState().isSimulationRunning
   // Deve retornar: true
   ```

2. **Forçar atualização manual:**
   ```javascript
   // Console
   const simEngine = (await import('./lib/simulation')).simEngine;
   simEngine.generateAlert('ahu-001', 'High', 'Teste manual');
   ```

3. **Aguardar atualização automática:**
   - Simulação atualiza a cada 5 minutos
   - Widgets reagem automaticamente via `useMemo`

### Teste de Reatividade

1. **Adicionar alerta manualmente:**
   ```javascript
   const { useAppStore } = await import('./store/app');
   useAppStore.getState().addManualAlert({
     id: 'test-' + Date.now(),
     assetId: 'ahu-001',
     assetTag: 'AHU-001',
     severity: 'Critical',
     type: 'temperature',
     message: 'Temperatura crítica - TESTE',
     timestamp: new Date(),
     acknowledged: false,
     resolved: false
   });
   ```

2. **Observar mudanças:**
   - Widget "Alertas Ativos" aumenta contador
   - Tabela "Últimos Alertas" adiciona linha
   - Heatmap atualiza densidade

### ✅ Verificações

- [ ] Contador de alertas aumenta
- [ ] Novo alerta aparece na tabela
- [ ] Ordenação mantida (severidade)
- [ ] Timestamp "Agora mesmo"
- [ ] Badge vermelho (Critical)

---

## 📋 Cenário 7: Resetando para Padrão

### Passo a Passo

1. **Adicionar vários widgets:**
   - Modo de edição → "+ Adicionar Widget"
   - Adicionar 5-6 widgets diferentes

2. **Remover alguns widgets padrão:**
   - Clicar no "X" vermelho de 2-3 widgets

3. **Reordenar widgets:**
   - Arrastar e soltar alguns widgets

4. **Resetar:**
   - Clicar botão "🔄 Restaurar Padrão"
   - Confirmar no dialog

5. **Verificar resultado:**
   - Exatamente 12 widgets padrão voltam
   - Ordem original restaurada
   - Widgets personalizados removidos

### Código responsável

```typescript
// src/store/overview.ts
resetToDefault: () => {
  set({ widgets: defaultWidgets, editMode: false });
}
```

### ✅ Verificações

- [ ] Confirmação antes de resetar
- [ ] 12 widgets padrão restaurados
- [ ] Ordem: 6 KPIs → 2 gráficos → 1 tabela → 2 análises
- [ ] Todos com dados reais
- [ ] Modo de edição desativado

---

## 🔍 Debugging: Como Verificar Dados

### Ver dados brutos do store

```javascript
// Console DevTools
const store = useAppStore.getState();

// Equipamentos
console.table(store.assets.map(a => ({ 
  tag: a.tag, 
  type: a.type, 
  status: a.status, 
  power: a.powerConsumption, 
  health: a.healthScore 
})));

// Sensores online
console.log(`Sensores: ${store.sensors.filter(s => s.online).length}/${store.sensors.length}`);

// Alertas ativos
console.table(store.alerts.filter(a => !a.resolved).map(a => ({
  asset: a.assetTag,
  severity: a.severity,
  message: a.message,
  time: new Date(a.timestamp).toLocaleString()
})));
```

### Ver dados calculados na página

```javascript
// Console DevTools (quando em Visão Geral)
// Este hook não está disponível diretamente, mas podemos simular:

const { assets, sensors, alerts } = useAppStore.getState();
const onlineSensors = sensors.filter(s => s.online).length;
const uptime = ((onlineSensors / sensors.length) * 100).toFixed(1);
const activeAlerts = alerts.filter(a => !a.resolved && !a.acknowledged).length;
const totalConsumption = assets.reduce((sum, a) => sum + a.powerConsumption, 0);
const avgHealth = (assets.reduce((sum, a) => sum + a.healthScore, 0) / assets.length).toFixed(1);

console.log('KPIs:', {
  uptime: uptime + '%',
  activeAlerts,
  consumption: totalConsumption.toFixed(0) + 'kWh',
  avgHealth: avgHealth + '%'
});
```

### Ver dados recebidos por widget específico

```javascript
// Adicionar temporariamente em DraggableWidget.tsx após getWidgetData():
console.log(`[${widget.id}] Data:`, widgetData);

// Recompilar e ver console
// Remover após debug
```

---

## 🎯 Checklist de Testes Completo

### Widgets Padrão
- [ ] MTTF mostra 168h com trend
- [ ] Disponibilidade mostra % real
- [ ] Alertas Ativos mostra quantidade correta
- [ ] Health Score mostra % médio
- [ ] Sensores Online mostra % real
- [ ] Equipamentos mostra X/Y formato

### Gráficos
- [ ] Consumo por Equipamento: 6 barras com tags corretas
- [ ] Histórico de Consumo: linha temporal
- [ ] Distribuição: pizza com % por tipo

### Tabelas e Heatmaps
- [ ] Tabela: até 5 alertas ordenados por severidade
- [ ] Heatmap: densidade 7 dias x 24 horas

### Interatividade
- [ ] Modo de edição liga/desliga
- [ ] Adicionar widget funciona
- [ ] Widget novo vem com dados reais
- [ ] Remover widget funciona
- [ ] Arrastar widget funciona
- [ ] Resetar restaura padrão

### Persistência
- [ ] Reload da página mantém widgets
- [ ] LocalStorage contém 'traksense-overview-storage'
- [ ] Mudanças persistem entre sessões

### Performance
- [ ] Widgets carregam instantaneamente
- [ ] Sem delay visível em cálculos
- [ ] Drag & drop suave
- [ ] Nenhum warning no console

---

## 🐛 Problemas Comuns e Soluções

### Widget mostra Math.random() em vez de dados reais

**Causa:** Widget ID não está no mapeamento `getWidgetData()`  
**Solução:**
1. Verificar `widget.id` no console
2. Adicionar caso em `getWidgetData()`:
   ```typescript
   case 'seu-widget-id':
     return { value: data.algumDado, unit: 'unidade' };
   ```

### Tabela de alertas vazia

**Causa:** `data.topAlerts` não está sendo passado  
**Verificar:**
```javascript
// Console
const { alerts } = useAppStore.getState();
alerts.filter(a => !a.resolved).length // Deve ser > 0
```

**Solução:** Se alerts.length === 0, simulação não está rodando:
```javascript
useAppStore.getState().startSimulation();
```

### Gráfico de pizza não aparece

**Causa:** `data.assets` não está disponível  
**Verificar:**
```javascript
// Console
useAppStore.getState().assets.length // Deve ser > 0
```

**Solução:** Verificar que EditableOverviewPage está passando `assets` em `dashboardData`

### Valores não atualizam

**Causa:** `useMemo` não está reagindo a mudanças  
**Solução:** Verificar dependencies do useMemo:
```typescript
const dashboardData = useMemo(() => {
  // ...
}, [assets, sensors, alerts, timeRange]); // ← TODAS as dependências
```

---

## ✅ Teste de Aceitação Final

Execute este teste para validar sistema completo:

```bash
# 1. Build
npm run build
# ✅ Deve compilar sem erros

# 2. Dev
npm run dev
# ✅ Deve iniciar em localhost:5002

# 3. Navegar
# ✅ Abrir Visão Geral

# 4. Verificar Widgets Padrão
# ✅ Todos os 12 widgets aparecem
# ✅ Nenhum mostra Math.random()
# ✅ Todos têm dados relevantes

# 5. Testar Interatividade
# ✅ Modo de edição funciona
# ✅ Adicionar widget funciona
# ✅ Remover widget funciona
# ✅ Resetar funciona

# 6. Reload
# ✅ F5 mantém widgets customizados

# 7. Console
# ✅ Sem erros TypeScript
# ✅ Sem warnings React
```

**Se todos os ✅ passarem:** Sistema 100% funcional! 🎉

---

**Status:** ✅ Sistema de auto-população completo e testável  
**Build:** ✅ 12.51s sem erros  
**Widgets Padrão:** ✅ 12 com dados reais  
**Biblioteca:** ✅ 18 widgets de gestão disponíveis  
**Documentação:** ✅ Guia prático completo
