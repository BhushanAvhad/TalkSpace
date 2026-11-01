import React from 'react';
import { Logo } from '@/components/brand/Logo';
import { Github, Twitter, Linkedin, Heart } from 'lucide-react';

export function Footer({ onOpenAuth }) {
  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer className="border-t border-border bg-card/60 select-none">
      <div className="container max-w-7xl mx-auto px-4 sm:px-8 py-16 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-1">
            <Logo variant="full" size="md" showTagline={false} />
            <p className="text-xs text-muted-foreground leading-relaxed">
              Connect. Communicate. Collaborate. Modern real-time communication platform designed for individuals and teams.
            </p>
          </div>

          {/* Navigation */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
              Navigation
            </h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li>
                <button
                  type="button"
                  onClick={() => scrollTo('home')}
                  className="hover:text-primary transition-colors"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => scrollTo('features')}
                  className="hover:text-primary transition-colors"
                >
                  Features
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => scrollTo('product')}
                  className="hover:text-primary transition-colors"
                >
                  Showcase
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => scrollTo('why-us')}
                  className="hover:text-primary transition-colors"
                >
                  Why TalkSpace
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => scrollTo('faq')}
                  className="hover:text-primary transition-colors"
                >
                  FAQ
                </button>
              </li>
            </ul>
          </div>

          {/* Capabilities */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
              Platform Features
            </h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li>Real-Time WebSockets</li>
              <li>Direct 1-on-1 Chats</li>
              <li>Public Community Channels</li>
              <li>Media & File Attachments</li>
              <li>Presence Detection</li>
              <li>Supabase Cloud Storage</li>
            </ul>
          </div>

          {/* Account */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
              Account
            </h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li>
                <button
                  type="button"
                  onClick={() => onOpenAuth('login')}
                  className="hover:text-primary transition-colors"
                >
                  Sign In to TalkSpace
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onOpenAuth('register')}
                  className="hover:text-primary transition-colors"
                >
                  Create an Account
                </button>
              </li>
              <li>
                <a
                  href="https://github.com/BhushanAvhad/TalkSpace"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary transition-colors"
                >
                  Open Source Repository
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between text-xs text-muted-foreground gap-4">
          <p>&copy; {new Date().getFullYear()} TalkSpace. All rights reserved.</p>
          <div className="flex items-center gap-2">
            <span>Crafted for frictionless collaboration</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
