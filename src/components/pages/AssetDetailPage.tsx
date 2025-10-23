import React, { useState, useMemo, useEffect } from 'react';
import { useAppStore, useSelectedAsset, useTimeRangeMs } from '../../store/app';
import { useFeaturesStore } from '../../store/features';
import { simEngine } from '../../lib/simulation';
import { hasPerformanceTelemetry, reasonMissingTelemetry } from '../../lib/hasPerformanceTelemetry';
import { LineChartTemp } from '../charts/LineChartTemp';
import { ScatterPerformance } from '../charts/ScatterPerformance';
import { KPICard } from '../ui/KPICard';
import { JE02SensorDetail } from './JE02SensorDetail';
import { PerformanceEmpty } from '../assets/PerformanceEmpty';
import { TrakNorCTA } from '../assets/TrakNorCTA';
import { ContactSalesDialog } from '../common/ContactSalesDialog';
import { assetsService } from '../../services/assetsService';
import { telemetryService } from '../../services/telemetryService';
import type { ApiSensor } from '../../types/api';
import { 
  ArrowLeft, 
  ExternalLink, 
  Heart, 
  Clock, 
  Gauge, 
  Zap,
  Activity,
  AlertTriangle,
  Loader2 
} from 'lucide-react';

export const AssetDetailPage: React.FC = () => {
  const { setSelectedAsset, sensors, alerts, maintenanceTasks, maintenanceSchedules, maintenanceHistory } = useAppStore();
  const selectedAsset = useSelectedAsset();
  const timeRange = useTimeRangeMs();
  const hidePerformanceWhenNoSensors = useFeaturesStore(state => state.hidePerformanceWhenNoSensors);
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('je02');
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  
  // Estados para busca dinâmica de sensores
  const [apiSensors, setApiSensors] = useState<ApiSensor[]>([]);
  const [availableMetrics, setAvailableMetrics] = useState<Array<{id: string, label: string, unit: string}>>([]);
  const [isLoadingSensors, setIsLoadingSensors] = useState(false);
  const [telemetryChartData, setTelemetryChartData] = useState<any>(null);
  const [isLoadingTelemetry, setIsLoadingTelemetry] = useState(false);

  if (!selectedAsset) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Nenhum ativo selecionado</p>
          <button
            onClick={() => setSelectedAsset(null)}
            className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg"
          >
            Voltar para Lista
          </button>
        </div>
      </div>
    );
  }

  // Get asset sensors
  const assetSensors = sensors.filter(s => s.assetId === selectedAsset.id);
  const assetAlerts = alerts.filter(a => a.assetId === selectedAsset.id && !a.resolved);
  
  // Check if asset has performance telemetry
  const hasPerf = hasPerformanceTelemetry(selectedAsset, sensors);
  const missingSensors = hasPerf ? [] : reasonMissingTelemetry(selectedAsset, sensors);
  
  // Decide if Performance tab should be shown
  const showPerformanceTab = !hidePerformanceWhenNoSensors || hasPerf;

  // Get telemetry data for selected metrics
  const telemetryData = useMemo(() => {
    const data: { [key: string]: any[] } = {};
    selectedMetrics.forEach(metric => {
      const sensorId = `${selectedAsset.id}-${metric}`;
      data[metric] = simEngine.getTelemetryData(sensorId, timeRange);
    });
    return data;
  }, [selectedAsset.id, selectedMetrics, timeRange]);

  // Calculate asset KPIs
  const assetKPIs = useMemo(() => {
    const dpFilterSensor = assetSensors.find(s => s.type === 'dp_filter');
    const currentDp = dpFilterSensor?.lastReading?.value || 0;

    const powerSensor = assetSensors.find(s => s.type === 'power_kw');
    const currentPower = powerSensor?.lastReading?.value || 0;

    const vibrationSensor = assetSensors.find(s => s.type === 'vibration');
    const compressorState = Math.random() > 0.3 ? 'ON' : 'OFF'; // Mock

    return {
      health: selectedAsset.healthScore,
      operatingHours: selectedAsset.operatingHours,
      dpFilter: currentDp,
      compressorState,
      currentPower,
      vibration: vibrationSensor?.lastReading?.value || 0
    };
  }, [selectedAsset, assetSensors]);

  // Performance data for scatter plot
  const performanceData = useMemo(() => {
    const powerData = telemetryData.power_kw || [];
    if (powerData.length === 0) return [];

    const avgPower = powerData.reduce((sum, p) => sum + p.value, 0) / powerData.length;
    const estimatedLoad = avgPower * 0.8; // Mock thermal load calculation
    const eer = (estimatedLoad / avgPower) * 3.412; // Convert to EER

    return [{
      assetId: selectedAsset.id,
      assetTag: selectedAsset.tag,
      powerKw: avgPower,
      thermalLoad: estimatedLoad,
      eer
    }];
  }, [selectedAsset, telemetryData]);

  // Mapeamento de tipos de métricas para labels amigáveis
  const metricLabels: Record<string, { label: string; unit: string }> = {
    // Temperatura
    'temp_supply': { label: 'Temp. Insuflamento', unit: '°C' },
    'temp_return': { label: 'Temp. Retorno', unit: '°C' },
    'temp_setpoint': { label: 'Setpoint', unit: '°C' },
    'temperature': { label: 'Temperatura', unit: '°C' },
    
    // Umidade
    'humidity': { label: 'Umidade', unit: '%' },
    
    // Pressão
    'pressure': { label: 'Pressão', unit: 'Pa' },
    'dp_filter': { label: 'ΔP Filtro', unit: 'Pa' },
    'pressure_suction': { label: 'Pressão Sucção', unit: 'kPa' },
    'pressure_discharge': { label: 'Pressão Descarga', unit: 'kPa' },
    
    // Potência e Energia
    'power_kw': { label: 'Potência', unit: 'kW' },
    'current': { label: 'Corrente', unit: 'A' },
    'voltage': { label: 'Tensão', unit: 'V' },
    
    // Vibração e Mecânica
    'vibration': { label: 'Vibração', unit: 'mm/s' },
    
    // Vazão
    'airflow': { label: 'Vazão de Ar', unit: 'm³/h' },
    
    // Sinal e Conectividade
    'signal_strength': { label: 'Sinal RSSI', unit: 'dBm' },
    'maintenance': { label: 'RSSI', unit: 'dBW' },
  };

  // Buscar sensores do ativo via API
  useEffect(() => {
    if (!selectedAsset?.id) {
      setApiSensors([]);
      setAvailableMetrics([]);
      return;
    }

    const fetchAssetSensors = async () => {
      setIsLoadingSensors(true);
      try {
        console.log(`🔍 Buscando sensores para o ativo ${selectedAsset.tag} (ID: ${selectedAsset.id})`);
        const assetIdNum = typeof selectedAsset.id === 'string' ? parseInt(selectedAsset.id) : selectedAsset.id;
        const sensorsData = await assetsService.getSensors(assetIdNum);
        
        setApiSensors(sensorsData);
        
        // Extrair tipos de métricas únicos e criar opções para checkboxes
        const uniqueMetricTypes = [...new Set(sensorsData.map(s => s.metric_type))];
        const metrics = uniqueMetricTypes.map(metricType => {
          const meta = metricLabels[metricType] || { 
            label: metricType, 
            unit: sensorsData.find(s => s.metric_type === metricType)?.unit || '' 
          };
          return {
            id: metricType,
            label: meta.label,
            unit: meta.unit
          };
        });
        
        setAvailableMetrics(metrics);
        console.log(`✅ ${sensorsData.length} sensores carregados, ${metrics.length} tipos de métricas disponíveis`);
        
      } catch (error) {
        console.error('❌ Erro ao carregar sensores do ativo:', error);
        setApiSensors([]);
        setAvailableMetrics([]);
      } finally {
        setIsLoadingSensors(false);
      }
    };

    fetchAssetSensors();
  }, [selectedAsset?.id]);

  // Buscar dados de telemetria quando métricas são selecionadas
  useEffect(() => {
    if (!selectedAsset?.id || selectedMetrics.length === 0 || apiSensors.length === 0) {
      setTelemetryChartData(null);
      return;
    }

    const fetchTelemetryData = async () => {
      setIsLoadingTelemetry(true);
      try {
        console.log(`📊 Buscando telemetria para métricas: ${selectedMetrics.join(', ')}`);
        
        // Filtrar sensores que correspondem às métricas selecionadas
        const relevantSensors = apiSensors.filter(s => selectedMetrics.includes(s.metric_type));
        
        if (relevantSensors.length === 0) {
          setTelemetryChartData(null);
          return;
        }

        // Buscar dados para cada sensor (últimas 24h)
        const deviceIds = [...new Set(relevantSensors.map(s => s.device_name))];
        
        // Buscar dados de telemetria para cada device
        const telemetryPromises = deviceIds.map(async (deviceId) => {
          try {
            const data = await telemetryService.getHistoryLastHours(deviceId, 24);
            return data;
          } catch (error) {
            console.error(`❌ Erro ao buscar dados do device ${deviceId}:`, error);
            return { series: [] };
          }
        });

        const results = await Promise.all(telemetryPromises);
        const allData = results.flatMap(r => r.series || []);
        
        setTelemetryChartData(allData);
        console.log(`✅ ${allData.length} pontos de telemetria carregados`);
        
      } catch (error) {
        console.error('❌ Erro ao carregar dados de telemetria:', error);
        setTelemetryChartData(null);
      } finally {
        setIsLoadingTelemetry(false);
      }
    };

    fetchTelemetryData();
  }, [selectedAsset?.id, selectedMetrics, apiSensors]);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setSelectedAsset(null)}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{selectedAsset.tag}</h1>
            <p className="text-muted-foreground">
              {selectedAsset.type} • {selectedAsset.location}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <a
            href="#"
            className="flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Abrir OS no TrakNor</span>
          </a>
        </div>
      </div>

      {/* Asset KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <KPICard
          label="Saúde Geral"
          value={assetKPIs.health.toFixed(0)}
          unit="%"
          status={assetKPIs.health >= 80 ? 'good' : assetKPIs.health >= 60 ? 'warning' : 'critical'}
          icon={<Heart className="w-4 h-4" />}
        />

        <KPICard
          label="Horas Operação"
          value={assetKPIs.operatingHours.toLocaleString('pt-BR')}
          unit="h"
          icon={<Clock className="w-4 h-4" />}
        />

        <KPICard
          label="ΔP Filtro"
          value={assetKPIs.dpFilter.toFixed(0)}
          unit="Pa"
          status={assetKPIs.dpFilter > 250 ? 'critical' : assetKPIs.dpFilter > 200 ? 'warning' : 'good'}
          icon={<Gauge className="w-4 h-4" />}
        />

        <KPICard
          label="Estado Compressor"
          value={assetKPIs.compressorState}
          status={assetKPIs.compressorState === 'ON' ? 'good' : 'warning'}
          icon={<Activity className="w-4 h-4" />}
        />

        <KPICard
          label="Potência Atual"
          value={assetKPIs.currentPower.toFixed(0)}
          unit="kW"
          icon={<Zap className="w-4 h-4" />}
        />

        <KPICard
          label="Vibração"
          value={assetKPIs.vibration.toFixed(1)}
          unit="mm/s"
          status={assetKPIs.vibration > 5 ? 'critical' : assetKPIs.vibration > 3 ? 'warning' : 'good'}
          icon={<Activity className="w-4 h-4" />}
        />
      </div>

      {/* Tabs */}
      <div className="border-b border-border">
        <nav className="flex space-x-8 overflow-x-auto">
          {[
            { id: 'je02', label: 'Monitoramento' },
            { id: 'telemetry', label: 'Telemetria' },
            { id: 'performance', label: 'Performance', conditional: showPerformanceTab },
            { id: 'maintenance', label: 'Manutenção' },
            { id: 'alerts', label: 'Histórico Alertas' },
            { id: 'raw', label: 'Telemetria Bruta' }
          ]
            .filter(tab => tab.conditional !== false)
            .map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab.label}
              </button>
            ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'telemetry' && (
        <div className="space-y-6">
          {/* Metric Selector */}
          <div className="bg-card rounded-xl p-4 border shadow-sm">
            <h3 className="text-lg font-semibold mb-3">Selecionar Métricas</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
              {isLoadingSensors ? (
                <div className="col-span-full flex items-center justify-center py-4">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  <span className="text-sm text-muted-foreground">Carregando sensores...</span>
                </div>
              ) : availableMetrics.length > 0 ? (
                availableMetrics.map(metric => (
                  <label
                    key={metric.id}
                    className="flex items-center space-x-2 text-sm cursor-pointer hover:bg-muted/50 p-2 rounded transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedMetrics.includes(metric.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedMetrics([...selectedMetrics, metric.id]);
                        } else {
                          setSelectedMetrics(selectedMetrics.filter(m => m !== metric.id));
                        }
                      }}
                      className="rounded border-gray-300"
                    />
                    <span className="font-medium">{metric.label}</span>
                    <span className="text-xs text-muted-foreground">({metric.unit})</span>
                  </label>
                ))
              ) : (
                <div className="col-span-full flex flex-col items-center justify-center py-8 text-muted-foreground">
                  <AlertTriangle className="h-8 w-8 mb-2" />
                  <p className="text-sm">Nenhum sensor encontrado para este ativo.</p>
                  <p className="text-xs mt-1">Verifique se há sensores vinculados na página de Sensores.</p>
                </div>
              )}
            </div>
          </div>

          {/* Time Series Chart */}
          <div className="bg-card rounded-xl p-6 border shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Séries Temporais</h3>
              {selectedMetrics.length > 0 && (
                <span className="text-sm text-muted-foreground">
                  {selectedMetrics.length} métrica{selectedMetrics.length > 1 ? 's' : ''} selecionada{selectedMetrics.length > 1 ? 's' : ''}
                </span>
              )}
            </div>
            
            {isLoadingTelemetry ? (
              <div className="h-96 flex items-center justify-center">
                <div className="flex flex-col items-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
                  <span className="text-sm text-muted-foreground">Carregando dados de telemetria...</span>
                </div>
              </div>
            ) : telemetryChartData && telemetryChartData.length > 0 ? (
              <div className="h-96">
                <LineChartTemp 
                  data={{
                    supply: telemetryChartData.filter((s: any) => s.sensorId.includes('temp')) || [],
                    return: [],
                    setpoint: []
                  }}
                  height={400}
                />
                <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    📊 <strong>{telemetryChartData.length}</strong> pontos de dados carregados (últimas 24h)
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Dados atualizados automaticamente a cada 30 segundos
                  </p>
                </div>
              </div>
            ) : selectedMetrics.length > 0 ? (
              <div className="h-96 flex items-center justify-center">
                <div className="flex flex-col items-center text-center max-w-md">
                  <AlertTriangle className="h-12 w-12 text-amber-500 mb-3" />
                  <h4 className="text-lg font-medium mb-2">Sem dados disponíveis</h4>
                  <p className="text-sm text-muted-foreground">
                    Não foram encontrados dados de telemetria para as métricas selecionadas nas últimas 24 horas.
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Verifique se os sensores estão enviando dados corretamente.
                  </p>
                </div>
              </div>
            ) : (
              <div className="h-96 flex items-center justify-center">
                <div className="flex flex-col items-center text-center max-w-md">
                  <Activity className="h-12 w-12 text-primary mb-3" />
                  <h4 className="text-lg font-medium mb-2">Selecione métricas para visualizar</h4>
                  <p className="text-sm text-muted-foreground">
                    Escolha uma ou mais métricas acima para exibir os dados no gráfico temporal.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'je02' && (
        <JE02SensorDetail assetId={selectedAsset.id} />
      )}

      {activeTab === 'performance' && showPerformanceTab && (
        <div className="space-y-6">
          {hasPerf ? (
            <div className="bg-card rounded-xl p-6 border shadow-sm">
              <h3 className="text-lg font-semibold mb-4">Análise de Performance</h3>
              <ScatterPerformance data={performanceData} height={400} />
            </div>
          ) : (
            <PerformanceEmpty asset={selectedAsset} missingSensors={missingSensors} />
          )}
        </div>
      )}

      {activeTab === 'maintenance' && (
        <div className="space-y-6">
          {/* TrakNor CTA */}
          <TrakNorCTA 
            onContactClick={() => setContactDialogOpen(true)}
            onLearnMoreClick={() => {
              // Pode abrir modal interno ou página externa
              window.open('https://traknor.com/como-funciona', '_blank', 'noopener,noreferrer');
            }}
          />
          
          {/* Maintenance Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-card rounded-xl p-6 border shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold">Tarefas Pendentes</h4>
                <Clock className="w-4 h-4 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-blue-600">
                {maintenanceTasks.filter(t => t.assetId === selectedAsset.id && t.status === 'scheduled').length}
              </p>
            </div>
            
            <div className="bg-card rounded-xl p-6 border shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold">Vencidas</h4>
                <AlertTriangle className="w-4 h-4 text-red-600" />
              </div>
              <p className="text-2xl font-bold text-red-600">
                {maintenanceTasks.filter(t => 
                  t.assetId === selectedAsset.id && 
                  t.status === 'scheduled' && 
                  new Date(t.scheduledDate) < new Date()
                ).length}
              </p>
            </div>
            
            <div className="bg-card rounded-xl p-6 border shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold">Concluídas (30d)</h4>
                <Activity className="w-4 h-4 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-green-600">
                {maintenanceHistory.filter(h => 
                  h.assetId === selectedAsset.id && 
                  new Date(h.completedDate) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                ).length}
              </p>
            </div>
          </div>

          {/* Recent Tasks */}
          <div className="bg-card rounded-xl p-6 border shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Próximas Manutenções</h3>
            <div className="space-y-3">
              {maintenanceTasks
                .filter(t => t.assetId === selectedAsset.id && t.status === 'scheduled')
                .sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime())
                .slice(0, 5)
                .map(task => (
                  <div key={task.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium">{task.title}</h4>
                      <p className="text-sm text-muted-foreground">{task.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <span>📅 {new Date(task.scheduledDate).toLocaleDateString('pt-BR')}</span>
                        <span>⏱️ {task.estimatedDuration} min</span>
                        {task.assignedTo && <span>👤 {task.assignedTo}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        task.priority === 'Critical' ? 'bg-red-100 text-red-800' :
                        task.priority === 'High' ? 'bg-orange-100 text-orange-800' :
                        task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {task.priority}
                      </span>
                      {new Date(task.scheduledDate) < new Date() && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Vencida
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              {maintenanceTasks.filter(t => t.assetId === selectedAsset.id && t.status === 'scheduled').length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Nenhuma manutenção agendada para este ativo</p>
                </div>
              )}
            </div>
          </div>

          {/* Maintenance History */}
          <div className="bg-card rounded-xl p-6 border shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Histórico Recente</h3>
            <div className="space-y-3">
              {maintenanceHistory
                .filter(h => h.assetId === selectedAsset.id)
                .slice(0, 10)
                .map(record => (
                  <div key={record.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{record.title}</h4>
                      <span className="text-sm text-muted-foreground">
                        {new Date(record.completedDate).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{record.notes}</p>
                    <div className="flex items-center justify-between text-sm">
                      <span>👤 {record.completedBy}</span>
                      <span>💰 ${record.cost.toFixed(2)}</span>
                    </div>
                    {record.beforeHealthScore && record.afterHealthScore && (
                      <div className="mt-2 text-sm">
                        <span className="text-muted-foreground">Saúde: </span>
                        <span className="text-red-500">{record.beforeHealthScore}%</span>
                        <span className="text-muted-foreground"> → </span>
                        <span className="text-green-600">{record.afterHealthScore}%</span>
                        <span className="text-green-600"> (+{record.afterHealthScore - record.beforeHealthScore}%)</span>
                      </div>
                    )}
                  </div>
                ))}
              {maintenanceHistory.filter(h => h.assetId === selectedAsset.id).length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Nenhum histórico de manutenção disponível</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'alerts' && (
        <div className="bg-card rounded-xl p-6 border shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Histórico de Alertas</h3>
          {assetAlerts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <AlertTriangle className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum alerta ativo para este ativo</p>
            </div>
          ) : (
            <div className="space-y-3">
              {assetAlerts.map(alert => (
                <div key={alert.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      alert.severity === 'Critical' ? 'bg-red-100 text-red-800' :
                      alert.severity === 'High' ? 'bg-orange-100 text-orange-800' :
                      alert.severity === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {alert.severity}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {(alert.timestamp instanceof Date ? alert.timestamp : new Date(alert.timestamp)).toLocaleString('pt-BR')}
                    </span>
                  </div>
                  <p className="text-sm">{alert.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">Regra: {alert.ruleName}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'raw' && (
        <div className="bg-card rounded-xl p-6 border shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Telemetria Bruta</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-4">Timestamp</th>
                  <th className="text-left py-2 px-4">Sensor</th>
                  <th className="text-left py-2 px-4">Valor</th>
                  <th className="text-left py-2 px-4">Unidade</th>
                  <th className="text-left py-2 px-4">Qualidade</th>
                </tr>
              </thead>
              <tbody>
                {assetSensors.slice(0, 10).map(sensor => (
                  <tr key={sensor.id} className="border-b">
                    <td className="py-2 px-4">
                      {sensor.lastReading?.timestamp ? (sensor.lastReading.timestamp instanceof Date ? sensor.lastReading.timestamp : new Date(sensor.lastReading.timestamp)).toLocaleString('pt-BR') : 'N/A'}
                    </td>
                    <td className="py-2 px-4">{sensor.tag}</td>
                    <td className="py-2 px-4">
                      {sensor.lastReading?.value.toFixed(2)}
                    </td>
                    <td className="py-2 px-4">{sensor.unit}</td>
                    <td className="py-2 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        sensor.lastReading?.quality === 'good' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {sensor.lastReading?.quality}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {/* Contact Sales Dialog */}
      <ContactSalesDialog 
        open={contactDialogOpen} 
        onOpenChange={setContactDialogOpen}
        subject="Interesse em TrakNor - Gestão de Manutenção"
      />
    </div>
  );
};