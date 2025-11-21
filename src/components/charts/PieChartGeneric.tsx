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

interface PieChartGenericProps {
  data?: DataPoint[];
  series?: SeriesData[];
  height?: number;
  type?: 'pie' | 'donut';
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

export const PieChartGeneric: React.FC<PieChartGenericProps> = ({ 
  data, 
  series,
  height = 250,
  type = 'pie'
}) => {
  // Validação de dados
  const hasData = (data && data.length > 0) || (series && series.length > 0 && series.some(s => s.data.length > 0));

  if (!hasData) {
    return null; // Retorna null para que o overlay do parent seja exibido
  }

  // Para gráfico de pizza com múltiplas variáveis, calcular média de cada série
  const pieData = series && series.length > 0
    ? series.map((s, index) => {
        // Calcular média dos valores da série
        const avgValue = s.data.length > 0
          ? s.data.reduce((sum, point) => sum + point.value, 0) / s.data.length
          : 0;
        
        return {
          name: s.name,
          value: avgValue,
          itemStyle: {
            color: defaultColors[index % defaultColors.length]
          }
        };
      })
    : data?.map((point, index) => ({
        name: `Item ${index + 1}`,
        value: point.value,
        itemStyle: {
          color: defaultColors[index % defaultColors.length]
        }
      })) || [];

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => {
        return `${params.marker} ${params.name}<br/>Valor: ${params.value.toFixed(2)}<br/>Percentual: ${params.percent.toFixed(1)}%`;
      }
    },
    legend: {
      orient: 'horizontal',
      bottom: 0,
      left: 'center',
      type: 'scroll',
      data: pieData.map(item => item.name)
    },
    series: [
      {
        name: 'Distribuição',
        type: 'pie',
        radius: type === 'donut' ? ['40%', '70%'] : '70%',
        center: ['50%', '45%'],
        data: pieData,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        },
        label: {
          show: true,
          formatter: '{b}: {d}%'
        },
        labelLine: {
          show: true
        }
      }
    ]
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
