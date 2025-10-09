# Funcionalidade: Adicionar Ativos HVAC

## Visão Geral

Sistema completo para adicionar novos ativos HVAC à plataforma TrakSense, com formulário em três etapas cobrindo informações básicas, localização e especificações técnicas.

## Arquivos Criados/Modificados

### 1. **Tipos Atualizados** (`src/types/hvac.ts`)

```typescript
export interface HVACAsset {
  // ... campos existentes
  specifications: {
    capacity?: number;
    voltage?: number;
    maxCurrent?: number;
    refrigerant?: string;
    brand?: string;        // ✨ NOVO
    model?: string;        // ✨ NOVO
    serialNumber?: string; // ✨ NOVO
  };
  // Informações de Localização
  company?: string;   // ✨ NOVO
  sector?: string;    // ✨ NOVO
  subsector?: string; // ✨ NOVO
}
```

### 2. **Componente de Diálogo** (`src/components/assets/AddAssetDialog.tsx`)

Dialog modal com formulário em três abas para criar novos ativos.

#### Estrutura do Componente

**Props:**
- `onAddAsset`: Callback que recebe os dados do novo ativo

**Estado Interno:**
```typescript
// Informações Básicas
- tag: string (obrigatório)
- type: HVACAsset['type'] (obrigatório)
- brand: string
- model: string
- capacity: string
- serialNumber: string

// Informações de Localização
- company: string (obrigatório)
- sector: string (obrigatório)
- subsector: string
- location: string (gerado automaticamente se vazio)

// Especificações Técnicas
- voltage: string
- maxCurrent: string
- refrigerant: string (seletor com opções R-22, R-134a, R-404A, R-407C, R-410A, R-32, R-717, R-744)
```

#### Abas do Formulário

**1. Informações Básicas** (`basic`)
- Tag do Equipamento* (ex: AHU-001)
- Tipo de Equipamento* (AHU, Chiller, VRF, RTU, Boiler, Cooling Tower)
- Marca (ex: Carrier, Trane, York)
- Modelo (ex: 30XA-1002)
- Capacidade (TR para Chiller, kW para outros)
- Número de Série

**2. Localização** (`location`)
- Empresa* (ex: Hospital Central)
- Setor* (ex: Centro Cirúrgico)
- Subsetor (ex: Sala 01)
- Localização Descritiva (opcional, gerado automaticamente como "Empresa - Setor - Subsetor")
- Prévia da localização em card azul

**3. Especificações** (`specs`)
- Tensão Nominal (V)
- Corrente Máxima (A)
- Fluido Refrigerante (dropdown com 8 opções)
- Card informativo: "Estas especificações são opcionais..."

#### Validações

```typescript
// Tag obrigatória
if (!tag.trim()) {
  toast.error('Tag do equipamento é obrigatória');
  setActiveTab('basic');
  return;
}

// Empresa e Setor obrigatórios
if (!company.trim() || !sector.trim()) {
  toast.error('Empresa e Setor são obrigatórios');
  setActiveTab('location');
  return;
}
```

#### Navegação Entre Abas

- Botões "Anterior" e "Próximo" para navegação
- Validação ao tentar avançar de aba
- Botão "Adicionar Ativo" apenas na última aba
- Botão "Cancelar" fecha o diálogo e reseta o formulário

### 3. **Store Atualizado** (`src/store/app.ts`)

Adicionada função `addAsset` no Zustand store:

```typescript
interface AppState {
  // ... outros campos
  addAsset: (asset: Omit<HVACAsset, 'id' | 'healthScore' | 'powerConsumption' | 'status' | 'operatingHours' | 'lastMaintenance'>) => void;
}

// Implementação
addAsset: (assetData) => {
  const newAsset: HVACAsset = {
    ...assetData,
    id: `asset-${Date.now()}-${Math.random().toString(36).substring(7)}`,
    healthScore: 100,      // Novo ativo com saúde perfeita
    powerConsumption: 0,   // Será calculado pela simulação
    status: 'OK',
    operatingHours: 0,
    lastMaintenance: new Date(),
  };
  
  const currentAssets = get().assets;
  set({ assets: [...currentAssets, newAsset] });
}
```

### 4. **Página de Ativos Atualizada** (`src/components/pages/AssetsPage.tsx`)

Integração do botão de adicionar ativo:

```tsx
import { AddAssetDialog } from '../assets/AddAssetDialog';

export const AssetsPage: React.FC = () => {
  const { assets, setSelectedAsset, addAsset } = useAppStore();
  
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Ativos HVAC</h1>
          {/* ... */}
        </div>
        
        <div className="flex items-center space-x-3">
          <span>{filteredAssets.length} de {assets.length} ativos</span>
          <AddAssetDialog onAddAsset={addAsset} />
        </div>
      </div>
      {/* ... resto da página */}
    </div>
  );
};
```

## Fluxo de Uso

### 1. Usuário Clica em "Adicionar Ativo"
- Dialog modal é aberto
- Formulário começa na aba "Informações Básicas"

### 2. Preenchimento do Formulário

**Aba 1 - Informações Básicas:**
- Usuário digita TAG do equipamento (obrigatório)
- Seleciona tipo de equipamento
- Opcionalmente preenche marca, modelo, capacidade, número de série
- Clica em "Próximo"

**Aba 2 - Localização:**
- Usuário preenche empresa (obrigatório)
- Preenche setor (obrigatório)
- Opcionalmente preenche subsetor
- Vê prévia da localização gerada automaticamente
- Pode sobrescrever com localização descritiva customizada
- Clica em "Próximo"

**Aba 3 - Especificações:**
- Usuário opcionalmente preenche tensão, corrente, refrigerante
- Card amarelo informa que são campos opcionais
- Clica em "Adicionar Ativo"

### 3. Validação e Criação

```typescript
// Validações executadas:
✓ Tag não vazia
✓ Empresa não vazia
✓ Setor não vazio

// Campos preenchidos automaticamente:
✓ id: gerado com timestamp + random
✓ healthScore: 100
✓ powerConsumption: 0
✓ status: 'OK'
✓ operatingHours: 0
✓ lastMaintenance: Date.now()
✓ location: gerado como "Empresa - Setor - Subsetor" se não fornecido
```

### 4. Feedback ao Usuário

```typescript
// Sucesso
toast.success(`Ativo ${tag} adicionado com sucesso!`);

// Erro - Tag vazia
toast.error('Tag do equipamento é obrigatória');

// Erro - Localização incompleta
toast.error('Empresa e Setor são obrigatórios');
```

### 5. Atualização da Lista
- Dialog fecha automaticamente
- Novo ativo aparece na tabela de ativos
- Contador de ativos é atualizado
- Formulário é resetado para próxima adição

## Componentes UI Utilizados

```typescript
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
```

## Campos do Formulário

### Obrigatórios (marcados com *)

| Campo | Tipo | Aba | Validação |
|-------|------|-----|-----------|
| Tag do Equipamento | Input text | Básica | `!tag.trim()` |
| Tipo de Equipamento | Select | Básica | Sempre tem valor padrão 'AHU' |
| Empresa | Input text | Localização | `!company.trim()` |
| Setor | Input text | Localização | `!sector.trim()` |

### Opcionais

| Campo | Tipo | Aba | Placeholder |
|-------|------|-----|-------------|
| Marca | Input text | Básica | "Ex: Carrier, Trane, York" |
| Modelo | Input text | Básica | "Ex: 30XA-1002" |
| Capacidade | Input number | Básica | "Ex: 500" |
| Número de Série | Input text | Básica | "Ex: SN123456789" |
| Subsetor | Input text | Localização | "Ex: Sala 01" |
| Localização Descritiva | Input text | Localização | "Ex: 3º Andar - Ala Leste" |
| Tensão Nominal | Input number | Especificações | "Ex: 380" |
| Corrente Máxima | Input number | Especificações | "Ex: 150.5" |
| Fluido Refrigerante | Select | Especificações | 8 opções disponíveis |

## Opções de Refrigerante

```typescript
const REFRIGERANTS = [
  { value: '', label: 'Nenhum' },
  { value: 'R-22', label: 'R-22' },
  { value: 'R-134a', label: 'R-134a' },
  { value: 'R-404A', label: 'R-404A' },
  { value: 'R-407C', label: 'R-407C' },
  { value: 'R-410A', label: 'R-410A' },
  { value: 'R-32', label: 'R-32' },
  { value: 'R-717', label: 'R-717 (Amônia)' },
  { value: 'R-744', label: 'R-744 (CO₂)' },
];
```

## Tipos de Equipamento

