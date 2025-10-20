import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  TooltipProps,
} from 'recharts';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { TimeSeriesPoint } from '@/types/telemetry';
import { getSensorMetadata } from '@/types/telemetry';

// ===========================
// SENSOR TYPE DEFINITION
// ===========================

/**
 * Tipos de sensores suportados.
 * Deve corresponder aos tipos definidos em SENSOR_METADATA.
 */
export type SensorType = 
  | 'temp_supply' 
  | 'temp_return' 
  | 'temp_ambient' 
  | 'temp_evaporator'
  | 'temp_condenser'
  | 'pressure_evap'
  | 'pressure_cond'
  | 'flow_water'
  | 'flow_refrigerant'
  | 'power_consumption'
  | 'current'
  | 'voltage'
  | 'frequency'
  | 'cop'
  | 'efficiency';

/**
 * Ponto de dados do gráfico (simplificado).
 * Usa apenas 'value' para facilitar uso.
 */
export interface ChartDataPoint {
  timestamp: number | Date; // Timestamp em ms ou Date object
  value: number; // Valor a ser plotado
}

/**
 * FASE 3 - DIA 6: TelemetryChart Component
 * 
 * Componente para visualização de dados de telemetria com Recharts.
 * Suporta múltiplos tipos de gráficos (line, bar, area) e configurações flexíveis.
 */

// ===========================
// TYPES & INTERFACES
// ===========================

export type ChartType = 'line' | 'bar' | 'area';
export type TimeRange = '1h' | '6h' | '24h' | '7d' | '30d';

export interface TelemetryChartProps {
  /** Dados de série temporal para exibição */
  data: ChartDataPoint[];
  
  /** Tipo de gráfico a ser renderizado */
  chartType?: ChartType;
  
  /** Tipo de sensor (para metadata e estilo) */
  sensorType?: SensorType;
  
  /** Nome customizado para série (sobrescreve metadata) */
  seriesName?: string;
  
  /** Cor customizada para série (sobrescreve metadata) */
  seriesColor?: string;
  
  /** Altura do gráfico em pixels */
  height?: number;
  
  /** Exibir grid de fundo */
  showGrid?: boolean;
  
  /** Exibir legenda */
  showLegend?: boolean;
  
  /** Exibir tooltip */
  showTooltip?: boolean;
  
  /** Formato de data no eixo X */
  dateFormat?: string;
  
  /** Formato de data no tooltip */
  tooltipDateFormat?: string;
  
  /** Unidade customizada (sobrescreve metadata) */
  unit?: string;
  
  /** Classe CSS adicional */
  className?: string;
  
  /** Callback ao clicar em um ponto */
  onPointClick?: (point: ChartDataPoint) => void;
}

export interface MultiSeriesChartProps extends Omit<TelemetryChartProps, 'data' | 'sensorType' | 'seriesName' | 'seriesColor' | 'unit'> {
  /** Múltiplas séries de dados */
  series: Array<{
    id: string;
    data: ChartDataPoint[];
    sensorType?: SensorType;
    name: string;
    color: string;
    unit?: string;
  }>;
}

// ===========================
// HELPER FUNCTIONS
// ===========================

/**
 * Formata timestamp para exibição no eixo X.
 * Auto-ajusta formato baseado no range de tempo.
 */
const formatXAxisDate = (timestamp: number, dateFormat?: string): string => {
  if (dateFormat) {
    return format(new Date(timestamp), dateFormat, { locale: ptBR });
  }
  
  // Auto-detecção de formato baseado no range
  const date = new Date(timestamp);
  const now = new Date();
  const diffHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
  
  if (diffHours < 24) {
    return format(date, 'HH:mm', { locale: ptBR });
  } else if (diffHours < 168) { // 7 dias
    return format(date, 'dd/MM HH:mm', { locale: ptBR });
  } else {
    return format(date, 'dd/MM', { locale: ptBR });
  }
};

/**
 * Formata valor numérico com unidade.
 */
const formatValue = (value: number, unit?: string): string => {
  const formattedValue = typeof value === 'number' ? value.toFixed(2) : value;
  return unit ? `${formattedValue} ${unit}` : formattedValue;
};

