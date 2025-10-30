# 🧪 GUIA DE TESTE E2E - Frontend Telemetria

**Data**: 19 de Outubro de 2025  
**Objetivo**: Validar integração completa Frontend → Backend  
**Tempo estimado**: 15-20 minutos

---

## 📋 PRÉ-REQUISITOS

### **Backend**
- ✅ Backend rodando em `http://localhost:8000`
- ✅ Usuário admin criado (`admin` / `admin`)
- ✅ Dados de teste gerados:
  ```bash
  cd traksense-backend
  docker exec -it traksense-api python test_generate_telemetry.py
  ```

### **Frontend**
- ✅ Frontend rodando em `http://localhost:5173`
- ✅ Login realizado com sucesso
- ✅ Device `GW-1760908415` existe no backend

---

## 🎯 TESTE 1: SENSORS PAGE - LOADING INICIAL

### **Objetivo**: Verificar carregamento de dados reais

### **Passos**:

1. **Acessar Sensors Page**
   - URL: `http://localhost:5173/sensors`
   - OU: Clicar em "Sensors" no menu lateral

2. **Observar Loading State**
   - ❓ **Esperado**: Spinner de loading aparece brevemente
   - ❓ **Esperado**: Texto "Carregando sensores..." visível

3. **Verificar Dados Carregados**
   - ❓ **Esperado**: Grid de sensores aparece após loading
   - ❓ **Esperado**: Sensores têm dados reais (não mock)
   - ❓ **Esperado**: Status "online" ou "offline" correto

### **Validações**:

| Item | Esperado | Status |
|------|----------|--------|
| Loading spinner aparece | ✅ Sim | ☐ |
| Sensores carregam em < 3s | ✅ Sim | ☐ |
| Grid exibe sensores | ✅ Sim | ☐ |
| Valores são números reais | ✅ Sim (ex: 22.5°C) | ☐ |
| Timestamp é recente | ✅ Últimos minutos | ☐ |

### **Como Validar Dados Reais**:

1. Abrir **DevTools** (F12)
2. Ir na aba **Network**
3. Procurar request: `GET /api/telemetry/device/GW-1760908415/summary/`
4. Verificar response tem `sensors` array

**Screenshot DevTools**:
```json
{
  "device_id": "GW-1760908415",
  "device_name": "Gateway Principal",
  "sensors": [
    {
      "sensor_id": "temp_supply_1",
      "sensor_name": "TEMP-1760908415",
      "sensor_type": "temp_supply",
      "is_online": true,
      "last_value": 22.5,
      "last_reading_at": "2025-10-19T23:00:00Z",
      "statistics_24h": { ... }
    }
  ]
}
```

---

## 🔄 TESTE 2: AUTO-REFRESH (30 SEGUNDOS)

### **Objetivo**: Verificar atualização automática de dados

### **Passos**:

1. **Permanecer na Sensors Page**
   - Não navegar para outra página
   - Manter aba ativa

2. **Observar Badge de Última Atualização**
   - ❓ **Esperado**: Badge com timestamp visível (ex: "Última atualização: 23:15:30")
   - ❓ **Esperado**: Indicador verde pulsante (●)

3. **Aguardar 30 Segundos**
   - Cronometrar 30 segundos
   - ❓ **Esperado**: Badge atualiza para novo timestamp
   - ❓ **Esperado**: Spinner pequeno aparece no header ("Atualizando...")

4. **Verificar Network (DevTools)**
   - Abrir aba Network
   - A cada 30s: nova request `GET /api/telemetry/device/.../summary/`
   - ❓ **Esperado**: Request automática sem interação do usuário

### **Validações**:

| Item | Esperado | Status |
|------|----------|--------|
| Badge de timestamp existe | ✅ Sim | ☐ |
| Indicador verde pulsante | ✅ Sim | ☐ |
| Auto-refresh a cada 30s | ✅ Sim | ☐ |
| Spinner "Atualizando..." | ✅ Sim (durante refresh) | ☐ |
| Request automática no Network | ✅ Sim | ☐ |
| Valores dos sensores atualizam | ✅ Sim (se houver novos dados) | ☐ |

