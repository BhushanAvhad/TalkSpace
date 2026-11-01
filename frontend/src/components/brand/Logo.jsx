import React from 'react';
import { cn } from '@/lib/utils';

/**
 * TalkSpace Brand Logo
 * Geometric connected conversation nodes forming a fluid 'T' and 'S' dialogue loop.
 * 
 * @param {Object} props
 * @param {'icon' | 'full' | 'stacked'} props.variant - Display format
 * @param {'sm' | 'md' | 'lg' | 'xl'} props.size - Dimension scale
 * @param {boolean} props.showTagline - Whether to render tagline
 * @param {string} props.className - Additional custom classes
 */
export function Logo({
  variant = 'full',
  size = 'md',
  showTagline = false,
  className,
  ...props
}) {
  const sizeMap = {
    xs: { icon: 20, text: 'text-sm', sub: 'text-[9px]', gap: 'gap-1.5' },
    sm: { icon: 28, text: 'text-base font-bold', sub: 'text-[10px]', gap: 'gap-2' },
    md: { icon: 36, text: 'text-xl font-bold tracking-tight', sub: 'text-xs', gap: 'gap-2.5' },
    lg: { icon: 48, text: 'text-2xl font-extrabold tracking-tight', sub: 'text-xs', gap: 'gap-3' },
    xl: { icon: 64, text: 'text-4xl font-black tracking-tight', sub: 'text-sm', gap: 'gap-4' },
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  return (
    <div
      className={cn(
        'inline-flex items-center select-none font-sans',
        currentSize.gap,
        className
      )}
      {...props}
    >
      {/* Geometric Connected Bubble Icon */}
      <div className="relative flex-shrink-0 flex items-center justify-center">
        <svg
          width={currentSize.icon}
          height={currentSize.icon}
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="transition-transform duration-300 hover:scale-105"
        >
          <defs>
            {/* Primary Gradient: Violet to Electric Indigo */}
            <linearGradient id="talkspace-primary" x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
              <stop stopColor="#6366f1" />
              <stop offset="0.6" stopColor="#8b5cf6" />
              <stop offset="1" stopColor="#ec4899" />
            </linearGradient>

            {/* Secondary Gradient: Cyan Highlight Node */}
            <linearGradient id="talkspace-accent" x1="20" y1="18" x2="38" y2="38" gradientUnits="userSpaceOnUse">
              <stop stopColor="#06b6d4" />
              <stop offset="1" stopColor="#6366f1" />
            </linearGradient>

            {/* Subtle Glow Filter */}
            <filter id="talkspace-glow" x="-20%" y="-20%" width="140%" height="140%" filterUnits="userSpaceOnUse">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Primary Conversation Bubble (T-Flow) */}
          <rect
            x="6"
            y="6"
            width="24"
            height="22"
            rx="11"
            fill="url(#talkspace-primary)"
            className="drop-shadow-sm"
          />
          {/* Primary Speech Tail Tip */}
          <path
            d="M12 28L8 34C8 34 14 33 16 30"
            fill="url(#talkspace-primary)"
          />

          {/* Connected Secondary Space Bubble (S-Flow) with Glass Overlap */}
          <rect
            x="18"
            y="18"
            width="24"
            height="22"
            rx="11"
            fill="url(#talkspace-accent)"
            fillOpacity="0.9"
            style={{ backdropFilter: 'blur(4px)' }}
          />
          {/* Secondary Speech Tail Tip */}
          <path
            d="M36 40L40 44C40 44 38 39 36 38"
            fill="url(#talkspace-accent)"
          />

          {/* Communication Pulse Rings (Connected Orbit) */}
          <circle cx="16" cy="17" r="3" fill="#ffffff" fillOpacity="0.95" />
          <circle cx="30" cy="29" r="3.5" fill="#ffffff" fillOpacity="0.95" />
          
          {/* Connecting Bridge Line */}
          <path
            d="M19 19.5L27 26.5"
            stroke="#ffffff"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray="2 3"
            strokeOpacity="0.85"
          />
        </svg>
      </div>

      {/* Wordmark & Tagline */}
      {variant !== 'icon' && (
        <div className="flex flex-col">
          <div className="flex items-center tracking-tight leading-none">
            <span className="font-extrabold text-foreground">Talk</span>
            <span className="font-bold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Space
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 ml-0.5 animate-pulse" />
          </div>

          {showTagline && (
            <span className={cn('text-muted-foreground font-medium mt-0.5', currentSize.sub)}>
              Connect. Communicate. Collaborate.
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export default Logo;

