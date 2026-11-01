import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { getApiUrl } from '@/lib/api';

export function Avatar({
  src,
  alt = 'Avatar',
  name = '',
  size = 'md',
  status = null, // 'online' | 'offline' | 'away' | 'busy' | null
  className,
  ...props
}) {
  const [hasError, setHasError] = useState(false);

  // Reset error state only when src actually changes value
  useEffect(() => {
    setHasError(false);
  }, [src]);

  const sizeMap = {
    xs: { wrap: 'w-6 h-6 text-[10px]', dot: 'w-2 h-2 ring-1' },
    sm: { wrap: 'w-8 h-8 text-xs', dot: 'w-2.5 h-2.5 ring-2' },
    md: { wrap: 'w-10 h-10 text-sm', dot: 'w-3 h-3 ring-2' },
    lg: { wrap: 'w-12 h-12 text-base', dot: 'w-3.5 h-3.5 ring-2' },
    xl: { wrap: 'w-16 h-16 text-lg', dot: 'w-4 h-4 ring-2' },
  };

  const statusMap = {
    online: 'bg-emerald-500',
    offline: 'bg-muted-foreground/40',
    away: 'bg-amber-500',
    busy: 'bg-rose-500',
  };

  const getInitials = (text) => {
    if (!text) return '?';
    const parts = text.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return text.substring(0, 2).toUpperCase();
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  // Filter out empty or placeholder 'profile.png' that causes 404s
  const cleanSrc =
    src &&
    typeof src === 'string' &&
    src.trim() !== '' &&
    src !== 'profile.png' &&
    src !== '/profile.png'
      ? getApiUrl(src)
      : null;

  return (
    <div className={cn('relative inline-flex flex-shrink-0 select-none', className)} {...props}>
      <div
        className={cn(
          'relative flex items-center justify-center rounded-full overflow-hidden border border-border/60 bg-muted text-muted-foreground font-semibold',
          currentSize.wrap
        )}
      >
        {cleanSrc && !hasError ? (
          <img
            key={cleanSrc}
            src={cleanSrc}
            alt={alt || name}
            loading="eager"
            onError={() => setHasError(true)}
            className="w-full h-full object-cover select-none"
          />
        ) : (
          <span className="tracking-wider select-none">{getInitials(name || alt)}</span>
        )}
      </div>

      {status && statusMap[status] && (
        <span
          className={cn(
            'absolute bottom-0 right-0 rounded-full ring-background',
            statusMap[status],
            currentSize.dot
          )}
          title={`Status: ${status}`}
        />
      )}
    </div>
  );
}

export default Avatar;
