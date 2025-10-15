/**
 * StatusFilter Component
 * 
 * Segmented control para filtrar ativos por status, alinhado ao design system.
 * Usa shadcn/ui ToggleGroup com estilos consistentes.
 * 
 * Features:
 * - Visual padronizado (radius 12-16px, tokens corretos)
 * - Estados hover/active/focus
 * - Acessibilidade (aria-label, foco visível)
 * - Responsivo
 */

import React from 'react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { cn } from '@/lib/utils';

interface StatusOption {
  key: string;
  label: string;
}

const STATUS_OPTIONS: StatusOption[] = [
  { key: 'all', label: 'Todos' },
  { key: 'OK', label: 'Operando' },
  { key: 'Alert', label: 'Alerta' },
  { key: 'Maintenance', label: 'Manutenção' },
  { key: 'Stopped', label: 'Offline' },
];

interface StatusFilterProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function StatusFilter({ value, onChange, className }: StatusFilterProps) {
  return (
    <ToggleGroup
      type="single"
      value={value}
      onValueChange={(v) => v && onChange(v)}
      className={cn(
        'inline-flex items-center gap-1 rounded-xl border bg-background p-1',
        className
      )}
      aria-label="Filtro de status"
    >
      {STATUS_OPTIONS.map((option) => (
        <ToggleGroupItem
          key={option.key}
          value={option.key}
          className={cn(
            'rounded-lg px-3 py-1.5 text-sm transition-colors',
            'data-[state=on]:bg-primary data-[state=on]:text-primary-foreground',
            'hover:bg-muted',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
          )}
        >
          {option.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}
