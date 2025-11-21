import { useState, useEffect } from 'react';
import { telemetryService } from '../services/telemetryService';

interface SensorDataPoint {
  timestamp: Date;
  value: number;
  sensorId: string;
  quality: 'good' | 'warning' | 'error';
}

interface UseSensorHistoryResult {
  data: SensorDataPoint[];
  loading: boolean;
  error: string | null;
}

/**
 * Hook para buscar histórico de dados de um sensor
 * @param sensorTag - Tag do sensor
 * @param assetTag - Tag do asset (ex: CHILLER-001)
 * @param hours - Número de horas de histórico (padrão: 24)
 * @param refreshInterval - Intervalo de atualização em ms (padrão: 60000 = 1 min)
 * @param forceInterval - Forçar intervalo específico de agregação (ex: '1m', '5m', 'raw')
 */
export function useSensorHistory(
  sensorTag?: string,
  assetTag?: string,
  hours: number = 24,
  refreshInterval: number = 60000,
  forceInterval?: string
): UseSensorHistoryResult {
  const [result, setResult] = useState<UseSensorHistoryResult>({
    data: [],
    loading: false,
    error: null
  });

  useEffect(() => {
    if (!sensorTag || !assetTag) {
      setResult({
        data: [],
        loading: false,
        error: null
      });
      return;
    }

    let isMounted = true;
    let hasData = false;

    const fetchHistory = async () => {
      // Não fazer loading novamente se já temos dados (evita piscar)
      if (!hasData) {
        setResult(prev => ({ ...prev, loading: true, error: null }));
      }

      try {
        console.log(`📊 Buscando histórico: assetTag=${assetTag}, sensorTag=${sensorTag}, hours=${hours}, forceInterval=${forceInterval}`);

        // Buscar histórico usando assetTag
        const response = await telemetryService.getHistoryByAsset(
          assetTag,
          hours,
          [sensorTag],
          forceInterval
        );

        console.log('📊 Resposta da API:', response);

        if (!isMounted) return;

        // Encontrar a série do sensor específico
        const sensorSeries = response.series.find(s => s.sensorId === sensorTag);

        console.log('📊 Série encontrada:', sensorSeries);

        if (sensorSeries && sensorSeries.data.length > 0) {
          const dataPoints: SensorDataPoint[] = sensorSeries.data.map(point => ({
            timestamp: new Date(point.timestamp),
            value: point.avg ?? point.max ?? point.min ?? 0, // Usar avg, ou fallback para max/min
            sensorId: sensorTag,
            quality: 'good' as const
          }));

          console.log(`✅ ${dataPoints.length} pontos de dados carregados`);
          
          hasData = true;
          setResult({
            data: dataPoints,
            loading: false,
            error: null
          });
        } else {
          console.warn('⚠️ Nenhum dado encontrado para o sensor');
          setResult({
            data: [],
            loading: false,
            error: 'Nenhum dado encontrado'
          });
        }
      } catch (error) {
        if (!isMounted) return;
        console.error('❌ Erro ao buscar histórico do sensor:', error);
        setResult({
          data: [],
          loading: false,
          error: error instanceof Error ? error.message : 'Erro ao carregar dados'
        });
      }
    };

    // Buscar dados imediatamente
    fetchHistory();

    // Configurar intervalo de atualização
    const interval = setInterval(fetchHistory, refreshInterval);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [sensorTag, assetTag, hours, refreshInterval, forceInterval]);

  return result;
}
