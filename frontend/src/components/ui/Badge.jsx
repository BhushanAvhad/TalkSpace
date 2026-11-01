import React from 'react';
import { cn } from '@/lib/utils';

export const badgeVariants = {
  default: 'border-transparent bg-primary text-primary-foreground shadow-subtle',
  secondary: 'border-transparent bg-secondary text-secondary-foreground',
  destructive: 'border-transparent bg-destructive text-destructive-foreground',
  outline: 'border-border text-foreground',
  success: 'border-transparent bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20',
  warning: 'border-transparent bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20',
  glow: 'border-transparent bg-indigo-500/20 text-indigo-500 dark:text-indigo-400 border border-indigo-500/30 shadow-glow',
};

export function Badge({ className, variant = 'default', ...props }) {
  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring select-none',
        badgeVariants[variant] || badgeVariants.default,
        className
      )}
      {...props}
    />
  );
}

export default Badge;

