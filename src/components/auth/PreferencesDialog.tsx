import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/auth';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Settings, 
  Bell, 
  Volume2,
  Mail,
  Smartphone,
  Globe,
  Clock,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Idiomas disponíveis
const LANGUAGES = [
  { value: 'pt-br', label: 'Português (Brasil)', flag: '🇧🇷' },
  { value: 'en', label: 'English (US)', flag: '🇺🇸' },
  { value: 'es', label: 'Español', flag: '🇪🇸' },
];

// Timezones do Brasil e principais
const TIMEZONES = [
  { value: 'America/Sao_Paulo', label: 'Brasília (GMT-3)', region: 'Brasil' },
  { value: 'America/Manaus', label: 'Manaus (GMT-4)', region: 'Brasil' },
  { value: 'America/Fortaleza', label: 'Fortaleza (GMT-3)', region: 'Brasil' },
  { value: 'America/Recife', label: 'Recife (GMT-3)', region: 'Brasil' },
  { value: 'America/Noronha', label: 'Fernando de Noronha (GMT-2)', region: 'Brasil' },
  { value: 'America/New_York', label: 'New York (GMT-5)', region: 'EUA' },
  { value: 'America/Los_Angeles', label: 'Los Angeles (GMT-8)', region: 'EUA' },
  { value: 'Europe/London', label: 'London (GMT+0)', region: 'Europa' },
  { value: 'Europe/Paris', label: 'Paris (GMT+1)', region: 'Europa' },
  { value: 'Asia/Tokyo', label: 'Tokyo (GMT+9)', region: 'Ásia' },
];

interface PreferencesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const PreferencesDialog: React.FC<PreferencesDialogProps> = ({ open, onOpenChange }) => {
  const user = useAuthStore(state => state.user);
  const updateUserProfile = useAuthStore(state => state.updateUserProfile);

  // Preferências de notificações (locais - não salvas no backend ainda)
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

