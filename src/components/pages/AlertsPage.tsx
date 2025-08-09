import React, { useState } from 'react';
import { useAppStore } from '../../store/app';
import { AlertTriangle, Bell, CheckCircle, Clock, Settings } from 'lucide-react';

export const AlertsPage: React.FC = () => {
  const { alerts, acknowledgeAlert, scenarios, setScenario } = useAppStore();
  const [filterStatus, setFilterStatus] = useState<string>('active');

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
    switch (severity) {
      case 'Critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'High': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
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
                {alerts.filter(a => !a.resolved && !a.acknowledged).length}
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
                {alerts.filter(a => a.acknowledged && !a.resolved).length}
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
                {alerts.filter(a => a.resolved).length}
              </h3>
              <p className="text-sm text-muted-foreground">Resolvidos</p>
            </div>
            <CheckCircle className="w-5 h-5 text-green-600" />
          </div>
        </div>

        <div className="bg-card rounded-xl p-4 border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-primary">{alerts.length}</h3>
              <p className="text-sm text-muted-foreground">Total</p>
            </div>
            <Clock className="w-5 h-5 text-primary" />
          </div>
        </div>
      </div>

      {/* Scenario Selector */}
      <div className="bg-card rounded-xl p-6 border shadow-sm">
        <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
          <Settings className="w-5 h-5" />
          <span>Cenários de Simulação</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {scenarios.map(scenario => (
            <button
              key={scenario.id}
              onClick={() => setScenario(scenario.id)}
              className={`p-3 rounded-lg border text-left transition-colors ${
                scenario.active 
                  ? 'bg-primary text-primary-foreground border-primary' 
                  : 'hover:bg-muted border-border'
              }`}
            >
              <div className="font-medium text-sm">{scenario.name}</div>
              <div className="text-xs opacity-75 mt-1">{scenario.description}</div>
            </button>
          ))}
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

        {filteredAlerts.length === 0 ? (
          <div className="text-center py-12">
            <AlertTriangle className="w-12 h-12 mx-auto mb-4 opacity-50 text-muted-foreground" />
            <p className="text-muted-foreground">Nenhum alerta encontrado</p>
          </div>
        ) : (
          <div className="divide-y">
            {filteredAlerts.map(alert => (
              <div key={alert.id} className="p-6 hover:bg-muted/30 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getSeverityColor(alert.severity)}`}>
                        {alert.severity}
                      </span>
                      <span className="font-medium">{alert.assetTag}</span>
                      <span className="text-sm text-muted-foreground">
                        {getTimeAgo(alert.timestamp)}
                      </span>
                    </div>
                    
                    <p className="text-sm text-foreground mb-2">{alert.message}</p>
                    
                    <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                      <span>Regra: {alert.ruleName}</span>
                      <span>Tipo: {alert.type}</span>
                      {alert.acknowledgedBy && (
                        <span>Reconhecido por: {alert.acknowledgedBy}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col space-y-2 ml-4">
                    {!alert.acknowledged && !alert.resolved && (
                      <button
                        onClick={() => acknowledgeAlert(alert.id)}
                        className="px-3 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200 transition-colors"
                      >
                        Reconhecer
                      </button>
                    )}
                    
                    {alert.acknowledged && (
                      <div className="flex items-center space-x-1 text-xs text-green-600">
                        <CheckCircle className="w-3 h-3" />
                        <span>Reconhecido</span>
                      </div>
                    )}
                    
                    {alert.resolved && (
                      <div className="flex items-center space-x-1 text-xs text-gray-500">
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

      {/* Rule Builder Mock */}
      <div className="bg-card rounded-xl p-6 border shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Construtor de Regras (Mock)</h3>
        <div className="bg-muted/30 rounded-lg p-4 text-center">
          <p className="text-muted-foreground">
            Interface de construção de regras em desenvolvimento
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Exemplo: "ΔP filtro > 250 Pa por 10 min → severidade Alta"
          </p>
        </div>
      </div>
    </div>
  );
};