import { useEffect } from 'react';
import { usePreferencesStore } from '../store/preferences';

/**
 * Hook para sincronizar o tema do store com a classe dark no <html>
 * Suporta 'light', 'dark' e 'system' (que segue prefers-color-scheme)
 */
export function useThemeSync() {
  const theme = usePreferencesStore((state) => state.theme);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const applyTheme = () => {
      const isDark = theme === 'dark' || (theme === 'system' && mediaQuery.matches);
      
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    // Aplicar tema inicial
    applyTheme();

    // Se for 'system', ouvir mudanças no prefers-color-scheme
    if (theme === 'system') {
      const handler = () => applyTheme();
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    }
  }, [theme]);
}
