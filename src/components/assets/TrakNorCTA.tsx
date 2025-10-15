import React, { useState } from 'react';
import { CheckCircle2, X, Wrench, Zap, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useCTAStore } from '@/store/cta';
import { useFeaturesStore } from '@/store/features';

interface TrakNorCTAProps {
  orgId?: string;
  onContactClick?: () => void;
}

export function TrakNorCTA({ orgId = 'default', onContactClick }: TrakNorCTAProps) {
  const { isDismissed, dismiss } = useCTAStore();
  const enableTrakNorCTA = useFeaturesStore(state => state.enableTrakNorCTA);
  
  // ID único para este CTA
  const ctaKey = `traknor:${orgId}`;
  
  // Não exibir se foi dispensado ou está desabilitado
  if (isDismissed(ctaKey) || !enableTrakNorCTA) {
    return null;
  }
  
  const handleDismiss = () => {
    dismiss(ctaKey);
  };
  
  const handleContact = () => {
    if (onContactClick) {
      onContactClick();
    } else {
      // Fallback: abrir modal de contato ou mailto
      window.location.href = 'mailto:vendas@traknor.com?subject=Interesse em TrakNor&body=Gostaria de saber mais sobre a plataforma TrakNor para gestão de manutenção.';
    }
  };
  
  return (
    <Card className="border-blue-200 bg-gradient-to-br from-blue-50/80 to-indigo-50/50 dark:border-blue-800/50 dark:from-blue-950/30 dark:to-indigo-950/20">
      <CardHeader className="flex-row items-start justify-between space-y-0 pb-3">
        <div className="flex items-start gap-3 flex-1">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white">
            <Wrench className="size-5" />
          </div>
          <div>
            <CardTitle className="text-lg text-foreground">
              Manutenção Inteligente com TrakNor
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Eleve sua gestão de manutenção ao próximo nível
            </p>
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="icon"
          onClick={handleDismiss}
          aria-label="Dispensar CTA"
          className="hover:bg-blue-100 dark:hover:bg-blue-900/50"
        >
          <X className="size-4" />
        </Button>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Benefícios */}
        <ul className="space-y-2.5">
          {[
            {
              icon: <Zap className="size-4" />,
              text: 'Alertas preditivos e priorização automática de tarefas'
            },
            {
              icon: <Clock className="size-4" />,
              text: 'Ordem de serviço em 1 clique com histórico completo'
            },
            {
              icon: <CheckCircle2 className="size-4" />,
              text: 'Integração total com sensores e telemetria do ativo'
            },
          ].map((item, idx) => (
            <li key={idx} className="flex items-center gap-3 text-sm">
              <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-blue-600/10 text-blue-700 dark:bg-blue-400/10 dark:text-blue-400">
                {item.icon}
              </div>
              <span>{item.text}</span>
            </li>
          ))}
        </ul>
        
        {/* Destaque */}
        <div className="rounded-lg bg-blue-600/5 border border-blue-200/50 p-3 dark:bg-blue-400/5 dark:border-blue-800/50">
          <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
            🎁 <strong>Oferta especial:</strong> Integração gratuita para clientes TrakSense HVAC
          </p>
        </div>
        
        {/* Botões de Ação */}
        <div className="flex flex-wrap gap-3 pt-2">
          <Button 
            onClick={handleContact}
            className="gap-2 bg-blue-600 hover:bg-blue-700"
          >
            Quero Contratar
          </Button>
          
          <Button 
            variant="outline" 
            asChild
            className="gap-2"
          >
            <a 
              href="https://traknor.com/planos" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              Saiba Mais
            </a>
          </Button>
        </div>
        
        {/* Informação Adicional */}
        <p className="text-xs text-muted-foreground pt-2 border-t">
          TrakNor é uma plataforma de gestão de manutenção desenvolvida pela mesma equipe do TrakSense. 
          Dados de sensores são sincronizados automaticamente.
        </p>
      </CardContent>
    </Card>
  );
}
