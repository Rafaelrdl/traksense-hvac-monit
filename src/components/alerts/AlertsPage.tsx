/**
 * Alerts Page
 * 
 * Page for viewing and managing system alerts.
 */

import React, { useEffect, useState } from 'react';
import { useAlertsStore } from '@/store/alertsStore';
import { useRulesStore } from '@/store/rulesStore';
import { AlertStatus, Severity } from '@/services/api/alerts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AlertCircle, Bell, CheckCircle2, Clock, Filter, Loader2, Plus, RefreshCw } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { AlertDetailsDialog } from './AlertDetailsDialog';
import { AddRuleModalMultiParam } from './AddRuleModalMultiParam';

const severityConfig: Partial<Record<Severity, { color: string; bg: string; label: string }>> = {
  CRITICAL: { color: 'text-red-700', bg: 'bg-red-100 border-red-200', label: 'Crítico' },
  HIGH: { color: 'text-orange-700', bg: 'bg-orange-100 border-orange-200', label: 'Alto' },
  MEDIUM: { color: 'text-yellow-700', bg: 'bg-yellow-100 border-yellow-200', label: 'Médio' },
  LOW: { color: 'text-blue-700', bg: 'bg-blue-100 border-blue-200', label: 'Baixo' },
  Critical: { color: 'text-red-700', bg: 'bg-red-100 border-red-200', label: 'Crítico' },
  High: { color: 'text-orange-700', bg: 'bg-orange-100 border-orange-200', label: 'Alto' },
  Medium: { color: 'text-yellow-700', bg: 'bg-yellow-100 border-yellow-200', label: 'Médio' },
  Low: { color: 'text-blue-700', bg: 'bg-blue-100 border-blue-200', label: 'Baixo' },
};