// ===========================
// CUSTOM TOOLTIP
// ===========================

interface CustomTooltipProps extends TooltipProps<number, string> {
  unit?: string;
  tooltipDateFormat?: string;
  seriesName?: string;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ 
  active, 
  payload, 
  label,
  unit,
  tooltipDateFormat = 'dd/MM/yyyy HH:mm:ss',
  seriesName 
}) => {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const data = payload[0];
  const value = data.value as number;
  const timestamp = label as number;

  return (
    <div className="bg-background/95 backdrop-blur-sm border border-border rounded-lg shadow-lg p-3">
      <p className="text-xs text-muted-foreground mb-2">
        {format(new Date(timestamp), tooltipDateFormat, { locale: ptBR })}
      </p>
      <p className="text-sm font-medium" style={{ color: data.color }}>
        {seriesName || data.name}: <span className="font-bold">{formatValue(value, unit)}</span>
      </p>
    </div>
  );
};

// ===========================
// SINGLE SERIES CHART
// ===========================

/**
 * TelemetryChart - Gráfico de telemetria para uma única série.
 */
export const TelemetryChart: React.FC<TelemetryChartProps> = ({
  data,
  chartType = 'line',
  sensorType,
  seriesName,
  seriesColor,
  height = 300,
  showGrid = true,
  showLegend = true,
  showTooltip = true,
  dateFormat,
  tooltipDateFormat,
  unit,
  className = '',
  onPointClick,
}) => {
  // Obter metadata do sensor se tipo fornecido
  const metadata = useMemo(() => {
    return sensorType ? getSensorMetadata(sensorType) : null;
  }, [sensorType]);

  // Determinar nome e cor da série
  const finalSeriesName = seriesName || metadata?.displayName || 'Valor';
  const finalSeriesColor = seriesColor || metadata?.color || '#3b82f6';
  const finalUnit = unit || metadata?.unit || '';

  // Preparar dados para Recharts (timestamp como número)
  const chartData = useMemo(() => {
    return data.map(point => {
      // Converter timestamp para number (ms)
      let timestampMs: number;
      if (point.timestamp instanceof Date) {
        timestampMs = point.timestamp.getTime();
      } else if (typeof point.timestamp === 'string') {
        timestampMs = new Date(point.timestamp).getTime();
      } else {
        timestampMs = point.timestamp as number;
      }
      
      return {
        timestamp: timestampMs,
        value: point.value,
      };
    });
  }, [data]);

  // Renderizar gráfico vazio se sem dados
  if (chartData.length === 0) {
    return (
      <div className={`flex items-center justify-center ${className}`} style={{ height }}>
        <p className="text-muted-foreground text-sm">Nenhum dado disponível</p>
      </div>
    );
  }

  // Renderizar chart baseado no tipo (conditional rendering para evitar erro de tipo)
  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={height}>
        {chartType === 'bar' ? (
          <BarChart
            data={chartData}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            onClick={(e) => {
              if (e && e.activePayload && e.activePayload[0] && onPointClick) {
                const payload = e.activePayload[0].payload;
                onPointClick({
                  timestamp: payload.timestamp,
                  value: payload.value,
                });
              }
            }}
          >
            {showGrid && <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />}
            
            <XAxis
              dataKey="timestamp"
              type="number"
              domain={['dataMin', 'dataMax']}
              tickFormatter={(timestamp) => formatXAxisDate(timestamp, dateFormat)}
              className="text-xs"
              stroke="currentColor"
            />
            
            <YAxis
              className="text-xs"
              stroke="currentColor"
              tickFormatter={(value) => formatValue(value, finalUnit)}
            />
            
            {showTooltip && (
              <Tooltip
                content={
                  <CustomTooltip
                    unit={finalUnit}
                    tooltipDateFormat={tooltipDateFormat}
                    seriesName={finalSeriesName}
                  />
                }
              />
            )}
            
            {showLegend && <Legend />}
            
            <Bar
              dataKey="value"
              name={finalSeriesName}
              fill={finalSeriesColor}
            />
          </BarChart>
        ) : chartType === 'area' ? (
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            onClick={(e) => {
              if (e && e.activePayload && e.activePayload[0] && onPointClick) {
                const payload = e.activePayload[0].payload;
                onPointClick({
                  timestamp: payload.timestamp,
                  value: payload.value,
                });
              }
            }}
          >
            {showGrid && <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />}
            
            <XAxis
              dataKey="timestamp"
              type="number"
              domain={['dataMin', 'dataMax']}
              tickFormatter={(timestamp) => formatXAxisDate(timestamp, dateFormat)}
              className="text-xs"
              stroke="currentColor"
            />
            
            <YAxis
              className="text-xs"
              stroke="currentColor"
              tickFormatter={(value) => formatValue(value, finalUnit)}
            />
            
            {showTooltip && (
              <Tooltip
                content={
                  <CustomTooltip
                    unit={finalUnit}
                    tooltipDateFormat={tooltipDateFormat}
                    seriesName={finalSeriesName}
                  />
                }
              />
            )}
            
            {showLegend && <Legend />}
            
            <Area
              type="monotone"
              dataKey="value"
              name={finalSeriesName}
              stroke={finalSeriesColor}
              fill={finalSeriesColor}
              fillOpacity={0.3}
              strokeWidth={2}
            />
          </AreaChart>
        ) : (
          <LineChart
            data={chartData}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            onClick={(e) => {
              if (e && e.activePayload && e.activePayload[0] && onPointClick) {
                const payload = e.activePayload[0].payload;
                onPointClick({
                  timestamp: payload.timestamp,
                  value: payload.value,
                });
              }
            }}
          >
            {showGrid && <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />}
            
            <XAxis
              dataKey="timestamp"
              type="number"
              domain={['dataMin', 'dataMax']}
              tickFormatter={(timestamp) => formatXAxisDate(timestamp, dateFormat)}
              className="text-xs"
              stroke="currentColor"
            />
            
            <YAxis
              className="text-xs"
              stroke="currentColor"
              tickFormatter={(value) => formatValue(value, finalUnit)}
            />
            
            {showTooltip && (
              <Tooltip
                content={
                  <CustomTooltip
                    unit={finalUnit}
                    tooltipDateFormat={tooltipDateFormat}
                    seriesName={finalSeriesName}
                  />
                }
              />
            )}
            
            {showLegend && <Legend />}
            
            <Line
              type="monotone"
              dataKey="value"
              name={finalSeriesName}
              stroke={finalSeriesColor}
              strokeWidth={2}
              dot={chartData.length < 50}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        )}
      </ResponsiveContainer>
    </div>
  );
};

