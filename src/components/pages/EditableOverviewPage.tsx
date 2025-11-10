import React, { useMemo } from 'react';
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core';
import {
  SortableContext,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { useAppStore, useTimeRangeMs } from '../../store/app';
import { useOverviewStore } from '../../store/overview';
import { simEngine } from '../../lib/simulation';
import { DraggableWidget } from '../dashboard/DraggableWidget';
import { OverviewWidgetPalette } from '../dashboard/OverviewWidgetPalette';
import { Button } from '../ui/button';
import { Switch } from '../ui/switch';
import { Edit3, RotateCcw } from 'lucide-react';
import { WidgetType } from '../../types/dashboard';

export const EditableOverviewPage: React.FC = () => {
  const { assets, sensors, alerts } = useAppStore();
  const { widgets, editMode, addWidget, reorderWidgets, setEditMode, resetToDefault } = useOverviewStore();
  const timeRange = useTimeRangeMs();

  const sensors_dnd = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Preparar dados do dashboard (igual OverviewPage original)
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

    // Temperature data
    const temperatureData = (() => {
      try {
        const supplyData = simEngine.getTelemetryData(`ahu-001-temp_supply`, timeRange) || [];
        const returnData = simEngine.getTelemetryData(`ahu-001-temp_return`, timeRange) || [];
        const setpointData = simEngine.getTelemetryData(`ahu-001-temp_setpoint`, timeRange) || [];
        return { supply: supplyData, return: returnData, setpoint: setpointData };
      } catch (error) {
        return { supply: [], return: [], setpoint: [] };
      }
    })();

    // Energy data
    const energyData = (() => {
      try {
        return simEngine.getTelemetryData('ahu-001-power_kw', {
          start: new Date(new Date().setHours(0, 0, 0, 0)),
          end: new Date()
        }) || [];
      } catch (error) {
        return [];
      }
    })();

    // Filter health data
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
        return { healthScore: 85, dpFilter: 150, daysUntilChange: 30 };
      }
    })();

    // Alert heatmap
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
          data.push({ day: date.getDay(), hour, count, date });
        }
      }
      return data;
    })();

    return {
      kpis,
      assets,
      sensors,
      alerts,
      temperatureData,
      energyData,
      filterData,
      alertHeatmapData,
      topAlerts: alerts
        .filter(a => !a.resolved)
        .sort((a, b) => {
          const severityOrder = { 'Critical': 4, 'High': 3, 'Medium': 2, 'Low': 1 };
          return severityOrder[b.severity] - severityOrder[a.severity];
        })
        .slice(0, 5)
    };
  }, [assets, sensors, alerts, timeRange]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const oldIndex = widgets.findIndex((w) => w.id === active.id);
      const newIndex = widgets.findIndex((w) => w.id === over.id);
      
      const newWidgets = [...widgets];
      const [movedWidget] = newWidgets.splice(oldIndex, 1);
      newWidgets.splice(newIndex, 0, movedWidget);
      
      reorderWidgets(newWidgets);
    }
  };

  const handleAddWidget = (widgetType: WidgetType) => {
    const position = { x: 0, y: 0 };
    addWidget(widgetType, position);
  };

  const handleResetToDefault = () => {
    if (confirm('Tem certeza que deseja restaurar os widgets padrão? Esta ação não pode ser desfeita.')) {
      resetToDefault();
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Visão Geral</h1>
          <p className="text-muted-foreground">
            Monitoramento em tempo real dos sistemas HVAC críticos
          </p>
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

      {/* Edit Mode Actions */}
      {editMode && (
        <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-blue-800">
              <Edit3 className="w-5 h-5" />
              <span className="font-medium">Modo de Edição Ativo</span>
            </div>
            <span className="text-blue-700 text-sm">
              Arraste widgets para reorganizar, clique no X para remover ou no ⚙️ para configurar
            </span>
          </div>
          <div className="flex items-center gap-2">
            <OverviewWidgetPalette onAddWidget={handleAddWidget} />
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetToDefault}
              className="gap-2 border-blue-300 text-blue-700 hover:bg-blue-100"
            >
              <RotateCcw className="w-4 h-4" />
              Restaurar Padrão
            </Button>
          </div>
        </div>
      )}

      {/* Dashboard Grid */}
      <DndContext
        sensors={sensors_dnd}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={widgets.map(w => w.id)} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-1 lg:grid-cols-6 gap-6 auto-rows-min">
            {widgets.map(widget => (
              <DraggableWidget
                key={widget.id}
                widget={widget}
                layoutId="overview"
                data={dashboardData}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* Empty State */}
      {widgets.length === 0 && (
        <div className="text-center py-16">
          <div className="bg-card rounded-xl p-12 border shadow-sm max-w-md mx-auto">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Edit3 className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Dashboard Vazio</h3>
            <p className="text-muted-foreground mb-6">
              Você removeu todos os widgets. {editMode ? 'Use o botão "Adicionar Widget" para começar.' : 'Ative o modo de edição para adicionar widgets.'}
            </p>
            {editMode ? (
              <div className="flex flex-col gap-2">
                <OverviewWidgetPalette onAddWidget={handleAddWidget} />
                <Button
                  variant="outline"
                  onClick={handleResetToDefault}
                  className="gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  Ou restaure os widgets padrão
                </Button>
              </div>
            ) : (
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