export const AlertsPage: React.FC = () => {
  const {
    alerts,
    statistics,
    isLoading,
    filters,
    fetchAlerts,
    fetchStatistics,
    setFilters,
    pollAlerts,
    stopPolling,
  } = useAlertsStore();

  const { fetchStatistics: fetchRuleStats } = useRulesStore();

  const [selectedAlertId, setSelectedAlertId] = useState<number | null>(null);
  const [isAddRuleModalOpen, setIsAddRuleModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<AlertStatus | 'all'>('all');
  const [severityFilter, setSeverityFilter] = useState<Severity | 'all'>('all');

  // Load data on mount
  useEffect(() => {
    fetchAlerts();
    fetchStatistics();
    fetchRuleStats();
    
    // Start polling for real-time updates
    pollAlerts();
    
    return () => {
      stopPolling();
    };
  }, []);

  // Apply filters
  const handleApplyFilters = () => {
    setFilters({
      status: statusFilter === 'all' ? undefined : statusFilter,
      severity: severityFilter === 'all' ? undefined : severityFilter,
    });
  };

  // Reset filters
  const handleResetFilters = () => {
    setStatusFilter('all');
    setSeverityFilter('all');
    setFilters({});
  };

  // Refresh data
  const handleRefresh = () => {
    fetchAlerts();
    fetchStatistics();
  };

  const selectedAlert = alerts.find((a) => a.id === selectedAlertId);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Alertas</h1>
        <p className="text-muted-foreground mt-1">
          Gerencie e monitore os alertas do sistema
        </p>
      </div>

      {/* Statistics Cards - Compact Layout */}
      {statistics && (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => {
            setStatusFilter('active');
            handleApplyFilters();
          }}>
            <CardContent className="py-3 px-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold text-red-600">{statistics.active}</div>
                  <p className="text-sm text-muted-foreground">Alertas Ativos</p>
                </div>
                <AlertCircle className="h-6 w-5 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => {
            setStatusFilter('acknowledged');
            handleApplyFilters();
          }}>
            <CardContent className="py-3 px-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-yellow-600">{statistics.acknowledged}</div>
                  <p className="text-sm text-muted-foreground">Reconhecidos</p>
                </div>
                <Bell className="h-5 w-5 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => {
            setStatusFilter('resolved');
            handleApplyFilters();
          }}>
            <CardContent className="py-3 px-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-green-600">{statistics.resolved}</div>
                  <p className="text-sm text-muted-foreground">Resolvidos</p>
                </div>
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => {
            setStatusFilter('all');
            handleResetFilters();
          }}>
            <CardContent className="py-3 px-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-blue-600">{statistics.total}</div>
                  <p className="text-sm text-muted-foreground">Total</p>
                </div>
                <Clock className="h-5 w-5 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Inline Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-muted-foreground">Filtrar por:</span>
              <div className="flex gap-2">
                <Button
                  variant={statusFilter === 'active' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setStatusFilter('active');
                    setFilters({ status: 'active', severity: severityFilter === 'all' ? undefined : severityFilter });
                  }}
                >
                  Ativos
                </Button>
                <Button
                  variant={statusFilter === 'acknowledged' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setStatusFilter('acknowledged');
                    setFilters({ status: 'acknowledged', severity: severityFilter === 'all' ? undefined : severityFilter });
                  }}
                >
                  Reconhecidos
                </Button>
                <Button
                  variant={statusFilter === 'resolved' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setStatusFilter('resolved');
                    setFilters({ status: 'resolved', severity: severityFilter === 'all' ? undefined : severityFilter });
                  }}
                >
                  Resolvidos
                </Button>
                <Button
                  variant={statusFilter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={handleResetFilters}
                >
                  Todos
                </Button>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Alerts List - Compact Layout */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Lista de Alertas ({alerts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : alerts.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum alerta encontrado</h3>
              <p className="text-muted-foreground">
                {filters.status || filters.severity
                  ? 'Tente ajustar os filtros para ver mais resultados'
                  : 'Não há alertas no momento'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {alerts
                .filter(alert => alert && alert.id && alert.rule_name && alert.message)
                .map((alert, index) => {
                const config = severityConfig[alert.severity] || severityConfig.MEDIUM;
                const borderColor = 
                  alert.severity === 'CRITICAL' || alert.severity === 'Critical'
                    ? 'border-red-300'
                    : alert.severity === 'HIGH' || alert.severity === 'High'
                    ? 'border-orange-300'
                    : alert.severity === 'MEDIUM' || alert.severity === 'Medium'
                    ? 'border-yellow-300'
                    : 'border-blue-300';
                
                return (
                  <div
                    key={`alert-${alert.id}-${index}`}
                    className={`p-4 rounded-lg border-2 bg-white cursor-pointer transition-all hover:shadow-md ${borderColor}`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge
                            variant="outline"
                            className={`${
                              alert.severity === 'CRITICAL' || alert.severity === 'Critical'
                                ? 'bg-red-100 text-red-700 border-red-300'
                                : alert.severity === 'HIGH' || alert.severity === 'High'
                                ? 'bg-orange-100 text-orange-700 border-orange-300'
                                : alert.severity === 'MEDIUM' || alert.severity === 'Medium'
                                ? 'bg-yellow-100 text-yellow-700 border-yellow-300'
                                : 'bg-blue-100 text-blue-700 border-blue-300'
                            }`}
                          >
                            {config?.label || alert.severity}
                          </Badge>
                          <span className="font-semibold truncate">{alert.rule_name}</span>
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {(() => {
                              try {
                                const date = new Date(alert.triggered_at);
                                if (isNaN(date.getTime())) {
                                  return 'Data inválida';
                                }
                                return formatDistanceToNow(date, {
                                  addSuffix: true,
                                  locale: ptBR,
                                });
                              } catch {
                                return 'Data inválida';
                              }
                            })()}
                          </span>
                        </div>
                        <p className="text-sm mb-1">{alert.message}</p>
                        <div className="text-xs text-muted-foreground">
                          <span className="font-medium">Regra: Alerta {alert.rule_name}</span>
                          {' • '}
                          <span>Equipamento: {alert.equipment_name} ({alert.asset_tag})</span>
                        </div>
                      </div>
                      {/* Botões dinâmicos baseados no estado do alerta */}
                      {alert.resolved ? (
                        // Alerta RESOLVIDO → Botão "Detalhes"
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedAlertId(alert.id);
                          }}
                        >
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          Detalhes
                        </Button>
                      ) : alert.acknowledged ? (
                        // Alerta RECONHECIDO → Botão "Resolver"
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedAlertId(alert.id);
                          }}
                        >
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          Resolver
                        </Button>
                      ) : (
                        // Alerta ATIVO → Botão "Reconhecer"
                        <Button
                          size="sm"
                          className="bg-yellow-600 hover:bg-yellow-700 text-white"
                          disabled={!alert.is_active}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedAlertId(alert.id);
                          }}
                        >
                          <Clock className="w-4 h-4 mr-2" />
                          Reconhecer
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      {selectedAlert && (
        <AlertDetailsDialog
          alert={selectedAlert}
          open={!!selectedAlertId}
          onOpenChange={(open) => !open && setSelectedAlertId(null)}
        />
      )}

      <AddRuleModalMultiParam open={isAddRuleModalOpen} onOpenChange={setIsAddRuleModalOpen} />
    </div>
  );
};
