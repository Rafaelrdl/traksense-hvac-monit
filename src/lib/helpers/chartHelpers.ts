import { TimeSeriesPoint } from '@/types/telemetry';
import { ChartDataPoint } from '@/components/charts/TelemetryChart';

/**
 * FASE 3 - DIA 6: Chart Data Helpers
 * 
 * Helpers para converter dados do backend (TimeSeriesPoint) 
 * para dados de gráfico (ChartDataPoint).
 */

/**
 * Converte TimeSeriesPoint (backend) para ChartDataPoint (gráfico).
 * Usa 'avg' como valor padrão.
 * 
 * @param point - TimeSeriesPoint do backend
 * @returns ChartDataPoint para uso no TelemetryChart
 */
export const timeSeriesPointToChartData = (point: TimeSeriesPoint): ChartDataPoint => {
  return {
    timestamp: new Date(point.timestamp).getTime(), // Converte ISO string para ms
    value: point.avg ?? 0, // Usa avg como valor padrão
  };
};

/**
 * Converte array de TimeSeriesPoint para ChartDataPoint[].
 * 
 * @param points - Array de TimeSeriesPoint do backend
 * @param valueKey - Chave do valor a ser usado ('avg', 'min', 'max')
 * @returns Array de ChartDataPoint para uso no TelemetryChart
 */
export const timeSeriesArrayToChartData = (
  points: TimeSeriesPoint[],
  valueKey: 'avg' | 'min' | 'max' = 'avg'
): ChartDataPoint[] => {
  return points
    .filter(point => point[valueKey] !== null) // Remove pontos nulos
    .map(point => ({
      timestamp: new Date(point.timestamp).getTime(),
      value: point[valueKey]!,
    }));
};

/**
 * Converte TimeSeriesPoint para 3 séries de ChartDataPoint (min, avg, max).
 * Útil para exibir banda de variação em gráficos de área.
 * 
 * @param points - Array de TimeSeriesPoint do backend
 * @returns Objeto com 3 arrays (min, avg, max)
 */
export const timeSeriesArrayToChartDataWithBands = (
  points: TimeSeriesPoint[]
): {
  min: ChartDataPoint[];
  avg: ChartDataPoint[];
  max: ChartDataPoint[];
} => {
  return {
    min: timeSeriesArrayToChartData(points, 'min'),
    avg: timeSeriesArrayToChartData(points, 'avg'),
    max: timeSeriesArrayToChartData(points, 'max'),
  };
};

/**
 * Filtra pontos de gráfico por range de tempo.
 * 
 * @param points - Array de ChartDataPoint
 * @param startTime - Timestamp de início (ms)
 * @param endTime - Timestamp de fim (ms)
 * @returns Array filtrado
 */
export const filterChartDataByTimeRange = (
  points: ChartDataPoint[],
  startTime: number,
  endTime: number
): ChartDataPoint[] => {
  return points.filter(point => {
    const timestamp = typeof point.timestamp === 'number' ? point.timestamp : point.timestamp.getTime();
    return timestamp >= startTime && timestamp <= endTime;
  });
};

/**
 * Calcula estatísticas de um array de ChartDataPoint.
 * 
 * @param points - Array de ChartDataPoint
 * @returns Estatísticas (min, max, avg, count)
 */
export const calculateChartDataStatistics = (
  points: ChartDataPoint[]
): {
  min: number;
  max: number;
  avg: number;
  count: number;
} => {
  if (points.length === 0) {
    return { min: 0, max: 0, avg: 0, count: 0 };
  }

  const values = points.map(p => p.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const sum = values.reduce((acc, v) => acc + v, 0);
  const avg = sum / values.length;

  return {
    min,
    max,
    avg,
    count: points.length,
  };
};
