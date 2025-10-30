# 🚀 Referência Rápida - Organização de Arquivos Frontend

> Para Desenvolvedores e Assistentes de IA

---

## 🎯 Regra de Ouro

**NUNCA crie arquivos .md na raiz do projeto!**

Use sempre: `docs/` + subpasta apropriada

---

## 📍 Onde Criar Cada Arquivo?

### Documentação (.md)

```
FASE_X_NOME.md           → docs/fases/
IMPLEMENTACAO_NOME.md    → docs/implementacao/
GUIA_NOME.md             → docs/guias/
BUGFIX_NOME.md           → docs/bugfixes/
INTEGRACAO_NOME.md       → docs/integracao/
MULTI_TENANT_NOME.md     → docs/integracao/
MIGRACAO_NOME.md         → docs/integracao/
TENANT_NOME.md           → docs/integracao/
TESTE_NOME.md            → docs/integracao/
```

---

## ✅ Exceções (Permitidos na Raiz)

**Documentação:**
- `README.md`, `INDEX.md`, `SECURITY.md`, `LICENSE`

**Configuração:**
- `package.json`, `tsconfig.json`, `vite.config.ts`
- `tailwind.config.js`, `components.json`, `theme.json`
- `.env`, `.env.example`, `.gitignore`
- `index.html`

---

## 🔍 Como Decidir?

```
1. Qual é o prefixo do arquivo?
   └─ Consulte a tabela acima

2. É documentação?
   └─ docs/

3. É uma das exceções?
   └─ Se não, use subpasta

4. Crie com caminho completo!
   └─ docs/fases/FASE_7.md
```

---

## 📚 Documentação Completa

- **AI_FILE_ORGANIZATION_WARNING.md** - Regras visuais e detalhadas
- **.copilot-rules** - Resumo das regras
- **.github/copilot-instructions.md** - Instruções completas
- **INDEX.md** - Índice geral (a criar)

---

## 🤖 Para Assistentes de IA

Antes de criar QUALQUER arquivo:

1. ✅ Ler `.copilot-rules`
2. ✅ Ler `AI_FILE_ORGANIZATION_WARNING.md`
3. ✅ Identificar prefixo do arquivo
4. ✅ Consultar tabela de localização
5. ✅ Criar com caminho COMPLETO

---

**Última atualização:** 30 de outubro de 2025  
**Projeto:** TrakSense Frontend (React)
