import { HVACAsset, Sensor, EquipmentType } from '@/types/hvac';

/**
 * Mapa de sensores mínimos necessários por tipo de equipamento
 * para habilitar a aba de Performance
 */
const REQUIRED_SENSORS_BY_TYPE: Record<string, string[]> = {
  CHILLER: ['power_kw', 'temp_supply', 'temp_return'],
  AHU: ['temp_supply', 'airflow'],
  PUMP: ['power_kw', 'pressure_suction'],
  FAN_COIL: ['temp_supply', 'temp_return'],
  BOILER: ['power_kw', 'temp_supply'],
  COOLING_TOWER: ['power_kw', 'temp_supply'],
  VRF: ['power_kw', 'temp_supply'],
  RTU: ['power_kw', 'temp_supply'],
  DEFAULT: ['power_kw'],
};

/**
 * Mapeia tipos legados para os novos tipos expandidos
 */
const LEGACY_TYPE_MAP: Record<string, string> = {
  'Chiller': 'CHILLER',
  'AHU': 'AHU',
  'VRF': 'VRF',
  'RTU': 'RTU',
  'Boiler': 'BOILER',
  'CoolingTower': 'COOLING_TOWER',
};

/**
 * Verifica se um equipamento possui telemetria mínima para exibir Performance
 * 
 * @param asset - O ativo/equipamento a ser verificado
 * @param sensors - Lista de sensores disponíveis (opcional, usa do asset se não fornecido)
 * @returns true se possui sensores mínimos, false caso contrário
 */
export function hasPerformanceTelemetry(
  asset: HVACAsset,
  sensors?: Sensor[]
): boolean {
  if (!asset) return false;
  
  // Determinar o tipo do equipamento (tentar equipmentType primeiro, depois type legado)
  const equipmentType = asset.specifications?.equipmentType;
  const legacyType = asset.type;
  
  let typeKey = equipmentType || LEGACY_TYPE_MAP[legacyType] || 'DEFAULT';
  
  // Buscar sensores necessários para este tipo
  const requiredSensorTypes = REQUIRED_SENSORS_BY_TYPE[typeKey] || REQUIRED_SENSORS_BY_TYPE.DEFAULT;
  
  // Se não foram fornecidos sensores, não temos como verificar
  if (!sensors || sensors.length === 0) {
    return false;
  }
  
  // Filtrar sensores deste ativo
  const assetSensors = sensors.filter(s => s.assetId === asset.id);
  
  // Verificar se todos os sensores necessários estão presentes e online
  const hasSensors = requiredSensorTypes.every(requiredType => {
    return assetSensors.some(sensor => 
      sensor.type === requiredType && 
      sensor.online && 
      sensor.lastReading !== null
    );
  });
  
  return hasSensors;
}

/**
 * Retorna uma lista legível dos sensores faltantes para o equipamento
 * 
 * @param asset - O ativo/equipamento a ser verificado
 * @param sensors - Lista de sensores disponíveis
 * @returns Array de strings com os nomes amigáveis dos sensores faltantes
 */
export function reasonMissingTelemetry(
  asset: HVACAsset,
  sensors?: Sensor[]
): string[] {
  if (!asset) return ['Equipamento não encontrado'];
  
  // Determinar o tipo do equipamento
  const equipmentType = asset.specifications?.equipmentType;
  const legacyType = asset.type;
  
  let typeKey = equipmentType || LEGACY_TYPE_MAP[legacyType] || 'DEFAULT';
  
  // Buscar sensores necessários para este tipo
  const requiredSensorTypes = REQUIRED_SENSORS_BY_TYPE[typeKey] || REQUIRED_SENSORS_BY_TYPE.DEFAULT;
  
  if (!sensors || sensors.length === 0) {
    return ['Nenhum sensor configurado'];
  }
  
  // Filtrar sensores deste ativo
  const assetSensors = sensors.filter(s => s.assetId === asset.id);
  
  // Identificar quais sensores estão faltando
  const missingSensors: string[] = [];
  
  requiredSensorTypes.forEach(requiredType => {
    const sensor = assetSensors.find(s => s.type === requiredType);
    
    if (!sensor) {
      missingSensors.push(getSensorFriendlyName(requiredType) + ' (não instalado)');
    } else if (!sensor.online) {
      missingSensors.push(getSensorFriendlyName(requiredType) + ' (offline)');
    } else if (!sensor.lastReading) {
      missingSensors.push(getSensorFriendlyName(requiredType) + ' (sem leitura)');
    }
  });
  
  return missingSensors.length > 0 
    ? missingSensors 
    : ['Todos os sensores necessários estão disponíveis'];
}

/**
 * Retorna o nome amigável de um tipo de sensor
 */
function getSensorFriendlyName(sensorType: string): string {
  const names: Record<string, string> = {
    'power_kw': 'Potência (kW)',
    'temp_supply': 'Temperatura de Insuflamento',
    'temp_return': 'Temperatura de Retorno',
    'airflow': 'Vazão de Ar',
    'pressure_suction': 'Pressão de Sucção',
    'pressure_discharge': 'Pressão de Descarga',
    'dp_filter': 'Delta P do Filtro',
    'current': 'Corrente Elétrica',
    'voltage': 'Tensão',
  };
  
  return names[sensorType] || sensorType;
}
