import React from 'react';
import { cn } from '@/lib/utils';

export const Input = React.forwardRef(
  ({ className, type = 'text', error, icon, ...props }, ref) => {
    return (
      <div className="relative w-full">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
            {icon}
          </div>
        )}
        <input
          type={type}
          ref={ref}
          className={cn(
            'flex h-10 w-full rounded-lg border border-input bg-card px-3.5 py-2 text-sm text-foreground shadow-subtle',
            'placeholder:text-muted-foreground/70 transition-all duration-150',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-transparent',
            'disabled:cursor-not-allowed disabled:opacity-50',
            icon && 'pl-10',
            error && 'border-destructive focus-visible:ring-destructive',
            className
          )}
          {...props}
        />
        {error && (
          <span className="text-xs text-destructive mt-1 block font-medium">
            {error}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export const Textarea = React.forwardRef(
  ({ className, error, ...props }, ref) => {
    return (
      <div className="relative w-full">
        <textarea
          ref={ref}
          className={cn(
            'flex min-h-[80px] w-full rounded-lg border border-input bg-card px-3.5 py-2.5 text-sm text-foreground shadow-subtle',
            'placeholder:text-muted-foreground/70 transition-all duration-150',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-transparent',
            'disabled:cursor-not-allowed disabled:opacity-50 resize-none',
            error && 'border-destructive focus-visible:ring-destructive',
            className
          )}
          {...props}
        />
        {error && (
          <span className="text-xs text-destructive mt-1 block font-medium">
            {error}
          </span>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export default Input;

