import { useState, useEffect } from 'react';
import { telemetryService } from '../services/telemetryService';

interface SensorDataPoint {
  timestamp: Date;
  value: number;
  sensorId: string;
  quality: 'good' | 'warning' | 'error';
}

interface SeriesData {
  name: string;
  data: SensorDataPoint[];
  unit: string;
  sensorTag: string;
}

interface UseMultipleSensorHistoryResult {
  series: SeriesData[];
  loading: boolean;
  error: string | null;
}

/**
 * Hook para buscar histórico de múltiplos sensores
 * @param sensorTags - Array de tags dos sensores
 * @param assetTag - Tag do asset
 * @param hours - Número de horas de histórico (padrão: 24)
 * @param refreshInterval - Intervalo de atualização em ms (padrão: 60000 = 1 min)
 */
export function useMultipleSensorHistory(
  sensorTags: string[],
  assetTag?: string,
  hours: number = 24,
  refreshInterval: number = 60000
): UseMultipleSensorHistoryResult {
  const [result, setResult] = useState<UseMultipleSensorHistoryResult>({
    series: [],
    loading: false,
    error: null
  });

  useEffect(() => {
    if (!sensorTags || sensorTags.length === 0 || !assetTag) {
      setResult({
        series: [],
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
        console.log(`📊 Buscando histórico múltiplo: assetTag=${assetTag}, sensors=${sensorTags.length}, hours=${hours}`);

        // Buscar histórico usando assetTag para todos os sensores
        const response = await telemetryService.getHistoryByAsset(
          assetTag,
          hours,
          sensorTags
        );

        console.log('📊 Resposta da API (múltiplas séries):', response);

        if (!isMounted) return;

        const seriesData: SeriesData[] = [];

        // Processar cada sensor
        for (const sensorTag of sensorTags) {
          const sensorSeries = response.series.find(s => s.sensorId === sensorTag);

          if (sensorSeries && sensorSeries.data.length > 0) {
            // Extrair nome formatado do sensor
            const varName = sensorTag.includes('_') 
              ? sensorTag.split('_').slice(1).join('_')
              : sensorTag;
            const formattedName = varName
              .split('_')
              .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
              .join(' ');

            const dataPoints: SensorDataPoint[] = sensorSeries.data.map(point => ({
              timestamp: new Date(point.timestamp),
              value: point.avg ?? point.max ?? point.min ?? 0,
              sensorId: sensorTag,
              quality: 'good' as const
            }));

            seriesData.push({
              name: formattedName,
              data: dataPoints,
              unit: sensorSeries.unit,
              sensorTag: sensorTag
            });

            console.log(`✅ Série ${formattedName}: ${dataPoints.length} pontos`);
          } else {
            console.warn(`⚠️ Nenhum dado encontrado para sensor: ${sensorTag}`);
          }
        }

        if (seriesData.length > 0) {
          console.log(`✅ Total: ${seriesData.length} séries carregadas`);
          hasData = true;
          setResult({
            series: seriesData,
            loading: false,
            error: null
          });
        } else {
          setResult({
            series: [],
            loading: false,
            error: 'Nenhum dado encontrado'
          });
        }
      } catch (error) {
        if (!isMounted) return;
        console.error('❌ Erro ao buscar histórico múltiplo:', error);
        setResult({
          series: [],
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
  }, [JSON.stringify(sensorTags), assetTag, hours, refreshInterval]);

  return result;
}
