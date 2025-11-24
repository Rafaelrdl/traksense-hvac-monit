import { useState, useEffect } from 'react';
import type { IoTParameter } from '@/types/equipment';

/**
 * Catálogo de parâmetros IoT por tipo de dispositivo
 * 
 * Este dicionário contém METADADOS (labels, unidades, variáveis) para UI,
 * não valores mockados. Os valores reais vêm da API/MQTT.
 * 
 * TODO: Migrar para API backend quando endpoint de metadados estiver disponível
 */
const IoT_PARAMETERS_DB: Record<string, IoTParameter[]> = {
  // AHU Parameters
  'iot-ahu-001': [
    {
      key: 'temp_supply',
      label: 'Temperatura de Insuflamento',
      unit: '°C',
      variables: [
        { key: 'current', label: 'Atual' },
        { key: 'avg', label: 'Média' },
        { key: 'min', label: 'Mínima' },
        { key: 'max', label: 'Máxima' },
      ],
    },
    {
      key: 'temp_return',
      label: 'Temperatura de Retorno',
      unit: '°C',
      variables: [
        { key: 'current', label: 'Atual' },
        { key: 'avg', label: 'Média' },
      ],
    },
    {
      key: 'dp_filter',
      label: 'ΔP Filtro',
      unit: 'Pa',
      variables: [
        { key: 'current', label: 'Atual' },
        { key: 'max', label: 'Máximo' },
      ],
    },
    {
      key: 'airflow',
      label: 'Vazão de Ar',
      unit: 'm³/h',
    },
    {
      key: 'humidity',
      label: 'Umidade',
      unit: '%',
      variables: [
        { key: 'current', label: 'Atual' },
        { key: 'avg', label: 'Média' },
      ],
    },
    {
      key: 'power_kw',
      label: 'Consumo de Energia',
      unit: 'kW',
      variables: [
        { key: 'current', label: 'Atual' },
        { key: 'avg', label: 'Média' },
        { key: 'max', label: 'Pico' },
      ],
    },
  ],
  'iot-ahu-002': [
    {
      key: 'temp_supply',
      label: 'Temperatura de Insuflamento',
      unit: '°C',
      variables: [
        { key: 'current', label: 'Atual' },
        { key: 'avg', label: 'Média' },
      ],
    },
    {
      key: 'dp_filter',
      label: 'ΔP Filtro',
      unit: 'Pa',
    },
    {
      key: 'power_kw',
      label: 'Consumo de Energia',
      unit: 'kW',
    },
  ],

  // Chiller Parameters
  'iot-chiller-001': [
    {
      key: 'temp_supply',
      label: 'Temperatura da Água Gelada (Saída)',
      unit: '°C',
      variables: [
        { key: 'current', label: 'Atual' },
        { key: 'avg', label: 'Média' },
        { key: 'setpoint', label: 'Setpoint' },
      ],
    },
    {
      key: 'temp_return',
      label: 'Temperatura da Água Gelada (Retorno)',
      unit: '°C',
      variables: [
        { key: 'current', label: 'Atual' },
        { key: 'avg', label: 'Média' },
      ],
    },
    {
      key: 'pressure_suction',
      label: 'Pressão de Sucção',
      unit: 'psi',
      variables: [
        { key: 'current', label: 'Atual' },
        { key: 'min', label: 'Mínima' },
      ],
    },
    {
      key: 'pressure_discharge',
      label: 'Pressão de Descarga',
      unit: 'psi',
      variables: [
        { key: 'current', label: 'Atual' },
        { key: 'max', label: 'Máxima' },
      ],
    },
    {
      key: 'power_kw',
      label: 'Consumo de Energia',
      unit: 'kW',
      variables: [
        { key: 'current', label: 'Atual' },
        { key: 'avg', label: 'Média' },
        { key: 'max', label: 'Pico' },
      ],
    },
    {
      key: 'cop',
      label: 'COP (Coeficiente de Performance)',
      unit: '-',
      variables: [
        { key: 'current', label: 'Atual' },
        { key: 'avg', label: 'Média' },
      ],
    },
  ],
  'iot-chiller-002': [
    {
      key: 'temp_supply',
      label: 'Temperatura da Água Gelada (Saída)',
      unit: '°C',
    },
    {
      key: 'pressure_suction',
      label: 'Pressão de Sucção',
      unit: 'psi',
    },
    {
      key: 'pressure_discharge',
      label: 'Pressão de Descarga',
      unit: 'psi',
    },
    {
      key: 'power_kw',
      label: 'Consumo de Energia',
      unit: 'kW',
    },
  ],

  // VRF Parameters
  'iot-vrf-001': [
    {
      key: 'temp_supply',
      label: 'Temperatura de Insuflamento',
      unit: '°C',
      variables: [
        { key: 'current', label: 'Atual' },
        { key: 'setpoint', label: 'Setpoint' },
      ],
    },
    {
      key: 'temp_return',
      label: 'Temperatura de Retorno',
      unit: '°C',
    },
    {
      key: 'pressure_suction',
      label: 'Pressão de Sucção',
      unit: 'psi',
    },
    {
      key: 'power_kw',
      label: 'Consumo de Energia',
      unit: 'kW',
    },
    {
      key: 'superheat',
      label: 'Superaquecimento',
      unit: 'K',
    },
  ],

  // RTU Parameters
  'iot-rtu-001': [
    {
      key: 'temp_supply',
      label: 'Temperatura de Insuflamento',
      unit: '°C',
    },
    {
      key: 'temp_return',
      label: 'Temperatura de Retorno',
      unit: '°C',
    },
    {
      key: 'dp_filter',
      label: 'ΔP Filtro',
      unit: 'Pa',
    },
    {
      key: 'power_kw',
      label: 'Consumo de Energia',
      unit: 'kW',
    },
    {
      key: 'airflow',
      label: 'Vazão de Ar',
      unit: 'm³/h',
    },
  ],

  // Cooling Tower Parameters
  'iot-ct-001': [
    {
      key: 'temp_supply',
      label: 'Temperatura da Água (Saída)',
      unit: '°C',
      variables: [
        { key: 'current', label: 'Atual' },
        { key: 'avg', label: 'Média' },
      ],
    },
    {
      key: 'temp_return',
      label: 'Temperatura da Água (Entrada)',
      unit: '°C',
    },
    {
      key: 'power_kw',
      label: 'Consumo de Energia',
      unit: 'kW',
    },
    {
      key: 'vibration',
      label: 'Vibração',
      unit: 'mm/s',
      variables: [
        { key: 'current', label: 'Atual' },
        { key: 'max', label: 'Máximo' },
      ],
    },
    {
      key: 'speed_rpm',
      label: 'Velocidade do Ventilador',
      unit: 'RPM',
    },
  ],

  // Boiler Parameters
  'iot-boiler-001': [
    {
      key: 'temp_supply',
      label: 'Temperatura da Água Quente (Saída)',
      unit: '°C',
      variables: [
        { key: 'current', label: 'Atual' },
        { key: 'setpoint', label: 'Setpoint' },
      ],
    },
    {
      key: 'temp_return',
      label: 'Temperatura da Água Quente (Retorno)',
      unit: '°C',
    },
    {
      key: 'pressure_discharge',
      label: 'Pressão do Sistema',
      unit: 'psi',
    },
    {
      key: 'power_kw',
      label: 'Consumo de Energia',
      unit: 'kW',
    },
  ],
};

