import { useState, useEffect } from 'react';
import { assetsService } from '../services/assetsService';
import { ApiSensor } from '../types/api';

interface UseSensorDataResult {
  value: number | null;
  unit: string;
  isOnline: boolean;
  isLoading: boolean;
  error: string | null;
  sensor: ApiSensor | null;
}

/**
 * Hook para buscar dados em tempo real de um sensor específico
 * Usa sensorTag e assetId do widget config para buscar o último valor
 * 
 * @param sensorTag - Tag única do sensor configurado no widget
 * @param assetId - ID do asset ao qual o sensor pertence
 * @param refreshInterval - Intervalo de atualização em milissegundos (padrão: 30s)
 */
export function useSensorData(
  sensorTag: string | undefined, 
  assetId: number | undefined,
  refreshInterval = 30000
): UseSensorDataResult {
  const [data, setData] = useState<UseSensorDataResult>({
    value: null,
    unit: '',
    isOnline: false,
    isLoading: true,
    error: null,
    sensor: null,
  });

  useEffect(() => {
    if (!sensorTag || !assetId) {
      setData({
        value: null,
        unit: '',
        isOnline: false,
        isLoading: false,
        error: sensorTag ? 'Asset não configurado' : 'Sensor não configurado',
        sensor: null,
      });
      return;
    }

    let isMounted = true; // Prevenir state updates após unmount

    const fetchSensorData = async () => {
      try {
        if (!isMounted) return;
        
        setData(prev => ({ ...prev, isLoading: true, error: null }));
        
        // Buscar todos os sensores do asset
        const sensors = await assetsService.getSensors(assetId);
        
        // Encontrar sensor específico pela tag
        const targetSensor = sensors.find(s => s.tag === sensorTag);
        
        if (!targetSensor) {
          if (!isMounted) return;
          setData({
            value: null,
            unit: '',
            isOnline: false,
            isLoading: false,
            error: `Sensor ${sensorTag} não encontrado no asset`,
            sensor: null,
          });
          return;
        }
        
        if (!isMounted) return;
        
        setData({
          value: targetSensor.last_value,
          unit: targetSensor.unit || '',
          isOnline: targetSensor.is_online,
          isLoading: false,
          error: null,
          sensor: targetSensor,
        });
        
      } catch (error: any) {
        console.error('❌ Erro ao buscar dados do sensor:', error);
        if (!isMounted) return;
        
        setData(prev => ({
          ...prev,
          isLoading: false,
          error: error.message || 'Erro ao carregar dados do sensor',
        }));
      }
    };

    fetchSensorData();

    // Auto-refresh com intervalo configurável
    const interval = setInterval(fetchSensorData, refreshInterval);
    
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [sensorTag, assetId, refreshInterval]);

  return data;
}
