import React, { useState, useEffect } from 'react';
import { Menu, X, ArrowRight, MessageSquare } from 'lucide-react';
import { Logo } from '@/components/brand/Logo';
import { Button } from '@/components/ui/Button';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { useAuthStore } from '@/stores/useAuthStore';
import { cn } from '@/lib/utils';

export function Navbar({ onOpenAuth, onEnterChat }) {
  const { isAuthenticated, user } = useAuthStore();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);

      const sections = ['home', 'features', 'about', 'why-us'];
      const scrollPosition = window.scrollY + 120;

      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const navLinks = [
    { label: 'Home', id: 'home' },
    { label: 'Features', id: 'features' },
    { label: 'About', id: 'about' },
    { label: 'Why TalkSpace', id: 'why-us' },
  ];

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-200 select-none',
        scrolled
          ? 'bg-background/90 backdrop-blur-md border-b border-border/80 shadow-subtle'
          : 'bg-transparent border-b border-transparent'
      )}
    >
      <div className="container max-w-7xl mx-auto px-4 sm:px-8 h-18 flex items-center justify-between">
        {/* Left: Original TalkSpace custom logo */}
        <div
          className="cursor-pointer flex items-center"
          onClick={() => scrollToSection('home')}
        >
          <Logo variant="full" size="md" showTagline={false} />
        </div>

        {/* Center: Navigation Links (Home, Features, About) */}
        <nav className="hidden md:flex items-center gap-1 px-3 py-1.5 rounded-full bg-card/60 border border-border/60 backdrop-blur-sm shadow-subtle">
          {navLinks.map((link) => {
            const isActive = activeSection === link.id;
            return (
              <button
                key={link.id}
                type="button"
                onClick={() => scrollToSection(link.id)}
                className={cn(
                  'px-4 py-1.5 text-xs font-semibold rounded-full transition-all duration-200',
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-glow'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                )}
              >
                {link.label}
              </button>
            );
          })}
        </nav>

        {/* Right: Theme Toggle & Actions */}
        <div className="hidden md:flex items-center gap-3">
          <ThemeToggle />

          {isAuthenticated ? (
            <Button
              variant="primary"
              size="sm"
              onClick={onEnterChat}
              className="text-xs font-semibold shadow-glow"
            >
              <MessageSquare className="w-3.5 h-3.5 mr-1.5" />
              Open Chat (@{user?.username})
            </Button>
          ) : (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onOpenAuth('login')}
                className="text-xs font-semibold text-foreground hover:text-primary"
              >
                Login
              </Button>

              <Button
                variant="primary"
                size="sm"
                onClick={() => onOpenAuth('register')}
                className="text-xs font-semibold shadow-glow"
              >
                Get Started
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex md:hidden items-center gap-2">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl border border-border bg-card text-foreground"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-border bg-card/95 backdrop-blur-xl px-5 py-6 space-y-4 shadow-2xl animate-fade-in">
          <div className="flex flex-col space-y-2">
            {navLinks.map((link) => (
              <button
                key={link.id}
                type="button"
                onClick={() => scrollToSection(link.id)}
                className={cn(
                  'w-full text-left px-3 py-2 text-sm font-semibold rounded-lg transition-colors',
                  activeSection === link.id
                    ? 'bg-primary/10 text-primary font-bold'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {link.label}
              </button>
            ))}
          </div>

          <div className="pt-4 border-t border-border flex flex-col gap-2.5">
            {isAuthenticated ? (
              <Button
                variant="primary"
                size="default"
                className="w-full text-xs font-semibold"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onEnterChat();
                }}
              >
                Open Workspace (@{user?.username})
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="default"
                  className="w-full text-xs font-semibold"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAuth('login');
                  }}
                >
                  Login
                </Button>
                <Button
                  variant="primary"
                  size="default"
                  className="w-full text-xs font-semibold"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAuth('register');
                  }}
                >
                  Get Started
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;

