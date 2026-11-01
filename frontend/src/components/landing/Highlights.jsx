import React from 'react';
import { Zap, MessageSquare, Share2, Globe, Shield, Sparkles } from 'lucide-react';

export function Highlights() {
  const highlights = [
    {
      icon: Zap,
      title: 'Real-Time Communication',
      desc: 'Instant delivery powered by optimized WebSockets.',
    },
    {
      icon: MessageSquare,
      title: 'Private & Group Channels',
      desc: 'Seamlessly shift from 1-on-1 to community rooms.',
    },
    {
      icon: Share2,
      title: 'Easy File Sharing',
      desc: 'Share images, documents, and media effortlessly.',
    },
    {
      icon: Globe,
      title: 'Connected Experiences',
      desc: 'Live presence status and instant chat requests.',
    },
  ];

  return (
    <section className="py-12 border-y border-border/60 bg-muted/20 select-none">
      <div className="container max-w-7xl mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {highlights.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className="flex items-start gap-3.5 p-4 rounded-xl border border-border/50 bg-card/60 backdrop-blur-sm shadow-subtle hover:border-primary/40 transition-colors"
              >
                <div className="p-2.5 rounded-xl bg-primary/10 text-primary flex-shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-foreground">{item.title}</h4>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                    {item.desc}
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

export default Highlights;
