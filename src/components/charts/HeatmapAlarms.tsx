import React from 'react';
import ReactECharts from 'echarts-for-react';

interface HeatmapAlarmsProps {
  data: Array<{
    day: number;
    hour: number;
    count: number;
    date: Date;
  }>;
  height?: number;
}

export const HeatmapAlarms: React.FC<HeatmapAlarmsProps> = ({ data, height = 200 }) => {
  // Validate data
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <div 
        className="flex items-center justify-center text-muted-foreground bg-muted/20 rounded-lg"
        style={{ height }}
      >
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p>Carregando heatmap de alertas...</p>
        </div>
      </div>
    );
  }

  const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));

  const validData = data.filter(item => 
    item && 
    typeof item.day === 'number' && 
    typeof item.hour === 'number' && 
    typeof item.count === 'number' && 
    !isNaN(item.count) &&
    item.date instanceof Date
  );

  const maxCount = Math.max(...validData.map(item => item.count), 1);

  const heatmapData = validData.map(item => [
    item.hour,
    item.day,
    item.count,
    item.date.toLocaleDateString('pt-BR')
  ]);

  const option = {
    tooltip: {
      position: 'top',
      formatter: (params: any) => {
        const [hour, day, count, date] = params.data;
        return `<strong>${date}</strong><br/>
                ${days[day]} ${hour}:00<br/>
                Alertas: ${count}`;
      }
    },
    grid: {
      height: '60%',
      top: '10%',
      left: '10%',
      right: '5%'
    },
    xAxis: {
      type: 'category',
      data: hours,
      splitArea: {
        show: true
      },
      axisLabel: {
        interval: 1,
        fontSize: 10
      },
      name: 'Hora do Dia',
      nameLocation: 'middle',
      nameGap: 25
    },
    yAxis: {
      type: 'category',
      data: days,
      splitArea: {
        show: true
      },
      axisLabel: {
        fontSize: 10
      }
    },
    visualMap: {
      min: 0,
      max: maxCount,
      calculable: false,
      orient: 'horizontal',
      left: 'center',
      bottom: '5%',
      inRange: {
        color: [
          '#f7fbfb',
          '#e6f4f5',
          '#b8dce0',
          '#8ac4ca',
          '#5cadb5',
          '#2e95a0',
          '#076a75'
        ]
      },
      text: ['Alto', 'Baixo'],
      textStyle: {
        fontSize: 10
      }
    },
    series: [
      {
        name: 'Densidade de Alertas',
        type: 'heatmap',
        data: heatmapData,
        label: {
          show: false
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  };

  try {
    return (
      <div style={{ height, width: '100%' }}>
        <ReactECharts 
          option={option} 
          style={{ height: '100%', width: '100%' }}
          opts={{ renderer: 'svg', locale: 'pt' }}
          notMerge={true}
          lazyUpdate={true}
        />
      </div>
    );
  } catch (error) {
    console.error('Error rendering HeatmapAlarms:', error);
    return (
      <div 
        className="flex items-center justify-center text-muted-foreground bg-muted/10 rounded-lg border border-dashed border-muted"
        style={{ height }}
      >
        <div className="text-center">
          <div className="text-sm">Erro ao renderizar heatmap de alertas</div>
        </div>
      </div>
    );
  }
};