  // Preferências de regionalização (salvas no backend)
  const [regionalization, setRegionalization] = useState({
    language: 'pt-br',
    timezone: 'America/Sao_Paulo',
    time_format: '24h' as '12h' | '24h',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sincronizar com dados do usuário quando o dialog abrir
  useEffect(() => {
    console.log('🔄 useEffect: Dialog abriu ou user mudou');
    console.log('📊 useEffect: open =', open);
    console.log('👤 useEffect: user =', user);
    
    if (user && open) {
      console.log('🔄 useEffect: Sincronizando regionalization com user');
      console.log('🌍 useEffect: user.language =', user.language);
      console.log('⏰ useEffect: user.timezone =', user.timezone);
      
      setRegionalization({
        language: user.language || 'pt-br',
        timezone: user.timezone || 'America/Sao_Paulo',
        time_format: user.time_format || '24h',
      });
      
      console.log('✅ useEffect: Regionalization setado para:', {
        language: user.language || 'pt-br',
        timezone: user.timezone || 'America/Sao_Paulo',
        time_format: user.time_format || '24h',
      });
    }
  }, [user, open]);

  const handleSave = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      console.log('🔄 Salvando preferências:', regionalization); // Debug
      
      // Salvar preferências de regionalização no backend
      await updateUserProfile({
        language: regionalization.language,
        timezone: regionalization.timezone,
        time_format: regionalization.time_format,
      });

      console.log('✅ Preferências salvas com sucesso!'); // Debug

      // TODO: Salvar preferências de notificações quando backend suportar
      console.log('Preferências de notificações (local):', preferences);
      
      toast.success('Preferências salvas!', {
        description: 'Suas preferências foram atualizadas com sucesso.',
      });
      
      onOpenChange(false);
    } catch (error: any) {
      console.error('❌ Erro ao salvar preferências:', error);
      toast.error('Erro ao salvar preferências', {
        description: error.message || 'Tente novamente mais tarde.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    // Resetar notificações para valores padrão
    setPreferences({
      emailNotifications: true,
      pushNotifications: true,
      soundEnabled: true,
      criticalAlerts: true,
      highAlerts: true,
      mediumAlerts: true,
      lowAlerts: false,
    });

    // Resetar regionalização para valores do usuário
    if (user) {
      setRegionalization({
        language: user.language || 'pt-br',
        timezone: user.timezone || 'America/Sao_Paulo',
        time_format: user.time_format || '24h',
      });
    }
    
    toast.success('Preferências restauradas', {
      description: 'As preferências foram restauradas aos valores originais.',
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

        <Tabs defaultValue="notifications" className="w-full mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="notifications">Notificações</TabsTrigger>
            <TabsTrigger value="regional">Regionalização</TabsTrigger>
          </TabsList>

          {/* TAB: Notificações */}
          <TabsContent value="notifications" className="space-y-4 mt-4">
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
          </TabsContent>

          {/* TAB: Regionalização */}
          <TabsContent value="regional" className="space-y-4 mt-4">
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-6">
                {/* Idioma */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-muted-foreground" />
                    <Label className="text-base font-semibold">Idioma da Interface</Label>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Escolha o idioma que será usado na plataforma
                  </p>

                  <Select
                    value={regionalization.language}
                    onValueChange={(value) =>
                      setRegionalization({ ...regionalization, language: value })
                    }
                  >
                    <SelectTrigger className="w-full h-12">
                      <SelectValue placeholder="Selecione um idioma" />
                    </SelectTrigger>
                    <SelectContent>
                      {LANGUAGES.map((lang) => (
                        <SelectItem key={lang.value} value={lang.value}>
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{lang.flag}</span>
                            <span>{lang.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                {/* Fuso Horário */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <Label className="text-base font-semibold">Fuso Horário</Label>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Defina seu fuso horário para exibir datas e horários corretamente
                  </p>

                  <Select
                    value={regionalization.timezone}
                    onValueChange={(value) =>
                      setRegionalization({ ...regionalization, timezone: value })
                    }
                  >
                    <SelectTrigger className="w-full h-12">
                      <SelectValue placeholder="Selecione um fuso horário" />
                    </SelectTrigger>
                    <SelectContent>
                      {TIMEZONES.map((tz) => (
                        <SelectItem key={tz.value} value={tz.value}>
                          <div className="flex flex-col">
                            <span>{tz.label}</span>
                            <span className="text-xs text-muted-foreground">{tz.region}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Informação sobre timezone atual */}
                  <div className="p-3 rounded-lg bg-muted/50 border">
                    <p className="text-sm">
                      <span className="font-medium">Horário local atual:</span>{' '}
                      {new Date().toLocaleString('pt-BR', {
                        timeZone: regionalization.timezone,
                        dateStyle: 'short',
                        timeStyle: 'medium',
                      })}
                    </p>
                  </div>
                </div>

                <Separator />

                {/* Formato de Hora */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <Label className="text-base font-semibold">Formato de Hora</Label>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Escolha entre formato 12 horas (AM/PM) ou 24 horas
                  </p>

                  <Select
                    value={regionalization.time_format}
                    onValueChange={(value: '12h' | '24h') =>
                      setRegionalization({ ...regionalization, time_format: value })
                    }
                  >
                    <SelectTrigger className="w-full h-12">
                      <SelectValue placeholder="Selecione o formato" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="24h">
                        <div className="flex flex-col">
                          <span>24 horas</span>
                          <span className="text-xs text-muted-foreground">
                            Exemplo: 23:30:45
                          </span>
                        </div>
                      </SelectItem>
                      <SelectItem value="12h">
                        <div className="flex flex-col">
                          <span>12 horas (AM/PM)</span>
                          <span className="text-xs text-muted-foreground">
                            Exemplo: 11:30:45 PM
                          </span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Preview do formato */}
                  <div className="p-3 rounded-lg bg-muted/50 border">
                    <p className="text-sm">
                      <span className="font-medium">Pré-visualização:</span>{' '}
                      {new Date().toLocaleTimeString(
                        regionalization.language || 'pt-BR',
                        {
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                          hour12: regionalization.time_format === '12h',
                          timeZone: regionalization.timezone,
                        }
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>

        <Separator className="mt-4" />

        {/* Footer com Ações */}
        <div className="flex items-center justify-between gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            className="text-muted-foreground"
            disabled={isSubmitting}
          >
            Restaurar Padrões
          </Button>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleSave} 
              className="bg-primary hover:bg-primary/90"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                'Salvar Preferências'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
