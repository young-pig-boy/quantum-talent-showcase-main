'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Theme } from '@/hooks/use-theme';

const STORAGE_KEY = 'quantum-theme';

interface ThemeContextValue {
  theme: Theme;
  setTheme: (t: Theme) => void;
  toggleTheme: () => void;
  resolved: boolean;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'light',
  setTheme: () => {},
  toggleTheme: () => {},
  resolved: false,
});

function getSystemTheme(): Theme {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  if (theme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('light');
  const [resolved, setResolved] = useState(false);

  useEffect(() => {
    let stored: Theme | null = null;
    try {
      const v = localStorage.getItem(STORAGE_KEY);
      if (v === 'light' || v === 'dark') stored = v;
    } catch {
      /* ignore */
    }
    const initial = stored ?? getSystemTheme();
    setThemeState(initial);
    applyTheme(initial);
    setResolved(true);
  }, []);

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
    applyTheme(t);
    try {
      localStorage.setItem(STORAGE_KEY, t);
    } catch {
      /* ignore */
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  }, [theme, setTheme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, resolved }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeContext() {
  return useContext(ThemeContext);
}

/** Inline script to prevent FOUC — inject into <head> via next/script */
export const THEME_INIT_SCRIPT = `
(function(){
  try{
    var t=localStorage.getItem('quantum-theme');
    if(t==='dark'){document.documentElement.classList.add('dark')}
    else{document.documentElement.classList.remove('dark')}
  }catch(e){document.documentElement.classList.remove('dark')}
})();
`;
