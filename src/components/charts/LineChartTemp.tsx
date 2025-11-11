import React, { useEffect, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import { TelemetryPoint } from '../../types/hvac';

interface LineChartTempProps {
  data: {
    supply: TelemetryPoint[];
    return: TelemetryPoint[];
    setpoint: TelemetryPoint[];
  };
  height?: number;
}

export const LineChartTemp: React.FC<LineChartTempProps> = ({ data, height = 300 }) => {
  const [isReady, setIsReady] = useState(false);

  // Small delay to ensure DOM is ready
  useEffect(() => {
    const timer = setTimeout(() => setIsReady(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Validate data availability
  if (!isReady || !data || !data.supply || !data.return || !data.setpoint) {
    return (
      <div 
        className="flex items-center justify-center text-muted-foreground bg-muted/20 rounded-lg"
        style={{ height }}
      >
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p>Carregando dados de temperatura...</p>
        </div>
      </div>
    );
  }

  // Check if data arrays have content
  const hasData = data.supply.length > 0 || data.return.length > 0 || data.setpoint.length > 0;
  
  if (!hasData) {
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

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross' },
      formatter: (params: any) => {
        if (!params || !params[0]) return '';
        const time = formatDate(new Date(params[0].axisValue));
        const dataIndex = params[0].dataIndex; // Índice do ponto atual
        let content = `<strong>${time}</strong><br/>`;
        
        params.forEach((param: any) => {
          const value = param.value?.[1];
          if (typeof value === 'number') {
            // � FIX #13: Access full series data for previous value calculation
            // Previously: Used param.data[dataIndex - 1] but param.data is just current tuple
            // Now: Access full series array from option.series
            const seriesData = option.series[param.seriesIndex]?.data;
            const prevValue = dataIndex > 0 && seriesData?.[dataIndex - 1]?.[1];
            const hasPrevValue = typeof prevValue === 'number';
            const change = hasPrevValue ? (value - prevValue).toFixed(1) : '0.0';
            const changeNum = parseFloat(change);
            
            content += `${param.marker} ${param.seriesName}: ${value.toFixed(1)}°C `;
            if (hasPrevValue) {
              content += `(${changeNum > 0 ? '+' : ''}${change}°C)<br/>`;
            } else {
              content += '<br/>';
            }
          }
        });
        return content;
      }
    },
    legend: {
      data: ['Insuflamento', 'Retorno', 'Setpoint'],
      top: 10
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '10%',
      top: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'time',
      axisLabel: {
        formatter: formatTime
      }
    },
    yAxis: {
      type: 'value',
      name: 'Temperatura (°C)',
      axisLabel: {
        formatter: '{value}°C'
      },
      min: 10,
      max: 35
    },
    series: [
      {
        name: 'Insuflamento',
        type: 'line',
        data: data.supply?.filter(point => point && point.timestamp).map(point => [
          point.timestamp instanceof Date ? point.timestamp : new Date(point.timestamp), 
          point.value
        ]) || [],
        smooth: 0.3,
        lineStyle: { width: 2, color: '#076A75' },
        itemStyle: { color: '#076A75' },
        symbol: 'none'
      },
      {
        name: 'Retorno',
        type: 'line',
        data: data.return?.filter(point => point && point.timestamp).map(point => [
          point.timestamp instanceof Date ? point.timestamp : new Date(point.timestamp), 
          point.value
        ]) || [],
        smooth: 0.3,
        lineStyle: { width: 2, color: '#2E868F' },
        itemStyle: { color: '#2E868F' },
        symbol: 'none'
      },
      {
        name: 'Setpoint',
        type: 'line',
        data: data.setpoint?.filter(point => point && point.timestamp).map(point => [
          point.timestamp instanceof Date ? point.timestamp : new Date(point.timestamp), 
          point.value
        ]) || [],
        lineStyle: { 
          width: 2, 
          type: 'dashed',
          color: '#93BDC2'
        },
        itemStyle: { color: '#93BDC2' },
        symbol: 'none'
      }
    ],
    // Comfort zone (21-24°C)
    graphic: [{
      type: 'rect',
      shape: {
        x: 0,
        y: 0,
        width: 0,
        height: 0
      },
      style: {
        fill: 'rgba(7, 106, 117, 0.1)',
        stroke: 'rgba(7, 106, 117, 0.3)',
        lineWidth: 1
      },
      // This would be dynamically positioned in a real implementation
      invisible: true
    }],
    dataZoom: [
      {
        type: 'inside',
        xAxisIndex: 0
      },
      {
        type: 'slider',
        xAxisIndex: 0,
        height: 20,
        bottom: 20
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
    console.error('Error rendering LineChartTemp:', error);
    return (
      <div 
        className="flex items-center justify-center text-muted-foreground bg-muted/10 rounded-lg border border-dashed border-muted"
        style={{ height }}
      >
        <div className="text-center">
          <div className="text-sm">Erro ao renderizar gráfico de temperatura</div>
        </div>
      </div>
    );
  }
};