import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, ChevronDown, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ProductPreview } from './ProductPreview';
import { useAuthStore } from '@/stores/useAuthStore';

export function Hero({ onOpenAuth, onEnterChat }) {
  const { isAuthenticated } = useAuthStore();

  const scrollToFeatures = () => {
    const el = document.getElementById('features');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="home" className="relative pt-28 pb-16 md:pt-36 md:pb-24 overflow-hidden select-none">
      {/* Subtle background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-indigo-500/15 via-purple-500/10 to-transparent blur-[120px] pointer-events-none rounded-full" />

      <div className="container max-w-7xl mx-auto px-4 sm:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Headline, Description & CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="lg:col-span-6 space-y-6 text-center lg:text-left"
          >
            {/* Announcement Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-semibold shadow-subtle">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>TalkSpace Live Messaging</span>
              <span className="w-1 h-1 rounded-full bg-primary" />
              <span className="text-muted-foreground font-normal">Real-Time Platform</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-foreground leading-[1.15]">
              Real-Time Messaging <br />
              <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                Made Effortless.
              </span>
            </h1>

            {/* Short Supporting Description */}
            <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Connect instantly with team members and friends through private 1-on-1 conversations, collaborative group channels, and seamless file sharing.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
              <Button
                size="lg"
                variant="primary"
                onClick={isAuthenticated ? onEnterChat : () => onOpenAuth('register')}
                className="w-full sm:w-auto h-11 px-7 text-xs sm:text-sm font-semibold shadow-glow"
              >
                {isAuthenticated ? (
                  <>
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Start Chatting
                  </>
                ) : (
                  <>
                    Start Chatting
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>

              <Button
                size="lg"
                variant="outline"
                onClick={scrollToFeatures}
                className="w-full sm:w-auto h-11 px-6 text-xs sm:text-sm font-semibold"
              >
                Explore Features
                <ChevronDown className="w-4 h-4 ml-2" />
              </Button>
            </div>

            {/* Trust points */}
            <div className="pt-4 flex items-center justify-center lg:justify-start gap-6 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Instant WebSocket Sync</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-indigo-500" />
                <span>Encrypted Storage</span>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Custom Chat Application Preview */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.15, ease: 'easeOut' }}
            className="lg:col-span-6 w-full"
          >
            <ProductPreview />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default Hero;

