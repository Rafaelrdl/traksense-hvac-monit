# Preferências: Regionalização (Idioma e Timezone)

**Data:** 2025-01-19  
**Status:** ✅ Implementação Completa

---

## 📋 Resumo

Adicionada nova aba **"Regionalização"** no componente `PreferencesDialog` para permitir que o usuário configure **idioma** e **fuso horário**, com integração completa ao backend Django.

---

## 🎯 Objetivo

Permitir que cada usuário personalize:
- **Idioma da interface** (pt-BR, en, es)
- **Fuso horário** para exibição correta de datas e horários

Essas configurações são salvas no perfil do usuário no backend (`language` e `timezone`).

---

## 🚀 O Que Foi Implementado

### 1. ✅ Estrutura com Tabs

O `PreferencesDialog` agora possui **2 abas**:

```tsx
<Tabs defaultValue="notifications" className="w-full mt-4">
  <TabsList className="grid w-full grid-cols-2">
    <TabsTrigger value="notifications">Notificações</TabsTrigger>
    <TabsTrigger value="regional">Regionalização</TabsTrigger>
  </TabsList>
  
  <TabsContent value="notifications">
    {/* Canais de notificação e alertas por severidade */}
  </TabsContent>
  
  <TabsContent value="regional">
    {/* Idioma e Timezone */}
  </TabsContent>
</Tabs>
```

### 2. ✅ Seleção de Idioma

**Idiomas disponíveis:**
- 🇧🇷 Português (Brasil) - `pt-br`
- 🇺🇸 English (US) - `en`
- 🇪🇸 Español - `es`

**Implementação:**
```typescript
const LANGUAGES = [
  { value: 'pt-br', label: 'Português (Brasil)', flag: '🇧🇷' },
  { value: 'en', label: 'English (US)', flag: '🇺🇸' },
  { value: 'es', label: 'Español', flag: '🇪🇸' },
];
```

**Componente:**
```tsx
<Select
  value={regionalization.language}
  onValueChange={(value) =>
    setRegionalization({ ...regionalization, language: value })
  }
>
  <SelectTrigger className="w-full h-12">
    <SelectValue placeholder="Selecione um idioma" />
  </SelectTrigger>
  <SelectContent>
    {LANGUAGES.map((lang) => (
      <SelectItem key={lang.value} value={lang.value}>
        <div className="flex items-center gap-2">
          <span className="text-xl">{lang.flag}</span>
          <span>{lang.label}</span>
        </div>
      </SelectItem>
    ))}
  </SelectContent>
</Select>
```

### 3. ✅ Seleção de Fuso Horário

**Timezones disponíveis:**

#### Brasil:
- 🇧🇷 Brasília (GMT-3) - `America/Sao_Paulo`
- 🇧🇷 Manaus (GMT-4) - `America/Manaus`
- 🇧🇷 Fortaleza (GMT-3) - `America/Fortaleza`
- 🇧🇷 Recife (GMT-3) - `America/Recife`
- 🇧🇷 Fernando de Noronha (GMT-2) - `America/Noronha`

#### Internacional:
- 🇺🇸 New York (GMT-5) - `America/New_York`
- 🇺🇸 Los Angeles (GMT-8) - `America/Los_Angeles`
- 🇬🇧 London (GMT+0) - `Europe/London`
- 🇫🇷 Paris (GMT+1) - `Europe/Paris`
- 🇯🇵 Tokyo (GMT+9) - `Asia/Tokyo`

**Implementação:**
```typescript
const TIMEZONES = [
  { value: 'America/Sao_Paulo', label: 'Brasília (GMT-3)', region: 'Brasil' },
  { value: 'America/Manaus', label: 'Manaus (GMT-4)', region: 'Brasil' },
  // ... mais timezones
];
```

**Preview de Horário:**
```tsx
<div className="p-3 rounded-lg bg-muted/50 border">
  <p className="text-sm">
    <span className="font-medium">Horário local atual:</span>{' '}
    {new Date().toLocaleString('pt-BR', {
      timeZone: regionalization.timezone,
      dateStyle: 'short',
      timeStyle: 'medium',
    })}
  </p>
</div>
```

### 4. ✅ Integração com Backend

#### Estado Local:
```typescript
const [regionalization, setRegionalization] = useState({
  language: 'pt-br',
  timezone: 'America/Sao_Paulo',
});
```

#### Sincronização com User:
```typescript
useEffect(() => {
  if (user && open) {
    setRegionalization({
      language: user.language || 'pt-br',
      timezone: user.timezone || 'America/Sao_Paulo',
    });
  }
}, [user, open]);
```

#### Salvamento:
```typescript
const handleSave = async () => {
  try {
    // Salvar no backend
    await updateUserProfile({
      language: regionalization.language,
      timezone: regionalization.timezone,
    });

    toast.success('Preferências salvas!');
    onOpenChange(false);
  } catch (error: any) {
    toast.error('Erro ao salvar preferências', {
      description: error.message,
    });
  }
};
```

