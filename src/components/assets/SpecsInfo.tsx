import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info } from 'lucide-react';

export function SpecsInfo() {
  return (
    <Alert
      role="note"
      className="
        border-blue-200 bg-blue-50/70 text-zinc-900
        dark:border-blue-400/30 dark:bg-blue-500/10 dark:text-zinc-100
      "
    >
      <div className="flex items-start gap-3">
        <Info className="mt-0.5 size-4 shrink-0 opacity-80" />
        <div className="space-y-1">
          <AlertTitle className="text-sm font-medium leading-tight">
            Especificações Técnicas
          </AlertTitle>
          <AlertDescription className="text-sm leading-relaxed opacity-90">
            Informe apenas parâmetros técnicos do equipamento. 
            Campos marcados com <span className="text-red-500 font-medium">*</span> são obrigatórios.
          </AlertDescription>
        </div>
      </div>
    </Alert>
  );
}
