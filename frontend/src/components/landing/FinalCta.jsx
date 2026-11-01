import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function FinalCta({ onOpenAuth }) {
  return (
    <section className="py-24 relative overflow-hidden select-none">
      {/* Background Gradient Aura */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent pointer-events-none" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-64 bg-indigo-500/15 rounded-full blur-[100px] pointer-events-none" />

      <div className="container max-w-5xl mx-auto px-4 sm:px-8 relative z-10">
        <div className="p-10 sm:p-16 rounded-3xl border border-primary/30 bg-card/90 backdrop-blur-xl shadow-glow-lg text-center space-y-6 relative overflow-hidden">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ready for real-time collaboration?</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground max-w-2xl mx-auto leading-tight">
            Your conversations deserve a better space.
          </h2>

          <p className="text-sm sm:text-base text-muted-foreground max-w-lg mx-auto leading-relaxed">
            Start connecting and make every conversation count. Free to join, instant setup, and zero clutter.
          </p>

          <div className="pt-2 flex justify-center">
            <Button
              size="lg"
              variant="primary"
              onClick={() => onOpenAuth('register')}
              className="h-12 px-8 text-sm font-semibold shadow-glow"
            >
              Join TalkSpace
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default FinalCta;
