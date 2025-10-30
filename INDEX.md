# 📑 TrakSense HVAC Monitoring - Índice Completo

> **Navegação rápida para toda a documentação e código do frontend**

---

## 🎯 Visão Geral

**TrakSense HVAC Monitoring** é uma aplicação React moderna para monitoramento de HVAC com:
- 🏢 **Multi-tenant** - Suporte a múltiplos tenants/sites
- 📊 **Telemetria em tempo real** - Gráficos e dashboards
- 🔔 **Sistema de alertas** - Notificações e regras
- 👥 **Gerenciamento de equipe** - Usuários e permissões
- ⚙️ **Preferências customizáveis** - Regionalização e configurações

---

## 📂 Estrutura do Projeto

```
traksense-hvac-monit/
├── .github/                    # Configurações GitHub e AI
│   ├── ai-instructions/        # 🤖 Instruções para AI (LEIA PRIMEIRO!)
│   └── copilot-instructions.md # Guia completo do Copilot
├── docs/                       # 📚 Documentação completa
│   ├── fases/                  # Fases de desenvolvimento
│   ├── implementacao/          # Implementações de features
│   ├── guias/                  # Guias e tutoriais
│   ├── bugfixes/               # Correções de bugs
│   └── integracao/             # Integrações e migrações
├── public/                     # Arquivos públicos estáticos
├── src/                        # 💻 Código fonte
│   ├── api/                    # Integrações com backend
│   ├── components/             # Componentes React
│   ├── contexts/               # Contextos React
│   ├── hooks/                  # Custom hooks
│   ├── lib/                    # Bibliotecas e utilitários
│   ├── pages/                  # Páginas/rotas
│   ├── store/                  # Estado global (Zustand)
│   └── types/                  # Tipos TypeScript
├── package.json                # Dependências e scripts
├── tsconfig.json               # Configuração TypeScript
├── vite.config.ts              # Configuração Vite
└── tailwind.config.js          # Configuração Tailwind CSS
```

---

## 📚 Documentação

### 🤖 Instruções para IA (Prioritário!)

**LEIA PRIMEIRO antes de criar qualquer arquivo:**

- **[.github/ai-instructions/README.md](.github/ai-instructions/README.md)** - Visão geral das instruções
- **[.github/ai-instructions/.copilot-rules](.github/ai-instructions/.copilot-rules)** - Regras rápidas
- **[.github/ai-instructions/AI_FILE_ORGANIZATION_WARNING.md](.github/ai-instructions/AI_FILE_ORGANIZATION_WARNING.md)** - Guia visual
- **[.github/ai-instructions/QUICK_REFERENCE.md](.github/ai-instructions/QUICK_REFERENCE.md)** - Referência rápida

### 📖 Documentação Geral

- **[docs/README.md](docs/README.md)** - Estrutura da documentação
- **[README.md](README.md)** - Visão geral do projeto

### 📅 Fases de Desenvolvimento

| Fase | Arquivo | Descrição |
|------|---------|-----------|
| **Fase 3** | [FASE_3_COMPLETO_EXECUTIVO.md](docs/fases/FASE_3_COMPLETO_EXECUTIVO.md) | Resumo executivo completo |
| **Fase 3** | [FASE_3_DIA_4_APP_STORE.md](docs/fases/FASE_3_DIA_4_APP_STORE.md) | App store integration |
| **Fase 3** | [FASE_3_DIA_5_SENSORS_PAGE.md](docs/fases/FASE_3_DIA_5_SENSORS_PAGE.md) | Página de sensores |
| **Fase 3** | [FASE_3_DIA_6-7_CHARTS.md](docs/fases/FASE_3_DIA_6-7_CHARTS.md) | Implementação de gráficos |
| **Fase 3** | [FASE_3_FRONTEND_DIA_3-7.md](docs/fases/FASE_3_FRONTEND_DIA_3-7.md) | Frontend completo |
| **Fase 3** | [FASE_3_IMPLEMENTACAO_DIA_1-2.md](docs/fases/FASE_3_IMPLEMENTACAO_DIA_1-2.md) | Implementação inicial |
| **Fase 3** | [FASE_3_RESUMO.md](docs/fases/FASE_3_RESUMO.md) | Resumo da fase |
| **Fase 3** | [FASE_3_TELEMETRIA_PLANEJAMENTO.md](docs/fases/FASE_3_TELEMETRIA_PLANEJAMENTO.md) | Planejamento de telemetria |
| **Fase 5** | [FASE_5_IMPLEMENTACAO_COMPLETA.md](docs/fases/FASE_5_IMPLEMENTACAO_COMPLETA.md) | Implementação completa |
| **Fase 6** | [FASE_6_COMPLETA_RESUMO_EXECUTIVO.md](docs/fases/FASE_6_COMPLETA_RESUMO_EXECUTIVO.md) | Resumo executivo |

### 🔧 Implementações

