import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ThemeMode = 'light' | 'dark' | 'system';

interface PreferencesState {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
}

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      theme: 'system',
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'ts:prefs',
    }
  )
);
