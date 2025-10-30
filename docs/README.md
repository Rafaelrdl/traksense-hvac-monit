# 📚 TrakSense Frontend - Documentação

> **Estrutura organizada da documentação do projeto TrakSense HVAC Monitoring (React + TypeScript)**

---

## 📂 Estrutura de Pastas

```
docs/
├── fases/              # Documentação das fases de desenvolvimento
├── implementacao/      # Detalhes de implementações específicas
├── guias/              # Guias e tutoriais
├── bugfixes/           # Documentação de correções de bugs
└── integracao/         # Documentação de integrações e migrações
```

---

## 🗂️ Subpastas Detalhadas

### 📅 `fases/` - Fases de Desenvolvimento

Documentação das fases do projeto organizadas cronologicamente.

**Conteúdo:**
- `FASE_3_*.md` - Fase 3: Telemetria e gráficos
- `FASE_5_*.md` - Fase 5: Implementações completas
- `FASE_6_*.md` - Fase 6: Resumos executivos

**Quando usar:**
- Planejamento de novas fases
- Documentação de entregas
- Resumos executivos
- Histórico do projeto

---

### 🔧 `implementacao/` - Implementações

Detalhes técnicos de features específicas implementadas.

**Conteúdo:**
- `IMPLEMENTACAO_*.md` - Documentação de implementações de features
- `IMPLEMENTACAO_MULTI_PARAMETRO_REGRAS.md` - ⭐ **NOVO**: Sistema de múltiplos parâmetros por regra
- Detalhes técnicos de componentes
- Fluxos de integração
- Decisões arquiteturais

**Quando usar:**
- Implementar nova feature
- Documentar decisões técnicas
- Referência para manutenção
- Onboarding de desenvolvedores

---

### 📖 `guias/` - Guias e Tutoriais

Guias práticos para desenvolvedores e testadores.

**Conteúdo:**
- `GUIA_TESTE_*.md` - Guias de teste de features
- Tutoriais passo a passo
- Checklist de validação
- Instruções de debug

**Quando usar:**
- Testar features implementadas
- Validar funcionalidades
- Debug de problemas
- Onboarding de QA

---

### 🐛 `bugfixes/` - Correções de Bugs

Documentação de bugs encontrados e suas soluções.

**Conteúdo:**
- `BUGFIX_*.md` - Análise e solução de bugs
- Root cause analysis
- Soluções aplicadas
- Prevenção futura

**Quando usar:**
- Documentar bugs críticos
- Registrar soluções
- Prevenir regressões
- Knowledge base de erros

---

### 🔗 `integracao/` - Integrações

Documentação de integrações com backend e migrações.

**Conteúdo:**
- `INTEGRACAO_*.md` - Integrações com APIs
- `MULTI_TENANT_*.md` - Multi-tenancy
- `MIGRACAO_*.md` - Migrações de dados/features
- `TENANT_*.md` - Contexto de tenant

**Quando usar:**
- Integrar com backend
- Implementar multi-tenancy
- Migrar features/dados
- Documentar contexto de tenant

---

## 🔍 Como Encontrar Documentação

### Por Tipo de Tarefa

| **Tarefa** | **Pasta** | **Exemplo** |
|------------|-----------|-------------|
| Entender histórico do projeto | `fases/` | `FASE_3_RESUMO.md` |
| Implementar feature específica | `implementacao/` | `IMPLEMENTACAO_STATUS_ONLINE_OFFLINE.md` |
| Testar funcionalidade | `guias/` | `GUIA_TESTE_E2E_TELEMETRIA.md` |
| Corrigir bug | `bugfixes/` | `BUGFIX_PAGINA_BRANCA_UNDEFINED.md` |
| Integrar com backend | `integracao/` | `INTEGRACAO_COMPLETA_ALERTAS.md` |

### Por Prefixo de Arquivo

