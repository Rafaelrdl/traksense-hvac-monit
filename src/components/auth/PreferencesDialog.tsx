import React, { useState } from 'react';
import { useAuthStore } from '../../store/auth';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { 
  Settings, 
  Bell, 
  Volume2,
  Mail,
  Smartphone,
} from 'lucide-react';
import { toast } from 'sonner';
import { ScrollArea } from '@/components/ui/scroll-area';

interface PreferencesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const PreferencesDialog: React.FC<PreferencesDialogProps> = ({ open, onOpenChange }) => {
  const user = useAuthStore(state => state.user);

  // Preferências de notificações
  const [preferences, setPreferences] = useState({
    // Notificações
    emailNotifications: true,
    pushNotifications: true,
    soundEnabled: true,
    
    // Alertas
    criticalAlerts: true,
    highAlerts: true,
    mediumAlerts: true,
    lowAlerts: false,
  });

  const handleSave = () => {
    // TODO: Salvar preferências na API
    console.log('Preferências salvas:', preferences);
    
    toast.success('Preferências salvas!', {
      description: 'Suas preferências foram atualizadas com sucesso.',
    });
    
    onOpenChange(false);
  };

  const handleReset = () => {
    // Resetar para valores padrão
    setPreferences({
      emailNotifications: true,
      pushNotifications: true,
      soundEnabled: true,
      criticalAlerts: true,
      highAlerts: true,
      mediumAlerts: true,
      lowAlerts: false,
    });
    
    toast.success('Preferências restauradas', {
      description: 'As preferências padrão foram restauradas.',
    });
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Settings className="w-5 h-5 text-primary" />
            Preferências
          </DialogTitle>
          <DialogDescription>
            Personalize sua experiência na plataforma TrakSense.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-6">
                {/* Canais de Notificação */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-muted-foreground" />
                    <Label className="text-base font-semibold">Canais de Notificação</Label>
                  </div>

                  <div className="space-y-3">
                    {/* Email */}
                    <div className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <Mail className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Email</p>
                          <p className="text-xs text-muted-foreground">
                            Receber notificações por email
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={preferences.emailNotifications}
                        onCheckedChange={(checked) =>
                          setPreferences({ ...preferences, emailNotifications: checked })
                        }
                      />
                    </div>

                    {/* Push */}
                    <div className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <Smartphone className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Push</p>
                          <p className="text-xs text-muted-foreground">
                            Notificações no navegador e aplicativo
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={preferences.pushNotifications}
                        onCheckedChange={(checked) =>
                          setPreferences({ ...preferences, pushNotifications: checked })
                        }
                      />
                    </div>

                    {/* Som */}
                    <div className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <Volume2 className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Som</p>
                          <p className="text-xs text-muted-foreground">
                            Reproduzir som ao receber alertas
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={preferences.soundEnabled}
                        onCheckedChange={(checked) =>
                          setPreferences({ ...preferences, soundEnabled: checked })
                        }
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Alertas por Severidade */}
                <div className="space-y-4">
                  <Label className="text-base font-semibold">Alertas por Severidade</Label>
                  <p className="text-xs text-muted-foreground">
                    Escolha quais níveis de alerta você deseja receber
                  </p>

                  <div className="space-y-3">
                    {/* Crítico */}
                    <div className="flex items-center justify-between p-3 rounded-lg border border-red-200 bg-red-50/50">
                      <div>
                        <p className="font-medium text-red-900">Crítico</p>
                        <p className="text-xs text-red-700">
                          Requer ação imediata
                        </p>
                      </div>
                      <Switch
                        checked={preferences.criticalAlerts}
                        onCheckedChange={(checked) =>
                          setPreferences({ ...preferences, criticalAlerts: checked })
                        }
                      />
                    </div>

                    {/* Alto */}
                    <div className="flex items-center justify-between p-3 rounded-lg border border-orange-200 bg-orange-50/50">
                      <div>
                        <p className="font-medium text-orange-900">Alto</p>
                        <p className="text-xs text-orange-700">
                          Necessita atenção prioritária
                        </p>
                      </div>
                      <Switch
                        checked={preferences.highAlerts}
                        onCheckedChange={(checked) =>
                          setPreferences({ ...preferences, highAlerts: checked })
                        }
                      />
                    </div>

                    {/* Médio */}
                    <div className="flex items-center justify-between p-3 rounded-lg border border-yellow-200 bg-yellow-50/50">
                      <div>
                        <p className="font-medium text-yellow-900">Médio</p>
                        <p className="text-xs text-yellow-700">
                          Atenção moderada necessária
                        </p>
                      </div>
                      <Switch
                        checked={preferences.mediumAlerts}
                        onCheckedChange={(checked) =>
                          setPreferences({ ...preferences, mediumAlerts: checked })
                        }
                      />
                    </div>

                    {/* Baixo */}
                    <div className="flex items-center justify-between p-3 rounded-lg border">
                      <div>
                        <p className="font-medium">Baixo</p>
                        <p className="text-xs text-muted-foreground">
                          Informativo
                        </p>
                      </div>
                      <Switch
                        checked={preferences.lowAlerts}
                        onCheckedChange={(checked) =>
                          setPreferences({ ...preferences, lowAlerts: checked })
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
            </ScrollArea>
        </div>

        <Separator />

        {/* Footer com Ações */}
        <div className="flex items-center justify-between gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            className="text-muted-foreground"
          >
            Restaurar Padrões
          </Button>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button onClick={handleSave} className="bg-primary hover:bg-primary/90">
              Salvar Preferências
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
