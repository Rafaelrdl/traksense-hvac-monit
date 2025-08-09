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
        radius: '80%',
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
          width: 20,
          itemStyle: {
            color: getHealthColor(safeHealthScore),
            shadowBlur: 10,
            shadowColor: `${getHealthColor(safeHealthScore)}40`
          }
        },
        pointer: {
          show: false
        },
        axisLine: {
          lineStyle: {
            width: 20,
            color: [
              [0.6, 'rgba(224, 90, 71, 0.15)'],
              [0.8, 'rgba(245, 195, 77, 0.15)'],
              [1, 'rgba(46, 139, 87, 0.15)']
            ]
          }
        },
        axisTick: {
          distance: -35,
          splitNumber: 5,
          lineStyle: {
            width: 1,
            color: '#999'
          }
        },
        axisLabel: {
          distance: -20,
          color: '#666',
          fontSize: 11,
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
      }
    ],
    graphic: [
      // Background circle for main content
      {
        type: 'circle',
        left: '50%',
        top: '55%',
        shape: {
          cx: 0,
          cy: 0,
          r: 65
        },
        style: {
          fill: 'rgba(255, 255, 255, 0.95)',
          stroke: 'rgba(7, 106, 117, 0.08)',
          lineWidth: 1,
          shadowBlur: 12,
          shadowColor: 'rgba(0, 0, 0, 0.08)'
        }
      },
      // Main score display
      {
        type: 'text',
        left: '50%',
        top: '48%',
        style: {
          text: `${safeHealthScore.toFixed(0)}`,
          fontSize: 32,
          fontWeight: 'bold',
          fill: getHealthColor(safeHealthScore),
          textAlign: 'center',
          fontFamily: 'Inter'
        }
      },
      // Score denominator
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
          fontSize: 13,
          fill: getHealthColor(safeHealthScore),
          textAlign: 'center',
          fontWeight: '600',
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
          fill: '#999',
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