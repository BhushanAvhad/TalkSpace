import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useThemeStore } from '@/stores/useThemeStore';
import { cn } from '@/lib/utils';

export function ThemeToggle({ className, ...props }) {
  const { theme, toggleTheme } = useThemeStore();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Toggle Theme"
      className={cn(
        'relative inline-flex items-center justify-center w-9 h-9 rounded-lg border border-border bg-card text-card-foreground',
        'hover:bg-muted hover:border-muted-foreground/30 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        'shadow-subtle active:scale-95',
        className
      )}
      {...props}
    >
      <Sun
        className={cn(
          'w-4 h-4 transition-all duration-300',
          isDark ? 'scale-0 rotate-90 opacity-0 absolute' : 'scale-100 rotate-0 opacity-100 text-amber-500'
        )}
      />
      <Moon
        className={cn(
          'w-4 h-4 transition-all duration-300',
          isDark ? 'scale-100 rotate-0 opacity-100 text-indigo-400' : 'scale-0 -rotate-90 opacity-0 absolute'
        )}
      />
    </button>
  );
}

export default ThemeToggle;

