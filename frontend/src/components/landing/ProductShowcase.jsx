import React, { useState } from 'react';
import {
  MessageSquare,
  Users,
  Paperclip,
  Smile,
  Send,
  Hash,
  Circle,
  FileText,
  CheckCheck,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export function ProductShowcase({ onOpenAuth }) {
  const [activeTab, setActiveTab] = useState('direct'); // 'direct' or 'channel'

  return (
    <section id="product" className="py-24 bg-muted/20 border-y border-border/60 relative select-none">
      <div className="container max-w-7xl mx-auto px-4 sm:px-8 space-y-16">
        {/* Section Header */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-primary uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> Product Showcase
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            A Clean Space Designed for True Focus
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            Every element is carefully considered. High contrast typography, clear conversation hierarchy, and distraction-free communication.
          </p>
        </div>

        {/* Tab switcher for mockup */}
        <div className="flex justify-center">
          <div className="inline-flex p-1 rounded-xl bg-card border border-border shadow-subtle text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab('direct')}
              className={`px-4 py-2 rounded-lg transition-all ${
                activeTab === 'direct'
                  ? 'bg-primary text-primary-foreground shadow-glow'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Direct Messaging View
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('channel')}
              className={`px-4 py-2 rounded-lg transition-all ${
                activeTab === 'channel'
                  ? 'bg-primary text-primary-foreground shadow-glow'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Public Community Channel
            </button>
          </div>
        </div>

        {/* Interactive Showcase Frame */}
        <div className="max-w-4xl mx-auto rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="h-16 px-6 border-b border-border/80 flex items-center justify-between bg-card/60 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              {activeTab === 'direct' ? (
                <Avatar name="Sarah Connor" size="md" status="online" />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold">
                  <Hash className="w-5 h-5" />
                </div>
              )}

              <div>
                <h3 className="font-bold text-sm text-foreground">
                  {activeTab === 'direct' ? 'Sarah Connor' : '# general-discussion'}
                </h3>
                <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Circle className="w-2 h-2 fill-emerald-500 text-emerald-500" />
                  <span>
                    {activeTab === 'direct'
                      ? 'Encrypted private session &bull; Active'
                      : 'Public team channel &bull; 12 online'}
                  </span>
                </div>
              </div>
            </div>

            <Button size="sm" variant="outline" onClick={() => onOpenAuth('register')}>
              Join Room
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </div>

          {/* Conversation Body */}
          <div className="p-6 space-y-4 h-96 overflow-y-auto bg-background/50 text-xs">
            {activeTab === 'direct' ? (
              <>
                <div className="flex gap-2.5 max-w-[80%]">
                  <Avatar name="Sarah Connor" size="xs" />
                  <div className="space-y-1">
                    <div className="text-[11px] font-semibold text-muted-foreground">Sarah Connor</div>
                    <div className="p-3 rounded-2xl rounded-tl-sm bg-card border border-border text-foreground leading-relaxed shadow-subtle">
                      Hey! Did you test the file attachment upload speed in the private chat view?
                    </div>
                    <div className="text-[9px] text-muted-foreground ml-1">11:02 AM</div>
                  </div>
                </div>

                <div className="flex gap-2.5 max-w-[80%] ml-auto flex-row-reverse">
                  <div className="space-y-1 text-right">
                    <div className="p-3 rounded-2xl rounded-tr-sm bg-gradient-to-tr from-indigo-600 to-purple-600 text-white leading-relaxed shadow-glow text-left">
                      Works smoothly. Both images and documents upload without socket delay!
                      <div className="mt-2 p-2 rounded-xl bg-white/15 border border-white/20 flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        <span>benchmark_results.pdf</span>
                      </div>
                    </div>
                    <div className="text-[9px] text-muted-foreground flex items-center justify-end gap-1 mr-1">
                      <span>11:04 AM</span>
                      <CheckCheck className="w-3 h-3 text-indigo-400" />
                    </div>
                  </div>
                </div>

                <div className="flex gap-2.5 max-w-[80%]">
                  <Avatar name="Sarah Connor" size="xs" />
                  <div className="space-y-1">
                    <div className="text-[11px] font-semibold text-muted-foreground">Sarah Connor</div>
                    <div className="p-3 rounded-2xl rounded-tl-sm bg-card border border-border text-foreground leading-relaxed shadow-subtle">
                      Awesome. Ready to onboard the rest of our development team today!
                    </div>
                    <div className="text-[9px] text-muted-foreground ml-1">11:05 AM</div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="flex gap-2.5 max-w-[80%]">
                  <Avatar name="David Miller" size="xs" />
                  <div className="space-y-1">
                    <div className="text-[11px] font-semibold text-muted-foreground">David Miller</div>
                    <div className="p-3 rounded-2xl rounded-tl-sm bg-card border border-border text-foreground leading-relaxed shadow-subtle">
                      Welcome everyone to the #general channel. Please review the community guidelines!
                    </div>
                    <div className="text-[9px] text-muted-foreground ml-1">09:15 AM</div>
                  </div>
                </div>

                <div className="flex gap-2.5 max-w-[80%] ml-auto flex-row-reverse">
                  <div className="space-y-1 text-right">
                    <div className="p-3 rounded-2xl rounded-tr-sm bg-gradient-to-tr from-indigo-600 to-purple-600 text-white leading-relaxed shadow-glow text-left">
                      All checked. Group message history loaded instantly from our Supabase database!
                    </div>
                    <div className="text-[9px] text-muted-foreground flex items-center justify-end gap-1 mr-1">
                      <span>09:20 AM</span>
                      <CheckCheck className="w-3 h-3 text-indigo-400" />
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Composer Mockup Bar */}
          <div className="p-4 border-t border-border bg-card/80">
            <div className="flex items-center gap-2 p-2 rounded-xl bg-muted/60 border border-input text-xs">
              <Paperclip className="w-4 h-4 text-muted-foreground" />
              <Smile className="w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                readOnly
                placeholder="Write a message to TalkSpace..."
                className="flex-1 bg-transparent border-0 text-foreground focus:outline-none"
              />
              <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center shadow-glow">
                <Send className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ProductShowcase;
