# 🤖 AI Instructions - TrakSense Frontend (React)

> **CRITICAL:** All AI assistants (GitHub Copilot, ChatGPT, Claude, etc.) MUST read this folder before creating any files in this project.

---

## ⚠️ MANDATORY READING ORDER

**Before creating ANY file, read these documents in this order:**

1. **`.copilot-rules`** ⭐ - Quick rules summary (START HERE)
2. **`AI_FILE_ORGANIZATION_WARNING.md`** - Detailed visual guide
3. **`QUICK_REFERENCE.md`** - Quick lookup table

---

## 🎯 Purpose of This Folder

This folder contains **critical organizational rules** that prevent files from being created in the wrong locations.

### Why This Matters

In October 2025, this project underwent a **major reorganization**:
- **21+ documentation files** were moved from root to organized folders
- **`docs/` structure** created with subfolders
- **Clear naming conventions** established

**We MUST maintain this organization!**

---

## 📋 Files in This Folder

### 1. `.copilot-rules`
**Purpose:** Quick reference rules for GitHub Copilot  
**When to read:** FIRST, before any file creation  
**Contents:**
- File naming conventions
- Location mappings
- Root directory whitelist

### 2. `AI_FILE_ORGANIZATION_WARNING.md`
**Purpose:** Comprehensive visual guide with examples  
**When to read:** When you need detailed guidance  
**Contents:**
- Complete tables of file types → locations
- Common mistakes and corrections
- Checklist before creating files

### 3. `QUICK_REFERENCE.md`
**Purpose:** Fast lookup table  
**When to read:** Quick validation of file location  
**Contents:**
- Concise prefix → location table
- Exception list
- Quick decision guide

---

## 🚨 Critical Rules Summary

### Rule #1: NEVER Create Documentation in Root
❌ **WRONG:** `c:\...\traksense-hvac-monit\FASE_7.md`  
✅ **CORRECT:** `c:\...\traksense-hvac-monit\docs\fases\FASE_7.md`

### Rule #2: Prefix Determines Location
- `FASE_*.md` → `docs/fases/`
- `IMPLEMENTACAO_*.md` → `docs/implementacao/`
- `GUIA_*.md` → `docs/guias/`
- `BUGFIX_*.md` → `docs/bugfixes/`
- `INTEGRACAO_*.md` → `docs/integracao/`
- `MULTI_TENANT_*.md` → `docs/integracao/`

### Rule #3: Root Whitelist Only
Only these files allowed in root:
- `README.md`, `INDEX.md`, `SECURITY.md`, `LICENSE`
- `package.json`, `tsconfig.json`, `vite.config.ts`
- `tailwind.config.js`, `components.json`, `theme.json`
- `.env`, `.env.example`, `.gitignore`, `index.html`

---

## 🔄 AI Workflow

```
┌─────────────────────────────────────┐
│  AI wants to create a file          │
└───────────┬─────────────────────────┘
            │
            ▼
┌─────────────────────────────────────┐
│  1. Read .copilot-rules             │
└───────────┬─────────────────────────┘
            │
            ▼
┌─────────────────────────────────────┐
│  2. Identify file prefix            │
│     (FASE_, GUIA_, BUGFIX_, etc)    │
└───────────┬─────────────────────────┘
            │
            ▼
┌─────────────────────────────────────┐
│  3. Lookup location in table        │
└───────────┬─────────────────────────┘
            │
            ▼
┌─────────────────────────────────────┐
│  4. Is it in root whitelist?        │
└───────────┬─────────────────────────┘
            │
            ├─── YES ──► Create in root
            │
            └─── NO ───► Create in docs/
```

---

## 📚 Additional References

After reading this folder, consult:

### Project Documentation
- **`../../INDEX.md`** - Complete project index (to be created)
- **`../../docs/README.md`** - Documentation structure (to be created)

### AI-Specific Instructions
- **`../copilot-instructions.md`** - Full GitHub Copilot guide

---

## ✅ Compliance Checklist

Before creating ANY file, verify:

- [ ] I read `.copilot-rules`
- [ ] I identified the file prefix
- [ ] I checked the location table
- [ ] I verified it's NOT in root whitelist
- [ ] I'm using the FULL PATH (docs/fases/... or docs/guias/...)

---

## 🎓 Examples

### ✅ CORRECT File Creation

```python
# Documentation
create_file("docs/fases/FASE_7_NOTIFICATIONS.md", content)
create_file("docs/guias/GUIA_COMPONENTES_UI.md", content)
create_file("docs/implementacao/IMPLEMENTACAO_ZUSTAND.md", content)
create_file("docs/bugfixes/BUGFIX_CHART_DISPLAY.md", content)
create_file("docs/integracao/INTEGRACAO_WEBSOCKET.md", content)
```

### ❌ WRONG File Creation

```python
# DON'T DO THIS!
create_file("FASE_7_NOTIFICATIONS.md", content)  # ❌ Missing docs/fases/
create_file("GUIA_COMPONENTES_UI.md", content)  # ❌ Missing docs/guias/
create_file("BUGFIX_CHART_DISPLAY.md", content)  # ❌ Missing docs/bugfixes/
```

---

## 🚀 Quick Start for AI

**First time in this project?**

1. ⭐ **YOU ARE HERE** - This README explains everything
2. Read `.copilot-rules` (2 minutes) - Quick rules
3. Read `AI_FILE_ORGANIZATION_WARNING.md` (5 minutes) - Detailed guide
4. Bookmark `QUICK_REFERENCE.md` for future lookups

**Creating a file now?**

1. What's the prefix? (FASE_, GUIA_, etc)
2. Look it up in `QUICK_REFERENCE.md`
3. Use the full path (docs/fases/... or docs/guias/...)
4. Done!

**Need more context?**

- Full Copilot guide: `../copilot-instructions.md`
- Project structure: `../../INDEX.md` (to be created)

---

## 📞 When in Doubt

If you're unsure where a file belongs:

1. Check the prefix against `.copilot-rules`
2. If still unsure, read `AI_FILE_ORGANIZATION_WARNING.md`
3. If no prefix matches, use: `docs/`
4. **NEVER default to root!**

---

## 🎯 Success Metrics

This system is successful when:
- ✅ 0 new files created in root incorrectly
- ✅ All files follow naming conventions
- ✅ Project structure remains organized
- ✅ New developers can navigate easily

---

## 📊 Statistics

**Reorganization (Oct 30, 2025):**
- 21+ files moved from root
- 5 folders created in docs/
- Clear naming conventions established

**Current protection:**
- 3 instruction files
- 100% coverage of file types

---

**🤖 Remember:** Your primary job is to maintain this organization. Every file in the right place = Better project for everyone!

---

**Last updated:** 30 de outubro de 2025  
**Project:** TrakSense Frontend (React + TypeScript)  
**Status:** Active and enforced
