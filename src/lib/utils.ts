import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { EquipmentType } from "@/types/hvac"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Retorna o nome de exibição do tipo de equipamento.
 * Para o tipo 'OTHER', usa o texto customizado ou "Outro" como fallback.
 */
export function getEquipmentDisplayType(type: EquipmentType, other?: string): string {
  if (type === 'OTHER') {
    return other?.trim() || 'Outro';
  }
  
  // Mapeamento de tipos para nomes amigáveis
  const typeLabels: Record<EquipmentType, string> = {
    CHILLER: 'Chiller',
    AHU: 'AHU',
    FAN_COIL: 'Fan Coil',
    PUMP: 'Bomba',
    BOILER: 'Caldeira',
    COOLING_TOWER: 'Torre de Resfriamento',
    VRF: 'VRF',
    RTU: 'RTU',
    VALVE: 'Válvula',
    SENSOR: 'Sensor',
    CONTROLLER: 'Controlador',
    FILTER: 'Filtro',
    DUCT: 'Duto',
    METER: 'Medidor',
    OTHER: 'Outro',
  };
  
  return typeLabels[type] || type;
}