```typescript
const HVAC_TYPES = [
  { value: 'AHU', label: 'AHU - Air Handling Unit' },
  { value: 'Chiller', label: 'Chiller' },
  { value: 'VRF', label: 'VRF - Variable Refrigerant Flow' },
  { value: 'RTU', label: 'RTU - Rooftop Unit' },
  { value: 'Boiler', label: 'Boiler' },
  { value: 'CoolingTower', label: 'Cooling Tower' },
];
```

## Cards Informativos

### Card de Prévia (Azul - Aba Localização)
```tsx
<div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200">
  <h4>Prévia da Localização:</h4>
  <p>{location || "Empresa - Setor - Subsetor"}</p>
</div>
```

### Card de Aviso (Amarelo - Aba Especificações)
```tsx
<div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200">
  <p>ℹ️ Estas especificações são opcionais, mas ajudam no monitoramento...</p>
</div>
```

## Responsividade

- Dialog com `max-w-2xl` (largura máxima)
- `max-h-[90vh]` para altura máxima do dialog
- ScrollArea com `h-[400px]` para conteúdo das abas
- Grid de 2 colunas para campos: `grid grid-cols-2 gap-4`
- Tabs responsivos: `grid w-full grid-cols-3`

## Acessibilidade

- Labels associados aos inputs via `htmlFor`
- Campos obrigatórios marcados com `<span className="text-red-500">*</span>`
- Placeholders descritivos em todos os campos
- Textos auxiliares em `text-xs text-muted-foreground`
- Ícones descritivos (Plus para adicionar)

## Integração com Backend (Futuro)

Quando integrar com backend real, atualizar a função `onAddAsset`:

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  try {
    const response = await api.post('/assets', newAsset);
    onAddAsset(response.data);
    toast.success(`Ativo ${tag} adicionado com sucesso!`);
  } catch (error) {
    toast.error('Erro ao adicionar ativo. Tente novamente.');
  }
};
```

## Melhorias Futuras

1. **Upload de Fotos do Equipamento**
   - Adicionar campo de upload na aba de Informações Básicas
   - Armazenar foto em `specifications.photo`

2. **Validação de Tag Duplicada**
   - Verificar se TAG já existe antes de adicionar
   - Mostrar erro se duplicada

3. **Auto-complete de Localização**
   - Sugerir empresas/setores existentes
   - Padronizar nomenclatura

4. **QR Code para Equipamentos**
   - Gerar QR Code automaticamente ao criar ativo
   - Permitir impressão para fixação no equipamento

5. **Templates de Equipamentos**
   - Salvar configurações comuns de equipamentos
   - Preencher automaticamente ao selecionar template

6. **Histórico de Criação**
   - Registrar usuário que criou o ativo
   - Timestamp de criação
   - Log de modificações

## Troubleshooting

### Erro: "Tag do equipamento é obrigatória"
**Causa:** Campo TAG está vazio
**Solução:** Preencher campo TAG antes de submeter

### Erro: "Empresa e Setor são obrigatórios"
**Causa:** Campos de localização incompletos
**Solução:** Preencher Empresa e Setor na aba Localização

### Dialog não abre
**Causa:** Componente não importado corretamente
**Solução:** Verificar importação: `import { AddAssetDialog } from '../assets/AddAssetDialog'`

### Novo ativo não aparece na lista
**Causa:** Store não está atualizado
**Solução:** Verificar se `addAsset` está sendo chamado corretamente do `useAppStore`

## Testes Recomendados

### Teste 1: Criação Básica
- [ ] Preencher apenas campos obrigatórios
- [ ] Verificar se ativo aparece na tabela
- [ ] Confirmar valores padrão (healthScore=100, status='OK')

### Teste 2: Criação Completa
- [ ] Preencher todos os campos
- [ ] Verificar todas as especificações salvas
- [ ] Confirmar localização gerada corretamente

### Teste 3: Validações
- [ ] Tentar submeter sem TAG - deve mostrar erro
- [ ] Tentar submeter sem Empresa - deve mostrar erro
- [ ] Tentar submeter sem Setor - deve mostrar erro

### Teste 4: Navegação
- [ ] Clicar em "Próximo" em cada aba
- [ ] Clicar em "Anterior" para voltar
- [ ] Cancelar formulário - deve resetar campos

### Teste 5: Edge Cases
- [ ] TAG com caracteres especiais
- [ ] Capacidade com decimal
- [ ] Subsetor vazio (deve funcionar)
- [ ] Cancelar sem preencher nada

---

**Última Atualização:** 2025-10-09
**Autor:** GitHub Copilot
**Status:** ✅ Implementado e Funcional
