import React, { useState, useMemo } from 'react';
import { useAppStore } from '../../store/app';
import { HVACAsset } from '../../types/hvac';
import { Search, ExternalLink, Heart, Zap, AlertCircle } from 'lucide-react';
import { AddAssetDialog } from '../assets/AddAssetDialog';
import { UnifiedAssetsToolbar } from '../../modules/assets/components/UnifiedAssetsToolbar';

export const AssetsPage: React.FC = () => {
  const { 
    assets, 
    setSelectedAsset, 
    addAsset, 
    isLoadingAssets,
    error 
  } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filteredAssets = useMemo(() => {
    return assets.filter(asset => {
      const matchesSearch = asset.tag.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          asset.location.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'all' || asset.type === filterType;
      const matchesStatus = filterStatus === 'all' || asset.status === filterStatus;
      
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [assets, searchTerm, filterType, filterStatus]);

  const getStatusColor = (status: HVACAsset['status']) => {
    switch (status) {
      case 'OK': return 'bg-green-100 text-green-800';
      case 'Maintenance': return 'bg-yellow-100 text-yellow-800';
      case 'Stopped': return 'bg-red-100 text-red-800';
      case 'Alert': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getHealthColor = (healthScore: number) => {
    if (healthScore >= 80) return 'text-green-600';
    if (healthScore >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getTypeIcon = (type: HVACAsset['type']) => {
    // In a real app, we'd have specific icons for each HVAC type
    return '🏭'; // Placeholder
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Ativos</h1>
          <p className="text-muted-foreground">
            Gerenciamento e monitoramento de equipamentos críticos
          </p>
        </div>
        
        <AddAssetDialog onAddAsset={addAsset} />
      </div>

      {/* Loading State */}
      {isLoadingAssets && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center gap-3">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
          <span className="text-blue-700 font-medium">Carregando assets...</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <div>
            <div className="text-red-700 font-medium">Erro ao carregar dados</div>
            <div className="text-red-600 text-sm">{error}</div>
          </div>
        </div>
      )}

      {/* Unified Toolbar with all filters */}
      <UnifiedAssetsToolbar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={filterStatus}
        onStatusChange={setFilterStatus}
        typeFilter={filterType}
        onTypeChange={setFilterType}
        filteredCount={filteredAssets.length}
        totalCount={assets.length}
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card rounded-lg p-4 border">
          <div className="text-2xl font-bold text-foreground">
            {assets.filter(a => a.status === 'OK').length}
          </div>
          <div className="text-sm text-muted-foreground">Ativos Normais</div>
        </div>
        
        <div className="bg-card rounded-lg p-4 border">
          <div className="text-2xl font-bold text-yellow-600">
            {assets.filter(a => a.status === 'Maintenance').length}
          </div>
          <div className="text-sm text-muted-foreground">Em Manutenção</div>
        </div>
        
        <div className="bg-card rounded-lg p-4 border">
          <div className="text-2xl font-bold text-orange-600">
            {assets.filter(a => a.status === 'Alert').length}
          </div>
          <div className="text-sm text-muted-foreground">Com Alertas</div>
        </div>
        
        <div className="bg-card rounded-lg p-4 border">
          <div className="text-2xl font-bold text-red-600">
            {assets.filter(a => a.status === 'Stopped').length}
          </div>
          <div className="text-sm text-muted-foreground">Parados</div>
        </div>
      </div>

      {/* Assets Table */}
      <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left py-4 px-6 font-medium text-muted-foreground">Ativo</th>
                <th className="text-left py-4 px-6 font-medium text-muted-foreground">Tipo</th>
                <th className="text-left py-4 px-6 font-medium text-muted-foreground">Localização</th>
                <th className="text-left py-4 px-6 font-medium text-muted-foreground">Saúde (%)</th>
                <th className="text-left py-4 px-6 font-medium text-muted-foreground">kWh/dia</th>
                <th className="text-left py-4 px-6 font-medium text-muted-foreground">Status</th>
                <th className="text-left py-4 px-6 font-medium text-muted-foreground">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredAssets.map((asset) => (
                <tr key={asset.id} className="border-b last:border-b-0 hover:bg-muted/30 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">{getTypeIcon(asset.type)}</div>
                      <div>
                        <button
                          onClick={() => setSelectedAsset(asset.id)}
                          className="font-semibold text-primary hover:text-primary/80 text-left"
                        >
                          {asset.tag}
                        </button>
                        <div className="text-xs text-muted-foreground">
                          {asset.specifications.capacity && (
                            <span>{asset.specifications.capacity} {asset.type === 'Chiller' ? 'tons' : 'kW'}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  
                  <td className="py-4 px-6">
                    <span className="text-sm font-medium">{asset.type}</span>
                  </td>
                  
                  <td className="py-4 px-6">
                    <span className="text-sm">{asset.location}</span>
                  </td>
                  
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-2">
                      <Heart className={`w-4 h-4 ${getHealthColor(asset.healthScore)}`} />
                      <span className={`font-medium ${getHealthColor(asset.healthScore)}`}>
                        {asset.healthScore.toFixed(0)}%
                      </span>
                    </div>
                  </td>
                  
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-2">
                      <Zap className="w-4 h-4 text-yellow-600" />
                      <span className="text-sm">{asset.powerConsumption.toLocaleString('pt-BR')}</span>
                    </div>
                  </td>
                  
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-2">
                      {asset.status === 'Alert' && <AlertCircle className="w-4 h-4 text-orange-500" />}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(asset.status)}`}>
                        {asset.status}
                      </span>
                    </div>
                  </td>
                  
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setSelectedAsset(asset.id)}
                        className="text-primary hover:text-primary/80 text-sm font-medium"
                      >
                        Detalhes
                      </button>
                      <span className="text-muted-foreground">•</span>
                      <a
                        href="#"
                        className="text-muted-foreground hover:text-foreground text-sm flex items-center space-x-1"
                        title="Abrir no TrakNor"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>TrakNor</span>
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredAssets.length === 0 && (
          <div className="text-center py-12">
            <div className="text-muted-foreground mb-4">
              <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum ativo encontrado</p>
              <p className="text-sm">Tente ajustar os filtros ou termo de busca</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};