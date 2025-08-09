import React from 'react';
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
  const formatTime = (timestamp: Date) => {
    return timestamp.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (timestamp: Date) => {
    return timestamp.toLocaleDateString('pt-BR', {
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
        const time = formatDate(new Date(params[0].axisValue));
        let content = `<strong>${time}</strong><br/>`;
        params.forEach((param: any) => {
          const value = param.value[1];
          const change = param.seriesIndex > 0 ? 
            ((value - params[param.seriesIndex - 1]?.value[1]) || 0).toFixed(1) : '0.0';
          content += `${param.marker} ${param.seriesName}: ${value.toFixed(1)}°C `;
          if (param.seriesIndex > 0) content += `(${change > 0 ? '+' : ''}${change}°C)<br/>`;
          else content += '<br/>';
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
        data: data.supply.map(point => [point.timestamp, point.value]),
        smooth: 0.3,
        lineStyle: { width: 2, color: '#076A75' },
        itemStyle: { color: '#076A75' },
        symbol: 'none'
      },
      {
        name: 'Retorno',
        type: 'line',
        data: data.return.map(point => [point.timestamp, point.value]),
        smooth: 0.3,
        lineStyle: { width: 2, color: '#2E868F' },
        itemStyle: { color: '#2E868F' },
        symbol: 'none'
      },
      {
        name: 'Setpoint',
        type: 'line',
        data: data.setpoint.map(point => [point.timestamp, point.value]),
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

  return (
    <ReactECharts 
      option={option} 
      style={{ height, width: '100%' }}
      opts={{ renderer: 'svg' }}
    />
  );
};