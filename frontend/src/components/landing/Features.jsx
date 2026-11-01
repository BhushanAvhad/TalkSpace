import React from 'react';
import {
  Zap,
  Lock,
  Users,
  Paperclip,
  Activity,
  Bell,
  MessageCircle,
  UserCheck,
  Sparkles,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';

export function Features() {
  const features = [
    {
      icon: Zap,
      title: 'Real-Time Messaging',
      desc: 'Instant conversations with responsive message delivery powered by persistent WebSocket channels.',
    },
    {
      icon: Lock,
      title: 'Private Conversations',
      desc: 'Dedicated one-to-one messaging with direct invite requests and isolated conversation histories.',
    },
    {
      icon: Users,
      title: 'Group Chats',
      desc: 'Bring multiple people together in community channels designed for team collaboration.',
    },
    {
      icon: Paperclip,
      title: 'File Sharing',
      desc: 'Share documents, images, and other supported files directly into the conversation stream.',
    },
    {
      icon: Activity,
      title: 'Online Presence',
      desc: 'See which users are currently active in your space with real-time status indicators.',
    },
    {
      icon: Bell,
      title: 'Smart Notifications',
      desc: 'Stay informed about new messages and incoming chat invitations with toast alerts and subtle audio.',
    },
    {
      icon: MessageCircle,
      title: 'Typing Indicators',
      desc: 'Know when someone is actively composing a message to keep conversations natural and in sync.',
    },
    {
      icon: UserCheck,
      title: 'Simple Connections',
      desc: 'Manage your active directory, send chat invitations, and approve or decline incoming requests.',
    },
  ];

  return (
    <section id="features" className="py-24 relative select-none">
      <div className="container max-w-7xl mx-auto px-4 sm:px-8 space-y-16">
        {/* Section Header */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-primary uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> Capabilities
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            Everything you need to stay connected.
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            Engineered with a focus on speed, reliability, and human connection. No clutter — just real-time dialogue.
          </p>
        </div>

        {/* 8 Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card
                key={index}
                className="group p-6 hover:border-primary/50 transition-all duration-300 hover:shadow-glow hover:-translate-y-1 bg-card/80 backdrop-blur-sm flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all duration-300 shadow-subtle">
                    <Icon className="w-6 h-6" />
                  </div>

                  <h3 className="font-bold text-base text-foreground group-hover:text-primary transition-colors">
                    {feature.title}
                  </h3>

                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {feature.desc}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-border/40 flex items-center text-[11px] font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                  Active feature &bull; Realtime enabled
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default Features;
