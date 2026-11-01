import React from 'react';
import { MessageSquare, Users, Inbox } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './Button';

export function EmptyState({
  icon: Icon = MessageSquare,
  title = 'No messages yet',
  description = 'Start a conversation or select a user from the directory to begin chatting.',
  actionLabel,
  onAction,
  className,
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center p-8 max-w-sm mx-auto select-none',
        className
      )}
    >
      <div className="w-14 h-14 rounded-2xl bg-muted/80 border border-border/80 flex items-center justify-center text-muted-foreground mb-4 shadow-subtle">
        <Icon className="w-7 h-7 text-primary/80" />
      </div>

      <h4 className="text-base font-bold text-foreground mb-1">{title}</h4>
      <p className="text-xs text-muted-foreground leading-relaxed mb-5">
        {description}
      </p>

      {actionLabel && onAction && (
        <Button size="sm" variant="outline" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

export default EmptyState;

