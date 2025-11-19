import React from 'react';
import ReactECharts from 'echarts-for-react';

interface DataPoint {
  timestamp: Date | string;
  value: number;
}

interface SeriesData {
  name: string;
  data: DataPoint[];
}

interface BarChartGenericProps {
  data?: DataPoint[];
  series?: SeriesData[];
  height?: number;
  horizontal?: boolean;
}

const defaultColors = [
  '#3b82f6', // blue-500
  '#10b981', // green-500
  '#f59e0b', // amber-500
  '#8b5cf6', // violet-500
  '#ef4444', // red-500
  '#06b6d4', // cyan-500
  '#ec4899', // pink-500
  '#14b8a6', // teal-500
];

export const BarChartGeneric: React.FC<BarChartGenericProps> = ({ 
  data, 
  series,
  height = 250,
  horizontal = false
}) => {
  // Validação de dados
  const hasData = (data && data.length > 0) || (series && series.length > 0 && series.some(s => s.data.length > 0));

  if (!hasData) {
    return null; // Retorna null para que o overlay do parent seja exibido
  }

  // Processar dados para múltiplas séries ou série única
  const chartSeries = series && series.length > 0
    ? series.map((s, index) => ({
        name: s.name,
        type: 'bar',
        data: s.data.map(point => point.value),
        itemStyle: {
          color: defaultColors[index % defaultColors.length]
        }
      }))
    : [{
        name: 'Valor',
        type: 'bar',
        data: data?.map(point => point.value) || [],
        itemStyle: {
          color: defaultColors[0]
        }
      }];

  // Extrair timestamps (usa a primeira série se houver múltiplas)
  const timestamps = series && series.length > 0 && series[0].data.length > 0
    ? series[0].data.map(point => {
        const date = point.timestamp instanceof Date ? point.timestamp : new Date(point.timestamp);
        return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      })
    : data?.map(point => {
        const date = point.timestamp instanceof Date ? point.timestamp : new Date(point.timestamp);
        return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      }) || [];

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      formatter: (params: any) => {
        if (!Array.isArray(params)) params = [params];
        
        let result = `<strong>${params[0].axisValue}</strong><br/>`;
        params.forEach((param: any) => {
          result += `${param.marker} ${param.seriesName}: ${param.value?.toFixed(2) || 0}<br/>`;
        });
        return result;
      }
    },
    legend: series && series.length > 1 ? {
      data: series.map(s => s.name),
      bottom: 0,
      type: 'scroll'
    } : undefined,
    grid: {
      left: '3%',
      right: '4%',
      bottom: series && series.length > 1 ? '15%' : '10%',
      top: '10%',
      containLabel: true
    },
    xAxis: horizontal ? {
      type: 'value'
    } : {
      type: 'category',
      data: timestamps,
      axisLabel: {
        rotate: timestamps.length > 10 ? 45 : 0,
        interval: Math.floor(timestamps.length / 10) || 0
      }
    },
    yAxis: horizontal ? {
      type: 'category',
      data: timestamps,
      axisLabel: {
        width: 100,
        overflow: 'truncate'
      }
    } : {
      type: 'value'
    },
    series: chartSeries
  };

  return (
    <ReactECharts 
      option={option} 
      style={{ height: '100%', width: '100%' }}
      opts={{ renderer: 'canvas' }}
      notMerge={true}
      lazyUpdate={true}
    />
  );
};
