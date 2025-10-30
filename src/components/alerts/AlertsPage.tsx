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
import { Alert, AlertCircle, Bell, CheckCircle2, Clock, Filter, Loader2, Plus, RefreshCw } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { AlertDetailsDialog } from './AlertDetailsDialog';
import { AddRuleModalMultiParam } from './AddRuleModalMultiParam';

const severityConfig: Record<Severity, { color: string; bg: string; label: string }> = {
  CRITICAL: { color: 'text-red-700', bg: 'bg-red-100 border-red-200', label: 'Crítico' },
  HIGH: { color: 'text-orange-700', bg: 'bg-orange-100 border-orange-200', label: 'Alto' },
  MEDIUM: { color: 'text-yellow-700', bg: 'bg-yellow-100 border-yellow-200', label: 'Médio' },
  LOW: { color: 'text-blue-700', bg: 'bg-blue-100 border-blue-200', label: 'Baixo' },
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Alertas</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie e monitore os alertas do sistema
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          <Button onClick={() => setIsAddRuleModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Nova Regra
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Alertas</CardTitle>
              <Bell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.total}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Todos os alertas do sistema
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ativos</CardTitle>
              <AlertCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{statistics.active}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Requerem atenção
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Reconhecidos</CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{statistics.acknowledged}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Em análise
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Resolvidos</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{statistics.resolved}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Concluídos
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as AlertStatus | 'all')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="active">Ativos</SelectItem>
                  <SelectItem value="acknowledged">Reconhecidos</SelectItem>
                  <SelectItem value="resolved">Resolvidos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Severidade</label>
              <Select value={severityFilter} onValueChange={(value) => setSeverityFilter(value as Severity | 'all')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="CRITICAL">Crítico</SelectItem>
                  <SelectItem value="HIGH">Alto</SelectItem>
                  <SelectItem value="MEDIUM">Médio</SelectItem>
                  <SelectItem value="LOW">Baixo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 flex items-end">
              <div className="flex gap-2 w-full">
                <Button onClick={handleApplyFilters} className="flex-1">
                  Aplicar
                </Button>
                <Button variant="outline" onClick={handleResetFilters} className="flex-1">
                  Limpar
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alerts List */}
      <Card>
        <CardHeader>
          <CardTitle>Alertas Recentes</CardTitle>
          <CardDescription>
            {filters.status ? `Exibindo alertas: ${filters.status}` : 'Exibindo todos os alertas'}
          </CardDescription>
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
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-colors hover:bg-accent ${
                    severityConfig[alert.severity].bg
                  }`}
                  onClick={() => setSelectedAlertId(alert.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant={alert.is_active ? 'destructive' : 'secondary'}>
                          {alert.is_active ? 'Ativo' : alert.acknowledged ? 'Reconhecido' : 'Resolvido'}
                        </Badge>
                        <Badge className={severityConfig[alert.severity].color}>
                          {severityConfig[alert.severity].label}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(alert.triggered_at), {
                            addSuffix: true,
                            locale: ptBR,
                          })}
                        </span>
                      </div>
                      <h4 className="font-semibold mb-1">{alert.rule_name}</h4>
                      <p className="text-sm text-muted-foreground mb-2">{alert.message}</p>
                      <div className="text-xs text-muted-foreground">
                        Equipamento: <span className="font-medium">{alert.equipment_name}</span> (
                        {alert.asset_tag})
                      </div>
                    </div>
                  </div>
                </div>
              ))}
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
