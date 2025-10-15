import React from 'react';
import { FileText, ListChecks, LayoutDashboard, CheckCircle2, Wrench } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useFeaturesStore } from '@/store/features';

interface TrakNorCTAProps {
  onContactClick?: () => void;
  onLearnMoreClick?: () => void;
}

export function TrakNorCTA({ onContactClick, onLearnMoreClick }: TrakNorCTAProps) {
  const enableTrakNorCTA = useFeaturesStore(state => state.enableTrakNorCTA);
  
  // Não exibir se está desabilitado por feature flag
  if (!enableTrakNorCTA) {
    return null;
  }
  
  const handleContact = () => {
    if (onContactClick) {
      onContactClick();
    } else {
      // Fallback: abrir modal de contato ou mailto
      window.location.href = 'mailto:vendas@traknor.com?subject=Interesse em TrakNor CMMS&body=Gostaria de conhecer o TrakNor para gestão de manutenção.';
    }
  };
  
  const handleLearnMore = () => {
    if (onLearnMoreClick) {
      onLearnMoreClick();
    } else {
      // Fallback: abrir página externa
      window.open('https://traknor.com/como-funciona', '_blank', 'noopener,noreferrer');
    }
  };
  
  return (
    <Card className="relative overflow-hidden border shadow-sm bg-card">
      {/* Accent bar superior */}
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-accent-9 via-accent-10 to-accent-9" />
      
      <CardHeader className="space-y-2 pb-4 pt-5">
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-accent-3 text-accent-11 dark:bg-accent-4/50">
            <Wrench className="size-5" />
          </div>
          <div className="flex-1">
            <CardTitle className="text-xl font-bold leading-tight">
              Manutenção sem caos. Comande tudo no TrakNor.
            </CardTitle>
            <CardDescription className="mt-1.5 leading-relaxed">
              Abra e priorize Ordens de Serviço em segundos, execute Planos preventivos e acompanhe seus ativos em painéis claros — tudo em um só lugar.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Benefícios principais - 3 bullets enxutos */}
        <div className="space-y-3">
          {[
            {
              icon: <FileText className="size-4" />,
              text: 'OS em 1 clique e histórico do ativo organizado.'
            },
            {
              icon: <ListChecks className="size-4" />,
              text: 'Planos e checklists preventivos para reduzir paradas e urgências.'
            },
            {
              icon: <LayoutDashboard className="size-4" />,
              text: 'Painéis operacionais para ver o que importa e decidir mais rápido.'
            },
          ].map((item, idx) => (
            <div key={idx} className="flex items-start gap-3 text-sm">
              <div className="flex size-6 shrink-0 items-center justify-center rounded-md bg-accent-3 text-accent-11 dark:bg-accent-4/30 mt-0.5">
                {item.icon}
              </div>
              <span className="leading-relaxed">{item.text}</span>
            </div>
          ))}
        </div>
        
        {/* Observação inteligente - linkagem com TrakSense */}
        <div className="rounded-lg bg-accent-2 border border-accent-6 p-3 dark:bg-accent-3/30 dark:border-accent-6/50">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="size-4 shrink-0 text-accent-11 mt-0.5" />
            <p className="text-sm leading-relaxed">
              <strong className="font-semibold">Sem telemetria?</strong> O TrakNor funciona 100% sem sensores — e quando você integrar ao TrakSense, desbloqueia camadas de análise preditiva.
            </p>
          </div>
        </div>
        
        {/* Botões de Ação - primário e secundário */}
        <div className="flex flex-wrap gap-2 pt-2">
          <Button 
            onClick={handleContact}
            size="sm"
            className="gap-2"
          >
            <Wrench className="size-4" />
            Quero Contratar
          </Button>
          
          <Button 
            onClick={handleLearnMore}
            variant="outline" 
            size="sm"
          >
            Ver como funciona
          </Button>
        </div>
        
        {/* Rodapé - microcopy de confiança */}
        <p className="text-xs text-muted-foreground pt-3 border-t leading-relaxed">
          Tecnologia moderna (React + TypeScript) e testes automatizados para estabilidade no dia a dia.
        </p>
      </CardContent>
    </Card>
  );
}
