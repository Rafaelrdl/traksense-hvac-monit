/**
 * UnifiedAssetsToolbar Component
 * 
 * Toolbar unificado para filtros de ativos com UX otimizada.
 * Combina busca, filtro de status e filtro de tipo em um design coeso.
 * 
 * Features:
 * - Busca em destaque (sempre visível)
 * - Filtros de status segmentados (visual moderno)
 * - Filtro de tipo compacto (dropdown)
 * - Contador de resultados
 * - Layout responsivo
 */

import React from 'react';
import { Search, Filter, X } from 'lucide-react';
import { StatusFilter } from './StatusFilter';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

interface UnifiedAssetsToolbarProps {
  // Search
  searchTerm: string;
  onSearchChange: (value: string) => void;
  
  // Status filter
  statusFilter: string;
  onStatusChange: (value: string) => void;
  
  // Type filter
  typeFilter: string;
  onTypeChange: (value: string) => void;
  
  // Results count
  filteredCount: number;
  totalCount: number;
}

const ASSET_TYPES = [
  { value: 'all', label: 'Todos os tipos' },
  { value: 'AHU', label: 'AHU' },
  { value: 'Chiller', label: 'Chiller' },
  { value: 'VRF', label: 'VRF' },
  { value: 'RTU', label: 'RTU' },
  { value: 'Boiler', label: 'Boiler' },
  { value: 'CoolingTower', label: 'Torre de Resfriamento' },
];

export function UnifiedAssetsToolbar({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusChange,
  typeFilter,
  onTypeChange,
  filteredCount,
  totalCount,
}: UnifiedAssetsToolbarProps) {
  const hasActiveFilters = statusFilter !== 'all' || typeFilter !== 'all' || searchTerm !== '';
  const selectedType = ASSET_TYPES.find(t => t.value === typeFilter);
  
  const clearAllFilters = () => {
    onSearchChange('');
    onStatusChange('all');
    onTypeChange('all');
  };
  
  return (
    <div className="space-y-4">
      {/* Primary Row: Search + Quick Actions */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search - Takes most space */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <input
            type="text"
            placeholder="Buscar por tag, localização ou equipamento..."
            className="w-full pl-10 pr-10 py-2.5 border border-input rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all text-sm"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          {searchTerm && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Limpar busca"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        
        {/* Type Filter Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="gap-2 rounded-xl min-w-[180px] justify-between"
            >
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                <span className="text-sm">{selectedType?.label || 'Tipo'}</span>
              </div>
              {typeFilter !== 'all' && (
                <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-xs">
                  1
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Tipo de Equipamento</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {ASSET_TYPES.map((type) => (
              <DropdownMenuItem
                key={type.value}
                onClick={() => onTypeChange(type.value)}
                className={typeFilter === type.value ? 'bg-accent' : ''}
              >
                {type.label}
                {typeFilter === type.value && (
                  <span className="ml-auto text-primary">✓</span>
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        
        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="gap-2 rounded-xl text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
            <span className="hidden sm:inline">Limpar filtros</span>
          </Button>
        )}
      </div>
      
      {/* Secondary Row: Status Filter + Results Count */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Status Filter */}
        <StatusFilter value={statusFilter} onChange={onStatusChange} />
        
        {/* Results Count */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{filteredCount}</span>
          {filteredCount !== totalCount && (
            <>
              <span>de</span>
              <span className="font-medium text-foreground">{totalCount}</span>
            </>
          )}
          <span>{filteredCount === 1 ? 'ativo' : 'ativos'}</span>
        </div>
      </div>
      
      {/* Active Filters Tags */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {searchTerm && (
            <Badge variant="secondary" className="gap-1.5 pl-2 pr-1 py-1">
              <span className="text-xs">Busca: "{searchTerm}"</span>
              <button
                onClick={() => onSearchChange('')}
                className="hover:bg-background rounded-sm p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
          
          {statusFilter !== 'all' && (
            <Badge variant="secondary" className="gap-1.5 pl-2 pr-1 py-1">
              <span className="text-xs">
                Status: {statusFilter === 'OK' ? 'Operando' : statusFilter}
              </span>
              <button
                onClick={() => onStatusChange('all')}
                className="hover:bg-background rounded-sm p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
          
          {typeFilter !== 'all' && (
            <Badge variant="secondary" className="gap-1.5 pl-2 pr-1 py-1">
              <span className="text-xs">Tipo: {selectedType?.label}</span>
              <button
                onClick={() => onTypeChange('all')}
                className="hover:bg-background rounded-sm p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
