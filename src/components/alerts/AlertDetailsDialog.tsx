/**
 * Alert Details Dialog
 * 
 * Dialog for viewing and managing individual alert details.
 */

import React, { useState } from 'react';
import { useAlertsStore } from '@/store/alertsStore';
import { Alert } from '@/services/api/alerts';
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
  const [notes, setNotes] = useState('');

  const handleAcknowledge = async () => {
    const success = await acknowledgeAlert(alert.id, notes || undefined);
    if (success) {
      setNotes('');
    }
  };

  const handleResolve = async () => {
    const success = await resolveAlert(alert.id, notes || undefined);
    if (success) {
      setNotes('');
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
          {/* Status and Severity */}
          <div className="flex items-center gap-2">
            <Badge variant={alert.is_active ? 'destructive' : 'secondary'} className="text-sm">
              {alert.is_active ? (
                <>
                  <AlertCircle className="w-3 h-3 mr-1" />
                  Ativo
                </>
              ) : alert.resolved ? (
                <>
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Resolvido
                </>
              ) : (
                <>
                  <Clock className="w-3 h-3 mr-1" />
                  Reconhecido
                </>
              )}
            </Badge>
            <Badge className={severityConfig[alert.severity].color}>
              {severityConfig[alert.severity].label}
            </Badge>
          </div>

          {/* Alert Info */}
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

          {/* Acknowledgment Info */}
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
                    <span className="text-muted-foreground">Por:</span>
                    <span className="font-medium">{alert.acknowledged_by_email || 'Desconhecido'}</span>
                  </div>

                  {alert.acknowledged_at && (
                    <div>
                      <span className="text-muted-foreground">Em:</span>{' '}
                      {format(new Date(alert.acknowledged_at), "dd/MM/yyyy 'às' HH:mm", {
                        locale: ptBR,
                      })}
                    </div>
                  )}

                  {alert.acknowledged_notes && (
                    <div>
                      <Label className="text-muted-foreground">Notas:</Label>
                      <p className="mt-1 text-sm whitespace-pre-wrap">{alert.acknowledged_notes}</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Resolution Info */}
          {alert.resolved && (
            <>
              <Separator />
              <div className="space-y-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-700 dark:text-green-400" />
                  <Label className="font-semibold text-green-900 dark:text-green-200">Resolução</Label>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <User className="w-3 h-3 text-muted-foreground" />
                    <span className="text-muted-foreground">Por:</span>
                    <span className="font-medium">{alert.resolved_by_email || 'Desconhecido'}</span>
                  </div>

                  {alert.resolved_at && (
                    <div>
                      <span className="text-muted-foreground">Em:</span>{' '}
                      {format(new Date(alert.resolved_at), "dd/MM/yyyy 'às' HH:mm", {
                        locale: ptBR,
                      })}
                    </div>
                  )}

                  {alert.resolved_notes && (
                    <div>
                      <Label className="text-muted-foreground">Notas:</Label>
                      <p className="mt-1 text-sm whitespace-pre-wrap">{alert.resolved_notes}</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Action Notes (for acknowledge/resolve) */}
          {!alert.resolved && (
            <>
              <Separator />
              <div className="space-y-3">
                <Label htmlFor="notes">
                  {alert.acknowledged ? 'Notas de Resolução' : 'Notas de Reconhecimento'}
                </Label>
                <Textarea
                  id="notes"
                  placeholder={
                    alert.acknowledged
                      ? 'Descreva como o problema foi resolvido...'
                      : 'Adicione notas sobre a investigação...'
                  }
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                />
              </div>
            </>
          )}
        </div>

        {/* Footer Actions */}
        {!alert.resolved && (
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Fechar
            </Button>

            {!alert.acknowledged && (
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

            <Button
              onClick={handleResolve}
              disabled={isResolving}
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
                  Resolver
                </>
              )}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};
