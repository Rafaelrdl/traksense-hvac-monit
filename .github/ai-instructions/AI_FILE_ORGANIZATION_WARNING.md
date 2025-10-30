# ⚠️ AVISO PARA ASSISTENTES DE IA - TrakSense Frontend

## 🚨 NUNCA CRIE ARQUIVOS NA RAIZ DESTE DIRETÓRIO

Este projeto possui uma **estrutura organizacional rigorosa**. Todos os arquivos devem ser criados nas pastas apropriadas.

---

## 📍 Onde Criar Cada Tipo de Arquivo

### 📚 Arquivos de Documentação (.md)
**Localização:** `docs/` (NUNCA na raiz)

| Tipo de Documento | Pasta Correta |
|-------------------|---------------|
| Documentação de fases | `docs/fases/` |
| Documentação de implementação | `docs/implementacao/` |
| Guias e tutoriais | `docs/guias/` |
| Correções de bugs | `docs/bugfixes/` |
| Integração e multi-tenant | `docs/integracao/` |
| Outros documentos | `docs/` |

---

## ✅ Exceções (Únicos Arquivos Permitidos na Raiz)

- `README.md` - Documentação principal do projeto
- `INDEX.md` - Índice de navegação geral
- `SECURITY.md` - Política de segurança
- `LICENSE` - Licença do projeto
- `package.json`, `package-lock.json` - Dependências
- `tsconfig.json` - Configuração TypeScript
- `vite.config.ts` - Configuração Vite
- `tailwind.config.js` - Configuração Tailwind
- `components.json` - Configuração shadcn/ui
- `theme.json` - Tema do projeto
- `index.html` - HTML principal
- `.env`, `.env.example` - Configurações de ambiente
- `.gitignore` - Configuração do Git

---

## 🎯 Convenções de Nomenclatura

A **nomenclatura define a localização**:

| Prefixo do Arquivo | Localização Correta |
|-------------------|---------------------|
| `FASE_*.md` | `docs/fases/` |
| `IMPLEMENTACAO_*.md` | `docs/implementacao/` |
| `GUIA_*.md` | `docs/guias/` |
| `BUGFIX_*.md` | `docs/bugfixes/` |
| `INTEGRACAO_*.md` | `docs/integracao/` |
| `MULTI_TENANT_*.md` | `docs/integracao/` |
| `MIGRACAO_*.md` | `docs/integracao/` |
| `TENANT_*.md` | `docs/integracao/` |
| `TESTE_*.md` | `docs/integracao/` |

---

## 📖 Documentação de Referência

Antes de criar qualquer arquivo, consulte:

1. **INDEX.md** - Índice completo do projeto (a criar)
2. **docs/README.md** - Estrutura de documentação (a criar)
3. **.github/copilot-instructions.md** - Instruções completas
4. **.github/ai-instructions/** - Pasta de instruções para IA

---

## 🤖 Checklist para IA antes de Criar Arquivos

- [ ] O arquivo é de documentação (.md)?
  - [ ] Identifiquei o prefixo correto (FASE_, GUIA_, etc)?
  - [ ] Escolhi a pasta correta em `docs/`?
  - [ ] **NÃO** vou criar na raiz?

- [ ] O arquivo é um dos permitidos na lista de exceções?
  - [ ] Se não, vou criar na pasta apropriada

---

## ❌ Exemplos de ERROS Comuns

```
❌ create_file("FASE_7_DASHBOARD.md")
✅ create_file("docs/fases/FASE_7_DASHBOARD.md")

❌ create_file("GUIA_COMPONENTES.md")
✅ create_file("docs/guias/GUIA_COMPONENTES.md")

❌ create_file("BUGFIX_CHART_ERROR.md")
✅ create_file("docs/bugfixes/BUGFIX_CHART_ERROR.md")

❌ create_file("INTEGRACAO_API.md")
✅ create_file("docs/integracao/INTEGRACAO_API.md")
```

---

## 🎓 Resumo

**Regra de Ouro:** Se você não tem certeza absoluta de que o arquivo pertence à raiz (e não está na lista de exceções), ele **NÃO** pertence à raiz.

**Sempre:**
1. Identifique o tipo de arquivo
2. Consulte as convenções de nomenclatura
3. Crie na pasta apropriada
4. **NUNCA** assuma que a raiz é o local correto

---

Este aviso existe porque o projeto foi **reorganizado** em 30/10/2025. **Por favor, mantenha essa organização!**
