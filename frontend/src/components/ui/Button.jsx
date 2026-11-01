import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export const buttonVariants = {
  variant: {
    default:
      'bg-primary text-primary-foreground shadow-subtle hover:bg-primary-hover active:scale-[0.98]',
    primary:
      'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-glow hover:from-indigo-600 hover:to-purple-700 active:scale-[0.98]',
    secondary:
      'bg-secondary text-secondary-foreground hover:bg-secondary/80 active:scale-[0.98]',
    outline:
      'border border-border bg-transparent hover:bg-muted hover:text-foreground active:scale-[0.98]',
    ghost:
      'hover:bg-muted hover:text-foreground active:scale-[0.98]',
    destructive:
      'bg-destructive text-destructive-foreground hover:bg-destructive/90 active:scale-[0.98]',
    glow:
      'bg-primary text-primary-foreground shadow-glow hover:shadow-glow-lg transition-all duration-300 active:scale-[0.98]',
  },
  size: {
    xs: 'h-7 px-2.5 text-xs rounded-md',
    sm: 'h-8 px-3 text-xs rounded-lg',
    default: 'h-10 px-4 py-2 text-sm rounded-lg',
    lg: 'h-11 px-6 text-base rounded-xl',
    icon: 'h-9 w-9 rounded-lg',
    'icon-sm': 'h-7 w-7 rounded-md',
  },
};

export const Button = React.forwardRef(
  (
    {
      className,
      variant = 'default',
      size = 'default',
      isLoading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          'inline-flex items-center justify-center font-medium transition-all duration-150',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
          'disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100 select-none',
          buttonVariants.variant[variant] || buttonVariants.variant.default,
          buttonVariants.size[size] || buttonVariants.size.default,
          className
        )}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
export default Button;

