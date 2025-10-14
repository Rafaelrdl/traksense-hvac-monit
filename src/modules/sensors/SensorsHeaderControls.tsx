import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronLeft, 
  ChevronRight, 
  Filter,
  Wifi,
  WifiOff,
  Activity
} from 'lucide-react';
import { useSensorsStore } from '@/store/sensors';
import { useSensorsURLParams } from '@/hooks/useSensorsURLParams';
import type { SensorStatusFilter } from '@/types/sensor';

const PAGE_SIZES = [25, 50, 100] as const;

interface SensorsHeaderControlsProps {
  onNavigateToEquipment?: (equipmentId: string) => void;
}

export function SensorsHeaderControls({ onNavigateToEquipment }: SensorsHeaderControlsProps) {
  const {
    filter,
    setFilter,
    getFilteredSensors,
    getPaginatedSensors,
    initializeFromAppStore,
  } = useSensorsStore();
  
  const { params, updateParams } = useSensorsURLParams();

  // Initialize sensors from app store on mount
  useEffect(() => {
    initializeFromAppStore();
  }, [initializeFromAppStore]);

  // Sync filter with URL params
  useEffect(() => {
    setFilter(params);
  }, [params, setFilter]);

  const { sensors: pageItems, pagination } = getPaginatedSensors();
  const filteredSensors = getFilteredSensors();
  
  const handleStatusFilter = (status: SensorStatusFilter) => {
    updateParams({ status });
  };

  const handlePageChange = (page: number) => {
    updateParams({ page });
  };

  const handleSizeChange = (size: string) => {
    updateParams({ size: Number(size) });
  };

  const getStatusCounts = () => {
    const allSensors = useSensorsStore.getState().items;
    const online = allSensors.filter(s => s.status === 'online').length;
    const offline = allSensors.filter(s => s.status === 'offline').length;
    return { total: allSensors.length, online, offline };
  };

  const { total, online, offline } = getStatusCounts();
  
  const getDisplayText = () => {
    const start = (pagination.page - 1) * pagination.size + 1;
    const end = Math.min(pagination.page * pagination.size, pagination.total);
    
    switch (filter.status) {
      case 'online':
        return `Online: ${pagination.total}${pagination.total > 0 ? ` — exibindo ${start}–${end}` : ''}`;
      case 'offline':
        return `Offline: ${pagination.total}${pagination.total > 0 ? ` — exibindo ${start}–${end}` : ''}`;
      default:
        return `Total: ${pagination.total}${pagination.total > 0 ? ` — exibindo ${start}–${end}` : ''}`;
    }
  };

  // Generate page numbers with smart truncation
  const generatePageNumbers = () => {
    const { page, totalPages } = pagination;
    const pages: (number | string)[] = [];
    
    if (totalPages <= 7) {
      // Show all pages if 7 or fewer
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Smart truncation for many pages
      pages.push(1);
      
      if (page > 4) {
        pages.push('...');
      }
      
      const start = Math.max(2, page - 1);
      const end = Math.min(totalPages - 1, page + 1);
      
      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) {
          pages.push(i);
        }
      }
      
      if (page < totalPages - 3) {
        pages.push('...');
      }
      
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  return (
    <div className="space-y-4">
      {/* Status Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card rounded-lg p-4 border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-green-600">{online}</h3>
              <p className="text-sm text-muted-foreground">Sensores Online</p>
            </div>
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <Wifi className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg p-4 border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-red-600">{offline}</h3>
              <p className="text-sm text-muted-foreground">Sensores Offline</p>
            </div>
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <WifiOff className="w-5 h-5 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg p-4 border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-primary">
                {total > 0 ? ((online / total) * 100).toFixed(1) : '0.0'}%
              </h3>
              <p className="text-sm text-muted-foreground">Disponibilidade</p>
            </div>
            <div className="p-2 bg-primary/10 rounded-lg">
              <Activity className="w-5 h-5 text-primary" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="bg-card rounded-lg p-4 border shadow-sm">
        <div className="flex flex-col gap-4">
          {/* Top Row: Status Filter and Page Size */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">Status:</span>
              <div className="flex items-center gap-1">
                <Button
                  variant={filter.status === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleStatusFilter('all')}
                  className="transition-colors"
                >
                  Todos
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {total}
                  </Badge>
                </Button>
                <Button
                  variant={filter.status === 'online' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleStatusFilter('online')}
                  className="transition-colors"
                >
                  <Wifi className="w-3 h-3 mr-1" />
                  Online
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {online}
                  </Badge>
                </Button>
                <Button
                  variant={filter.status === 'offline' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleStatusFilter('offline')}
                  className="transition-colors"
                >
                  <WifiOff className="w-3 h-3 mr-1" />
                  Offline
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {offline}
                  </Badge>
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Itens por página:</span>
              <Select 
                value={String(filter.size)} 
                onValueChange={handleSizeChange}
              >
                <SelectTrigger className="h-9 w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAGE_SIZES.map(size => (
                    <SelectItem key={size} value={String(size)}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Bottom Row: Count and Pagination */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="text-sm text-muted-foreground">
              {getDisplayText()}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <nav className="flex items-center gap-1" aria-label="Paginação de sensores">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page === 1}
                  onClick={() => handlePageChange(pagination.page - 1)}
                  className="transition-colors"
                  aria-label="Página anterior"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Anterior
                </Button>

                <div className="flex items-center gap-1 max-w-xs overflow-x-auto">
                  {generatePageNumbers().map((pageNum, index) => (
                    pageNum === '...' ? (
                      <span key={`ellipsis-${index}`} className="px-2 text-muted-foreground">
                        ...
                      </span>
                    ) : (
                      <Button
                        key={pageNum}
                        variant={pageNum === pagination.page ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handlePageChange(pageNum as number)}
                        className="min-w-[40px] transition-colors"
                        aria-current={pageNum === pagination.page ? 'page' : undefined}
                        aria-label={`Ir para página ${pageNum}`}
                      >
                        {pageNum}
                      </Button>
                    )
                  ))}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page === pagination.totalPages}
                  onClick={() => handlePageChange(pagination.page + 1)}
                  className="transition-colors"
                  aria-label="Próxima página"
                >
                  Próxima
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </nav>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}