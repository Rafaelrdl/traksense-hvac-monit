import React from 'react';
import { Activity, AlertCircle, ExternalLink, HelpCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { HVACAsset } from '@/types/hvac';
import { reasonMissingTelemetry } from '@/lib/hasPerformanceTelemetry';

interface PerformanceEmptyProps {
  asset: HVACAsset;
  missingSensors?: string[];
}

export function PerformanceEmpty({ asset, missingSensors }: PerformanceEmptyProps) {
  // Se não foi fornecida lista, gerar automaticamente
  const missing = missingSensors || reasonMissingTelemetry(asset, []);
  
  return (
    <div className="space-y-6">
      {/* Informativo Principal */}
      <Alert className="border-orange-200 bg-orange-50/70 text-zinc-900 dark:border-orange-400/30 dark:bg-orange-500/10 dark:text-zinc-100">
        <div className="flex items-start gap-3">
          <Activity className="mt-0.5 size-5 shrink-0 opacity-80" />
          <div className="space-y-2 flex-1">
            <AlertTitle className="text-base font-semibold leading-tight">
              Dados de Performance Indisponíveis
            </AlertTitle>
            <AlertDescription className="text-sm leading-relaxed opacity-90">
              Este equipamento não possui os sensores necessários para exibir métricas de performance. 
              Configure os sensores abaixo para habilitar análises avançadas.
            </AlertDescription>
          </div>
        </div>
      </Alert>

      {/* Card de Sensores Faltantes */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="size-5 text-orange-600" />
            <CardTitle className="text-lg">Sensores Necessários</CardTitle>
          </div>
          <CardDescription>
            Configure os seguintes sensores para habilitar a análise de performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {missing.map((sensor, idx) => (
              <li 
                key={idx} 
                className="flex items-center gap-3 p-3 border rounded-lg bg-muted/30"
              >
                <div className="size-2 rounded-full bg-orange-500" />
                <span className="text-sm">{sensor}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Card de Ações */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <HelpCircle className="size-5 text-blue-600" />
            <CardTitle className="text-lg">Como Habilitar Telemetria</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700 font-semibold text-xs dark:bg-blue-900/30 dark:text-blue-400">
                1
              </div>
              <p>
                <strong>Instalar sensores físicos</strong> no equipamento conforme especificação técnica
              </p>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700 font-semibold text-xs dark:bg-blue-900/30 dark:text-blue-400">
                2
              </div>
              <p>
                <strong>Configurar gateway IoT</strong> para coletar e enviar dados dos sensores
              </p>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700 font-semibold text-xs dark:bg-blue-900/30 dark:text-blue-400">
                3
              </div>
              <p>
                <strong>Vincular sensores</strong> ao equipamento na plataforma TrakSense
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 pt-2 border-t">
            <Button asChild>
              <a 
                href="https://docs.traksense.com/sensors/installation" 
                target="_blank" 
                rel="noopener noreferrer"
                className="gap-2"
              >
                <ExternalLink className="size-4" />
                Guia de Instalação
              </a>
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => {
                // Abrir modal de contato ou navegar para página de suporte
                window.location.href = 'mailto:suporte@traksense.com?subject=Solicitação de Instalação de Sensores';
              }}
              className="gap-2"
            >
              📧 Falar com Suporte
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Card de Benefícios */}
      <Card className="border-blue-200 bg-blue-50/30 dark:border-blue-800/50 dark:bg-blue-950/20">
        <CardHeader>
          <CardTitle className="text-lg">Benefícios da Telemetria de Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            {[
              'Monitoramento em tempo real de eficiência energética (EER/COP)',
              'Detecção precoce de degradação de performance',
              'Análise de correlação entre consumo e carga térmica',
              'Otimização automática de setpoints e operação',
              'Relatórios de performance e tendências históricas',
            ].map((benefit, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-blue-600 dark:text-blue-400">✓</span>
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
