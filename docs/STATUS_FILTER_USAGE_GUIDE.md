# Guia de Uso - StatusFilter Component

## 📚 Documentação Completa

### Visão Geral

O `StatusFilter` é um componente de filtro segmented control criado para filtrar ativos por status na plataforma TrakSense. Ele usa o componente `ToggleGroup` do shadcn/ui e segue rigorosamente o design system da aplicação.

---

## 🚀 Quick Start

### Importação

```tsx
import { StatusFilter } from '@/modules/assets/components/StatusFilter';
```

### Uso Básico

```tsx
function MyPage() {
  const [status, setStatus] = useState<string>('all');
  
  return (
    <StatusFilter 
      value={status} 
      onChange={setStatus} 
    />
  );
}
```

---

## 📖 API Reference

### Props

```typescript
interface StatusFilterProps {
  /**
   * Valor atual do filtro selecionado
   * @example "all" | "OK" | "Alert" | "Maintenance" | "Stopped"
   */
  value: string;
  
  /**
   * Callback executado quando o filtro muda
   * @param value - Novo valor do filtro
   */
  onChange: (value: string) => void;
  
  /**
   * Classes CSS adicionais para customização
   * @optional
   */
  className?: string;
}
```

### Valores Aceitos

```typescript
type StatusValue = 
  | 'all'         // Todos os ativos
  | 'OK'          // Ativos operando normalmente
  | 'Alert'       // Ativos com alertas
  | 'Maintenance' // Ativos em manutenção
  | 'Stopped';    // Ativos offline/parados
```

---

## 💡 Exemplos de Uso

### Exemplo 1: Integração Básica

```tsx
import { useState } from 'react';
import { StatusFilter } from '@/modules/assets/components/StatusFilter';

export function AssetsToolbar() {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  
  return (
    <div className="flex items-center gap-4">
      <h2>Filtros</h2>
      <StatusFilter 
        value={filterStatus} 
        onChange={setFilterStatus} 
      />
    </div>
  );
}
```

### Exemplo 2: Com Estado do Zustand

```tsx
import { useAssetsStore } from '@/stores/assets';
import { StatusFilter } from '@/modules/assets/components/StatusFilter';

export function AssetsPage() {
  const { statusFilter, setStatusFilter } = useAssetsStore();
  
  return (
    <StatusFilter 
      value={statusFilter} 
      onChange={setStatusFilter} 
    />
  );
}
```

### Exemplo 3: Com Sincronização de URL

```tsx
import { useSearchParams } from 'react-router-dom';
import { StatusFilter } from '@/modules/assets/components/StatusFilter';

export function AssetsPageWithURL() {
  const [searchParams, setSearchParams] = useSearchParams();
  const status = searchParams.get('status') || 'all';
  
  const handleChange = (newStatus: string) => {
    setSearchParams({ status: newStatus });
  };
  
  return (
    <StatusFilter 
      value={status} 
      onChange={handleChange} 
    />
  );
}
```

### Exemplo 4: Com Classes Customizadas

```tsx
import { StatusFilter } from '@/modules/assets/components/StatusFilter';

export function CustomStyledFilter() {
  const [status, setStatus] = useState('all');
  
  return (
    <StatusFilter 
      value={status} 
      onChange={setStatus}
      className="shadow-lg bg-card p-2"
    />
  );
}
```

---

## 🎨 Customização

### Estilização Adicional

O componente aceita `className` para adicionar estilos extras:

```tsx
<StatusFilter 
  value={status}
  onChange={setStatus}
  className="my-4 shadow-xl"
/>
```

### Modificar Opções de Status

Para adicionar/remover opções, edite o array `STATUS_OPTIONS` em `StatusFilter.tsx`:

```tsx
const STATUS_OPTIONS: StatusOption[] = [
  { key: 'all', label: 'Todos' },
  { key: 'OK', label: 'Operando' },
  { key: 'Alert', label: 'Alerta' },
  { key: 'Maintenance', label: 'Manutenção' },
  { key: 'Stopped', label: 'Offline' },
  // Adicione mais opções aqui
];
```

### Adaptar Labels

Modifique os labels mantendo as keys (para compatibilidade com backend):

```tsx
const STATUS_OPTIONS: StatusOption[] = [
  { key: 'all', label: 'Ver Todos' },        // Label customizado
  { key: 'OK', label: 'Normal' },           // Label customizado
  // ...
];
```

---

## 🔗 Integração com Lógica de Filtro

### Filtrando Array de Ativos

```tsx
import { useMemo } from 'react';
import { StatusFilter } from '@/modules/assets/components/StatusFilter';

export function AssetsGrid() {
  const { assets } = useAssetsStore();
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Aplicar filtro
  const filteredAssets = useMemo(() => {
    if (statusFilter === 'all') return assets;
    return assets.filter(asset => asset.status === statusFilter);
  }, [assets, statusFilter]);
  
  return (
    <div>
      <StatusFilter value={statusFilter} onChange={setStatusFilter} />
      <div className="grid gap-4">
        {filteredAssets.map(asset => (
          <AssetCard key={asset.id} asset={asset} />
        ))}
      </div>
    </div>
  );
}
```

### Combinando Múltiplos Filtros

```tsx
import { StatusFilter } from '@/modules/assets/components/StatusFilter';

export function AdvancedFilters() {
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredAssets = useMemo(() => {
    return assets.filter(asset => {
      const matchesStatus = statusFilter === 'all' || asset.status === statusFilter;
      const matchesType = typeFilter === 'all' || asset.type === typeFilter;
      const matchesSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesStatus && matchesType && matchesSearch;
    });
  }, [assets, statusFilter, typeFilter, searchTerm]);
  
  return (
    <div className="flex flex-col gap-4">
      <StatusFilter value={statusFilter} onChange={setStatusFilter} />
      {/* Outros filtros... */}
    </div>
  );
}
```

