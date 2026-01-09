import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'light' | 'dark';
type ColorTheme = 'violet' | 'blue' | 'emerald' | 'rose';

interface ThemeState {
    theme: Theme;
    colorTheme: ColorTheme;
    toggleTheme: () => void;
    setColorTheme: (color: ColorTheme) => void;
}

export const useThemeStore = create<ThemeState>()(
    persist(
        (set) => ({
            theme: 'light',
            colorTheme: 'violet',
            toggleTheme: () => set((state) => ({
                theme: state.theme === 'light' ? 'dark' : 'light'
            })),
            setColorTheme: (color) => set({ colorTheme: color }),
        }),
        {
            name: 'gym-pulse-theme',
        }
    )
);
