import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Lock, Users, Paperclip, Activity, ShieldCheck, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/Card';

export function Features() {
  const features = [
    {
      icon: Zap,
      title: 'Real-Time Messaging',
      description:
        'Deliver messages instantaneously using optimized Socket.IO WebSockets with sub-millisecond response latency.',
    },
    {
      icon: Lock,
      title: 'Private Conversations',
      description:
        'Send 1-on-1 direct messages with isolated history channels and a dedicated request approval workflow.',
    },
    {
      icon: Users,
      title: 'Group Discussions',
      description:
        'Bring everyone into public community channels like #general where all connected members collaborate live.',
    },
    {
      icon: Paperclip,
      title: 'Media Sharing',
      description:
        'Upload images with inline lightboxes and attach documents with one-click direct download cards.',
    },
    {
      icon: Activity,
      title: 'Online Presence',
      description:
        'Stay informed about who is currently available with real-time green presence indicator dots and online counts.',
    },
    {
      icon: ShieldCheck,
      title: 'Secure Communication',
      description:
        'Encrypted credentials with salted cryptographic PBKDF2 SHA-512 hashes and Supabase Row-Level Security.',
    },
  ];

  return (
    <section id="features" className="py-20 md:py-28 relative select-none bg-muted/20 border-t border-border/60">
      <div className="container max-w-7xl mx-auto px-4 sm:px-8 space-y-14">
        {/* Section Header */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-primary uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> Core Capabilities
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            Everything you need to communicate clearly.
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            Designed to remove friction from digital conversations. Focus purely on the message.
          </p>
        </div>

        {/* 6 Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
              >
                <Card className="p-6 h-full border border-border/80 bg-card hover:border-primary/50 hover:shadow-glow transition-all duration-300 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>

                    <h3 className="font-bold text-base text-foreground">
                      {feature.title}
                    </h3>

                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-border/40 text-[11px] font-semibold text-primary">
                    Instant &bull; Cloud Connected
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default Features;

