import React, { useState } from 'react';
import { DashboardWidget } from '../../types/dashboard';
import { useDashboardStore } from '../../store/dashboard';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Settings, Save, X } from 'lucide-react';

interface WidgetConfigProps {
  widget: DashboardWidget;
  layoutId: string;
  open: boolean;
  onClose: () => void;
}

export const WidgetConfig: React.FC<WidgetConfigProps> = ({ widget, layoutId, open, onClose }) => {
  const [title, setTitle] = useState(widget.title);
  const [size, setSize] = useState(widget.size);
  
  const updateWidget = useDashboardStore(state => state.updateWidget);

  const handleSave = () => {
    updateWidget(layoutId, widget.id, {
      title,
      size: size as DashboardWidget['size']
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Configurar Widget
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="widget-title">Título</Label>
            <Input
              id="widget-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nome do widget"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="widget-size">Tamanho</Label>
            <Select value={size} onValueChange={setSize}>
              <SelectTrigger id="widget-size">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="small">Pequeno (1 coluna)</SelectItem>
                <SelectItem value="medium">Médio (3 colunas)</SelectItem>
                <SelectItem value="large">Grande (6 colunas)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose}>
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button onClick={handleSave}>
              <Save className="w-4 h-4 mr-2" />
              Salvar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};