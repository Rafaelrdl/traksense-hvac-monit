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

interface RadialChartGenericProps {
  data?: DataPoint[];
  series?: SeriesData[];
  height?: number;
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

export const RadialChartGeneric: React.FC<RadialChartGenericProps> = ({ 
  data, 
  series,
  height = 250
}) => {
  // Validação de dados
  const hasData = (data && data.length > 0) || (series && series.length > 0 && series.some(s => s.data.length > 0));

  if (!hasData) {
    return null; // Retorna null para que o overlay do parent seja exibido
  }

  // Para gráfico radial com múltiplas variáveis, pegar último valor de cada série
  const radialData = series && series.length > 0
    ? series.map((s, index) => {
        // Pegar o último valor da série
        const lastValue = s.data.length > 0
          ? s.data[s.data.length - 1].value
          : 0;
        
        return {
          value: lastValue,
          name: s.name,
          itemStyle: {
            color: defaultColors[index % defaultColors.length]
          }
        };
      })
    : data?.map((point, index) => ({
        value: point.value,
        name: `Valor ${index + 1}`,
        itemStyle: {
          color: defaultColors[index % defaultColors.length]
        }
      })) || [];

  // Encontrar valor máximo para escala
  const maxValue = Math.max(...radialData.map(d => d.value));
  const indicatorMax = maxValue * 1.2; // 20% a mais para margem

  // Criar indicadores para o radar (um para cada variável)
  const indicators = radialData.map(item => ({
    name: item.name,
    max: indicatorMax
  }));

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => {
        if (params.seriesType === 'radar') {
          let result = '<strong>Valores</strong><br/>';
          params.value.forEach((val: number, idx: number) => {
            result += `${indicators[idx].name}: ${val.toFixed(2)}<br/>`;
          });
          return result;
        }
        return `${params.marker} ${params.name}: ${params.value.toFixed(2)}`;
      }
    },
    legend: {
      orient: 'horizontal',
      bottom: 0,
      left: 'center',
      data: radialData.map(item => item.name)
    },
    radar: {
      indicator: indicators,
      shape: 'circle',
      splitNumber: 5,
      name: {
        textStyle: {
          color: '#666'
        }
      },
      splitLine: {
        lineStyle: {
          color: '#ddd'
        }
      },
      splitArea: {
        show: true,
        areaStyle: {
          color: ['rgba(255, 255, 255, 0)', 'rgba(200, 200, 200, 0.1)']
        }
      },
      axisLine: {
        lineStyle: {
          color: '#ddd'
        }
      }
    },
    series: [
      {
        name: 'Valores',
        type: 'radar',
        data: [
          {
            value: radialData.map(d => d.value),
            name: 'Medições',
            areaStyle: {
              color: 'rgba(59, 130, 246, 0.2)'
            },
            lineStyle: {
              color: defaultColors[0],
              width: 2
            },
            itemStyle: {
              color: defaultColors[0]
            }
          }
        ]
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
