export interface Equipment {
  id: string;
  name: string;
  tag: string;
  assetTypeId: string;       // tipo de ativo (ex.: Chiller, AHU, etc.)
  iotDeviceId?: string;      // vínculo ao dispositivo IoT que expõe parâmetros
  location: string;
  company?: string;
  sector?: string;
  subsector?: string;
  status: 'active' | 'inactive' | 'maintenance';
  createdAt: Date;
}

export interface IoTParameter {
  key: string;               // ex.: "supply_air_temp"
  label: string;             // ex.: "Temperatura de Insuflamento"
  unit?: string;             // ex.: "°C"
  variables?: Variable[];    // ex.: [{key:'avg',label:'Média'},...]
}

export interface Variable {
  key: string;               // ex.: "avg", "min", "max", "current"
  label: string;             // ex.: "Média", "Mínimo", "Máximo", "Atual"
}

export interface AssetType {
  id: string;
  name: string;
  label: string;
}

// Dados estáticos dos tipos de ativos
export const ASSET_TYPES: AssetType[] = [
  { id: 'AHU', name: 'AHU', label: 'AHU - Air Handling Unit' },
  { id: 'Chiller', name: 'Chiller', label: 'Chiller' },
  { id: 'VRF', name: 'VRF', label: 'VRF - Variable Refrigerant Flow' },
  { id: 'RTU', name: 'RTU', label: 'RTU - Rooftop Unit' },
  { id: 'Boiler', name: 'Boiler', label: 'Boiler' },
  { id: 'CoolingTower', name: 'CoolingTower', label: 'Cooling Tower' },
];