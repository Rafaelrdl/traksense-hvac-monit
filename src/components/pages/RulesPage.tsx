import React from 'react';
import { RuleBuilder } from '../alerts/RuleBuilder';
import { Zap } from 'lucide-react';

export const RulesPage: React.FC = () => {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Zap className="w-6 h-6 text-primary" />
            Regras de Monitoramento
          </h1>
          <p className="text-muted-foreground mt-1">
            Configure regras automáticas para geração de alertas baseados em condições de equipamentos
          </p>
        </div>
      </div>

      {/* Rule Builder Component */}
      <div className="bg-card rounded-xl p-6 border shadow-sm">
        <RuleBuilder />
      </div>

      {/* Info Card */}
      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-xl p-6">
        <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
          <Zap className="w-5 h-5" />
          Como funcionam as regras?
        </h3>
        <div className="text-sm text-blue-800 space-y-2">
          <p>
            As regras de monitoramento avaliam continuamente os parâmetros dos equipamentos HVAC 
            e disparam alertas automáticos quando as condições configuradas são atendidas.
          </p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Monitore temperatura, pressão, consumo de energia e mais</li>
            <li>Configure limiares e duração para cada parâmetro</li>
            <li>Defina níveis de severidade (Crítico, Alto, Médio, Baixo)</li>
            <li>Escolha ações automáticas (Email, SMS, Push, Log, Webhook)</li>
            <li>Ative ou desative regras conforme necessário</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
