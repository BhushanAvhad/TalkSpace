import { create } from 'zustand';

/**
 * Manages active theme ('dark' | 'light') with localStorage persistence
 */
export const useThemeStore = create((set) => {
  // Determine initial theme from localStorage or system preference
  const savedTheme = typeof window !== 'undefined' ? localStorage.getItem('talkspace-theme') : null;
  const initialTheme = savedTheme || (window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

  // Immediately apply theme class to <html>
  if (typeof document !== 'undefined') {
    const root = document.documentElement;
    if (initialTheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }

  return {
    theme: initialTheme,

    toggleTheme: () =>
      set((state) => {
        const nextTheme = state.theme === 'dark' ? 'light' : 'dark';
        if (typeof window !== 'undefined') {
          localStorage.setItem('talkspace-theme', nextTheme);
          const root = document.documentElement;
          if (nextTheme === 'dark') {
            root.classList.add('dark');
          } else {
            root.classList.remove('dark');
          }
        }
        return { theme: nextTheme };
      }),

    setTheme: (theme) =>
      set(() => {
        if (typeof window !== 'undefined') {
          localStorage.setItem('talkspace-theme', theme);
          const root = document.documentElement;
          if (theme === 'dark') {
            root.classList.add('dark');
          } else {
            root.classList.remove('dark');
          }
        }
        return { theme };
      }),
  };
});

