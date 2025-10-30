import React, { useState, useEffect } from 'react';
import { useAlertsStore } from '../../store/alertsStore';
import { AlertTriangle, Bell, CheckCircle, Clock, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export const AlertsPage: React.FC = () => {
  const {
    alerts,
    statistics,
    isLoading,
    fetchAlerts,
    fetchStatistics,
    acknowledgeAlert: acknowledgeAlertApi,
    resolveAlert: resolveAlertApi,
  } = useAlertsStore();
  const [filterStatus, setFilterStatus] = useState<string>('active');

  // Carregar dados ao montar
  useEffect(() => {
    fetchAlerts();
    fetchStatistics();
  }, [fetchAlerts, fetchStatistics]);

  // Traduções
  const translateSeverity = (severity: string): string => {
    const translations: Record<string, string> = {
      'Critical': 'Crítico',
      'High': 'Alto',
      'Medium': 'Médio',
      'Low': 'Baixo'
    };
    return translations[severity] || severity;
  };

  const handleAcknowledge = async (alertId: number) => {
    const success = await acknowledgeAlertApi(alertId);
    if (success) {
      toast.success('Alerta reconhecido', {
        description: 'Marcado para monitoramento',
      });
      fetchAlerts(); // Recarregar lista
    }
  };

  const handleResolve = async (alertId: number) => {
    const success = await resolveAlertApi(alertId);
    if (success) {
      toast.success('Alerta resolvido', {
        description: 'Problema solucionado',
      });
      fetchAlerts(); // Recarregar lista
    }
  };

  const filteredAlerts = alerts.filter(alert => {
    switch (filterStatus) {
      case 'active': return !alert.resolved && !alert.acknowledged;
      case 'acknowledged': return alert.acknowledged && !alert.resolved;
      case 'resolved': return alert.resolved;
      case 'all': return true;
      default: return true;
    }
  });

  const getSeverityColor = (severity: string) => {
    const normalizedSeverity = severity.toLowerCase();
    if (normalizedSeverity.includes('critical') || normalizedSeverity.includes('crítico')) {
      return 'bg-red-100 text-red-800 border-red-200';
    }
    if (normalizedSeverity.includes('high') || normalizedSeverity.includes('alto')) {
      return 'bg-orange-100 text-orange-800 border-orange-200';
    }
    if (normalizedSeverity.includes('medium') || normalizedSeverity.includes('médio')) {
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
    if (normalizedSeverity.includes('low') || normalizedSeverity.includes('baixo')) {
      return 'bg-blue-100 text-blue-800 border-blue-200';
    }
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getTimeAgo = (date: Date | string | number) => {
    const now = new Date();
    const timestamp = date instanceof Date ? date : new Date(date);
    const diffMs = now.getTime() - timestamp.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays}d atrás`;
    if (diffHours > 0) return `${diffHours}h atrás`;
    return 'Agora mesmo';
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Alertas & Regras</h1>
          <p className="text-muted-foreground">
            Gerenciamento de alertas e configuração de regras de monitoramento
          </p>
        </div>
      </div>

      {/* Alert Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl p-4 border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-red-600">
                {statistics?.active || 0}
              </h3>
              <p className="text-sm text-muted-foreground">Alertas Ativos</p>
            </div>
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
        </div>

        <div className="bg-card rounded-xl p-4 border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-yellow-600">
                {statistics?.acknowledged || 0}
              </h3>
              <p className="text-sm text-muted-foreground">Reconhecidos</p>
            </div>
            <Bell className="w-5 h-5 text-yellow-600" />
          </div>
        </div>

        <div className="bg-card rounded-xl p-4 border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-green-600">
                {statistics?.resolved || 0}
              </h3>
              <p className="text-sm text-muted-foreground">Resolvidos</p>
            </div>
            <CheckCircle className="w-5 h-5 text-green-600" />
          </div>
        </div>

        <div className="bg-card rounded-xl p-4 border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-primary">{statistics?.total || 0}</h3>
              <p className="text-sm text-muted-foreground">Total</p>
            </div>
            <Clock className="w-5 h-5 text-primary" />
          </div>
        </div>
      </div>

      {/* Alerts Filter */}
      <div className="bg-card rounded-xl p-4 border shadow-sm">
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium">Filtrar por:</span>
          <div className="flex space-x-2">
            {[
              { value: 'active', label: 'Ativos' },
              { value: 'acknowledged', label: 'Reconhecidos' },
              { value: 'resolved', label: 'Resolvidos' },
              { value: 'all', label: 'Todos' }
            ].map(filter => (
              <button
                key={filter.value}
                onClick={() => setFilterStatus(filter.value)}
                className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                  filterStatus === filter.value
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Alerts List */}
      <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold">
            Lista de Alertas ({filteredAlerts.length})
          </h3>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : filteredAlerts.length === 0 ? (
          <div className="text-center py-12">
            <AlertTriangle className="w-12 h-12 mx-auto mb-4 opacity-50 text-muted-foreground" />
            <p className="text-muted-foreground font-medium mb-2">Nenhum alerta encontrado</p>
            <p className="text-sm text-muted-foreground">
              {filterStatus !== 'all' 
                ? 'Tente mudar o filtro para ver outros alertas' 
                : 'Não há alertas no momento. Alertas são gerados automaticamente quando as regras são disparadas.'
              }
            </p>
          </div>
        ) : (
          <div className="divide-y">
            {filteredAlerts.map(alert => (
              <div key={alert.id} className="p-6 hover:bg-muted/30 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getSeverityColor(alert.severity)}`}>
                        {translateSeverity(alert.severity)}
                      </span>
                      <span className="font-medium">{alert.asset_tag}</span>
                      <span className="text-sm text-muted-foreground">
                        {getTimeAgo(alert.triggered_at)}
                      </span>
                    </div>
                    
                    <p className="text-sm text-foreground mb-2">{alert.message}</p>
                    
                    <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                      <span>Regra: {alert.rule_name}</span>
                      <span>Equipamento: {alert.equipment_name}</span>
                      {alert.acknowledged_by && (
                        <span>Reconhecido por: ID {alert.acknowledged_by}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col space-y-2 ml-4">
                    {/* Botão Reconhecer - apenas para alertas ativos */}
                    {!alert.acknowledged && !alert.resolved && (
                      <button
                        onClick={() => handleAcknowledge(alert.id)}
                        className="px-3 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200 transition-colors font-medium"
                      >
                        Reconhecer
                      </button>
                    )}
                    
                    {/* Botão Resolver - para alertas reconhecidos */}
                    {alert.acknowledged && !alert.resolved && (
                      <>
                        <div className="flex items-center space-x-1 text-xs text-yellow-600 mb-1">
                          <CheckCircle className="w-3 h-3" />
                          <span>Reconhecido</span>
                        </div>
                        <button
                          onClick={() => handleResolve(alert.id)}
                          className="px-3 py-1 text-xs bg-green-100 text-green-800 rounded-lg hover:bg-green-200 transition-colors font-medium"
                        >
                          Resolvido
                        </button>
                      </>
                    )}
                    
                    {/* Status Resolvido - apenas visual */}
                    {alert.resolved && (
                      <div className="flex items-center space-x-1 text-xs text-green-600">
                        <CheckCircle className="w-3 h-3" />
                        <span>Resolvido</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};