| Feature | Arquivo | Descrição |
|---------|---------|-----------|
| **Auto Refresh** | [IMPLEMENTACAO_AUTO_REFRESH_TEMPO_REAL.md](docs/implementacao/IMPLEMENTACAO_AUTO_REFRESH_TEMPO_REAL.md) | Atualização em tempo real |
| **Notificações** | [IMPLEMENTACAO_NOTIFICACOES_COMPLETA.md](docs/implementacao/IMPLEMENTACAO_NOTIFICACOES_COMPLETA.md) | Sistema de notificações |
| **Seletor de Sites** | [IMPLEMENTACAO_SELETOR_SITES.md](docs/implementacao/IMPLEMENTACAO_SELETOR_SITES.md) | Seleção de sites |
| **Status Online/Offline** | [IMPLEMENTACAO_STATUS_ONLINE_OFFLINE.md](docs/implementacao/IMPLEMENTACAO_STATUS_ONLINE_OFFLINE.md) | Indicadores de status |
| **Telemetria** | [IMPLEMENTACAO_TELEMETRIA_ASSET_DETAILS.md](docs/implementacao/IMPLEMENTACAO_TELEMETRIA_ASSET_DETAILS.md) | Detalhes de telemetria |

### 📖 Guias

| Guia | Arquivo | Descrição |
|------|---------|-----------|
| **E2E Telemetria** | [GUIA_TESTE_E2E_TELEMETRIA.md](docs/guias/GUIA_TESTE_E2E_TELEMETRIA.md) | Teste end-to-end completo |
| **Preferences** | [GUIA_TESTE_PREFERENCES.md](docs/guias/GUIA_TESTE_PREFERENCES.md) | Teste de preferências |
| **Profile** | [GUIA_TESTE_PROFILE.md](docs/guias/GUIA_TESTE_PROFILE.md) | Teste de perfil |
| **Team Management** | [GUIA_TESTE_TEAM_MANAGEMENT.md](docs/guias/GUIA_TESTE_TEAM_MANAGEMENT.md) | Gerenciamento de equipe |

### 🐛 Bugfixes

| Bug | Arquivo | Descrição |
|-----|---------|-----------|
| **Página Branca** | [BUGFIX_PAGINA_BRANCA_UNDEFINED.md](docs/bugfixes/BUGFIX_PAGINA_BRANCA_UNDEFINED.md) | Erro undefined causando página branca |
| **Status Offline** | [BUGFIX_STATUS_OFFLINE_THRESHOLD.md](docs/bugfixes/BUGFIX_STATUS_OFFLINE_THRESHOLD.md) | Threshold de status offline |
| **Telemetry Mapper** | [BUGFIX_TELEMETRY_MAPPER_FIELDS.md](docs/bugfixes/BUGFIX_TELEMETRY_MAPPER_FIELDS.md) | Campos de mapeamento |

### 🔗 Integrações

| Integração | Arquivo | Descrição |
|-----------|---------|-----------|
| **Alertas** | [INTEGRACAO_COMPLETA_ALERTAS.md](docs/integracao/INTEGRACAO_COMPLETA_ALERTAS.md) | Integração de alertas |
| **Profile** | [INTEGRACAO_PROFILE_COMPLETA.md](docs/integracao/INTEGRACAO_PROFILE_COMPLETA.md) | Integração de perfil |
| **Team Modal** | [INTEGRACAO_TEAM_MODAL.md](docs/integracao/INTEGRACAO_TEAM_MODAL.md) | Modal de equipe |
| **Multi-tenant** | [MULTI_TENANT_ARCHITECTURE.md](docs/integracao/MULTI_TENANT_ARCHITECTURE.md) | Arquitetura multi-tenant |

---

## 💻 Código Fonte

### 🎨 Componentes Principais

```
src/components/
├── admin/              # Componentes de administração
├── alerts/             # Sistema de alertas
├── auth/               # Autenticação
├── dashboard/          # Dashboard principal
├── layout/             # Layout e navegação
├── notifications/      # Notificações
├── preferences/        # Preferências
├── profile/            # Perfil de usuário
├── team/               # Gerenciamento de equipe
├── telemetry/          # Telemetria e gráficos
└── ui/                 # Componentes UI (shadcn/ui)
```

### 🔌 API

```
src/api/
├── axios.ts            # Configuração Axios
├── auth.ts             # API de autenticação
├── assets.ts           # API de assets
├── telemetry.ts        # API de telemetria
├── alerts.ts           # API de alertas
├── profile.ts          # API de perfil
└── team.ts             # API de equipe
```

### 🗄️ Estado Global (Zustand)

```
src/store/
├── authStore.ts        # Estado de autenticação
├── tenantStore.ts      # Estado de tenant/site
├── preferencesStore.ts # Preferências do usuário
└── notificationStore.ts # Notificações
```

---

## 🛠️ Tecnologias

### Frontend
- **React 19** - Framework UI
- **TypeScript** - Tipagem estática
- **Vite 6.3.5** - Build tool
- **Zustand** - Gerenciamento de estado
- **React Router** - Roteamento
- **shadcn/ui** - Componentes UI
- **Tailwind CSS** - Estilização
- **ECharts** - Gráficos e visualizações
- **Axios** - HTTP client

