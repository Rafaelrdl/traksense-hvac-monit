import React, { useState } from 'react';
import { FileText, Download, Calendar as CalendarSmallIcon, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { DatePicker } from '@/components/ui/date-picker';

interface MyReportsTabProps {
  onRequestCustomReport?: () => void;
}

export function MyReportsTab({ onRequestCustomReport }: MyReportsTabProps) {
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [scope, setScope] = useState<string>('all');
  const [reportType, setReportType] = useState<string>('operational');

  // Dados de exemplo de relatórios gerados pelo usuário
  const userReports = [
    {
      title: 'Resumo Operacional Semanal',
      description: 'Visão geral do desempenho de todos os ativos HVAC',
      date: '2024-01-15',
      type: 'PDF',
      status: 'Disponível'
    },
    {
      title: 'Análise de Consumo Energético',
      description: 'Detalhamento do consumo energético por ativo e período',
      date: '2024-01-14',
      type: 'Excel',
      status: 'Disponível'
    },
    {
      title: 'Histórico de Manutenções',
      description: 'Registro completo de manutenções preventivas e corretivas',
      date: '2024-01-13',
      type: 'PDF',
      status: 'Disponível'
    },
    {
      title: 'Dashboard de Performance',
      description: 'Indicadores de performance e eficiência energética',
      date: '2024-01-12',
      type: 'Excel',
      status: 'Processando...'
    },
    {
      title: 'Relatório de Eficiência Térmica',
      description: 'Análise detalhada da eficiência térmica por zona',
      date: '2024-01-10',
      type: 'PDF',
      status: 'Disponível'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Report Generation Controls */}
      <div className="bg-card rounded-xl p-6 border shadow-sm">
        <div className="mb-4">
          <h3 className="text-lg font-semibold flex items-center space-x-2">
            <Filter className="w-5 h-5" />
            <span>Gerar Novo Relatório</span>
          </h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Date Range */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Período</Label>
            <div className="grid grid-cols-2 gap-2">
              <DatePicker
                selected={startDate}
                onChange={(date) => setStartDate(date || undefined)}
                placeholderText="Início"
              />
              <DatePicker
                selected={endDate}
                onChange={(date) => setEndDate(date || undefined)}
                placeholderText="Fim"
              />
            </div>
          </div>
          
          {/* Scope */}
          <div className="space-y-3">
            <Label htmlFor="scope-select" className="text-sm font-medium">Escopo</Label>
            <Select value={scope} onValueChange={setScope}>
              <SelectTrigger id="scope-select" className="w-full">
                <SelectValue placeholder="Selecione o escopo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Ativos</SelectItem>
                <SelectItem value="ahu">Apenas AHUs</SelectItem>
                <SelectItem value="chiller">Apenas Chillers</SelectItem>
                <SelectItem value="vrf">Apenas VRFs</SelectItem>
                <SelectItem value="rtu">Apenas RTUs</SelectItem>
                <SelectItem value="boiler">Apenas Boilers</SelectItem>
                <SelectItem value="cooling-tower">Apenas Torres de Resfriamento</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Report Type */}
          <div className="space-y-3">
            <Label htmlFor="report-type-select" className="text-sm font-medium">Tipo de Relatório</Label>
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger id="report-type-select" className="w-full">
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="operational">Resumo Operacional</SelectItem>
                <SelectItem value="energy">Análise Energética</SelectItem>
                <SelectItem value="performance">Performance de Ativos</SelectItem>
                <SelectItem value="alerts">Histórico de Alertas</SelectItem>
                <SelectItem value="maintenance">Manutenções Realizadas</SelectItem>
                <SelectItem value="efficiency">Eficiência Energética</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 mt-6">
          <Button 
            className="flex items-center gap-2"
            disabled={!startDate || !endDate}
          >
            <Filter className="w-4 h-4" />
            Gerar Relatório
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Exportar CSV
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Exportar PDF
          </Button>
        </div>
      </div>

      {/* Generated Reports List */}
      <div className="bg-card rounded-xl p-6 border shadow-sm">
        <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
          <FileText className="w-5 h-5" />
          <span>Meus Relatórios</span>
        </h3>
        
        <div className="space-y-4">
          {userReports.map((report, index) => (
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
                      <CalendarSmallIcon className="w-3 h-3" />
                      <span>{report.date}</span>
                    </span>
                    <span className="px-2 py-1 bg-muted rounded text-xs">{report.type}</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium text-white ${
                      report.status === 'Disponível' 
                        ? 'bg-chart-1'
                        : 'bg-chart-2'
                    }`}>
                      {report.status}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2">
                {report.status === 'Disponível' ? (
                  <>
                    <Button variant="outline" size="sm">
                      Visualizar
                    </Button>
                    <Button size="sm" className="flex items-center gap-1">
                      <Download className="w-3 h-3" />
                      <span>Download</span>
                    </Button>
                  </>
                ) : (
                  <Button variant="outline" size="sm" disabled>
                    Processando...
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}