| **Prefixo** | **Localização** | **Descrição** |
|-------------|-----------------|---------------|
| `FASE_*.md` | `docs/fases/` | Documentação de fases |
| `IMPLEMENTACAO_*.md` | `docs/implementacao/` | Detalhes de implementação |
| `GUIA_*.md` | `docs/guias/` | Guias e tutoriais |
| `BUGFIX_*.md` | `docs/bugfixes/` | Correções de bugs |
| `INTEGRACAO_*.md` | `docs/integracao/` | Integrações |
| `MULTI_TENANT_*.md` | `docs/integracao/` | Multi-tenancy |
| `MIGRACAO_*.md` | `docs/integracao/` | Migrações |

---

## 📋 Convenções de Nomenclatura

### Estrutura de Nome

```
[PREFIXO]_[DESCRIÇÃO_RESUMIDA].md
```

**Exemplos:**
- ✅ `FASE_3_TELEMETRIA_PLANEJAMENTO.md`
- ✅ `IMPLEMENTACAO_AUTO_REFRESH_TEMPO_REAL.md`
- ✅ `GUIA_TESTE_PREFERENCES.md`
- ✅ `BUGFIX_STATUS_OFFLINE_THRESHOLD.md`
- ✅ `INTEGRACAO_PROFILE_COMPLETA.md`

### Regras

1. **Use PREFIXOS claros** (FASE, IMPLEMENTACAO, GUIA, BUGFIX, INTEGRACAO)
2. **Use SNAKE_CASE** (palavras separadas por underscore)
3. **Seja DESCRITIVO** (nome deve indicar o conteúdo)
4. **Use .md** (Markdown) para documentação

---

## ✅ Checklist para Nova Documentação

Antes de criar um novo documento:

- [ ] Identificar o tipo (fase, implementação, guia, bugfix, integração)
- [ ] Escolher o prefixo correto
- [ ] Definir nome descritivo
- [ ] Escolher a pasta correta (fases/, implementacao/, guias/, bugfixes/, integracao/)
- [ ] Usar o caminho completo: `docs/[pasta]/[PREFIXO]_[NOME].md`

---

## 🚫 Arquivos Proibidos na Raiz

❌ **NUNCA** crie arquivos de documentação na raiz do projeto!

**ERRADO:**
```
traksense-hvac-monit/
├── FASE_7.md ❌
├── IMPLEMENTACAO_NOVA.md ❌
├── GUIA_TESTE.md ❌
└── BUGFIX_ALGO.md ❌
```

**CORRETO:**
```
traksense-hvac-monit/
└── docs/
    ├── fases/
    │   └── FASE_7.md ✅
    ├── implementacao/
    │   └── IMPLEMENTACAO_NOVA.md ✅
    ├── guias/
    │   └── GUIA_TESTE.md ✅
    └── bugfixes/
        └── BUGFIX_ALGO.md ✅
```

---

## 📊 Estatísticas

**Reorganização (30 de outubro de 2025):**
- ✅ 21+ arquivos organizados
- ✅ 5 subpastas criadas
- ✅ Estrutura padronizada
- ✅ Convenções estabelecidas

---

## 🔗 Links Úteis

### Documentação Principal
- **[INDEX.md](../INDEX.md)** - Índice completo do projeto
- **[README.md](../README.md)** - Visão geral do projeto

### Para Desenvolvedores
- **[Instruções para IA](.github/ai-instructions/README.md)** - Regras de organização
- **[Copilot Instructions](.github/copilot-instructions.md)** - Guia completo do Copilot

---

## 🆘 Precisa de Ajuda?

**Não sabe onde colocar um arquivo?**

1. Identifique o tipo de documento (fase, implementação, guia, bugfix, integração)
2. Use o prefixo correto no nome
3. Coloque na pasta correspondente
4. Em caso de dúvida, consulte `.github/ai-instructions/QUICK_REFERENCE.md`

**Arquivo existente no lugar errado?**

- Mova para a pasta correta seguindo as convenções
- Atualize referências em outros documentos
- Documente a mudança

---

**📅 Última atualização:** 30 de outubro de 2025  
**🔧 Tecnologias:** React 19 + TypeScript + Vite  
**👥 Mantenedores:** Equipe TrakSense
