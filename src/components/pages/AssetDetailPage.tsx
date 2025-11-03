import React, { useState, useMemo, useEffect } from 'react';
import { useAppStore, useSelectedAsset, useTimeRangeMs } from '../../store/app';
import { useFeaturesStore } from '../../store/features';
import { simEngine } from '../../lib/simulation';
import { hasPerformanceTelemetry, reasonMissingTelemetry } from '../../lib/hasPerformanceTelemetry';
import { MultiSeriesTelemetryChart } from '../charts/TelemetryChart';
import { ScatterPerformance } from '../charts/ScatterPerformance';
import { KPICard } from '../ui/KPICard';
import { JE02SensorDetail } from './JE02SensorDetail';
import { PerformanceEmpty } from '../assets/PerformanceEmpty';
import { TrakNorCTA } from '../assets/TrakNorCTA';
import { ContactSalesDialog } from '../common/ContactSalesDialog';
import { assetsService } from '../../services/assetsService';
import { telemetryService } from '../../services/telemetryService';
import { mapApiDeviceHistoryToFrontend } from '../../lib/mappers/telemetryMapper';
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
  const [availableMetrics, setAvailableMetrics] = useState<Array<{id: string, sensorTag?: string, metricType?: string, label: string, unit: string}>>([]);
  const [isLoadingSensors, setIsLoadingSensors] = useState(false);
  const [telemetryChartData, setTelemetryChartData] = useState<any>(null);
  const [isLoadingTelemetry, setIsLoadingTelemetry] = useState(false);
  const [telemetryPeriod, setTelemetryPeriod] = useState<'24h' | '7d' | '30d'>('24h');

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
        
        // Criar opções para checkboxes: um item por SENSOR (não por metric_type)
        // Assim todos os 4 sensores aparecem, mesmo que tenham metric_type duplicado
        const metrics = sensorsData.map(sensor => {
          const meta = metricLabels[sensor.metric_type] || { 
            label: sensor.metric_type, 
            unit: sensor.unit || '' 
          };
          return {
            id: sensor.tag, // Usar tag do sensor como ID único
            sensorTag: sensor.tag,
            metricType: sensor.metric_type,
            label: `${sensor.tag} (${meta.label})`, // Mostrar nome do sensor + tipo
            unit: meta.unit
          };
        });
        
        setAvailableMetrics(metrics);
        console.log(`✅ ${sensorsData.length} sensores carregados como métricas selecionáveis`);
        
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

    // Função auxiliar para extrair o device_id correto
    const getDeviceId = (sensor: any): string => {
      // Tentar mqtt_client_id primeiro, depois serial, depois tag do sensor
      let deviceId = sensor.device_mqtt_client_id || sensor.device_serial || sensor.tag.split('_')[0];
      
      console.log(`  🔍 Sensor ${sensor.tag}:`);
      console.log(`     mqtt_client_id="${sensor.device_mqtt_client_id}"`);
      console.log(`     device_serial="${sensor.device_serial}"`);
      console.log(`     device_id usado="${deviceId}"`);
      
      return deviceId;
    };

    // Calcular horas baseado no período
    const getHoursForPeriod = (period: '24h' | '7d' | '30d'): number => {
      switch (period) {
        case '24h': return 24;
        case '7d': return 24 * 7;
        case '30d': return 24 * 30;
      }
    };

    const fetchTelemetryData = async () => {
      setIsLoadingTelemetry(true);
      try {
        const hours = getHoursForPeriod(telemetryPeriod);
        console.log(`📊 Buscando telemetria para sensores: ${selectedMetrics.join(', ')} (período: ${telemetryPeriod} = ${hours}h)`);
        
        // Filtrar sensores que correspondem aos sensor.tag selecionados
        // (selectedMetrics agora contém sensor.tag em vez de metric_type)
        const relevantSensors = apiSensors.filter(s => selectedMetrics.includes(s.tag));
        
        console.log(`📋 Sensores relevantes encontrados:`, relevantSensors.map(s => ({
          tag: s.tag,
          metric_type: s.metric_type,
          device_mqtt_client_id: s.device_mqtt_client_id
        })));
        
        if (relevantSensors.length === 0) {
          console.warn('⚠️ Nenhum sensor relevante encontrado para as métricas selecionadas');
          setTelemetryChartData(null);
          return;
        }

        // Buscar dados para cada sensor
        // CORREÇÃO: Usar função auxiliar para extrair device_id corretamente
        const deviceIds = [...new Set(relevantSensors.map(getDeviceId))].filter(Boolean);
        
        // Buscar dados de telemetria para cada device
        console.log(`🔍 Buscando dados de ${deviceIds.length} device(s):`, deviceIds);
        
        // Verificar se os IDs estão corretos
        if (deviceIds.length > 0) {
          console.log(`🔎 Device ID para telemetria: "${deviceIds[0]}"`);
        }
        
        const telemetryPromises = deviceIds.map(async (deviceId) => {
          try {
            console.log(`  📡 Chamando telemetryService.getHistoryLastHours("${deviceId}", ${hours})`);
            const data = await telemetryService.getHistoryLastHours(deviceId, hours);
            console.log(`  ✅ Device ${deviceId} retornou:`, {
              deviceId: data.deviceId,
              seriesCount: data.series?.length || 0,
              series: data.series
            });
            return data;
          } catch (error: any) {
            console.error(`  ❌ Erro ao buscar dados do device ${deviceId}:`, {
              message: error.message,
              response: error.response?.data,
              status: error.response?.status
            });
            return { series: [] };
          }
        });

        const results = await Promise.all(telemetryPromises);
        console.log('📦 Raw API responses:', results);
        
        // Mapear respostas da API para o formato frontend
        const mappedResults = results.map(r => {
          try {
            return mapApiDeviceHistoryToFrontend(r);
          } catch (error) {
            console.error('❌ Erro ao mapear resposta:', error, r);
            return { deviceId: '', period: { start: '', end: '' }, aggregation: 'raw' as const, series: [] };
          }
        });
        console.log('✨ Mapped responses:', mappedResults);
        
        const allData = mappedResults.flatMap(r => r.series || []);
        
        console.log(`📊 Total de séries agregadas: ${allData.length}`);
        console.log('📊 Estrutura dos dados:', allData);
        
        // Criar um mapa de sensor_id -> metric_type dos sensores da API
        const sensorMetricMap = new Map<string, string>();
        relevantSensors.forEach(sensor => {
          // Adicionar múltiplas variações do sensor ID para cobrir todos os casos
          sensorMetricMap.set(sensor.tag, sensor.metric_type);
          sensorMetricMap.set(sensor.id?.toString() || '', sensor.metric_type);
          
          // Se o tag contém o device_name como prefixo, adicionar também sem prefixo
          if (sensor.tag.includes('_')) {
            const parts = sensor.tag.split('_');
            if (parts.length > 1) {
              // Ex: "4b686f6d70107115_A_temp" -> também mapear "A_temp"
              const suffix = parts.slice(1).join('_');
              sensorMetricMap.set(suffix, sensor.metric_type);
            }
          }
        });
        
        console.log('📋 Mapa de sensores (sample):', {
          totalEntries: sensorMetricMap.size,
          entries: Array.from(sensorMetricMap.entries()).slice(0, 5)
        });
        
        // Enriquecer as séries com metricType baseado no sensor_id
        const enrichedData = allData.map((series: any) => {
          // Tentar múltiplos campos possíveis para sensorId
          const sensorId = series.sensorId || series.sensor_id || series.sensorName || '';
          
          // Tentar encontrar no mapa
          let metricType = sensorMetricMap.get(sensorId) || '';
          
          // Se não encontrou, tentar variações
          if (!metricType && sensorId.includes('_')) {
            const suffix = sensorId.split('_').slice(1).join('_');
            metricType = sensorMetricMap.get(suffix) || '';
          }
          
          console.log(`  🔍 Série "${sensorId}": metricType="${metricType}", série completa:`, {
            sensorId: series.sensorId,
            sensor_id: series.sensor_id,
            sensorName: series.sensorName,
            sensorType: series.sensorType,
            dataPoints: series.data?.length || 0
          });
          
          return {
            ...series,
            metricType,
            sensorType: metricType // Adicionar também como sensorType para compatibilidade
          };
        });
        
        // Filtrar apenas as séries das métricas selecionadas
        const filteredData = enrichedData.filter((series: any) => {
          const isSelected = selectedMetrics.includes(series.metricType);
          console.log(`  ✅ Série ${series.sensorId || series.sensorName}: tipo="${series.metricType}", selecionado=${isSelected}`);
          return isSelected;
        });
        
        console.log(`📊 Séries filtradas: ${filteredData.length} de ${enrichedData.length}`);
        
        // Se nenhuma série foi filtrada mas temos séries disponíveis, mostrar todas
        // (fallback para quando o mapeamento falhar)
        if (filteredData.length === 0 && enrichedData.length > 0) {
          console.warn('⚠️ Nenhuma série correspondeu aos filtros. Mostrando todas as séries disponíveis como fallback.');
          console.log('📈 DADOS PARA O GRÁFICO (fallback):', JSON.stringify(enrichedData, null, 2));
          setTelemetryChartData(enrichedData);
          console.log(`✅ ${enrichedData.length} série(s) de telemetria carregadas (fallback - todas)`);
        } else {
          console.log('📈 DADOS PARA O GRÁFICO (filtradas):', JSON.stringify(filteredData, null, 2));
          setTelemetryChartData(filteredData);
          console.log(`✅ ${filteredData.length} série(s) de telemetria carregadas (filtradas)`);
        }
        
      } catch (error) {
        console.error('❌ Erro ao carregar dados de telemetria:', error);
        setTelemetryChartData(null);
      } finally {
        setIsLoadingTelemetry(false);
      }
    };

    fetchTelemetryData();
  }, [selectedAsset?.id, selectedMetrics, apiSensors, telemetryPeriod]);

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
          {/* Period Selector */}
          <div className="bg-card rounded-xl p-4 border shadow-sm">
            <h3 className="text-lg font-semibold mb-3">Período de Visualização</h3>
            <div className="flex gap-2">
              <button
                onClick={() => setTelemetryPeriod('24h')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  telemetryPeriod === '24h'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                24 Horas
              </button>
              <button
                onClick={() => setTelemetryPeriod('7d')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  telemetryPeriod === '7d'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                7 Dias
              </button>
              <button
                onClick={() => setTelemetryPeriod('30d')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  telemetryPeriod === '30d'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                30 Dias
              </button>
            </div>
          </div>

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
                <MultiSeriesTelemetryChart
                  series={telemetryChartData.map((seriesData: any, idx: number) => {
                    // Cores diferentes para cada série
                    const colors = ['#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
                    const color = colors[idx % colors.length];
                    
                    // Converter pontos de dados
                    const points = (seriesData.data || []).map((point: any) => ({
                      timestamp: new Date(point.timestamp),
                      value: point.avg !== undefined ? point.avg : (point.value !== undefined ? point.value : 0)
                    }));
                    
                    return {
                      id: seriesData.sensorId,
                      name: seriesData.sensorName || seriesData.sensorId,
                      data: points,
                      color: color,
                      unit: seriesData.unit || '',
                      sensorType: seriesData.sensorType as any
                    };
                  })}
                  chartType="line"
                  height={400}
                />
                <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    📊 <strong>{telemetryChartData.length}</strong> série(s) de dados carregadas ({telemetryPeriod === '24h' ? 'últimas 24h' : telemetryPeriod === '7d' ? 'últimos 7 dias' : 'últimos 30 dias'})
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Sensores: {telemetryChartData.map((s: any) => s.sensorId || s.sensorName).join(', ')}
                  </p>
                </div>
              </div>
            ) : selectedMetrics.length > 0 ? (
              <div className="h-96 flex items-center justify-center">
                <div className="flex flex-col items-center text-center max-w-md">
                  <AlertTriangle className="h-12 w-12 text-amber-500 mb-3" />
                  <h4 className="text-lg font-medium mb-2">Sem dados disponíveis</h4>
                  <p className="text-sm text-muted-foreground">
                    Não foram encontrados dados de telemetria para as métricas selecionadas {telemetryPeriod === '24h' ? 'nas últimas 24 horas' : telemetryPeriod === '7d' ? 'nos últimos 7 dias' : 'nos últimos 30 dias'}.
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