### 5. ✅ Estados de Loading

```tsx
<Button 
  onClick={handleSave} 
  disabled={isSubmitting}
>
  {isSubmitting ? (
    <>
      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      Salvando...
    </>
  ) : (
    'Salvar Preferências'
  )}
</Button>
```

### 6. ✅ Ícones e UI Melhorada

- 🌐 `<Globe />` - Ícone de idioma
- 🕐 `<Clock />` - Ícone de fuso horário
- 🔔 `<Bell />` - Ícone de notificações
- ⚙️ `<Settings />` - Ícone principal do dialog

---

## 📦 Arquivos Modificados

### `src/components/auth/PreferencesDialog.tsx`

**Mudanças principais:**

1. ✅ Adicionado import de componentes:
   - `Tabs`, `TabsContent`, `TabsList`, `TabsTrigger`
   - `Select`, `SelectContent`, `SelectItem`, `SelectTrigger`, `SelectValue`
   - Ícones: `Globe`, `Clock`, `Loader2`

2. ✅ Adicionadas constantes:
   - `LANGUAGES` - Array de idiomas disponíveis
   - `TIMEZONES` - Array de fusos horários

3. ✅ Adicionado estado de regionalização:
   - `regionalization` - Estado local para language e timezone
   - `isSubmitting` - Estado de loading

4. ✅ Refatorado `handleSave`:
   - Agora é assíncrono
   - Salva language e timezone no backend via `updateUserProfile`
   - Tratamento de erros com try/catch

5. ✅ Estrutura do Dialog com Tabs:
   - Tab "Notificações" (existente)
   - Tab "Regionalização" (nova)

6. ✅ Botões com estados de loading

---

## 🔗 Integração com Backend

### Campos do Modelo User (Backend)

```python
class User(AbstractUser):
    # ... outros campos ...
    timezone = models.CharField(
        max_length=50,
        default='America/Sao_Paulo',
        help_text='Fuso horário do usuário'
    )
    language = models.CharField(
        max_length=10,
        default='pt-br',
        choices=[
            ('pt-br', 'Português (Brasil)'),
            ('en', 'English'),
            ('es', 'Español'),
        ],
        help_text='Idioma preferido'
    )
```

### Endpoint de Atualização

**Método:** `PATCH /api/users/me/`

**Body:**
```json
{
  "language": "pt-br",
  "timezone": "America/Sao_Paulo"
}
```

**Resposta (200 OK):**
```json
{
  "id": 1,
  "username": "testuser",
  "email": "test@umc.com",
  "full_name": "Teste User",
  "language": "pt-br",
  "timezone": "America/Sao_Paulo",
  // ... outros campos
}
```

---

## 🎨 UI/UX

### Layout da Aba "Regionalização"

```
┌──────────────────────────────────────┐
│ 🌐 Idioma da Interface               │
├──────────────────────────────────────┤
│ Escolha o idioma que será usado...   │
│                                      │
│ ┌──────────────────────────────────┐ │
│ │ 🇧🇷 Português (Brasil)         ▼ │ │
│ └──────────────────────────────────┘ │
│                                      │
│ ───────────────────────────────────  │
│                                      │
│ 🕐 Fuso Horário                      │
├──────────────────────────────────────┤
│ Defina seu fuso horário para...     │
│                                      │
│ ┌──────────────────────────────────┐ │
│ │ Brasília (GMT-3)               ▼ │ │
│ │ Brasil                            │ │
│ └──────────────────────────────────┘ │
│                                      │
│ ┌──────────────────────────────────┐ │
│ │ Horário local atual: 18/10/2025  │ │
│ │ 14:30:45                          │ │
│ └──────────────────────────────────┘ │
└──────────────────────────────────────┘
```

### Preview de Horário em Tempo Real

O componente mostra o **horário atual** no fuso horário selecionado:

```tsx
{new Date().toLocaleString('pt-BR', {
  timeZone: regionalization.timezone,
  dateStyle: 'short',
  timeStyle: 'medium',
})}
```

**Exemplo:**
- Brasília (GMT-3): `18/10/2025, 14:30:45`
- Tokyo (GMT+9): `19/10/2025, 02:30:45`

---

## 🧪 Fluxo de Teste

### TESTE 1: Alterar Idioma ✅

1. Login com `test@umc.com`
2. Abrir menu do usuário → **"Preferências"**
3. Clicar na aba **"Regionalização"**
4. Selecionar idioma **"English (US)"** 🇺🇸
5. Clicar em **"Salvar Preferências"**
6. **✅ Verificar:**
   - Toast verde: "Preferências salvas!"
   - Requisição PATCH enviada com `language: "en"`
   - Valor persiste após F5

