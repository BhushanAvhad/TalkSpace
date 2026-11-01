import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Zap, HeartHandshake, Eye, CheckCircle2 } from 'lucide-react';

export function WhyTalkSpace() {
  const points = [
    {
      icon: Zap,
      title: 'Fast & Responsive Messaging',
      desc: 'Optimized WebSocket architecture streams every keystroke, typing alert, and message bubble with instantaneous feedback and zero polling.',
    },
    {
      icon: Eye,
      title: 'Clean Communication Experience',
      desc: 'No algorithm feeds, bloated status stories, or notification overload. An intentional workspace created purely for direct and group conversations.',
    },
    {
      icon: HeartHandshake,
      title: 'Simple and Intuitive Interface',
      desc: 'Engineered with familiar conventions inspired by world-class software. High-contrast typography, ergonomic dark & light themes, and zero learning curve.',
    },
  ];

  return (
    <section id="why-us" className="py-20 md:py-28 relative select-none">
      <div id="about" className="container max-w-7xl mx-auto px-4 sm:px-8 space-y-16">
        {/* Section Header */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-primary uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> About TalkSpace
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            Why Choose TalkSpace?
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            We stripped away the noise so that you can communicate and collaborate without friction.
          </p>
        </div>

        {/* 3 Value Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {points.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="p-8 rounded-2xl border border-border/80 bg-card/60 backdrop-blur-sm space-y-4 shadow-subtle hover:border-primary/40 transition-colors"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 border border-primary/30 text-primary flex items-center justify-center">
                  <Icon className="w-6 h-6" />
                </div>

                <h3 className="font-bold text-lg text-foreground">{item.title}</h3>

                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  {item.desc}
                </p>

                <div className="pt-2 flex items-center gap-2 text-xs font-semibold text-emerald-500">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Production Ready</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default WhyTalkSpace;

