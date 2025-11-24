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

// No mock data - use real API data only
export const useEquipmentStore = create<EquipmentState>()(
  persist(
    (set, get) => ({
      equipments: [], // Empty - load from API

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