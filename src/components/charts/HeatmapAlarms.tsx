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
  const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));

  const maxCount = Math.max(...data.map(item => item.count), 1);

  const heatmapData = data.map(item => [
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

  return (
    <ReactECharts 
      option={option} 
      style={{ height, width: '100%' }}
      opts={{ renderer: 'svg' }}
    />
  );
};