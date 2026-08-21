'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: ThemeMode;
  setTheme: (mode: ThemeMode) => void;
  resolvedTheme: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  setTheme: () => {},
  resolvedTheme: 'light',
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>('light');
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const saved = (localStorage.getItem('ridesetu_theme') || localStorage.getItem('ridesetu-theme')) as ThemeMode;
    if (saved && ['light', 'dark', 'system'].includes(saved)) {
      setThemeState(saved);
    } else {
      setThemeState('light');
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('ridesetu_theme', theme);
    localStorage.setItem('ridesetu-theme', theme);
    const root = document.documentElement;

    if (theme === 'dark') {
      root.classList.add('dark');
      setResolvedTheme('dark');
    } else if (theme === 'light') {
      root.classList.remove('dark');
      setResolvedTheme('light');
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        root.classList.add('dark');
        setResolvedTheme('dark');
      } else {
        root.classList.remove('dark');
        setResolvedTheme('light');
      }
    }
  }, [theme]);

  const setTheme = (mode: ThemeMode) => {
    setThemeState(mode);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