interface UseIoTParamsResult {
  params: IoTParameter[];
  loading: boolean;
  error: string | null;
}

export function useIoTParams(iotDeviceId?: string): UseIoTParamsResult {
  const [params, setParams] = useState<IoTParameter[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!iotDeviceId) {
      setParams([]);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    // Simular uma chamada de API assíncrona
    const fetchParams = () => {
      setTimeout(() => {
        try {
          const deviceParams = IoT_PARAMETERS_DB[iotDeviceId] || [];
          setParams(deviceParams);
          
          if (deviceParams.length === 0) {
            setError('Nenhum parâmetro encontrado para este dispositivo IoT');
          }
        } catch (err) {
          setError('Erro ao carregar parâmetros do dispositivo IoT');
          setParams([]);
        } finally {
          setLoading(false);
        }
      }, 500); // Simular delay da rede
    };

    fetchParams();
  }, [iotDeviceId]);

  return { params, loading, error };
}

// Função helper para obter todos os parâmetros IoT disponíveis (para testes)
export function getAllIoTParameters(): Record<string, IoTParameter[]> {
  return IoT_PARAMETERS_DB;
}

// Função helper para resolver o nome de um parâmetro
export function getParameterLabel(parameterKey: string, iotDeviceId?: string): string {
  if (!iotDeviceId) return parameterKey;
  
  const deviceParams = IoT_PARAMETERS_DB[iotDeviceId] || [];
  const param = deviceParams.find(p => p.key === parameterKey);
  return param?.label || parameterKey;
}

// Função helper para resolver o nome de uma variável
export function getVariableLabel(parameterKey: string, variableKey: string, iotDeviceId?: string): string {
  if (!iotDeviceId) return variableKey;
  
  const deviceParams = IoT_PARAMETERS_DB[iotDeviceId] || [];
  const param = deviceParams.find(p => p.key === parameterKey);
  const variable = param?.variables?.find(v => v.key === variableKey);
  return variable?.label || variableKey;
}