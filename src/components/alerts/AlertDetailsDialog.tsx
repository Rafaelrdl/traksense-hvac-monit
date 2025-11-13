/**
 * Alert Details Dialog
 * 
 * REGRA DE NEGÓCIO:
 * - Alerta ATIVO  Botão "Reconhecer" (sem modal, apenas marca)
 * - Alerta RECONHECIDO  Botão "Resolver" (abre modal com campo de descrição)
 * - Alerta RESOLVIDO  Botão "Detalhes" (visualiza histórico completo)
 */

import React, { useState } from 'react';
import { useAlertsStore } from '@/store/alertsStore';
import { Alert } from '@/services/api/alerts';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { AlertCircle, CheckCircle2, Clock, Loader2, User } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface AlertDetailsDialogProps {
  alert: Alert;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const severityConfig = {
  CRITICAL: { color: 'bg-red-600 text-white', label: 'Crítico' },
  HIGH: { color: 'bg-orange-600 text-white', label: 'Alto' },
  MEDIUM: { color: 'bg-yellow-600 text-white', label: 'Médio' },
  LOW: { color: 'bg-blue-600 text-white', label: 'Baixo' },
};

export const AlertDetailsDialog: React.FC<AlertDetailsDialogProps> = ({
  alert,
  open,
  onOpenChange,
}) => {
  const { acknowledgeAlert, resolveAlert, isAcknowledging, isResolving } = useAlertsStore();
  const [resolveNotes, setResolveNotes] = useState('');
  const [showResolveModal, setShowResolveModal] = useState(false);
  
  const severityKey = (alert?.severity || 'MEDIUM').toString().toUpperCase() as keyof typeof severityConfig;
  const sev = severityConfig[severityKey] ?? { color: 'bg-gray-600 text-white', label: 'Médio' };

  // Reconhecer (sem modal)
  const handleAcknowledge = async () => {
    const success = await acknowledgeAlert(alert.id);
    if (success) {
      onOpenChange(false);
    }
  };

  // Abrir modal de resolução
  const handleOpenResolve = () => {
    setShowResolveModal(true);
  };

  // Resolver (com notas obrigatórias)
  const handleResolve = async () => {
    if (!resolveNotes.trim()) {
      toast.error('Por favor, descreva o que foi feito para resolver o problema');
      return;
    }
    
    const success = await resolveAlert(alert.id, resolveNotes);
    if (success) {
      setResolveNotes('');
      setShowResolveModal(false);
      onOpenChange(false);
    }
  };

  const isActive = alert.is_active && !alert.acknowledged;
  const isAcknowledged = alert.acknowledged && !alert.resolved;
  const isResolved = alert.resolved;

  return (
    <>
      {/* Modal Principal */}
      <Dialog open={open && !showResolveModal} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Detalhes do Alerta
            </DialogTitle>
            <DialogDescription>
              Alerta #{alert.id} - {alert.rule_name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="flex items-center gap-2">
              <Badge variant={isActive ? 'destructive' : 'secondary'} className="text-sm">
                {isActive && (
                  <>
                    <AlertCircle className="w-3 h-3 mr-1" />
                    Ativo
                  </>
                )}
                {isAcknowledged && (
                  <>
                    <Clock className="w-3 h-3 mr-1" />
                    Reconhecido
                  </>
                )}
                {isResolved && (
                  <>
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Resolvido
                  </>
                )}
              </Badge>
              <Badge className={sev.color}>
                {sev.label}
              </Badge>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-muted-foreground">Regra</Label>
                <p className="font-semibold">{alert.rule_name}</p>
              </div>

              <div>
                <Label className="text-muted-foreground">Equipamento</Label>
                <p className="font-semibold">
                  {alert.equipment_name} <span className="text-muted-foreground">({alert.asset_tag})</span>
                </p>
              </div>

              <div>
                <Label className="text-muted-foreground">Mensagem</Label>
                <p className="text-sm">{alert.message}</p>
              </div>

              <div>
                <Label className="text-muted-foreground">Disparado em</Label>
                <p className="text-sm">
                  {format(new Date(alert.triggered_at), "dd 'de' MMMM 'de' yyyy 'às' HH:mm:ss", {
                    locale: ptBR,
                  })}
                </p>
              </div>
            </div>

            {alert.acknowledged && (
              <>
                <Separator />
                <div className="space-y-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-yellow-700 dark:text-yellow-400" />
                    <Label className="font-semibold text-yellow-900 dark:text-yellow-200">
                      Reconhecimento
                    </Label>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <User className="w-3 h-3 text-muted-foreground" />
                      <span className="text-muted-foreground">Reconhecido por:</span>
                      <span className="font-medium">{alert.acknowledged_by_email || 'Desconhecido'}</span>
                    </div>

                    {alert.acknowledged_at && (
                      <div className="flex items-center gap-2">
                        <Clock className="w-3 h-3 text-muted-foreground" />
                        <span className="text-muted-foreground">Em:</span>
                        <span className="font-medium">
                          {format(new Date(alert.acknowledged_at), "dd/MM/yyyy 'às' HH:mm", {
                            locale: ptBR,
                          })}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {alert.resolved && (
              <>
                <Separator />
                <div className="space-y-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-700 dark:text-green-400" />
                    <Label className="font-semibold text-green-900 dark:text-green-200">
                      Resolução
                    </Label>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <User className="w-3 h-3 text-muted-foreground" />
                      <span className="text-muted-foreground">Resolvido por:</span>
                      <span className="font-medium">{alert.resolved_by_email || 'Desconhecido'}</span>
                    </div>

                    {alert.resolved_at && (
                      <div className="flex items-center gap-2">
                        <Clock className="w-3 h-3 text-muted-foreground" />
                        <span className="text-muted-foreground">Em:</span>
                        <span className="font-medium">
                          {format(new Date(alert.resolved_at), "dd/MM/yyyy 'às' HH:mm", {
                            locale: ptBR,
                          })}
                        </span>
                      </div>
                    )}

                    {alert.resolved_notes && (
                      <div>
                        <Label className="text-muted-foreground">O que foi feito:</Label>
                        <p className="mt-1 text-sm whitespace-pre-wrap bg-white dark:bg-gray-800 p-3 rounded border">
                          {alert.resolved_notes}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Fechar
            </Button>

            {isActive && (
              <Button
                onClick={handleAcknowledge}
                disabled={isAcknowledging}
                variant="secondary"
                className="bg-yellow-600 hover:bg-yellow-700 text-white"
              >
                {isAcknowledging ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Reconhecendo...
                  </>
                ) : (
                  <>
                    <Clock className="w-4 h-4 mr-2" />
                    Reconhecer
                  </>
                )}
              </Button>
            )}

            {isAcknowledged && (
              <Button
                onClick={handleOpenResolve}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Resolver
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Resolução */}
      <Dialog open={showResolveModal} onOpenChange={setShowResolveModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              Resolver Alerta
            </DialogTitle>
            <DialogDescription>
              Descreva o que foi feito para resolver o problema
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="resolve-notes" className="text-sm font-medium">
                Descrição da Resolução <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="resolve-notes"
                placeholder="Ex: Substituído sensor de temperatura que estava com defeito. Teste realizado e confirmado funcionamento normal."
                value={resolveNotes}
                onChange={(e) => setResolveNotes(e.target.value)}
                rows={5}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                Esta informação ficará registrada no histórico do alerta
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button 
              variant="outline" 
              onClick={() => {
                setShowResolveModal(false);
                setResolveNotes('');
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleResolve}
              disabled={isResolving || !resolveNotes.trim()}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {isResolving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Resolvendo...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Confirmar Resolução
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
