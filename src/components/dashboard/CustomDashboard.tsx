import React, { useState, useMemo } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core';
import {
  SortableContext,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { useDashboardStore } from '../../store/dashboard';
import { useAppStore, useTimeRangeMs } from '../../store/app';
import { simEngine } from '../../lib/simulation';
import { DraggableWidget } from './DraggableWidget';
import { WidgetPalette } from './WidgetPalette';
import { LayoutManager } from './LayoutManager';
import { Button } from '../ui/button';
import { Switch } from '../ui/switch';
import { 
  Edit3, 
  Save, 
  RotateCcw,
  Layout
} from 'lucide-react';

export const CustomDashboard: React.FC = () => {
  const { layouts, currentLayoutId, editMode, setEditMode, setCurrentLayout, createLayout, deleteLayout, updateLayout } = useDashboardStore();
  const { assets, sensors, alerts } = useAppStore();
  const timeRange = useTimeRangeMs();
  const [showNewLayoutDialog, setShowNewLayoutDialog] = useState(false);
  const [newLayoutName, setNewLayoutName] = useState('');
  const [editingLayoutId, setEditingLayoutId] = useState<string | null>(null);
  const [editingLayoutName, setEditingLayoutName] = useState('');
  
  const currentLayout = layouts.find(l => l.id === currentLayoutId);
  
  const sensors_dnd = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Prepare dashboard data (same as OverviewPage)
  const dashboardData = useMemo(() => {
    const onlineSensors = sensors.filter(s => s.online).length;
    const totalSensors = sensors.length;
    const uptime = ((onlineSensors / totalSensors) * 100).toFixed(1);
    const activeAlerts = alerts.filter(a => !a.resolved && !a.acknowledged).length;
    const totalConsumption = assets.reduce((sum, asset) => sum + asset.powerConsumption, 0);
    const avgHealth = assets.reduce((sum, asset) => sum + asset.healthScore, 0) / assets.length;

    const kpis = {
      uptime: parseFloat(uptime),
      activeAlerts,
      consumption: totalConsumption.toFixed(0),
      avgHealth: avgHealth.toFixed(1),
      mtbf: '168',
      mttr: '2.5'
    };

    // Get temperature data for the main chart
    const temperatureData = (() => {
      try {
        const ahuSensor = sensors.find(s => s.assetId === 'ahu-001');
        if (!ahuSensor) return { supply: [], return: [], setpoint: [] };

        const supplyData = simEngine.getTelemetryData(`ahu-001-temp_supply`, timeRange) || [];
        const returnData = simEngine.getTelemetryData(`ahu-001-temp_return`, timeRange) || [];
        const setpointData = simEngine.getTelemetryData(`ahu-001-temp_setpoint`, timeRange) || [];

        return {
          supply: supplyData,
          return: returnData,
          setpoint: setpointData
        };
      } catch (error) {
        console.error('Error loading temperature data:', error);
        return { supply: [], return: [], setpoint: [] };
      }
    })();

    // Get energy consumption data
    const energyData = (() => {
      try {
        return simEngine.getTelemetryData('ahu-001-power_kw', {
          start: new Date(new Date().setHours(0, 0, 0, 0)),
          end: new Date()
        }) || [];
      } catch (error) {
        console.error('Error loading energy data:', error);
        return [];
      }
    })();

    // Get filter health data
    const filterData = (() => {
      try {
        const dpFilterData = simEngine.getTelemetryData('ahu-001-dp_filter', timeRange) || [];
        const currentDp = dpFilterData.length > 0 ? dpFilterData[dpFilterData.length - 1].value : 0;
        const healthScore = Math.max(0, Math.min(100, 100 - (currentDp / 400) * 100));
        const daysUntilChange = Math.max(1, Math.floor((400 - currentDp) / 5));

        return {
          healthScore: isNaN(healthScore) ? 85 : healthScore,
          dpFilter: isNaN(currentDp) ? 150 : currentDp,
          daysUntilChange: isNaN(daysUntilChange) ? 30 : daysUntilChange
        };
      } catch (error) {
        console.error('Error loading filter data:', error);
        return {
          healthScore: 85,
          dpFilter: 150,
          daysUntilChange: 30
        };
      }
    })();

    // Generate heatmap data for alerts
    const alertHeatmapData = (() => {
      const data: Array<{ day: number; hour: number; count: number; date: Date }> = [];
      const now = new Date();
      
      for (let day = 6; day >= 0; day--) {
        for (let hour = 0; hour < 24; hour++) {
          const date = new Date(now);
          date.setDate(date.getDate() - day);
          date.setHours(hour, 0, 0, 0);
          
          let count = 0;
          if (hour >= 8 && hour <= 18) {
            count = Math.floor(Math.random() * 3);
          } else {
            count = Math.floor(Math.random() * 2);
          }
          
          data.push({
            day: date.getDay(),
            hour,
            count,
            date
          });
        }
      }
      
      return data;
    })();

    // Top active alerts for table
    const topAlerts = alerts
      .filter(a => !a.resolved)
      .sort((a, b) => {
        const severityOrder = { 'Critical': 4, 'High': 3, 'Medium': 2, 'Low': 1 };
        return severityOrder[b.severity] - severityOrder[a.severity];
      })
      .slice(0, 5);

    return {
      kpis,
      temperatureData,
      energyData,
      filterData,
      alertHeatmapData,
      topAlerts
    };
  }, [assets, sensors, alerts, timeRange]);

  function handleDragStart(event: DragStartEvent) {
    // Could add preview or other drag start logic here
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      // Handle reordering logic here if needed
      // For now, we'll keep it simple
    }
  }

  if (!currentLayout) {
    return (
      <div className="p-6 text-center">
        <div className="bg-card rounded-xl p-8 border shadow-sm">
          <Layout className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-xl font-semibold mb-2">Nenhum layout encontrado</h2>
          <p className="text-muted-foreground mb-4">
            Crie um novo layout para começar a personalizar seu dashboard
          </p>
          <LayoutManager />
        </div>
      </div>
    );
  }

  const handleCreateLayout = () => {
    if (newLayoutName.trim()) {
      createLayout(newLayoutName.trim());
      setNewLayoutName('');
      setShowNewLayoutDialog(false);
    }
  };

  const handleStartEditName = (layoutId: string, currentName: string) => {
    setEditingLayoutId(layoutId);
    setEditingLayoutName(currentName);
  };

  const handleSaveLayoutName = (layoutId: string) => {
    if (editingLayoutName.trim() && editingLayoutName !== layouts.find(l => l.id === layoutId)?.name) {
      updateLayout(layoutId, { name: editingLayoutName.trim() });
    }
    setEditingLayoutId(null);
    setEditingLayoutName('');
  };

  const handleCancelEditName = () => {
    setEditingLayoutId(null);
    setEditingLayoutName('');
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboards</h1>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Time Range Selector */}
          <div className="flex items-center space-x-2">
            <label className="text-sm text-muted-foreground">Período:</label>
            <select 
              className="px-3 py-1 border border-input rounded-md text-sm bg-background"
              value={useAppStore(state => state.selectedTimeRange)}
              onChange={(e) => useAppStore.getState().setTimeRange(e.target.value as any)}
            >
              <option value="1h">1 Hora</option>
              <option value="6h">6 Horas</option>
              <option value="24h">24 Horas</option>
              <option value="7d">7 Dias</option>
              <option value="30d">30 Dias</option>
            </select>
          </div>
          
          {/* Edit Mode Toggle */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-muted-foreground">Editar:</label>
            <Switch checked={editMode} onCheckedChange={setEditMode} />
          </div>
        </div>
      </div>

      {/* Horizontal Layout Navigation */}
      <div className="border-b border-border">
        <div className="flex items-center gap-1 overflow-x-auto">
          {layouts.map((layout) => (
            <button
              key={layout.id}
              onClick={() => setCurrentLayout(layout.id)}
              className={`px-4 py-2 text-sm font-light whitespace-nowrap transition-colors border-b-2 ${
                layout.id === currentLayoutId
                  ? 'border-primary text-primary font-normal'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
              }`}
            >
              {layout.name}
            </button>
          ))}
          
          {/* Add New Layout Button */}
          <button
            onClick={() => setShowNewLayoutDialog(true)}
            className="px-4 py-2 text-sm font-light text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap flex items-center gap-1"
          >
            <span className="text-lg">+</span>
            <span>Nova Tela</span>
          </button>
        </div>
      </div>

      {/* New Layout Dialog */}
      {showNewLayoutDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowNewLayoutDialog(false)}>
          <div className="bg-background rounded-lg p-6 max-w-md w-full mx-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-semibold mb-4">Criar Nova Tela</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Nome da Tela</label>
                <input
                  type="text"
                  value={newLayoutName}
                  onChange={(e) => setNewLayoutName(e.target.value)}
                  placeholder="Ex: Produção, Qualidade, Manutenção..."
                  className="w-full px-3 py-2 border border-input rounded-md bg-background"
                  onKeyDown={(e) => e.key === 'Enter' && handleCreateLayout()}
                  autoFocus
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowNewLayoutDialog(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCreateLayout} disabled={!newLayoutName.trim()}>
                  Criar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rename Layout Modal */}
      {editingLayoutId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={handleCancelEditName}>
          <div className="bg-background rounded-lg p-6 max-w-md w-full mx-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-semibold mb-4">Renomear Tela</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Nome da Tela</label>
                <input
                  type="text"
                  value={editingLayoutName}
                  onChange={(e) => setEditingLayoutName(e.target.value)}
                  placeholder="Digite o novo nome..."
                  className="w-full px-3 py-2 border border-input rounded-md bg-background"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveLayoutName(editingLayoutId);
                    if (e.key === 'Escape') handleCancelEditName();
                  }}
                  autoFocus
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={handleCancelEditName}>
                  Cancelar
                </Button>
                <Button onClick={() => handleSaveLayoutName(editingLayoutId)} disabled={!editingLayoutName.trim()}>
                  Salvar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Mode Actions */}
      {editMode && (
        <div className="flex items-center justify-between bg-accent-2 border border-accent-6 rounded-lg p-4 shadow-sm dark:bg-accent-3/30 dark:border-accent-6/50">
          <div className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-accent-3 text-accent-11 dark:bg-accent-4/50">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <div className="font-medium text-foreground">Modo de Edição Ativo</div>
              <p className="text-sm text-muted-foreground">
                Arraste widgets para reorganizar ou clique no X para remover
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleStartEditName(currentLayoutId, currentLayout?.name || '')}
              className="gap-2"
            >
              <Edit3 className="w-4 h-4" />
              Renomear Tela
            </Button>
            <WidgetPalette layoutId={currentLayoutId} />
            {!currentLayout?.isDefault && layouts.length > 1 && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  if (confirm(`Tem certeza que deseja excluir a tela "${currentLayout?.name}"?`)) {
                    deleteLayout(currentLayoutId);
                  }
                }}
                className="gap-2"
              >
                Excluir Tela
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Dashboard Grid */}
      <DndContext
        sensors={sensors_dnd}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={currentLayout.widgets.map(w => w.id)} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-1 lg:grid-cols-6 gap-6 auto-rows-min">
            {currentLayout.widgets.map(widget => (
              <DraggableWidget
                key={widget.id}
                widget={widget}
                layoutId={currentLayoutId}
                data={dashboardData}
              />
            ))}
          </div>
        </SortableContext>
        
        <DragOverlay>
          {/* Could add drag overlay content here */}
        </DragOverlay>
      </DndContext>

      {/* Empty State */}
      {currentLayout.widgets.length === 0 && (
        <div className="text-center py-12">
          <div className="bg-card rounded-xl p-8 border shadow-sm">
            <Layout className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Dashboard Vazio</h3>
            <p className="text-muted-foreground mb-6">
              Este layout não possui widgets. {editMode ? 'Use o botão "Adicionar Widget" para começar.' : 'Ative o modo de edição para adicionar widgets.'}
            </p>
            {!editMode && (
              <Button onClick={() => setEditMode(true)} className="gap-2">
                <Edit3 className="w-4 h-4" />
                Ativar Modo de Edição
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};