import React from 'react';
import { cn } from '@/lib/utils';

export function Card({ className, ...props }) {
  return (
    <div
      className={cn(
        'rounded-xl border border-border bg-card text-card-foreground shadow-premium transition-all duration-200',
        className
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }) {
  return (
    <div
      className={cn('flex flex-col space-y-1.5 p-6 border-b border-border/50', className)}
      {...props}
    />
  );
}

export function CardTitle({ className, ...props }) {
  return (
    <h3
      className={cn('text-lg font-bold leading-none tracking-tight text-foreground', className)}
      {...props}
    />
  );
}

export function CardDescription({ className, ...props }) {
  return (
    <p
      className={cn('text-sm text-muted-foreground leading-relaxed', className)}
      {...props}
    />
  );
}

export function CardContent({ className, ...props }) {
  return <div className={cn('p-6', className)} {...props} />;
}

export function CardFooter({ className, ...props }) {
  return (
    <div
      className={cn('flex items-center p-6 pt-0 border-t border-border/40 mt-auto', className)}
      {...props}
    />
  );
}

export default Card;