### **Como Validar Auto-Refresh**:

1. Abrir **Console** (F12 → Console)
2. Ver logs do tipo:
   ```
   ✅ Telemetria carregada: 5 sensores
   ```
3. Aguardar 30s
4. Ver novo log idêntico (nova requisição)

---

## ⚠️ TESTE 3: ERROR HANDLING

### **Objetivo**: Verificar tratamento de erros

### **Cenários de Teste**:

#### **Cenário A: Backend Offline**

1. **Parar Backend**
   ```bash
   docker-compose down
   ```

2. **Recarregar Sensors Page** (F5)
   - ❓ **Esperado**: Mensagem de erro vermelha aparece
   - ❓ **Esperado**: Texto: "⚠️ Erro ao carregar telemetria"
   - ❓ **Esperado**: Fallback para dados mock (sensores ainda aparecem)

3. **Religar Backend**
   ```bash
   docker-compose up -d
   ```

4. **Aguardar 30s** (próximo auto-refresh)
   - ❓ **Esperado**: Erro desaparece
   - ❓ **Esperado**: Dados reais voltam a carregar

#### **Cenário B: Token Expirado**

1. **Simular Token Inválido**
   - Abrir DevTools → Application → Local Storage
   - Alterar valor de `token` para `"invalid-token-123"`

2. **Recarregar Sensors Page**
   - ❓ **Esperado**: Redirecionamento para `/login`
   - OU: Mensagem de erro "Não autorizado"

### **Validações**:

| Item | Esperado | Status |
|------|----------|--------|
| Erro visível quando API offline | ✅ Sim | ☐ |
| Fallback para mock data | ✅ Sim | ☐ |
| Erro desaparece ao religar backend | ✅ Sim | ☐ |
| Token inválido redireciona login | ✅ Sim | ☐ |

---

## 🎨 TESTE 4: UI STATES (Estados Visuais)

### **Objetivo**: Verificar todos os estados da UI

### **Estados para Testar**:

#### **Estado 1: Loading Inicial (Primeira Carga)**

**Quando**: Ao entrar na página pela primeira vez

**Esperado**:
- ✅ Spinner grande centralizado
- ✅ Texto "Carregando sensores..."
- ✅ Background branco/cinza claro

#### **Estado 2: Loading Refresh (Auto-Atualização)**

**Quando**: A cada 30 segundos

**Esperado**:
- ✅ Spinner pequeno no header (não bloqueia UI)
- ✅ Texto "Atualizando..."
- ✅ Grid de sensores permanece visível

#### **Estado 3: Success (Dados Carregados)**

**Quando**: Após loading bem-sucedido

**Esperado**:
- ✅ Grid de sensores cards visível
- ✅ Badge "Última atualização: HH:MM:SS"
- ✅ Indicador verde pulsante (●)
- ✅ Valores numéricos reais

#### **Estado 4: Empty (Sem Dados)**

**Quando**: Device sem sensores

**Esperado**:
- ✅ Mensagem "Nenhum sensor encontrado"
- ✅ Texto explicativo: "Verifique os filtros..."
- ✅ Centralizado na tela

#### **Estado 5: Error (Erro na API)**

**Quando**: Backend offline ou erro 500

**Esperado**:
- ✅ Mensagem vermelha com ⚠️
- ✅ Texto: "Erro ao carregar telemetria"
- ✅ Dados anteriores ou mock data visíveis

### **Validações**:

| Estado | Visualmente Correto | Status |
|--------|---------------------|--------|
| Loading Inicial | ✅ Spinner + texto | ☐ |
| Loading Refresh | ✅ Spinner header | ☐ |
| Success | ✅ Grid + badge | ☐ |
| Empty | ✅ Mensagem centralizada | ☐ |
| Error | ✅ Mensagem vermelha | ☐ |

---