---

## ♿ Acessibilidade

### Navegação por Teclado

```
Tab          → Move foco entre opções
Enter/Space  → Seleciona opção focada
Shift+Tab    → Move foco para trás
```

### Screen Readers

O componente é otimizado para leitores de tela:

```tsx
<ToggleGroup aria-label="Filtro de status">
  {/* Cada item é anunciado como "Todos, botão, não pressionado" */}
  <ToggleGroupItem value="all">Todos</ToggleGroupItem>
</ToggleGroup>
```

### ARIA Attributes

```html
<!-- Container -->
<div role="group" aria-label="Filtro de status">
  
  <!-- Item ativo -->
  <button 
    role="radio" 
    aria-checked="true"
    data-state="on"
  >
    Todos
  </button>
  
  <!-- Item inativo -->
  <button 
    role="radio" 
    aria-checked="false"
    data-state="off"
  >
    Operando
  </button>
</div>
```

---

## 🎭 Estados Visuais

### Default State

```css
/* Aparência padrão */
.toggle-item {
  background: transparent;
  color: inherit;
}
```

### Hover State

```css
/* Ao passar o mouse */
.toggle-item:hover {
  background: hsl(var(--muted));
}
```

### Active State

```css
/* Quando selecionado */
.toggle-item[data-state="on"] {
  background: hsl(var(--primary));
  color: hsl(var(--primary-foreground));
}
```

### Focus State

```css
/* Ao focar via teclado */
.toggle-item:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px hsl(var(--ring));
  outline-offset: 2px;
}
```

---

## 🐛 Troubleshooting

### Problema: Filtro não muda visualmente

**Causa:** Value prop não está sendo atualizado

**Solução:**
```tsx
// ❌ Errado
<StatusFilter value="all" onChange={setStatus} />

// ✅ Correto
const [status, setStatus] = useState('all');
<StatusFilter value={status} onChange={setStatus} />
```

### Problema: onChange não é chamado

**Causa:** ToggleGroup retorna `undefined` quando clica no item já selecionado

**Solução:** Já tratado internamente no componente:
```tsx
onValueChange={(v) => v && onChange(v)}
//                    ↑ só chama se v não for undefined
```

### Problema: Estilos não aplicam corretamente

**Causa:** Conflito com outras classes CSS

**Solução:** Use `cn()` helper para merge:
```tsx
import { cn } from '@/lib/utils';

<StatusFilter 
  className={cn('my-custom-class', conditionalClass && 'extra-class')}
  // ...
/>
```

---

## 🧪 Testes

### Unit Test (Vitest + Testing Library)

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { StatusFilter } from './StatusFilter';

describe('StatusFilter', () => {
  it('renders all options', () => {
    const onChange = vi.fn();
    render(<StatusFilter value="all" onChange={onChange} />);
    
    expect(screen.getByText('Todos')).toBeInTheDocument();
    expect(screen.getByText('Operando')).toBeInTheDocument();
    expect(screen.getByText('Alerta')).toBeInTheDocument();
    expect(screen.getByText('Manutenção')).toBeInTheDocument();
    expect(screen.getByText('Offline')).toBeInTheDocument();
  });
  
  it('calls onChange when option is clicked', () => {
    const onChange = vi.fn();
    render(<StatusFilter value="all" onChange={onChange} />);
    
    fireEvent.click(screen.getByText('Operando'));
    expect(onChange).toHaveBeenCalledWith('OK');
  });
  
  it('highlights selected option', () => {
    render(<StatusFilter value="OK" onChange={() => {}} />);
    
    const selectedButton = screen.getByText('Operando');
    expect(selectedButton).toHaveAttribute('data-state', 'on');
  });
});
```

### Integration Test

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { AssetsPage } from './AssetsPage';

describe('AssetsPage with StatusFilter', () => {
  it('filters assets when status changes', () => {
    render(<AssetsPage />);
    
    // Inicialmente mostra todos
    expect(screen.getByText('12 ativos')).toBeInTheDocument();
    
    // Clica em "Alerta"
    fireEvent.click(screen.getByText('Alerta'));
    
    // Mostra apenas ativos com alerta
    expect(screen.getByText('3 ativos')).toBeInTheDocument();
  });
});
```

---

## 📦 Dependências

```json
{
  "dependencies": {
    "@radix-ui/react-toggle-group": "^1.0.4",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.2.0"
  }
}
```

---

## 🔄 Changelog

### v1.0.0 (2025-10-15)
- ✨ Initial release
- ✅ StatusFilter component with ToggleGroup
- ✅ 5 predefined status options
- ✅ Full accessibility support
- ✅ Dark/Light mode compatible
- ✅ Mobile responsive

---

## 📞 Suporte

### Documentação Relacionada
- [shadcn/ui ToggleGroup](https://ui.shadcn.com/docs/components/toggle-group)
- [Radix UI Toggle Group](https://www.radix-ui.com/primitives/docs/components/toggle-group)
- [TrakSense Design System](./DESIGN_SYSTEM.md)

### Issues Comuns
- [GitHub Issues](https://github.com/Rafaelrdl/traksense-hvac-monit/issues)

### Contribuindo
Para adicionar novas funcionalidades ou reportar bugs, abra um issue ou PR no repositório.

---

**Última atualização:** 15 de outubro de 2025
