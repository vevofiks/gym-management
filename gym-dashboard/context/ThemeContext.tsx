import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';
type ColorTheme = 'violet' | 'blue' | 'emerald' | 'rose';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  colorTheme: ColorTheme;
  setColorTheme: (color: ColorTheme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children?: React.ReactNode }) => {
  const [theme, setTheme] = useState<Theme>('dark');
  const [colorTheme, setColorTheme] = useState<ColorTheme>('violet');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Load theme from localStorage
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    const savedColorTheme = localStorage.getItem('colorTheme') as ColorTheme | null;
    if (savedTheme) setTheme(savedTheme);
    if (savedColorTheme) setColorTheme(savedColorTheme);
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('theme-violet', 'theme-blue', 'theme-emerald', 'theme-rose');

    if (colorTheme !== 'violet') {
      root.classList.add(`theme-${colorTheme}`);
    }
    localStorage.setItem('colorTheme', colorTheme);
  }, [colorTheme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const value = {
    theme,
    toggleTheme,
    colorTheme,
    setColorTheme
  };

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  // During SSR, return default values instead of throwing
  if (!context) {
    return {
      theme: 'dark' as Theme,
      toggleTheme: () => { },
      colorTheme: 'violet' as ColorTheme,
      setColorTheme: () => { }
    };
  }
  return context;
};