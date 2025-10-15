import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CTAState {
  dismissedKeys: Set<string>;
  isDismissed: (key: string) => boolean;
  dismiss: (key: string) => void;
  undismiss: (key: string) => void;
  clearAll: () => void;
}

export const useCTAStore = create<CTAState>()(
  persist(
    (set, get) => ({
      dismissedKeys: new Set<string>(),
      
      isDismissed: (key: string) => {
        return get().dismissedKeys.has(key);
      },
      
      dismiss: (key: string) => {
        set((state) => ({
          dismissedKeys: new Set(state.dismissedKeys).add(key),
        }));
      },
      
      undismiss: (key: string) => {
        set((state) => {
          const newSet = new Set(state.dismissedKeys);
          newSet.delete(key);
          return { dismissedKeys: newSet };
        });
      },
      
      clearAll: () => {
        set({ dismissedKeys: new Set<string>() });
      },
    }),
    {
      name: 'ts:cta',
      // Custom serialization para Set
      partialize: (state) => ({
        dismissedKeys: Array.from(state.dismissedKeys),
      }),
      // Custom deserialization
      merge: (persistedState: any, currentState) => ({
        ...currentState,
        dismissedKeys: new Set(persistedState?.dismissedKeys || []),
      }),
    }
  )
);
