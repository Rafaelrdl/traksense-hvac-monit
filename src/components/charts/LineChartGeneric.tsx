import React from 'react';
import ReactECharts from 'echarts-for-react';

interface DataPoint {
  timestamp: Date;
  value: number;
  sensorId: string;
  quality: 'good' | 'warning' | 'error';
}

interface SeriesData {
  name: string;
  data: DataPoint[];
  color?: string;
  unit?: string;
}

interface LineChartGenericProps {
  data?: DataPoint[]; // Para compatibilidade com versão antiga (série única)
  series?: SeriesData[]; // Para múltiplas séries
  height?: number;
  color?: string;
}

export const LineChartGeneric: React.FC<LineChartGenericProps> = ({ 
  data, 
  series,
  height = 300,
  color = '#3b82f6'
}) => {
  // Converter data única para série se necessário
  const chartSeries: SeriesData[] = series || (data ? [{
    name: 'Valor',
    data: data,
    color: color,
    unit: ''
  }] : []);

  // Validar dados
  if (chartSeries.length === 0 || chartSeries.every(s => s.data.length === 0)) {
    return (
      <div 
        className="flex items-center justify-center text-muted-foreground"
        style={{ height }}
      >
        <p>Nenhum dado disponível para o período selecionado</p>
      </div>
    );
  }

  const formatTime = (timestamp: number | Date) => {
    const date = typeof timestamp === 'number' ? new Date(timestamp) : timestamp;
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (timestamp: number | Date) => {
    const date = typeof timestamp === 'number' ? new Date(timestamp) : timestamp;
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Calcular min e max para o eixo Y com margem
  const allValues = chartSeries.flatMap(s => s.data.map(d => d.value));
  const minValue = Math.min(...allValues);
  const maxValue = Math.max(...allValues);
  const margin = (maxValue - minValue) * 0.1 || 1; // 10% de margem ou 1 se for constante

  // Cores padrão para múltiplas séries
  const defaultColors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'];

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross' },
      formatter: (params: any) => {
        if (!params || !params[0]) return '';
        const time = formatDate(new Date(params[0].axisValue));
        
        let content = `<strong>${time}</strong><br/>`;
        params.forEach((param: any) => {
          const value = param.value?.[1];
          if (typeof value === 'number') {
            const seriesData = chartSeries[param.seriesIndex];
            content += `${param.marker} ${param.seriesName}: ${value.toFixed(2)} ${seriesData?.unit || ''}<br/>`;
          }
        });
        
        return content;
      }
    },
    legend: chartSeries.length > 1 ? {
      data: chartSeries.map(s => s.name),
      top: 10,
      type: 'scroll'
    } : undefined,
    grid: {
      left: '3%',
      right: '4%',
      bottom: '10%',
      top: chartSeries.length > 1 ? '15%' : '8%',
      containLabel: true
    },
    xAxis: {
      type: 'time',
      axisLabel: {
        formatter: formatTime,
        rotate: 45
      }
    },
    yAxis: {
      type: 'value',
      name: 'Valor',
      axisLabel: {
        formatter: (value: number) => value.toFixed(1)
      },
      min: Math.floor(minValue - margin),
      max: Math.ceil(maxValue + margin)
    },
    series: chartSeries.map((seriesData, index) => {
      const seriesColor = seriesData.color || defaultColors[index % defaultColors.length];
      const chartData = seriesData.data.map(point => [
        point.timestamp instanceof Date ? point.timestamp : new Date(point.timestamp),
        point.value
      ]);

      return {
        name: seriesData.name,
        type: 'line',
        data: chartData,
        smooth: false, // Sempre usar linhas retas
        lineStyle: { 
          width: 2, 
          color: seriesColor
        },
        itemStyle: { 
          color: seriesColor 
        },
        areaStyle: chartSeries.length === 1 ? {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [{
              offset: 0,
              color: `${seriesColor}40` // 25% opacity
            }, {
              offset: 1,
              color: `${seriesColor}10` // 6% opacity
            }]
          }
        } : undefined,
        symbol: 'circle',
        symbolSize: 4,
        showSymbol: false, // Mostrar apenas no hover
        emphasis: {
          focus: 'series',
          itemStyle: {
            borderColor: seriesColor,
            borderWidth: 2
          }
        }
      };
    }),
    dataZoom: [
      {
        type: 'inside',
        xAxisIndex: 0,
        filterMode: 'none'
      },
      {
        type: 'slider',
        xAxisIndex: 0,
        height: 20,
        bottom: 20,
        filterMode: 'none'
      }
    ]
  };

  try {
    return (
      <div style={{ height, width: '100%' }}>
        <ReactECharts 
          option={option} 
          style={{ height: '100%', width: '100%' }}
          opts={{ renderer: 'canvas', locale: 'pt' }}
          notMerge={true}
          lazyUpdate={true}
        />
      </div>
    );
  } catch (error) {
    console.error('Erro ao renderizar gráfico:', error);
    return (
      <div 
        className="flex items-center justify-center text-muted-foreground bg-muted/10 rounded-lg border border-dashed border-muted"
        style={{ height }}
      >
        <div className="text-center">
          <div className="text-sm">Erro ao renderizar gráfico</div>
        </div>
      </div>
    );
  }
};
