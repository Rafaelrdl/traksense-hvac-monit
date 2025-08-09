import React, { useEffect, useState } from 'react';
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
  const [isReady, setIsReady] = useState(false);

  // Small delay to ensure DOM is ready
  useEffect(() => {
    const timer = setTimeout(() => setIsReady(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Validate input parameters
  if (!isReady || typeof healthScore !== 'number' || isNaN(healthScore) ||
      typeof dpFilter !== 'number' || isNaN(dpFilter) ||
      typeof daysUntilChange !== 'number' || isNaN(daysUntilChange)) {
    return (
      <div 
        className="flex items-center justify-center text-muted-foreground bg-muted/20 rounded-lg"
        style={{ height }}
      >
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p>Carregando dados do filtro...</p>
        </div>
      </div>
    );
  }

  // Clamp values to safe ranges
  const safeHealthScore = Math.max(0, Math.min(100, healthScore));
  const safeDpFilter = Math.max(0, Math.min(500, dpFilter));
  const safeDaysUntilChange = Math.max(0, Math.min(365, daysUntilChange));

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
                Score: ${safeHealthScore.toFixed(0)}/100<br/>
                ΔP Atual: ${safeDpFilter.toFixed(1)} Pa<br/>
                Status: ${getHealthLabel(safeHealthScore)}<br/>
                Troca sugerida em: ${safeDaysUntilChange} dias`;
      }
    },
    series: [
      {
        name: 'Saúde do Filtro',
        type: 'gauge',
        center: ['50%', '55%'],
        radius: '75%',
        startAngle: 200,
        endAngle: -20,
        min: 0,
        max: 100,
        splitNumber: 10,
        itemStyle: {
          color: getHealthColor(safeHealthScore)
        },
        progress: {
          show: true,
          width: 18,
          itemStyle: {
            color: getHealthColor(safeHealthScore)
          }
        },
        pointer: {
          show: false
        },
        axisLine: {
          lineStyle: {
            width: 18,
            color: [
              [0.6, 'rgba(224, 90, 71, 0.2)'],
              [0.8, 'rgba(245, 195, 77, 0.2)'],
              [1, 'rgba(46, 139, 87, 0.2)']
            ]
          }
        },
        axisTick: {
          distance: -32,
          splitNumber: 5,
          lineStyle: {
            width: 1,
            color: '#999'
          }
        },
        axisLabel: {
          distance: -18,
          color: '#666',
          fontSize: 10,
          fontWeight: '500'
        },
        anchor: {
          show: false
        },
        title: {
          show: false
        },
        detail: {
          show: false
        },
        data: [
          {
            value: safeHealthScore,
            name: 'Score'
          }
        ]
      },
      // Inner gauge for ΔP reading
      {
        name: 'Delta P',
        type: 'gauge',
        center: ['50%', '55%'],
        radius: '50%',
        startAngle: 200,
        endAngle: -20,
        min: 0,
        max: 400,
        splitNumber: 4,
        axisLine: {
          lineStyle: {
            width: 4,
            color: [
              [0.625, 'rgba(46, 139, 87, 0.3)'], // 0-250 Pa
              [0.75, 'rgba(245, 195, 77, 0.3)'],  // 250-300 Pa
              [1, 'rgba(224, 90, 71, 0.3)']      // 300-400 Pa
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
          width: 2,
          length: '65%',
          itemStyle: {
            color: '#076A75',
            shadowBlur: 4,
            shadowColor: 'rgba(7, 106, 117, 0.3)'
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
            value: safeDpFilter,
            name: 'ΔP'
          }
        ]
      }
    ],
    // Add custom graphics for better layout
    graphic: [
      // Background circle for main score
      {
        type: 'circle',
        left: '50%',
        top: '55%',
        shape: {
          cx: 0,
          cy: 0,
          r: 50
        },
        style: {
          fill: 'rgba(255, 255, 255, 0.9)',
          stroke: 'rgba(7, 106, 117, 0.1)',
          lineWidth: 1,
          shadowBlur: 8,
          shadowColor: 'rgba(0, 0, 0, 0.1)'
        }
      },
      // Main score display
      {
        type: 'text',
        left: '50%',
        top: '48%',
        style: {
          text: `${safeHealthScore.toFixed(0)}`,
          fontSize: 28,
          fontWeight: 'bold',
          fill: getHealthColor(safeHealthScore),
          textAlign: 'center',
          fontFamily: 'Inter'
        }
      },
      {
        type: 'text',
        left: '50%',
        top: '56%',
        style: {
          text: '/100',
          fontSize: 14,
          fill: '#999',
          textAlign: 'center',
          fontFamily: 'Inter'
        }
      },
      // Status label
      {
        type: 'text',
        left: '50%',
        top: '64%',
        style: {
          text: getHealthLabel(safeHealthScore),
          fontSize: 14,
          fontWeight: '600',
          fill: getHealthColor(safeHealthScore),
          textAlign: 'center',
          fontFamily: 'Inter'
        }
      },
      // ΔP reading
      {
        type: 'text',
        left: '50%',
        top: '82%',
        style: {
          text: `ΔP: ${safeDpFilter.toFixed(0)} Pa`,
          fontSize: 12,
          fill: '#076A75',
          textAlign: 'center',
          fontWeight: '500',
          fontFamily: 'Inter'
        }
      },
      // Days until change
      {
        type: 'text',
        left: '50%',
        top: '88%',
        style: {
          text: `Troca sugerida em ${safeDaysUntilChange} dias`,
          fontSize: 11,
          fill: '#666',
          textAlign: 'center',
          fontFamily: 'Inter'
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
    console.error('Error rendering GaugeFilterHealth:', error);
    return (
      <div 
        className="flex items-center justify-center text-muted-foreground bg-muted/10 rounded-lg border border-dashed border-muted"
        style={{ height }}
      >
        <div className="text-center">
          <div className="text-sm">Erro ao renderizar gauge de saúde do filtro</div>
        </div>
      </div>
    );
  }
};