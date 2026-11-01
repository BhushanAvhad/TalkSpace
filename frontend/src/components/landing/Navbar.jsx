import React, { useState, useEffect } from 'react';
import { Menu, X, ArrowRight, Sparkles } from 'lucide-react';
import { Logo } from '@/components/brand/Logo';
import { Button } from '@/components/ui/Button';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { cn } from '@/lib/utils';

export function Navbar({ onOpenAuth }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);

      const sections = ['home', 'features', 'product', 'why-us', 'faq'];
      const scrollPosition = window.scrollY + 100;

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
    { label: 'Showcase', id: 'product' },
    { label: 'Why TalkSpace', id: 'why-us' },
    { label: 'FAQ', id: 'faq' },
  ];

  return (
    <nav
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled
          ? 'bg-background/85 backdrop-blur-md border-b border-border shadow-subtle'
          : 'bg-transparent border-b border-transparent'
      )}
    >
      <div className="container max-w-7xl mx-auto px-4 sm:px-8 h-20 flex items-center justify-between">
        {/* Left: Brand Logo */}
        <div className="cursor-pointer" onClick={() => scrollToSection('home')}>
          <Logo variant="full" size="md" showTagline={false} />
        </div>

        {/* Center: Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-1 p-1.5 rounded-full bg-card/60 border border-border/80 backdrop-blur-sm shadow-subtle">
          {navLinks.map((link) => {
            const isActive = activeSection === link.id;
            return (
              <button
                key={link.id}
                type="button"
                onClick={() => scrollToSection(link.id)}
                className={cn(
                  'px-4 py-1.5 text-xs font-semibold rounded-full transition-all duration-200 select-none',
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-glow'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                )}
              >
                {link.label}
              </button>
            );
          })}
        </div>

        {/* Right: Theme Toggle & Auth Buttons */}
        <div className="hidden md:flex items-center gap-3">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onOpenAuth('login')}
            className="text-xs font-semibold"
          >
            Sign In
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

      {/* Mobile Slide-down Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-border bg-card/95 backdrop-blur-xl px-4 py-6 space-y-4 animate-fade-in shadow-xl">
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
            <Button
              variant="outline"
              size="default"
              className="w-full text-xs font-semibold"
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAuth('login');
              }}
            >
              Sign In
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
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
