import React, { useState } from 'react';
import { useDashboardStore } from '../../store/dashboard';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { 
  Settings, 
  Plus, 
  Edit3, 
  Trash2, 
  Copy,
  Save
} from 'lucide-react';

export const LayoutManager: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [newLayoutName, setNewLayoutName] = useState('');
  const [copyFromLayoutId, setCopyFromLayoutId] = useState<string>('');
  
  const { 
    layouts, 
    currentLayoutId, 
    setCurrentLayout, 
    createLayout, 
    deleteLayout,
    updateLayout
  } = useDashboardStore();
  
  const currentLayout = layouts.find(l => l.id === currentLayoutId);

  const handleCreateLayout = () => {
    if (newLayoutName.trim()) {
      createLayout(newLayoutName.trim(), copyFromLayoutId || undefined);
      setNewLayoutName('');
      setCopyFromLayoutId('');
      setOpen(false);
    }
  };

  const handleDeleteLayout = (layoutId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este layout?')) {
      deleteLayout(layoutId);
    }
  };

  const handleRenameLayout = (layoutId: string) => {
    const layout = layouts.find(l => l.id === layoutId);
    if (!layout) return;
    
    const newName = window.prompt('Novo nome do layout:', layout.name);
    if (newName && newName.trim() && newName.trim() !== layout.name) {
      updateLayout(layoutId, { name: newName.trim() });
    }
  };

  return (
    <div className="flex items-center gap-4">
      {/* Layout Selector */}
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-muted-foreground">Layout:</label>
        <Select value={currentLayoutId} onValueChange={setCurrentLayout}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {layouts.map(layout => (
              <SelectItem key={layout.id} value={layout.id}>
                {layout.name} {layout.isDefault && '(Padrão)'}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Layout Management Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Settings className="w-4 h-4" />
            Gerenciar
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Gerenciar Layouts</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Create New Layout */}
            <div className="space-y-3">
              <h3 className="font-medium">Criar Novo Layout</h3>
              <div className="space-y-3">
                <Input
                  placeholder="Nome do layout"
                  value={newLayoutName}
                  onChange={(e) => setNewLayoutName(e.target.value)}
                />
                <div className="space-y-2">
                  <label className="text-sm font-medium">Copiar de (opcional):</label>
                  <Select value={copyFromLayoutId} onValueChange={setCopyFromLayoutId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um layout para copiar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Layout em branco</SelectItem>
                      {layouts.map(layout => (
                        <SelectItem key={layout.id} value={layout.id}>
                          {layout.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  onClick={handleCreateLayout} 
                  disabled={!newLayoutName.trim()}
                  className="w-full gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Criar Layout
                </Button>
              </div>
            </div>

            {/* Existing Layouts */}
            <div className="space-y-3">
              <h3 className="font-medium">Layouts Existentes</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {layouts.map(layout => (
                  <div
                    key={layout.id}
                    className="flex items-center justify-between p-3 border border-border rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{layout.name}</span>
                        {layout.isDefault && (
                          <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">
                            Padrão
                          </span>
                        )}
                        {layout.id === currentLayoutId && (
                          <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">
                            Ativo
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {layout.widgets.length} widget{layout.widgets.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRenameLayout(layout.id)}
                        disabled={layout.isDefault}
                      >
                        <Edit3 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => createLayout(`${layout.name} (Cópia)`, layout.id)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteLayout(layout.id)}
                        disabled={layout.isDefault || layouts.length <= 1}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};