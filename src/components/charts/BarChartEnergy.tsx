import React from 'react';
import ReactECharts from 'echarts-for-react';
import { TelemetryPoint } from '../../types/hvac';

interface BarChartEnergyProps {
  data: TelemetryPoint[];
  target?: number;
  height?: number;
}

export const BarChartEnergy: React.FC<BarChartEnergyProps> = ({ 
  data, 
  target = 2500, // Default daily target in kWh
  height = 300 
}) => {
  // Validate data
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <div 
        className="flex items-center justify-center text-muted-foreground bg-muted/20 rounded-lg"
        style={{ height }}
      >
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p>Carregando dados de consumo...</p>
        </div>
      </div>
    );
  }

  // Group data by hour and sum energy consumption
  const hourlyData = React.useMemo(() => {
    const hours: { [key: number]: number } = {};
    
    data.forEach(point => {
      if (point && point.timestamp && typeof point.value === 'number' && !isNaN(point.value)) {
        const timestamp = point.timestamp instanceof Date ? point.timestamp : new Date(point.timestamp);
        const hour = timestamp.getHours();
        hours[hour] = (hours[hour] || 0) + point.value;
      }
    });
    
    // Create array for all 24 hours
    return Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      value: hours[i] || 0,
      percentage: ((hours[i] || 0) / target * 100 * 24) // Rough percentage of daily target
    }));
  }, [data, target]);

  const totalConsumption = hourlyData.reduce((sum, item) => sum + item.value, 0);
  const targetPercentage = (totalConsumption / target * 100).toFixed(1);

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params: any) => {
        const param = params[0];
        const hour = param.dataIndex;
        const value = param.value;
        const percentage = hourlyData[hour]?.percentage.toFixed(1) || '0.0';
        return `<strong>${hour}:00 - ${(hour + 1) % 24}:00</strong><br/>
                Consumo: ${value.toFixed(1)} kWh<br/>
                % da Meta: ${percentage}%`;
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      top: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: hourlyData.map(item => `${item.hour.toString().padStart(2, '0')}:00`),
      axisLabel: {
        rotate: 45,
        interval: 1
      }
    },
    yAxis: {
      type: 'value',
      name: 'Energia (kWh)',
      axisLabel: {
        formatter: '{value} kWh'
      }
    },
    series: [
      {
        name: 'Consumo Horário',
        type: 'bar',
        data: hourlyData.map(item => item.value),
        itemStyle: {
          color: (params: any) => {
            const percentage = hourlyData[params.dataIndex]?.percentage || 0;
            if (percentage > 6) return '#E05A47'; // Above target per hour
            if (percentage > 4) return '#F5C34D'; // Warning level
            return '#076A75'; // Normal
          }
        },
        markLine: {
          data: [
            {
              name: 'Meta Diária',
              yAxis: target / 24, // Target per hour
              lineStyle: {
                color: '#93BDC2',
                type: 'dashed',
                width: 2
              },
              label: {
                formatter: `Meta: ${(target / 24).toFixed(0)} kWh/h`,
                position: 'end'
              }
            }
          ]
        }
      }
    ],
    // Add summary text
    graphic: [
      {
        type: 'text',
        left: '50%',
        top: '5%',
        style: {
          text: `Total Hoje: ${totalConsumption.toFixed(1)} kWh (${targetPercentage}% da meta)`,
          fontSize: 14,
          fontWeight: 'bold',
          fill: totalConsumption > target ? '#E05A47' : '#076A75',
          textAlign: 'center'
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
    console.error('Error rendering BarChartEnergy:', error);
    return (
      <div 
        className="flex items-center justify-center text-muted-foreground bg-muted/10 rounded-lg border border-dashed border-muted"
        style={{ height }}
      >
        <div className="text-center">
          <div className="text-sm">Erro ao renderizar gráfico de consumo</div>
        </div>
      </div>
    );
  }
};