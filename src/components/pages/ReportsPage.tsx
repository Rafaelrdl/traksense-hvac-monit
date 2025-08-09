import React from 'react';
import { FileText, Download, Calendar, Filter } from 'lucide-react';

export const ReportsPage: React.FC = () => {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Relatórios</h1>
          <p className="text-muted-foreground">
            Análises históricas e exportação de dados
          </p>
        </div>
      </div>

      {/* Report Controls */}
      <div className="bg-card rounded-xl p-6 border shadow-sm">
        <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
          <Filter className="w-5 h-5" />
          <span>Controles de Relatório</span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Período</label>
            <div className="flex space-x-2">
              <input
                type="date"
                className="flex-1 px-3 py-2 border border-input rounded-lg bg-background"
              />
              <input
                type="date"
                className="flex-1 px-3 py-2 border border-input rounded-lg bg-background"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Escopo</label>
            <select className="w-full px-3 py-2 border border-input rounded-lg bg-background">
              <option>Todos os Ativos</option>
              <option>Apenas AHUs</option>
              <option>Apenas Chillers</option>
              <option>Apenas VRFs</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Tipo de Relatório</label>
            <select className="w-full px-3 py-2 border border-input rounded-lg bg-background">
              <option>Resumo Operacional</option>
              <option>Análise Energética</option>
              <option>Performance de Ativos</option>
              <option>Histórico de Alertas</option>
            </select>
          </div>
        </div>
        
        <div className="flex space-x-3 mt-4">
          <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
            Gerar Relatório
          </button>
          <button className="px-4 py-2 border border-input rounded-lg hover:bg-muted transition-colors flex items-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Exportar CSV</span>
          </button>
          <button className="px-4 py-2 border border-input rounded-lg hover:bg-muted transition-colors flex items-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Exportar PDF</span>
          </button>
        </div>
      </div>

      {/* KPIs Agregados */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl p-4 border shadow-sm">
          <div className="text-2xl font-bold text-primary">98.5%</div>
          <div className="text-sm text-muted-foreground">Uptime Médio</div>
        </div>
        
        <div className="bg-card rounded-xl p-4 border shadow-sm">
          <div className="text-2xl font-bold text-primary">15,240</div>
          <div className="text-sm text-muted-foreground">kWh Consumidos</div>
        </div>
        
        <div className="bg-card rounded-xl p-4 border shadow-sm">
          <div className="text-2xl font-bold text-primary">87%</div>
          <div className="text-sm text-muted-foreground">Saúde Média</div>
        </div>
        
        <div className="bg-card rounded-xl p-4 border shadow-sm">
          <div className="text-2xl font-bold text-primary">12</div>
          <div className="text-sm text-muted-foreground">Alertas Resolvidos</div>
        </div>
      </div>

      {/* Available Reports */}
      <div className="bg-card rounded-xl p-6 border shadow-sm">
        <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
          <FileText className="w-5 h-5" />
          <span>Relatórios Disponíveis</span>
        </h3>
        
        <div className="space-y-4">
          {[
            {
              title: 'Resumo Operacional Semanal',
              description: 'Visão geral do desempenho de todos os ativos HVAC',
              date: '2024-01-15',
              type: 'PDF'
            },
            {
              title: 'Análise de Consumo Energético',
              description: 'Detalhamento do consumo energético por ativo e período',
              date: '2024-01-14',
              type: 'Excel'
            },
            {
              title: 'Histórico de Manutenções',
              description: 'Registro completo de manutenções preventivas e corretivas',
              date: '2024-01-13',
              type: 'PDF'
            },
            {
              title: 'Dashboard de Performance',
              description: 'Indicadores de performance e eficiência energética',
              date: '2024-01-12',
              type: 'Excel'
            }
          ].map((report, index) => (
            <div key={index} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/30 transition-colors">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium">{report.title}</h4>
                  <p className="text-sm text-muted-foreground">{report.description}</p>
                  <div className="flex items-center space-x-4 mt-1">
                    <span className="text-xs text-muted-foreground flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>{report.date}</span>
                    </span>
                    <span className="px-2 py-1 bg-muted rounded text-xs">{report.type}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <button className="px-3 py-1 text-sm border border-input rounded hover:bg-muted transition-colors">
                  Visualizar
                </button>
                <button className="px-3 py-1 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors flex items-center space-x-1">
                  <Download className="w-3 h-3" />
                  <span>Download</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};