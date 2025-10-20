# ⚡ BUGFIX URGENTE: Simulação Substituindo Assets da API

**Data**: 19 de outubro de 2025  
**Status**: ✅ **CORRIGIDO**  
**Impacto**: 🔴 CRÍTICO

---

## 🐛 **PROBLEMA**

Após **10 minutos exatos**, assets da API desapareciam e eram substituídos por 7 assets mockados.

---

## 🔍 **CAUSA**

`App.tsx` iniciava automaticamente `startSimulation()`, que criava um `setInterval` de **5 minutos** sobrescrevendo:

```typescript
// A cada 5 minutos:
set({
  assets: simEngine.getAssets() // ❌ SUBSTITUI API POR MOCK!
});
```

**Timeline**:
- t=0: ✅ 3 assets da API
- t=5min: ⚠️ Primeira substituição
- t=10min: ❌ **Assets viram mock (visível ao usuário)**

---

## ✅ **SOLUÇÃO**

Desabilitei `startSimulation()` automático em `src/App.tsx`:

```tsx
// ❌ ANTES:
useEffect(() => {
  startSimulation(); // Iniciava automaticamente
}, []);

// ✅ DEPOIS:
// useEffect(() => { ... }); // Comentado
```

---

## 🎯 **RESULTADO**

| Aspecto | Antes | Depois |
|---------|-------|--------|
| Assets após 10min | 7 mockados | 3 da API ✅ |
| Assets após 30min | 7 mockados | 3 da API ✅ |
| Simulação auto | ✅ Sim | ❌ Não |
| Dados estáveis | ❌ Não | ✅ Sim |

---

## 🧪 **TESTE**

1. Iniciar app: `npm run dev`
2. Acessar "Ativos"
3. **Aguardar 15+ minutos** ⏱️
4. ✅ Verificar: Assets da API permanecem!

---

## 📄 **DOCUMENTAÇÃO**

Detalhes completos: `BUGFIX_SIMULATION_SOBRESCREVE_API.md`

---

## 🎉 **CONCLUSÃO**

**Assets da API agora permanecem indefinidamente sem serem substituídos!** 🚀

A simulação ainda existe mas deve ser ativada **manualmente** via console se necessário:
```javascript
useAppStore.getState().startSimulation()
```
