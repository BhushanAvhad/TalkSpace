import React from 'react';
import { ArrowRight, Sparkles, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/stores/useAuthStore';

export function FinalCta({ onOpenAuth, onEnterChat }) {
  const { isAuthenticated } = useAuthStore();

  return (
    <section className="py-20 md:py-28 relative overflow-hidden select-none bg-muted/20 border-t border-border/60">
      {/* Background Radial Glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent pointer-events-none" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2/3 h-56 bg-indigo-500/15 rounded-full blur-[100px] pointer-events-none" />

      <div className="container max-w-4xl mx-auto px-4 sm:px-8 relative z-10 text-center space-y-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Real-time communication in your browser</span>
        </div>

        <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground leading-tight">
          Ready to experience <br />
          <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            TalkSpace?
          </span>
        </h2>

        <p className="text-sm sm:text-base text-muted-foreground max-w-lg mx-auto leading-relaxed">
          Join now to connect with active users, share files, and enjoy frictionless live communication.
        </p>

        <div className="pt-2 flex justify-center">
          <Button
            size="lg"
            variant="primary"
            onClick={isAuthenticated ? onEnterChat : () => onOpenAuth('register')}
            className="h-12 px-8 text-xs sm:text-sm font-semibold shadow-glow"
          >
            {isAuthenticated ? (
              <>
                <MessageSquare className="w-4 h-4 mr-2" />
                Launch Live Chat
              </>
            ) : (
              <>
                Get Started
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>
    </section>
  );
}

export default FinalCta;

