import React from 'react';
import ReactECharts from 'echarts-for-react';

interface GaugeFilterHealthProps {
  healthScore: number; // 0-100
  dpFilter: number; // Current ΔP in Pa
  daysUntilChange: number;
  height?: number;
}

export const GaugeFilterHealth: React.FC<GaugeFilterHealthProps> = ({ 
  healthScore, 
  dpFilter,
  daysUntilChange,
  height = 300 
}) => {
  const getHealthColor = (score: number) => {
    if (score >= 80) return '#2E8B57'; // Green
    if (score >= 60) return '#F5C34D'; // Amber
    return '#E05A47'; // Red
  };

  const getHealthLabel = (score: number) => {
    if (score >= 80) return 'Excelente';
    if (score >= 60) return 'Atenção';
    return 'Crítico';
  };

  const option = {
    tooltip: {
      formatter: () => {
        return `<strong>Saúde do Filtro</strong><br/>
                Score: ${healthScore}/100<br/>
                ΔP Atual: ${dpFilter.toFixed(1)} Pa<br/>
                Status: ${getHealthLabel(healthScore)}<br/>
                Troca sugerida em: ${daysUntilChange} dias`;
      }
    },
    series: [
      {
        name: 'Saúde do Filtro',
        type: 'gauge',
        center: ['50%', '60%'],
        startAngle: 200,
        endAngle: -20,
        min: 0,
        max: 100,
        splitNumber: 10,
        itemStyle: {
          color: getHealthColor(healthScore)
        },
        progress: {
          show: true,
          width: 30
        },
        pointer: {
          show: false
        },
        axisLine: {
          lineStyle: {
            width: 30,
            color: [
              [0.6, '#E05A47'],
              [0.8, '#F5C34D'],
              [1, '#2E8B57']
            ]
          }
        },
        axisTick: {
          distance: -45,
          splitNumber: 5,
          lineStyle: {
            width: 2,
            color: '#999'
          }
        },
        axisLabel: {
          distance: -20,
          color: '#999',
          fontSize: 12
        },
        anchor: {
          show: false
        },
        title: {
          show: false
        },
        detail: {
          valueAnimation: true,
          width: '60%',
          lineHeight: 40,
          borderRadius: 8,
          offsetCenter: [0, '-15%'],
          fontSize: 24,
          fontWeight: 'bold',
          formatter: '{value}/100',
          color: 'inherit'
        },
        data: [
          {
            value: healthScore,
            name: 'Score'
          }
        ]
      },
      // Secondary gauge for ΔP reading
      {
        name: 'Delta P',
        type: 'gauge',
        center: ['50%', '60%'],
        radius: '40%',
        startAngle: 200,
        endAngle: -20,
        min: 0,
        max: 400,
        splitNumber: 4,
        axisLine: {
          lineStyle: {
            width: 6,
            color: [
              [0.625, '#2E8B57'], // 0-250 Pa
              [0.75, '#F5C34D'],  // 250-300 Pa
              [1, '#E05A47']      // 300-400 Pa
            ]
          }
        },
        axisTick: {
          show: false
        },
        axisLabel: {
          show: false
        },
        pointer: {
          width: 3,
          length: '60%',
          itemStyle: {
            color: '#076A75'
          }
        },
        title: {
          show: false
        },
        detail: {
          show: false
        },
        data: [
          {
            value: dpFilter,
            name: 'ΔP'
          }
        ]
      }
    ],
    // Add labels
    graphic: [
      {
        type: 'text',
        left: '50%',
        top: '85%',
        style: {
          text: getHealthLabel(healthScore),
          fontSize: 18,
          fontWeight: 'bold',
          fill: getHealthColor(healthScore),
          textAlign: 'center'
        }
      },
      {
        type: 'text',
        left: '50%',
        top: '92%',
        style: {
          text: `Troca sugerida em ${daysUntilChange} dias`,
          fontSize: 12,
          fill: '#666',
          textAlign: 'center'
        }
      },
      {
        type: 'text',
        left: '30%',
        top: '45%',
        style: {
          text: `ΔP: ${dpFilter.toFixed(0)} Pa`,
          fontSize: 11,
          fill: '#076A75',
          textAlign: 'center',
          fontWeight: 'bold'
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