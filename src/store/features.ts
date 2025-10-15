import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface FeaturesState {
  // Performance tab visibility
  hidePerformanceWhenNoSensors: boolean;
  setHidePerformanceWhenNoSensors: (value: boolean) => void;
  
  // TrakNor CTA
  enableTrakNorCTA: boolean;
  setEnableTrakNorCTA: (value: boolean) => void;
}

export const useFeaturesStore = create<FeaturesState>()(
  persist(
    (set) => ({
      // Defaults
      hidePerformanceWhenNoSensors: true,
      enableTrakNorCTA: true,
      
      // Actions
      setHidePerformanceWhenNoSensors: (value) =>
        set({ hidePerformanceWhenNoSensors: value }),
      
      setEnableTrakNorCTA: (value) =>
        set({ enableTrakNorCTA: value }),
    }),
    {
      name: 'ts:features',
    }
  )
);
