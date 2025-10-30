# 🐛 BUGFIX: Notificações Mockadas Geradas Automaticamente

> **Data:** 30 de outubro de 2025  
> **Problema:** Notificações eram re-criadas automaticamente após limpar todas  
> **Causa:** useEffect no App.tsx criando notificações de exemplo em DEV mode  
> **Status:** ✅ CORRIGIDO

---

## 🔍 Problema Identificado

### Sintoma

Ao clicar em "Marcar todas como lidas" ou limpar todas as notificações no header, **automaticamente novas notificações eram geradas** com conteúdo mockado:

1. "HVAC: Consumo acima do esperado"
2. "Sensores sincronizados"
3. "Alerta crítico: Temperatura alta"

### Causa Raiz

No arquivo `src/App.tsx`, linhas 40-61, havia um `useEffect` que:

```typescript
useEffect(() => {
  if (import.meta.env.DEV && notifications.length === 0) {
    // Add some sample notifications for testing
    addNotification({
      title: 'HVAC: Consumo acima do esperado',
      // ...
    });
    // ... mais 2 notificações
  }
}, [addNotification, notifications.length]);
```

**Problema:** O efeito dependia de `notifications.length`, então:
- Quando o usuário limpava todas as notificações
- `notifications.length` voltava a ser 0
- O efeito era re-executado
- Novas notificações mockadas eram criadas

---

## ✅ Solução Implementada

### Mudanças no Código

**Arquivo:** `src/App.tsx`

#### Antes (❌ Problemático)

```typescript
// Seed notifications in development mode
useEffect(() => {
  if (import.meta.env.DEV && notifications.length === 0) {
    // Add some sample notifications for testing
    addNotification({
      title: 'HVAC: Consumo acima do esperado',
      message: 'Zona L2 apresenta consumo 18% acima da meta estabelecida',
      severity: 'warning',
    });
    
    addNotification({
      title: 'Sensores sincronizados',
      message: 'Todos os sensores da planta foram sincronizados com sucesso',
      severity: 'info',
    });
    
    addNotification({
      title: 'Alerta crítico: Temperatura alta',
      message: 'Chiller 02 operando com temperatura de condensação acima do limite',
      severity: 'critical',
    });
  }
}, [addNotification, notifications.length]);
```

#### Depois (✅ Corrigido)

```typescript
// REMOVIDO: Seed de notificações mockadas
// As notificações agora devem vir APENAS do backend via API
// useEffect(() => {
//   if (import.meta.env.DEV && notifications.length === 0) {
//     // Add some sample notifications for testing
//     addNotification({
//       title: 'HVAC: Consumo acima do esperado',
//       message: 'Zona L2 apresenta consumo 18% acima da meta estabelecida',
//       severity: 'warning',
//     });
//     
//     addNotification({
//       title: 'Sensores sincronizados',
//       message: 'Todos os sensores da planta foram sincronizados com sucesso',
//       severity: 'info',
//     });
//     
//     addNotification({
//       title: 'Alerta crítico: Temperatura alta',
//       message: 'Chiller 02 operando com temperatura de condensação acima do limite',
//       severity: 'critical',
//     });
//   }
// }, [addNotification, notifications.length]);
```

### Remoção de Imports Não Utilizados

```typescript
// Antes
const { add: addNotification, items: notifications } = useNotifications();

// Depois (removido, pois não é mais usado)
// (linha removida completamente)
```

---

## 🔄 Como o Sistema DEVE Funcionar Agora

### Fluxo Correto de Notificações

```
┌─────────────────────────────────────────────────────────────────┐
│                         BACKEND                                 │
├─────────────────────────────────────────────────────────────────┤
│ 1. Celery Task avalia regras a cada 5 minutos                   │
│ 2. Cria alertas no banco de dados                               │
│ 3. Disponibiliza via API /api/alerts/alerts/                    │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                │
├─────────────────────────────────────────────────────────────────┤
│ 1. alertsStore faz polling a cada 30 segundos                   │
│    (somente quando AlertsPage está montada)                     │
│    ↓                                                             │
│ 2. Compara alertas novos com lista anterior                     │
│    ↓                                                             │
│ 3. Para cada NOVO alerta ativo:                                 │
│    - Mapeia severidade (Critical/High → critical/warning)       │
│    - Cria notificação via useNotifications.add()                │
│    ↓                                                             │
│ 4. Notificação aparece no header (ícone sino)                   │
└─────────────────────────────────────────────────────────────────┘
```

### Onde as Notificações São Criadas

**Arquivo:** `src/store/alertsStore.ts`, linhas 69-94

