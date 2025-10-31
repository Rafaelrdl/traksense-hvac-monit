# Implementação: Botão de Exclusão de Equipamentos

## 📋 Resumo

Implementado botão de exclusão de equipamentos (Assets) na página **Ativos**, visível apenas para usuários com permissões de **Owner** e **Admin**.

## ✅ Arquivos Modificados

### 1. **src/store/app.ts**
- ✅ Adicionada interface `deleteAsset: (assetId: string) => Promise<void>` na interface `AppState`
- ✅ Implementada função `deleteAsset` que:
  - Extrai ID numérico do formato frontend (`asset-{id}`)
  - Chama `assetsService.delete(numericId)` para deletar na API
  - Remove o asset do estado local após sucesso
  - Trata erros e propaga exceções

### 2. **src/components/assets/DeleteAssetButton.tsx** (NOVO)
- ✅ Componente React com modal de confirmação usando AlertDialog do shadcn/ui
- ✅ Verifica permissões do usuário via `useAuthStore()`:
  - Retorna `null` se usuário não for `owner` ou `admin`
  - Renderiza botão apenas para usuários autorizados
- ✅ Modal de confirmação com:
  - Título e descrição clara da ação
  - Lista de itens que serão removidos (equipamento, devices, sensores, histórico, alertas)
  - Aviso em vermelho sobre ação irreversível
  - Botão de cancelar e confirmar
  - Loading state durante exclusão
- ✅ Integração com `toast` (sonner) para feedback visual
- ✅ Callback `onDeleteSuccess` opcional para recarregar lista

### 3. **src/components/pages/AssetsPage.tsx**
- ✅ Importado componente `DeleteAssetButton`
- ✅ Adicionado botão na coluna "Ações" da tabela de assets
- ✅ Separado por `•` dos outros botões (Detalhes e TrakNor)
- ✅ Configurado com:
  - `assetId={asset.id}` - ID do equipamento
  - `assetName={asset.tag}` - Nome/Tag para exibir no modal
  - `onDeleteSuccess={() => loadAssetsFromApi()}` - Recarrega lista após exclusão

## 🔐 Controle de Permissões

O botão implementa **2 camadas de segurança**:

1. **Frontend** (UX): 
   - Botão só aparece para `owner` e `admin`
   - Usuários sem permissão não veem a opção

2. **Backend** (API):
   - Endpoint `DELETE /api/assets/{id}/` tem permissão `CanWrite`
   - Django REST Framework valida no servidor

## 🎨 Interface do Usuário

### Botão na Tabela
```
Detalhes • TrakNor • Excluir
```

- Ícone: `Trash2` (lucide-react)
- Cor: Vermelho (`text-red-600 hover:text-red-800`)
- Texto: "Excluir"

### Modal de Confirmação
- **Título**: "Confirmar Exclusão"
- **Descrição**: 
  - Nome do equipamento em destaque
  - Aviso de ação irreversível em vermelho
  - Lista detalhada de itens que serão removidos:
    - O equipamento e suas configurações
    - Todos os dispositivos vinculados
    - Todos os sensores associados
    - Histórico de telemetria
    - Alertas e regras relacionadas

- **Botões**:
  - Cancelar (cinza, à esquerda)
  - Excluir Permanentemente (vermelho, com ícone e loading)

## 🔄 Fluxo de Exclusão

1. Usuário clica no botão "Excluir" na linha do equipamento
2. Modal de confirmação é exibido com detalhes
3. Usuário confirma a exclusão
4. Frontend:
   - Chama `deleteAsset(assetId)` da store
   - Store chama `assetsService.delete(numericId)`
5. Backend:
   - Valida permissões
   - Deleta asset do banco de dados
   - Retorna sucesso
6. Frontend:
   - Remove asset do estado local
   - Fecha modal
   - Exibe toast de sucesso
   - Recarrega lista de assets da API

## 📝 Mensagens ao Usuário

### Sucesso
```
✅ Equipamento excluído com sucesso
{assetName} foi removido do sistema.
```

### Erro
```
❌ Erro ao excluir equipamento
Não foi possível excluir o equipamento. Tente novamente.
```

## 🧪 Como Testar

1. **Login como Owner/Admin**:
   - Email: `admin@umc.com`
   - Senha: `admin123`

2. Navegar para página **Ativos**

3. Verificar que botão "Excluir" aparece na coluna de ações

4. Clicar em "Excluir" para qualquer equipamento

5. Verificar modal de confirmação com todos os detalhes

6. Confirmar exclusão

7. Verificar:
   - ✅ Toast de sucesso
   - ✅ Equipamento removido da lista
   - ✅ Contador de ativos atualizado

8. **Testar permissões** (Logout e login como Operator/Viewer):
   - Verificar que botão "Excluir" **não aparece**

## ⚠️ Considerações Importantes

1. **Exclusão em Cascata**: O backend Django deve ter configurado `on_delete=CASCADE` para:
   - Devices vinculados ao Asset
   - Sensors vinculados aos Devices
   - Readings dos Sensors

2. **Regras de Alerta**: Verificar se existem regras apontando para o asset antes de deletar:
   - Backend pode retornar erro 400 se houver dependências
   - Frontend exibe toast de erro ao usuário

3. **Auditoria**: Considerar adicionar log de auditoria no backend para rastrear exclusões

4. **Soft Delete**: Para produção, considerar implementar "soft delete" (flag `is_deleted`) em vez de exclusão permanente

## 🔧 Melhorias Futuras

- [ ] Adicionar verificação de dependências antes de permitir exclusão
- [ ] Implementar "soft delete" com possibilidade de restauração
- [ ] Adicionar log de auditoria no backend
- [ ] Permitir exclusão em lote (múltiplos equipamentos)
- [ ] Adicionar confirmação extra para equipamentos com alertas ativos

## 📊 Estatísticas

- **Arquivos criados**: 1 (`DeleteAssetButton.tsx`)
- **Arquivos modificados**: 2 (`app.ts`, `AssetsPage.tsx`)
- **Linhas adicionadas**: ~150 linhas
- **Componentes do shadcn/ui usados**: `AlertDialog`, `toast`
- **Permissões verificadas**: `owner`, `admin`

---

**Data de Implementação**: 31/10/2025
**Status**: ✅ Concluído e testado
