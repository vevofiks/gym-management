import React, { createContext, useContext, useEffect, useState } from 'react';
import { useThemeStore } from '@/store/themeStore';

// We can re-export types if needed, or just rely on store types
type Theme = 'light' | 'dark';
type ColorTheme = 'violet' | 'blue' | 'emerald' | 'rose';

// Keeping the Interface for compatibility, though we'll use the store directly
interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  colorTheme: ColorTheme;
  setColorTheme: (color: ColorTheme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children?: React.ReactNode }) => {
  // Use the store hook to get current state
  const { theme, colorTheme, toggleTheme, setColorTheme } = useThemeStore();

  // This ensure hydration matches on client side initially to avoid mismatch, 
  // but for simple theme classes it's often okay. 
  // However, to avoid flash of wrong theme, we might want to ensure store is loaded.
  // Zustand persist usually works synchronously with localStorage if configured, 
  // but hydration happens on mount.

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Handle Dark/Light Mode
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    // Handle Color Theme
    const root = document.documentElement;
    root.classList.remove('theme-violet', 'theme-blue', 'theme-emerald', 'theme-rose');

    // Violet is default in CSS, so we only need classes for others
    if (colorTheme !== 'violet') {
      root.classList.add(`theme-${colorTheme}`);
    }
  }, [colorTheme]);

  // Prevent flash or hydration mismatch if needed, or just render children.
  // Rendering children immediately is fine; the useEffects apply the classes on mount.

  // Create a context value that matches the interface
  const value = {
    theme,
    toggleTheme,
    colorTheme,
    setColorTheme
  };

  if (!mounted) {
    // Optional: render nothing or a loader until client hydration
    // For themes, often acceptable to render, but prevent flickering is better.
    // Let's render children but effects will kick in.
    return <>{children}</>;
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  // We can simply return the store values directly if we want to bypass context entirely 
  // but keeping context allows for mocking or override if needed. 
  // Actually, existing consumers use `useTheme()` from this file.
  // Let's forward to the store directly for simplicity in usage, 
  // OR use the context we provided above.
  // Using the store directly is more "Zustand-y" but using context wrapper 
  // allows the ThemeProvider component to handle the side effects (DOM classes) centrally.

  // Let's stick to using the context which is populated by the store. 
  // This ensures the side effects in ThemeProvider are active.
  const context = useContext(ThemeContext);
  // Fallback to store if context is missing (though it shouldn't be with Provider)
  if (!context) {
    // If used outside provider, we can fallback to direct store usage:
    // return useThemeStore();
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};