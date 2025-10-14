import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Copy, Mail, ExternalLink } from "lucide-react";
import { useState } from "react";

const SUPPORT_EMAIL = import.meta.env.VITE_SUPPORT_EMAIL ?? "contato@traksense.io";

interface RequestReportMiniModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedTemplate?: { id: string; name: string } | null;
}

function buildMailto(templateInfo?: { id: string; name: string } | null) {
  const templateText = templateInfo 
    ? `\n- Modelo de interesse: ${templateInfo.name} (ID: ${templateInfo.id})`
    : "";

  const subject = encodeURIComponent("Solicitação de relatório personalizado — TrakSense HVAC");
  const body = encodeURIComponent(
`Olá equipe TrakSense,

Gostaria de solicitar um relatório personalizado para nossa plataforma HVAC.

Informações da solicitação:
- Empresa/Equipe: [Preencher]
- Responsável pela solicitação: [Preencher]
- Intervalo de datas desejado: [Preencher]
- Métricas específicas: [Preencher]
- Formato preferido: [PDF/CSV/Excel]${templateText}
- Observações adicionais: [Preencher]

Aguardo retorno com prazo de entrega e eventuais custos envolvidos.

Atenciosamente.`
  );
  return `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`;
}

export function RequestReportMiniModal({ 
  open, 
  onOpenChange, 
  selectedTemplate 
}: RequestReportMiniModalProps) {
  const [copied, setCopied] = useState(false);
  
  const mailto = buildMailto(selectedTemplate);
  
  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(SUPPORT_EMAIL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Falha ao copiar e-mail:', err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Solicitar relatório personalizado
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            <p>
              Envie sua solicitação de relatório personalizado para nossa equipe técnica. 
              Incluiremos todas as métricas e análises específicas da sua operação HVAC.
            </p>
            {selectedTemplate && (
              <p className="mt-2 p-2 bg-muted/50 rounded-md">
                <strong>Modelo selecionado:</strong> {selectedTemplate.name}
              </p>
            )}
          </div>
          
          <div className="space-y-3">
            <label className="text-sm font-medium">E-mail de contato da TrakSense:</label>
            <div className="flex items-center justify-between rounded-lg border p-3 bg-muted/20">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium text-sm">{SUPPORT_EMAIL}</span>
              </div>
              <Button 
                size="sm" 
                variant="secondary" 
                onClick={handleCopyEmail}
                className="flex items-center gap-1"
              >
                <Copy className="w-3 h-3" />
                {copied ? "Copiado!" : "Copiar"}
              </Button>
            </div>
          </div>

          <div className="text-xs text-muted-foreground bg-blue-50 dark:bg-blue-950/20 p-3 rounded-md border border-blue-200 dark:border-blue-800">
            <strong>Tempo de resposta:</strong> Nossa equipe responde solicitações de relatórios personalizados em até 2 dias úteis.
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button 
            asChild 
            variant="default" 
            className="flex items-center gap-2"
          >
            <a href={mailto}>
              <ExternalLink className="w-4 h-4" />
              Abrir cliente de e-mail
            </a>
          </Button>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
          >
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}