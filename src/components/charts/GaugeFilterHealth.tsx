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
      // Background circle for main content
      // Background circle for main content
      {circle',
        type: 'circle',
        left: '50%',
        shape: {
        shape: {
          cy: 0,
          cy: 0,
          r: 65
        style: {
        style: { 255, 0.95)',
          fill: 'rgba(255, 255, 255, 0.95)',
          shadowColor: 'rgba(0, 0, 0, 0.08)'
      {
          shadowBlur: 12,
          shadowColor: 'rgba(0, 0, 0, 0.08)'
        top: '48%',
        style: {
      // Main score display0)}`,
      {
        type: 'text',
        left: '50%',lor(safeHealthScore),
          textAlign: 'center',
        style: {ter'
        }
          fontSize: 32,
          fontWeight: 'bold',
          fill: getHealthColor(safeHealthScore),
        type: 'text',
        left: '50%',
        }
        style: {
      // Score denominator
          fontSize: 14,
        type: 'text',
        left: '50%',
          fontFamily: 'Inter'
        style: {
      },
      // Status label
      {
        left: '50%',
          fontFamily: 'Inter'
        }
          text: getHealthLabel(safeHealthScore),
          fontSize: 13,
          fill: getHealthColor(safeHealthScore),
        type: 'text',',
          fontWeight: '600',
        top: '64%',
        style: {
      },
      // ΔP reading
      {
          textAlign: 'center',
          fontWeight: '600',
        top: '82%',
        style: {
          text: `ΔP: ${safeDpFilter.toFixed(0)} Pa`,
      // ΔP reading
      {
          textAlign: 'center',
          fontFamily: 'Inter'
        top: '82%',
        style: {
          text: `ΔP: ${safeDpFilter.toFixed(0)} Pa`,
          fontSize: 12,
          fill: '#076A75',
        left: '50%',
          fontFamily: 'Inter'
        }
      },
          fontSize: 11,
          fill: '#999',
          textAlign: 'center',
          fontFamily: 'Inter'
        }
  };

  try {
    return (
      <div style={{ height, width: '100%' }}>
        <ReactECharts 
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
      >
        <div className="text-center">
          <div className="text-sm">Erro ao renderizar gauge de saúde do filtro</div>
  } catch (error) {
    console.error('Error rendering GaugeFilterHealth:', error);
    );
  }
};          <div className="text-sm">Erro ao renderizar gauge de saúde do filtro</div>        </div>      </div>    );  }};