## 🔧 TESTE 5: CLEANUP (PREVENÇÃO DE MEMORY LEAKS)

### **Objetivo**: Verificar limpeza de recursos ao sair da página

### **Passos**:

1. **Entrar na Sensors Page**
   - Verificar auto-refresh iniciado

2. **Abrir Console** (F12)
   - Ver logs de telemetria

3. **Navegar para Outra Página** (ex: Dashboard)
   - Ir para `/dashboard` ou `/overview`

4. **Aguardar 30s**
   - ❓ **Esperado**: Não aparecem novos logs de telemetria
   - ❓ **Esperado**: Nenhuma request para `/api/telemetry/...`

5. **Voltar para Sensors Page**
   - ❓ **Esperado**: Auto-refresh reinicia
   - ❓ **Esperado**: Novas requests aparecem

### **Validações**:

| Item | Esperado | Status |
|------|----------|--------|
| Auto-refresh para ao sair | ✅ Sim | ☐ |
| Sem requests em background | ✅ Sim | ☐ |
| Auto-refresh reinicia ao voltar | ✅ Sim | ☐ |
| Console sem erros | ✅ Sim | ☐ |

---

## 📊 TESTE 6: TELEMETRYCHART COMPONENT (VISUAL)

### **Objetivo**: Verificar que o componente TelemetryChart existe e funciona

### **Passos**:

1. **Abrir Console do Browser** (F12)

2. **Executar Código de Teste**:
   ```javascript
   // Importar component (via module)
   import { TelemetryChart } from '@/components/charts/TelemetryChart';
   
   // Verificar se foi exportado corretamente
   console.log('TelemetryChart:', typeof TelemetryChart);
   // Esperado: "function"
   ```

3. **Verificar Arquivo Existe**:
   - Navegar: `traksense-hvac-monit/src/components/charts/TelemetryChart.tsx`
   - ❓ **Esperado**: Arquivo existe
   - ❓ **Esperado**: ~650 linhas de código

4. **Verificar Exports**:
   ```javascript
   // No console:
   Object.keys(await import('@/components/charts/TelemetryChart'))
   // Esperado: ["TelemetryChart", "MultiSeriesTelemetryChart", "TemperatureChart", "PowerChart", "PressureChart", "default"]
   ```

### **Validações**:

| Item | Esperado | Status |
|------|----------|--------|
| TelemetryChart.tsx existe | ✅ Sim | ☐ |
| TelemetryChart exportado | ✅ function | ☐ |
| MultiSeriesTelemetryChart exportado | ✅ function | ☐ |
| Presets exportados | ✅ 3 presets | ☐ |
| Sem erros de compilação | ✅ Sim | ☐ |

---

## 📈 TESTE 7: PERFORMANCE

### **Objetivo**: Verificar que a aplicação é responsiva

### **Métricas para Medir**:

#### **1. Tempo de Loading Inicial**

**Como medir**:
1. Abrir DevTools → Network
2. Recarregar página (Ctrl+Shift+R)
3. Ver tempo da request `GET /api/telemetry/device/.../summary/`

**Esperado**:
- ✅ < 1 segundo: Excelente
- ⚠️ 1-3 segundos: Aceitável
- ❌ > 3 segundos: Problema

#### **2. Tempo de Auto-Refresh**

**Como medir**:
1. Aguardar auto-refresh (30s)
2. Ver tempo no Network

**Esperado**:
- ✅ < 500ms: Excelente
- ⚠️ 500ms-1s: Aceitável
- ❌ > 1s: Problema

#### **3. Memória da Aba**

**Como medir**:
1. DevTools → Performance → Memory
2. Tirar snapshot inicial
3. Aguardar 5 minutos (10 auto-refreshes)
4. Tirar novo snapshot

**Esperado**:
- ✅ Memória estável (não cresce constantemente)
- ❌ Memory leak (cresce 10MB+ por minuto)

### **Validações**:

