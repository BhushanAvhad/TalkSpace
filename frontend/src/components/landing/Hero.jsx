import React from 'react';
import { ArrowRight, Sparkles, Shield, Zap, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ProductMockup } from './ProductMockup';

export function Hero({ onOpenAuth }) {
  const scrollToFeatures = () => {
    const el = document.getElementById('features');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="home" className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
      {/* Background Radial Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-gradient-to-tr from-indigo-500/20 via-purple-500/15 to-transparent blur-[120px] pointer-events-none rounded-full" />

      <div className="container max-w-7xl mx-auto px-4 sm:px-8 relative z-10 flex flex-col items-center text-center space-y-8">
        {/* Announcement Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-semibold shadow-subtle animate-fade-in select-none">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>TalkSpace 2.0 is live</span>
          <span className="w-1 h-1 rounded-full bg-primary" />
          <span className="text-muted-foreground font-normal">Real-time communication redefined</span>
        </div>

        {/* Hero Title */}
        <div className="space-y-4 max-w-4xl">
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-foreground leading-[1.1]">
            Conversations That Bring <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              People Closer.
            </span>
          </h1>

          <p className="text-base sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Experience seamless communication with real-time messaging, private conversations, group chats and effortless file sharing — all in one connected space.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <Button
            size="lg"
            variant="primary"
            onClick={() => onOpenAuth('register')}
            className="w-full sm:w-auto h-12 px-8 text-sm font-semibold shadow-glow"
          >
            Get Started
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>

          <Button
            size="lg"
            variant="outline"
            onClick={scrollToFeatures}
            className="w-full sm:w-auto h-12 px-8 text-sm font-semibold"
          >
            Explore Features
            <ChevronDown className="w-4 h-4 ml-2" />
          </Button>
        </div>

        {/* Interactive Chat Application Interface Preview */}
        <div className="w-full pt-10 sm:pt-14">
          <ProductMockup />
        </div>
      </div>
    </section>
  );
}

export default Hero;
