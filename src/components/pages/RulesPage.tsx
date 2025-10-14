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
        <div className="text-sm text-blue-800 space-y-3">
          <p>
            As regras são avaliadas sobre <strong>parâmetros do Equipamento IoT</strong> vinculado ao equipamento cadastrado.
            Quando as condições são atendidas, alertas automáticos são gerados.
          </p>
          
          <div className="space-y-2">
            <h4 className="font-semibold text-blue-900">Principais características:</h4>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li><strong>Equipamento-based:</strong> Regras vinculadas a equipamentos específicos cadastrados</li>
              <li><strong>Tipo de ativo derivado:</strong> Automaticamente obtido do equipamento (não editável)</li>
              <li><strong>Parâmetros IoT:</strong> Apenas parâmetros disponíveis no dispositivo IoT do equipamento</li>
              <li><strong>Variáveis:</strong> Detalhamento de como observar o parâmetro (ex: média, pico, atual)</li>
              <li><strong>Ações disponíveis:</strong> E-mail e Notificação in-app (WebHook descontinuado)</li>
            </ul>
          </div>

          <div className="bg-blue-100 rounded-lg p-3 mt-3">
            <p className="text-xs text-blue-700">
              <strong>Nota:</strong> WebHook foi descontinuado por questões de segurança. 
              Regras antigas com WebHook foram migradas automaticamente e podem necessitar de revisão.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
