import React from 'react';
import { Zap, ShieldCheck, HeartHandshake, Eye, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/Card';

export function WhyTalkSpace() {
  const points = [
    {
      icon: Zap,
      title: 'Uncompromised Speed',
      description:
        'Built with Socket.IO and optimized real-time channels, delivering messages with sub-millisecond response latency without page refreshes.',
    },
    {
      icon: ShieldCheck,
      title: 'Simplicity & Pure Focus',
      description:
        'No overwhelming clutter, bloated menus, or unnecessary distractions. Every pixel is crafted around seamless, focused conversation.',
    },
    {
      icon: HeartHandshake,
      title: 'Connected Communication',
      description:
        'Effortlessly toggle between high-energy group channels and focused 1-on-1 private messaging without switching tools.',
    },
    {
      icon: Eye,
      title: 'Modern & Ergonomic UI',
      description:
        'Engineered for long-session comfort with deep graphite dark mode and crisp slate light mode, fluid animations, and high text contrast.',
    },
  ];

  return (
    <section id="why-us" className="py-24 relative select-none">
      <div className="container max-w-7xl mx-auto px-4 sm:px-8 space-y-16">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-primary uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> Why Choose Us
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            Built for people who value clear conversation.
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            Communication tools should make talking easier, not more complicated. Here is why TalkSpace stands apart.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {points.map((pt, index) => {
            const Icon = pt.icon;
            return (
              <div
                key={index}
                className="flex items-start gap-5 p-6 rounded-2xl border border-border bg-card/60 backdrop-blur-sm shadow-subtle hover:border-primary/40 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 border border-primary/30 text-primary flex items-center justify-center flex-shrink-0 shadow-subtle">
                  <Icon className="w-6 h-6" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="font-bold text-base text-foreground">{pt.title}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {pt.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default WhyTalkSpace;