| Métrica | Valor | Status |
|---------|-------|--------|
| Loading inicial | < 1s | ☐ |
| Auto-refresh | < 500ms | ☐ |
| Memory stable | Sim | ☐ |

---

## ✅ CHECKLIST FINAL DE VALIDAÇÃO

### **Backend API**

- [ ] Endpoint `/api/telemetry/latest/{device_id}/` funciona
- [ ] Endpoint `/api/telemetry/history/{device_id}/` funciona
- [ ] Endpoint `/api/telemetry/device/{device_id}/summary/` funciona
- [ ] Auto-agregação funciona (buckets corretos)
- [ ] Performance < 1s em todos endpoints
- [ ] Error handling correto (404, 401, 500)

### **Frontend Integration**

- [ ] SensorsPage carrega dados reais do backend
- [ ] Loading state aparece durante carregamento
- [ ] Dados corretos exibidos (valores, timestamps)
- [ ] Auto-refresh funciona a cada 30s
- [ ] Badge de última atualização atualiza
- [ ] Error handling exibe mensagem
- [ ] Fallback para mock data funciona
- [ ] Cleanup ao sair da página (sem memory leak)

### **UI States**

- [ ] Loading inicial (spinner grande)
- [ ] Loading refresh (spinner header)
- [ ] Success (grid + badge)
- [ ] Empty (mensagem centralizada)
- [ ] Error (mensagem vermelha)

### **TelemetryChart Component**

- [ ] TelemetryChart.tsx existe
- [ ] Component compila sem erros
- [ ] Exports corretos (5 exports)
- [ ] chartHelpers.ts existe (6 funções)

### **Performance**

- [ ] Loading < 1s
- [ ] Auto-refresh < 500ms
- [ ] Sem memory leaks
- [ ] Console sem erros

---

## 🎯 RESULTADO ESPERADO

### **✅ TESTES PASSARAM**

Se todos os itens acima estiverem ✅:

```
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║  ✅ INTEGRAÇÃO TELEMETRIA COMPLETA E FUNCIONAL!           ║
║                                                            ║
║  Backend: ✓ 3 endpoints funcionando                       ║
║  Frontend: ✓ Dados reais carregando                       ║
║  Auto-Refresh: ✓ 30s funcionando                          ║
║  Performance: ✓ < 1s loading                              ║
║  Error Handling: ✓ Tratamento correto                     ║
║                                                            ║
║  FASE 3 - 100% COMPLETA! 🎉                               ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
```

### **⚠️ PROBLEMAS ENCONTRADOS**

Se algum teste falhar:

1. **Verificar logs do backend**:
   ```bash
   docker logs traksense-api
   ```

2. **Verificar console do frontend**:
   - F12 → Console
   - Procurar erros vermelhos

3. **Verificar network requests**:
   - F12 → Network
   - Status codes (200, 401, 500, etc.)

4. **Executar teste backend**:
   ```bash
   cd traksense-backend
   python test_telemetry_e2e.py
   ```

---

## 📝 RELATÓRIO DE TESTES

Ao finalizar os testes, preencha:

**Data**: __/__/____  
**Testador**: _________________  
**Ambiente**: Local / Dev / Prod

| Teste | Status | Observações |
|-------|--------|-------------|
| 1. Loading Inicial | ☐ Pass ☐ Fail |  |
| 2. Auto-Refresh | ☐ Pass ☐ Fail |  |
| 3. Error Handling | ☐ Pass ☐ Fail |  |
| 4. UI States | ☐ Pass ☐ Fail |  |
| 5. Cleanup | ☐ Pass ☐ Fail |  |
| 6. TelemetryChart | ☐ Pass ☐ Fail |  |
| 7. Performance | ☐ Pass ☐ Fail |  |

**Resultado Geral**: ☐ APROVADO ☐ REPROVADO

**Comentários**:
```
_______________________________________________________________
_______________________________________________________________
_______________________________________________________________
```

---

**Última Atualização**: 19 de Outubro de 2025  
**Responsável**: GitHub Copilot  
**Status**: Aguardando execução de testes
