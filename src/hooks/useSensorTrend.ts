import { useState, useEffect } from 'react';
import { telemetryService } from '../services/telemetryService';

interface UseSensorTrendResult {
  trendPercentage: number | null;
  isLoading: boolean;
  error: string | null;
  comparisonPeriod: string;
}

/**
 * Hook para calcular tendência de um sensor comparando valor atual com histórico
 * 
 * @param sensorTag - Tag única do sensor
 * @param assetId - ID do asset ao qual o sensor pertence
 * @param currentValue - Valor atual do sensor
 * @param comparisonHours - Horas para comparação (padrão: 24h)
 */
export function useSensorTrend(
  sensorTag: string | undefined,
  assetId: number | undefined,
  currentValue: number | null,
  comparisonHours: number = 24
): UseSensorTrendResult {
  const [trend, setTrend] = useState<UseSensorTrendResult>({
    trendPercentage: null,
    isLoading: false,
    error: null,
    comparisonPeriod: `${comparisonHours}h`,
  });

  useEffect(() => {
    if (!sensorTag || !assetId || currentValue === null) {
      setTrend({
        trendPercentage: null,
        isLoading: false,
        error: sensorTag ? 'Dados insuficientes' : 'Sensor não configurado',
        comparisonPeriod: `${comparisonHours}h`,
      });
      return;
    }

    let isMounted = true;

    const calculateTrend = async () => {
      try {
        if (!isMounted) return;

        setTrend(prev => ({ ...prev, isLoading: true, error: null }));

        // Calcular período de comparação
        const endDate = new Date();
        const startDate = new Date(endDate.getTime() - comparisonHours * 60 * 60 * 1000);

        // Buscar histórico do sensor
        const history = await telemetryService.getHistoryByAsset(
          String(assetId),
          comparisonHours,
          sensorTag ? [sensorTag] : undefined
        );

        if (!isMounted) return;

        // Encontrar série do sensor específico
        const sensorSeries = history.series.find(s => s.sensorId === sensorTag);
        
        // Se não há dados suficientes, retornar null
        if (!sensorSeries || sensorSeries.data.length < 2) {
          setTrend({
            trendPercentage: null,
            isLoading: false,
            error: 'Histórico insuficiente para calcular tendência',
            comparisonPeriod: `${comparisonHours}h`,
          });
          return;
        }

        // Pegar primeira leitura (mais antiga) do período
        const oldestPoint = sensorSeries.data[0];
        const oldValue = oldestPoint.avg ?? oldestPoint.min ?? 0;

        // Calcular variação percentual
        let trendPercentage: number;
        
        if (oldValue === 0) {
          // Se valor antigo é 0, calcular baseado na magnitude do valor atual
          trendPercentage = currentValue > 0 ? 100 : (currentValue < 0 ? -100 : 0);
        } else {
          // Cálculo padrão: ((atual - antigo) / antigo) * 100
          trendPercentage = ((currentValue - oldValue) / Math.abs(oldValue)) * 100;
        }

        if (!isMounted) return;

        setTrend({
          trendPercentage,
          isLoading: false,
          error: null,
          comparisonPeriod: `${comparisonHours}h`,
        });

      } catch (error: any) {
        console.error('❌ Erro ao calcular tendência:', error);
        if (!isMounted) return;

        setTrend({
          trendPercentage: null,
          isLoading: false,
          error: error.message || 'Erro ao calcular tendência',
          comparisonPeriod: `${comparisonHours}h`,
        });
      }
    };

    calculateTrend();

    return () => {
      isMounted = false;
    };
  }, [sensorTag, assetId, currentValue, comparisonHours]);

  return trend;
}
