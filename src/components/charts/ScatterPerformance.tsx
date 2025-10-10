import React, { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { TelemetryPoint } from '../../types/hvac';

interface ScatterPerformanceProps {
  data: Array<{
    assetId: string;
    assetTag: string;
    powerKw: number;
    thermalLoad: number; // estimated
    eer?: number;
  }>;
  height?: number;
}

export const ScatterPerformance: React.FC<ScatterPerformanceProps> = ({ data, height = 300 }) => {
  // Validate data
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <div 
        className="flex items-center justify-center text-muted-foreground bg-muted/20 rounded-lg"
        style={{ height }}
      >
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p>Carregando dados de performance...</p>
        </div>
      </div>
    );
  }

  // Filter out invalid data points
  const validData = data.filter(point => 
    point && 
    typeof point.powerKw === 'number' && 
    typeof point.thermalLoad === 'number' &&
    !isNaN(point.powerKw) && 
    !isNaN(point.thermalLoad) &&
    point.powerKw > 0 && 
    point.thermalLoad > 0
  );

  if (validData.length === 0) {
    return (
      <div 
        className="flex items-center justify-center text-muted-foreground"
        style={{ height }}
      >
        <p>Dados insuficientes para análise de performance</p>
      </div>
    );
  }

  // Calculate regression line
  const calculateRegression = useMemo(() => {
    if (validData.length < 2) return null;

    const n = validData.length;
    const sumX = validData.reduce((sum, point) => sum + point.thermalLoad, 0);
    const sumY = validData.reduce((sum, point) => sum + point.powerKw, 0);
    const sumXY = validData.reduce((sum, point) => sum + point.thermalLoad * point.powerKw, 0);
    const sumXX = validData.reduce((sum, point) => sum + point.thermalLoad * point.thermalLoad, 0);

    const denominator = n * sumXX - sumX * sumX;
    if (Math.abs(denominator) < 1e-10) return null; // Avoid division by zero

    const slope = (n * sumXY - sumX * sumY) / denominator;
    const intercept = (sumY - slope * sumX) / n;

    return { slope, intercept };
  }, [validData]);

  const scatterData = validData.map(point => [
    point.thermalLoad,
    point.powerKw,
    point.assetTag || 'Unknown',
    point.eer || (point.thermalLoad / point.powerKw) * 3.412 // Convert to EER if not provided
  ]);

  // Create regression line data
  const regressionData = calculateRegression ? 
    validData.map(point => [
      point.thermalLoad,
      calculateRegression.slope * point.thermalLoad + calculateRegression.intercept
    ]).sort((a, b) => a[0] - b[0]) : [];

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => {
        if (params.seriesName === 'Regressão') {
          return `<strong>Linha de Tendência</strong><br/>
                  Carga: ${params.data[0].toFixed(1)} kW<br/>
                  Potência: ${params.data[1].toFixed(1)} kW`;
        }
        
        const [thermalLoad, powerKw, assetTag, eer] = params.data;
        return `<strong>${assetTag}</strong><br/>
                Carga Térmica: ${thermalLoad.toFixed(1)} kW<br/>
                Potência Elétrica: ${powerKw.toFixed(1)} kW<br/>
                EER Estimado: ${eer.toFixed(2)}`;
      }
    },
    legend: {
      data: ['Ativos', 'Regressão'],
      top: 10
    },
    grid: {
      left: '10%',
      right: '5%',
      bottom: '15%',
      top: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'value',
      name: 'Carga Térmica Estimada (kW)',
      nameLocation: 'middle',
      nameGap: 30,
      axisLabel: {
        formatter: '{value} kW'
      }
    },
    yAxis: {
      type: 'value',
      name: 'Potência Elétrica (kW)',
      nameLocation: 'middle',
      nameGap: 50,
      axisLabel: {
        formatter: '{value} kW'
      }
    },
    series: [
      {
        name: 'Ativos',
        type: 'scatter',
        data: scatterData,
        symbolSize: (data: any) => {
          const eer = data[3];
          // Larger symbols for better efficiency
          return Math.max(8, Math.min(20, eer * 3));
        },
        itemStyle: {
          color: (params: any) => {
            const eer = params.data[3];
            // Color code by efficiency
            if (eer > 12) return '#2E8B57'; // High efficiency - Green
            if (eer > 10) return '#F5C34D'; // Medium efficiency - Amber
            return '#E05A47'; // Low efficiency - Red
          },
          opacity: 0.8
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 20,
            shadowColor: 'rgba(0, 0, 0, 0.3)'
          }
        }
      },
      ...(regressionData.length > 1 ? [{
        name: 'Regressão',
        type: 'line',
        data: regressionData,
        lineStyle: {
          color: '#93BDC2',
          type: 'dashed',
          width: 2
        },
        symbol: 'none',
        itemStyle: {
          color: '#93BDC2'
        },
        z: 1
      }] : [])
    ],
    // Add efficiency legend
    graphic: [
      {
        type: 'group',
        left: '75%',
        top: '20%',
        children: [
          {
            type: 'text',
            style: {
              text: 'Eficiência (EER)',
              fontSize: 12,
              fontWeight: 'bold',
              fill: '#333'
            }
          },
          {
            type: 'circle',
            top: 20,
            style: {
              r: 5,
              fill: '#2E8B57'
            }
          },
          {
            type: 'text',
            left: 15,
            top: 17,
            style: {
              text: 'Alta (>12)',
              fontSize: 10,
              fill: '#666'
            }
          },
          {
            type: 'circle',
            top: 35,
            style: {
              r: 5,
              fill: '#F5C34D'
            }
          },
          {
            type: 'text',
            left: 15,
            top: 32,
            style: {
              text: 'Média (10-12)',
              fontSize: 10,
              fill: '#666'
            }
          },
          {
            type: 'circle',
            top: 50,
            style: {
              r: 5,
              fill: '#E05A47'
            }
          },
          {
            type: 'text',
            left: 15,
            top: 47,
            style: {
              text: 'Baixa (<10)',
              fontSize: 10,
              fill: '#666'
            }
          }
        ]
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
    console.error('Error rendering ScatterPerformance:', error);
    return (
      <div 
        className="flex items-center justify-center text-muted-foreground bg-muted/10 rounded-lg border border-dashed border-muted"
        style={{ height }}
      >
        <div className="text-center">
          <div className="text-sm">Erro ao renderizar gráfico de performance</div>
        </div>
      </div>
    );
  }
};