### TESTE 2: Alterar Fuso Horário ✅

1. Abrir **"Preferências"** → **"Regionalização"**
2. Selecionar timezone **"America/New_York (GMT-5)"**
3. **✅ Verificar:** Preview de horário atualiza imediatamente
4. Clicar em **"Salvar Preferências"**
5. **✅ Verificar:**
   - Toast verde: "Preferências salvas!"
   - Requisição PATCH enviada com `timezone: "America/New_York"`
   - Valor persiste após F5

### TESTE 3: Restaurar Padrões ✅

1. Alterar idioma e timezone
2. Clicar em **"Restaurar Padrões"**
3. **✅ Verificar:**
   - Idioma volta para `pt-br`
   - Timezone volta para `America/Sao_Paulo` (ou valor original do usuário)
   - Toast: "Preferências restauradas"

### TESTE 4: Loading States ✅

1. Alterar qualquer configuração
2. Clicar em **"Salvar Preferências"**
3. **✅ Verificar:**
   - Botão mostra spinner e texto "Salvando..."
   - Botões ficam desabilitados
   - Após sucesso, dialog fecha

---

## 📊 Comparação: Antes vs Depois

### Antes
```tsx
// ❌ Sem aba de regionalização
<Dialog>
  <ScrollArea>
    {/* Apenas notificações */}
  </ScrollArea>
</Dialog>

// ❌ Sem integração com backend
const handleSave = () => {
  console.log('Preferências salvas:', preferences);
};
```

### Depois
```tsx
// ✅ Com abas (Notificações + Regionalização)
<Tabs defaultValue="notifications">
  <TabsList>
    <TabsTrigger value="notifications">Notificações</TabsTrigger>
    <TabsTrigger value="regional">Regionalização</TabsTrigger>
  </TabsList>
  
  <TabsContent value="notifications">{/* ... */}</TabsContent>
  <TabsContent value="regional">{/* Idioma + Timezone */}</TabsContent>
</Tabs>

// ✅ Com integração real
const handleSave = async () => {
  await updateUserProfile({
    language: regionalization.language,
    timezone: regionalization.timezone,
  });
};
```

---

## 🔜 Próximos Passos (Opcional)

### Melhorias Futuras:

1. **Internacionalização (i18n):**
   - Usar biblioteca como `react-i18n` ou `next-intl`
   - Traduzir toda a interface baseado no `user.language`
   - Exemplo: pt-br → "Preferências", en → "Preferences"

2. **Notificações no Backend:**
   - Criar modelo `UserPreferences` no Django
   - Salvar configurações de notificações (email, push, sound)
   - Criar endpoint `PATCH /api/users/me/preferences/`

3. **Mais Idiomas:**
   - Adicionar Francês, Alemão, Italiano, etc.
   - Detectar idioma do navegador como sugestão inicial

4. **Mais Timezones:**
   - Adicionar todos os timezones do IANA
   - Agrupar por continente/região
   - Busca/filtro no Select de timezone

5. **Validações:**
   - Validar formato de timezone (IANA)
   - Validar código de idioma (ISO 639-1)

---

## ✅ Checklist de Validação

- [x] Importações corretas (Tabs, Select, ícones)
- [x] Constantes LANGUAGES e TIMEZONES criadas
- [x] Estado `regionalization` com language e timezone
- [x] useEffect para sincronizar com user
- [x] handleSave assíncrono com try/catch
- [x] Integração com updateUserProfile
- [x] Preview de horário em tempo real
- [x] Estados de loading nos botões
- [x] Toast de sucesso e erro
- [x] Botão "Restaurar Padrões" funcional
- [x] Zero erros de compilação TypeScript

---

## 🎉 Resultado Final

O `PreferencesDialog` agora possui:

1. ✅ **2 Abas:** Notificações e Regionalização
2. ✅ **Seleção de Idioma:** pt-BR, en, es (com bandeiras 🇧🇷🇺🇸🇪🇸)
3. ✅ **Seleção de Timezone:** 10 opções principais (Brasil + Internacional)
4. ✅ **Preview de Horário:** Mostra horário atual no timezone selecionado
5. ✅ **Integração Backend:** Salva language e timezone via PATCH /api/users/me/
6. ✅ **Estados de Loading:** Spinner durante salvamento
7. ✅ **Notificações Toast:** Feedback visual completo
8. ✅ **Restaurar Padrões:** Volta aos valores originais
9. ✅ **Persistência:** Dados salvos no banco PostgreSQL
10. ✅ **Sincronização:** Valores carregados do user ao abrir dialog

**🚀 Pronto para uso no navegador!**

---

**Desenvolvido por:** GitHub Copilot  
**Sessão:** Integração Frontend-Backend FASE 1  
**Data:** 2025-01-19  
**Status:** ✅ COMPLETO
