import React from 'react';
import { Logo } from '@/components/brand/Logo';

export function Footer({ onOpenAuth }) {
  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer className="border-t border-border bg-card/70 select-none">
      <div className="container max-w-7xl mx-auto px-4 sm:px-8 py-12 space-y-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-2 max-w-sm">
            <Logo variant="full" size="md" showTagline={false} />
            <p className="text-xs text-muted-foreground leading-relaxed">
              Connect. Communicate. Collaborate. Modern real-time communication platform for teams and individuals.
            </p>
          </div>

          <nav className="flex flex-wrap items-center gap-6 text-xs font-medium text-muted-foreground">
            <button
              type="button"
              onClick={() => scrollTo('home')}
              className="hover:text-primary transition-colors"
            >
              Home
            </button>
            <button
              type="button"
              onClick={() => scrollTo('features')}
              className="hover:text-primary transition-colors"
            >
              Features
            </button>
            <button
              type="button"
              onClick={() => scrollTo('about')}
              className="hover:text-primary transition-colors"
            >
              About
            </button>
            <button
              type="button"
              onClick={() => scrollTo('why-us')}
              className="hover:text-primary transition-colors"
            >
              Why TalkSpace
            </button>
            <button
              type="button"
              onClick={() => onOpenAuth('login')}
              className="hover:text-primary transition-colors"
            >
              Login
            </button>
          </nav>
        </div>

        <div className="pt-6 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between text-xs text-muted-foreground gap-3">
          <p>&copy; {new Date().getFullYear()} TalkSpace. All rights reserved.</p>
          <span>Crafted with React 19, Socket.IO & Supabase</span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;

