import { DashboardWidget } from '../../types/dashboard';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface OverviewWidgetConfigProps {
  widget: DashboardWidget;
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: Partial<DashboardWidget>) => void;
}

export const OverviewWidgetConfig = ({
  widget,
  isOpen,
  onClose,
  onSave
}: OverviewWidgetConfigProps) => {
  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const formData = new FormData(e.currentTarget);
    const size = formData.get('size') as DashboardWidget['size'];
    const warningLimit = formData.get('warningLimit');
    const criticalLimit = formData.get('criticalLimit');
    
    const updates: Partial<DashboardWidget> = {
      size,
      config: {
        ...widget.config,
        warningLimit: warningLimit ? parseFloat(warningLimit as string) : undefined,
        criticalLimit: criticalLimit ? parseFloat(criticalLimit as string) : undefined
      }
    };
    
    onSave(updates);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Configurações do Widget</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSave} className="space-y-6">
          {/* Título do Widget */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Widget</Label>
            <div className="text-sm text-muted-foreground bg-muted rounded-md px-3 py-2">
              {widget.title}
            </div>
          </div>

          {/* Limites e Alertas */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-1 h-5 bg-yellow-500 rounded-full" />
              <Label className="text-sm font-medium">Limites e Alertas</Label>
            </div>
            
            <p className="text-xs text-muted-foreground">
              Configure os valores de limite para alertas visuais no widget
            </p>

            {/* Limite de Aviso */}
            <div className="space-y-2">
              <Label htmlFor="warningLimit" className="text-sm">
                Limite de Aviso
              </Label>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                <Input
                  id="warningLimit"
                  name="warningLimit"
                  type="number"
                  step="0.1"
                  placeholder="Ex: 80"
                  defaultValue={widget.config?.warningLimit}
                  className="flex-1"
                />
                <span className="text-sm text-muted-foreground min-w-[40px]">
                  {widget.config?.unit || '%'}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Valor que indica condição de atenção (amarelo)
              </p>
            </div>

            {/* Limite Crítico */}
            <div className="space-y-2">
              <Label htmlFor="criticalLimit" className="text-sm">
                Limite Crítico
              </Label>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full" />
                <Input
                  id="criticalLimit"
                  name="criticalLimit"
                  type="number"
                  step="0.1"
                  placeholder="Ex: 95"
                  defaultValue={widget.config?.criticalLimit}
                  className="flex-1"
                />
                <span className="text-sm text-muted-foreground min-w-[40px]">
                  {widget.config?.unit || '%'}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Valor que indica condição crítica (vermelho)
              </p>
            </div>
          </div>

          {/* Ações */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              Cancelar
            </Button>
            <Button type="submit">
              Salvar Configurações
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