### Ferramentas
- **ESLint** - Linting
- **TypeScript ESLint** - Linting TypeScript
- **Vite PWA Plugin** - Progressive Web App

---

## 🚀 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev              # Inicia servidor de desenvolvimento

# Build
npm run build            # Build de produção
npm run preview          # Preview do build

# Linting
npm run lint             # Executa ESLint
```

---

## 📋 Convenções do Projeto

### 🔤 Nomenclatura de Arquivos

| Tipo | Padrão | Exemplo |
|------|--------|---------|
| **Componentes** | PascalCase.tsx | `AssetCard.tsx` |
| **Hooks** | use + PascalCase.ts | `useTelemetry.ts` |
| **Stores** | camelCase + Store.ts | `authStore.ts` |
| **APIs** | camelCase.ts | `telemetry.ts` |
| **Types** | camelCase.ts | `assets.ts` |
| **Docs** | UPPER_SNAKE_CASE.md | `FASE_3_RESUMO.md` |

### 📁 Organização de Documentação

| Prefixo | Localização | Descrição |
|---------|-------------|-----------|
| `FASE_*.md` | `docs/fases/` | Documentação de fases |
| `IMPLEMENTACAO_*.md` | `docs/implementacao/` | Implementações |
| `GUIA_*.md` | `docs/guias/` | Guias e tutoriais |
| `BUGFIX_*.md` | `docs/bugfixes/` | Correções de bugs |
| `INTEGRACAO_*.md` | `docs/integracao/` | Integrações |

---

## 🔐 Ambiente e Variáveis

```env
# Backend API
VITE_API_URL=http://localhost:8000

# Tenant ID padrão
VITE_DEFAULT_TENANT_ID=1

# Outras configurações
VITE_APP_NAME=TrakSense
```

---

## 🎯 Features Principais

### ✅ Implementadas

- ✅ **Autenticação** - Login, logout, proteção de rotas
- ✅ **Multi-tenant** - Suporte a múltiplos sites/tenants
- ✅ **Dashboard** - Visão geral de assets
- ✅ **Telemetria** - Gráficos em tempo real
- ✅ **Alertas** - Sistema de alertas e notificações
- ✅ **Perfil** - Gerenciamento de perfil
- ✅ **Equipe** - Gerenciamento de usuários
- ✅ **Preferências** - Customização e regionalização
- ✅ **Status Online/Offline** - Indicadores em tempo real
- ✅ **Auto Refresh** - Atualização automática de dados

---

## 🤝 Como Contribuir

### Para Desenvolvedores

1. **Leia as instruções para AI** (`.github/ai-instructions/`)
2. **Entenda a estrutura** (`docs/README.md`)
3. **Siga as convenções** (nomenclatura, organização)
4. **Documente mudanças** (crie arquivos em `docs/`)

### Para AI Assistants

1. **SEMPRE leia** `.github/ai-instructions/.copilot-rules` PRIMEIRO
2. **Nunca crie arquivos na raiz** (use `docs/` com subpastas)
3. **Use prefixos corretos** (FASE_, IMPLEMENTACAO_, GUIA_, etc)
4. **Consulte** `QUICK_REFERENCE.md` quando em dúvida

---

## 📞 Precisa de Ajuda?

### 🔍 Encontrar Informação

1. **Consulte este INDEX.md** - Visão geral completa
2. **Navegue por docs/** - Documentação detalhada
3. **Use busca** - Ctrl+Shift+F no VS Code

### 📝 Criar Documentação

1. **Identifique o tipo** (fase, implementação, guia, bugfix, integração)
2. **Use o prefixo correto** (FASE_, IMPLEMENTACAO_, etc)
3. **Coloque na pasta certa** (docs/fases/, docs/implementacao/, etc)
4. **Consulte** `.github/ai-instructions/` em caso de dúvida

### 🐛 Reportar Bug

1. **Documente em** `docs/bugfixes/BUGFIX_[DESCRIÇÃO].md`
2. **Inclua:** descrição, root cause, solução, prevenção
3. **Atualize** referências em outros documentos

---

## 📊 Estatísticas do Projeto

**Última reorganização:** 30 de outubro de 2025

**Documentação:**
- 21+ arquivos de documentação
- 5 categorias organizadas
- 100% dos arquivos seguindo convenções

**Código:**
- React 19 + TypeScript
- 100% tipado
- Componentização modular
- Estado global com Zustand

---

## 🎓 Recursos Adicionais

### Documentação Oficial
- [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/)
- [Zustand](https://github.com/pmndrs/zustand)
- [shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [ECharts](https://echarts.apache.org/)

### Projeto Backend
- **[traksense-backend/INDEX.md](../traksense-backend/INDEX.md)** - Índice do backend
- **[traksense-backend/docs/](../traksense-backend/docs/)** - Documentação do backend

---

**📅 Última atualização:** 30 de outubro de 2025  
**🔧 Versão:** 1.0.0  
**👥 Equipe:** TrakSense Development Team  
**📧 Contato:** [Inserir contato]

---

**🎯 Mantenha a organização! Todo arquivo no lugar certo = Projeto melhor para todos! 🚀**