```typescript
fetchAlerts: async () => {
  // ... fetch API ...
  
  // Detectar novos alertas e criar notificações
  const newAlerts = data.results.filter(alert => 
    alert.is_active && !previousAlerts.some(prev => prev.id === alert.id)
  );
  
  if (newAlerts.length > 0) {
    const notificationsStore = useNotifications.getState();
    newAlerts.forEach(alert => {
      // Mapear severity da API para notificação
      let severity: 'info' | 'warning' | 'critical' = 'info';
      const alertSeverity = alert.severity.toLowerCase();
      if (alertSeverity.includes('critical')) severity = 'critical';
      else if (alertSeverity.includes('high')) severity = 'warning';
      
      notificationsStore.add({
        title: alert.rule_name,
        message: alert.message,
        severity,
      });
    });
  }
}
```

---

## ✅ Resultado Esperado

### Antes da Correção

1. Usuário clica em "Marcar todas como lidas" ❌
2. Notificações desaparecem temporariamente ❌
3. **Imediatamente 3 novas notificações mockadas aparecem** ❌
4. Usuário não consegue limpar as notificações ❌

### Depois da Correção

1. Usuário clica em "Marcar todas como lidas" ✅
2. Notificações marcadas como lidas permanecem assim ✅
3. **Nenhuma notificação mockada é criada** ✅
4. Novas notificações aparecem **SOMENTE** quando:
   - Backend cria novos alertas ✅
   - AlertsPage está aberta (polling ativo) ✅
   - Alertas são detectados como novos ✅

---

## 🧪 Como Testar

### Teste 1: Limpar Notificações

1. Acesse a aplicação
2. Clique no ícone de sino no header
3. Clique em "Marcar todas como lidas"
4. ✅ **Esperado:** Notificações marcadas como lidas, nenhuma nova criada

### Teste 2: Notificações do Backend

1. Acesse a página de Alertas
2. No backend, crie um novo alerta (via admin ou celery task)
3. Aguarde até 30 segundos (polling)
4. ✅ **Esperado:** Nova notificação aparece no header

### Teste 3: Persistência

1. Marque notificações como lidas
2. Feche o navegador
3. Reabra a aplicação
4. ✅ **Esperado:** Notificações continuam como lidas (persiste no localStorage)

---

## 📊 Arquivos Modificados

### `src/App.tsx`

**Mudanças:**
1. ❌ Removido useEffect que criava notificações mockadas
2. ❌ Removido import `useNotifications` (não usado)
3. ✅ Comentado código com explicação clara

**Linhas afetadas:** 17-61

---

## 🔗 Referências

### Documentação Relacionada

- **Sistema de Notificações:** `docs/implementacao/IMPLEMENTACAO_NOTIFICACOES_COMPLETA.md`
- **Integração Alertas:** `docs/integracao/INTEGRACAO_COMPLETA_ALERTAS.md`
- **Store de Alertas:** `src/store/alertsStore.ts`
- **Store de Notificações:** `src/store/notifications.ts`

### Endpoints de Backend

```
GET /api/alerts/alerts/             - Lista alertas
GET /api/alerts/alerts/statistics/  - Estatísticas de alertas
POST /api/alerts/alerts/{id}/acknowledge/  - Reconhecer alerta
POST /api/alerts/alerts/{id}/resolve/      - Resolver alerta
```

---

## ⚠️ Notas Importantes

### Para Desenvolvedores

Se você precisar testar notificações sem backend:

1. **Não reative o código mockado no App.tsx**
2. Use o console do navegador:

```javascript
// Abra console (F12) e execute:
const { add } = useNotifications.getState();
add({
  title: 'Teste de notificação',
  message: 'Esta é uma notificação de teste',
  severity: 'warning'
});
```

### Para QA

- Notificações devem aparecer APENAS quando há novos alertas do backend
- Limpar notificações deve ser permanente (até novos alertas)
- Sistema de polling funciona apenas com AlertsPage aberta

---

## ✅ Checklist de Validação

- [x] Código mockado removido do App.tsx
- [x] Imports não utilizados removidos
- [x] Comentários explicativos adicionados
- [x] Notificações não são mais re-criadas automaticamente
- [x] Sistema continua funcionando com backend (alertsStore)
- [x] Documentação criada (este arquivo)

---

**🎉 Bug corrigido! Notificações agora vêm APENAS do backend!**

**📅 Data:** 30 de outubro de 2025  
**👨‍💻 Corrigido por:** Sistema de IA  
**🔧 Arquivos modificados:** 1 (src/App.tsx)
