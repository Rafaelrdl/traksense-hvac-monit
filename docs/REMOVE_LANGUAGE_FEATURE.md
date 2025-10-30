# Remoção da Funcionalidade de Idioma (Language)

## 📋 Resumo

Removida toda a funcionalidade de seleção de idioma da interface, mantendo apenas **Timezone** e **Formato de Hora (12h/24h)**.

---

## ✅ O que foi removido:

### Backend (Django)

1. **Model (`apps/accounts/models.py`)**:
   - ❌ Removido campo `language` do modelo `User`
   - ✅ Mantidos: `timezone`, `time_format`

2. **Serializers (`apps/accounts/serializers.py`)**:
   - ❌ Removido `language` de `UserSerializer.fields`
   - ❌ Removido `language` de `UserUpdateSerializer.fields`
   - ✅ Mantidos: `timezone`, `time_format`

3. **Migration**:
   - ✅ Criada migration `0004_remove_language_field.py`
   - ✅ Aplicada ao schema `public` e `umc`

---

### Frontend (React + TypeScript)

1. **Interfaces TypeScript**:
   - ❌ Removido `language?` de `User` interface (`store/auth.ts`)
   - ❌ Removido `language` de `BackendUser` (`services/auth.service.ts`)
   - ❌ Removido `language?` de `UserProfileUpdate` (`services/auth.service.ts`)

2. **Mapeamento**:
   - ❌ Removido `language: backendUser.language || 'pt-br'` do `mapBackendUserToUser`

3. **PreferencesDialog**:
   - ❌ Removido import `Globe` (ícone de idioma)
   - ❌ Removida constante `LANGUAGES` com os 3 idiomas
   - ❌ Removido state `regionalization` → Substituído por `timezonePrefs`
   - ✅ Renomeada aba `"Regionalização"` → `"Fusos Horários"`
   - ❌ Removida seção completa de seleção de idioma
   - ✅ Mantidas: Seção de Timezone + Seção de Formato de Hora

4. **Biblioteca i18n**:
   - ❌ Removido diretório completo `src/i18n/`
   - ❌ Removido hook `useLanguageSync.ts`
   - ❌ Removidas dependências:
     - `i18next`
     - `react-i18next`
     - `i18next-browser-languagedetector`
   - ❌ Removido import no `App.tsx`

---

## 📝 Mudanças Específicas

### PreferencesDialog.tsx

**Antes:**
```tsx
const [regionalization, setRegionalization] = useState({
  language: 'pt-br',
  timezone: 'America/Sao_Paulo',
  time_format: '24h' as '12h' | '24h',
});

// 3 abas: Notificações, Regionalização
<TabsTrigger value="regional">Regionalização</TabsTrigger>

// Seção de Idioma + Timezone + Formato
```

**Depois:**
```tsx
const [timezonePrefs, setTimezonePrefs] = useState({
  timezone: 'America/Sao_Paulo',
  time_format: '24h' as '12h' | '24h',
});

// 2 abas: Notificações, Fusos Horários
<TabsTrigger value="timezone">Fusos Horários</TabsTrigger>

// Apenas Timezone + Formato (sem idioma)
```

---

### handleSave

**Antes:**
```tsx
await updateUserProfile({
  language: regionalization.language,
  timezone: regionalization.timezone,
  time_format: regionalization.time_format,
});
```

**Depois:**
```tsx
await updateUserProfile({
  timezone: timezonePrefs.timezone,
  time_format: timezonePrefs.time_format,
});
```

---

## 🗄️ Banco de Dados

### Migration Aplicada:

```sql
-- Schema: public
ALTER TABLE users DROP COLUMN language;

-- Schema: umc
ALTER TABLE users DROP COLUMN language;
```

### Campos Mantidos:

| Campo | Tipo | Default | Descrição |
|-------|------|---------|-----------|
| `timezone` | VARCHAR(50) | `'America/Sao_Paulo'` | Fuso horário do usuário |
| `time_format` | VARCHAR(3) | `'24h'` | Formato de hora: `'12h'` ou `'24h'` |

---

## 🎯 Funcionalidades Preservadas

✅ **Timezone**:
- Seleção de fuso horário
- Preview de horário local
- Aplicado no Header (relógio)
- Salvo no backend

✅ **Time Format (12h/24h)**:
- Seleção de formato
- Preview em tempo real
- Aplicado no Header (relógio)
- Salvo no backend

---

## 🧪 Como Testar

1. **Abra a aplicação** em `http://localhost:5001`
2. **Faça login** com `test@umc.com`
3. **Clique no avatar** (canto superior direito)
4. **Clique em "Preferências"**
5. **Vá para a aba "Fusos Horários"** (antes era "Regionalização")
6. **Verifique que NÃO há seletor de idioma** ✅
7. **Mude o Timezone** (ex: New York)
8. **Mude o Formato de Hora** (ex: 12h)
9. **Clique em "Salvar"**
10. **Veja o relógio no Header** mudar de formato ✅

---

## 📦 Estrutura Final

### Backend
```
apps/accounts/
├── models.py           # User: timezone, time_format
├── serializers.py      # UserSerializer: timezone, time_format
└── migrations/
    └── 0004_remove_language_field.py
```

### Frontend
```
src/
├── store/
│   └── auth.ts         # User: timezone, time_format
├── services/
│   └── auth.service.ts # BackendUser, UserProfileUpdate
└── components/
    └── auth/
        └── PreferencesDialog.tsx  # Aba "Fusos Horários"
```

---

## 🔧 Comandos Executados

```bash
# Backend - Criar e aplicar migration
docker exec -it traksense-api python manage.py makemigrations accounts --name remove_language_field
docker exec -it traksense-api python manage.py migrate

# Frontend - Remover dependências
npm uninstall i18next react-i18next i18next-browser-languagedetector

# Reiniciar backend
docker restart traksense-api
```

---

## ⚠️ Breaking Changes

### Para Usuários Existentes:
- O campo `language` será removido do banco de dados
- Dados de idioma anteriormente salvos serão perdidos (não é mais usado)
- **Timezone** e **time_format** continuam funcionando normalmente

### Para o Código:
- ❌ `user.language` não existe mais
- ❌ Não enviar `language` em `updateUserProfile()`
- ✅ Continuar usando `user.timezone` e `user.time_format`

---

## 📅 Data da Mudança

**Data:** 19 de outubro de 2025  
**Migration:** `0004_remove_language_field`  
**Versão:** 2.0.0