// ===========================
// MULTI SERIES CHART
// ===========================

/**
 * MultiSeriesTelemetryChart - Gráfico de telemetria para múltiplas séries.
 * Útil para comparar múltiplos sensores no mesmo gráfico.
 */
export const MultiSeriesTelemetryChart: React.FC<MultiSeriesChartProps> = ({
  series,
  chartType = 'line',
  height = 300,
  showGrid = true,
  showLegend = true,
  showTooltip = true,
  dateFormat,
  tooltipDateFormat,
  className = '',
  onPointClick,
}) => {
  // Combinar todos os dados em um único array com timestamps unificados
  const chartData = useMemo(() => {
    // Criar mapa de timestamp -> valores
    const timestampMap = new Map<number, Record<string, number>>();
    
    series.forEach((s) => {
      s.data.forEach((point) => {
        // Converter timestamp para number (ms)
        let timestampMs: number;
        if (point.timestamp instanceof Date) {
          timestampMs = point.timestamp.getTime();
        } else if (typeof point.timestamp === 'string') {
          timestampMs = new Date(point.timestamp).getTime();
        } else {
          timestampMs = point.timestamp as number;
        }
        
        if (!timestampMap.has(timestampMs)) {
          timestampMap.set(timestampMs, {});
        }
        
        const values = timestampMap.get(timestampMs)!;
        values[s.id] = point.value;
      });
    });
    
    // Converter para array ordenado
    const sortedData = Array.from(timestampMap.entries())
      .map(([timestamp, values]) => ({
        timestamp,
        ...values,
      }))
      .sort((a, b) => a.timestamp - b.timestamp);
    
    return sortedData;
  }, [series]);

  // Renderizar gráfico vazio se sem dados
  if (chartData.length === 0) {
    return (
      <div className={`flex items-center justify-center ${className}`} style={{ height }}>
        <p className="text-muted-foreground text-sm">Nenhum dado disponível</p>
      </div>
    );
  }

  // Renderizar chart baseado no tipo (conditional rendering para evitar erro de tipo)
  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={height}>
        {chartType === 'bar' ? (
          <BarChart
            data={chartData}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            {showGrid && <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />}
            
            <XAxis
              dataKey="timestamp"
              type="number"
              domain={['dataMin', 'dataMax']}
              tickFormatter={(timestamp) => formatXAxisDate(timestamp, dateFormat)}
              className="text-xs"
              stroke="currentColor"
            />
            
            <YAxis
              className="text-xs"
              stroke="currentColor"
            />
            
            {showTooltip && <Tooltip />}
            
            {showLegend && <Legend />}
            
            {series.map((s) => (
              <Bar
                key={s.id}
                dataKey={s.id}
                name={s.name}
                fill={s.color}
              />
            ))}
          </BarChart>
        ) : chartType === 'area' ? (
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            {showGrid && <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />}
            
            <XAxis
              dataKey="timestamp"
              type="number"
              domain={['dataMin', 'dataMax']}
              tickFormatter={(timestamp) => formatXAxisDate(timestamp, dateFormat)}
              className="text-xs"
              stroke="currentColor"
            />
            
            <YAxis
              className="text-xs"
              stroke="currentColor"
            />
            
            {showTooltip && <Tooltip />}
            
            {showLegend && <Legend />}
            
            {series.map((s) => (
              <Area
                key={s.id}
                type="monotone"
                dataKey={s.id}
                name={s.name}
                stroke={s.color}
                fill={s.color}
                fillOpacity={0.3}
                strokeWidth={2}
              />
            ))}
          </AreaChart>
        ) : (
          <LineChart
            data={chartData}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            {showGrid && <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />}
            
            <XAxis
              dataKey="timestamp"
              type="number"
              domain={['dataMin', 'dataMax']}
              tickFormatter={(timestamp) => formatXAxisDate(timestamp, dateFormat)}
              className="text-xs"
              stroke="currentColor"
            />
            
            <YAxis
              className="text-xs"
              stroke="currentColor"
            />
            
            {showTooltip && <Tooltip />}
            
            {showLegend && <Legend />}
            
            {series.map((s) => (
              <Line
                key={s.id}
                type="monotone"
                dataKey={s.id}
                name={s.name}
                stroke={s.color}
                strokeWidth={2}
                dot={chartData.length < 50}
                activeDot={{ r: 6 }}
              />
            ))}
          </LineChart>
        )}
      </ResponsiveContainer>
    </div>
  );
};

// ===========================
// PRESET CHARTS
// ===========================

/**
 * TemperatureChart - Preset para gráfico de temperatura.
 */
export const TemperatureChart: React.FC<Omit<TelemetryChartProps, 'sensorType'>> = (props) => {
  return (
    <TelemetryChart
      {...props}
      sensorType="temp_supply"
      chartType="line"
    />
  );
};

/**
 * PowerChart - Preset para gráfico de potência.
 */
export const PowerChart: React.FC<Omit<TelemetryChartProps, 'sensorType'>> = (props) => {
  return (
    <TelemetryChart
      {...props}
      sensorType="power_consumption"
      chartType="bar"
    />
  );
};

/**
 * PressureChart - Preset para gráfico de pressão.
 */
export const PressureChart: React.FC<Omit<TelemetryChartProps, 'sensorType'>> = (props) => {
  return (
    <TelemetryChart
      {...props}
      sensorType="pressure_evap"
      chartType="area"
    />
  );
};

// Export default
export default TelemetryChart;
