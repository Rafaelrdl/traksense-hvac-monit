import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Equipment } from '@/types/equipment';

interface EquipmentState {
  equipments: Equipment[];
  
  // Actions
  addEquipment: (equipment: Omit<Equipment, 'id' | 'createdAt'>) => void;
  updateEquipment: (id: string, equipment: Partial<Equipment>) => void;
  removeEquipment: (id: string) => void;
  getEquipmentById: (id: string) => Equipment | undefined;
  getEquipmentsByAssetType: (assetTypeId: string) => Equipment[];
}

// Mock data dos equipamentos cadastrados
const mockEquipments: Equipment[] = [
  {
    id: 'eq-001',
    name: 'AHU Principal Ala Norte',
    tag: 'AHU-001',
    assetTypeId: 'AHU',
    iotDeviceId: 'iot-ahu-001',
    location: 'Ala Norte - 1º Andar',
    company: 'TrakSense Healthcare',
    sector: 'Climatização',
    subsector: 'AHUs',
    status: 'active',
    createdAt: new Date('2024-01-15'),
  },
  {
    id: 'eq-002',
    name: 'Chiller Central Torre A',
    tag: 'CH-001',
    assetTypeId: 'Chiller',
    iotDeviceId: 'iot-chiller-001',
    location: 'Casa de Máquinas - Torre A',
    company: 'TrakSense Healthcare',
    sector: 'Climatização',
    subsector: 'Chillers',
    status: 'active',
    createdAt: new Date('2024-01-20'),
  },
  {
    id: 'eq-003',
    name: 'VRF Sala de Cirurgia 01',
    tag: 'VRF-001',
    assetTypeId: 'VRF',
    iotDeviceId: 'iot-vrf-001',
    location: 'Centro Cirúrgico - Sala 01',
    company: 'TrakSense Healthcare',
    sector: 'Climatização',
    subsector: 'VRFs',
    status: 'active',
    createdAt: new Date('2024-02-01'),
  },
  {
    id: 'eq-004',
    name: 'RTU Emergência Ala Sul',
    tag: 'RTU-001',
    assetTypeId: 'RTU',
    iotDeviceId: 'iot-rtu-001',
    location: 'Ala Sul - Cobertura',
    company: 'TrakSense Healthcare',
    sector: 'Climatização',
    subsector: 'RTUs',
    status: 'active',
    createdAt: new Date('2024-02-10'),
  },
  {
    id: 'eq-005',
    name: 'Chiller Backup Torre B',
    tag: 'CH-002',
    assetTypeId: 'Chiller',
    iotDeviceId: 'iot-chiller-002',
    location: 'Casa de Máquinas - Torre B',
    company: 'TrakSense Healthcare',
    sector: 'Climatização',
    subsector: 'Chillers',
    status: 'active',
    createdAt: new Date('2024-02-15'),
  },
  {
    id: 'eq-006',
    name: 'Torre de Resfriamento Principal',
    tag: 'CT-001',
    assetTypeId: 'CoolingTower',
    iotDeviceId: 'iot-ct-001',
    location: 'Terraço Torre A',
    company: 'TrakSense Healthcare',
    sector: 'Climatização',
    subsector: 'Torres de Resfriamento',
    status: 'active',
    createdAt: new Date('2024-02-20'),
  },
  {
    id: 'eq-007',
    name: 'AHU Laboratório',
    tag: 'AHU-002',
    assetTypeId: 'AHU',
    iotDeviceId: 'iot-ahu-002',
    location: 'Laboratório - 2º Andar',
    company: 'TrakSense Healthcare',
    sector: 'Climatização',
    subsector: 'AHUs',
    status: 'maintenance',
    createdAt: new Date('2024-03-01'),
  },
  {
    id: 'eq-008',
    name: 'Boiler Aquecimento Central',
    tag: 'BOI-001',
    assetTypeId: 'Boiler',
    iotDeviceId: 'iot-boiler-001',
    location: 'Casa de Máquinas - Subsolo',
    company: 'TrakSense Healthcare',
    sector: 'Aquecimento',
    subsector: 'Boilers',
    status: 'active',
    createdAt: new Date('2024-03-05'),
  },
];

export const useEquipmentStore = create<EquipmentState>()(
  persist(
    (set, get) => ({
      equipments: mockEquipments,

      addEquipment: (equipmentData) => {
        const newEquipment: Equipment = {
          ...equipmentData,
          id: `eq-${Date.now()}`,
          createdAt: new Date(),
        };
        
        set((state) => ({
          equipments: [...state.equipments, newEquipment],
        }));
      },

      updateEquipment: (id, updates) => {
        set((state) => ({
          equipments: state.equipments.map((equipment) =>
            equipment.id === id ? { ...equipment, ...updates } : equipment
          ),
        }));
      },

      removeEquipment: (id) => {
        set((state) => ({
          equipments: state.equipments.filter((equipment) => equipment.id !== id),
        }));
      },

      getEquipmentById: (id) => {
        return get().equipments.find((equipment) => equipment.id === id);
      },

      getEquipmentsByAssetType: (assetTypeId) => {
        return get().equipments.filter((equipment) => equipment.assetTypeId === assetTypeId);
      },
    }),
    {
      name: 'equipment-store',
      version: 1,
    }
  )
);