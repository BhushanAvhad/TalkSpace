import React from 'react';
import {
  Hash,
  Send,
  Paperclip,
  Smile,
  Circle,
  FileText,
  CheckCheck,
  Sparkles,
  Users,
  Shield,
  MessageSquare,
} from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';

export function ProductMockup() {
  return (
    <div className="relative w-full max-w-5xl mx-auto rounded-2xl border border-border/80 bg-card/95 shadow-glow-lg overflow-hidden backdrop-blur-xl transition-all">
      {/* Window Controls Bar */}
      <div className="h-10 bg-muted/50 border-b border-border/60 px-4 flex items-center justify-between select-none">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
          <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
          <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
        </div>

        <div className="text-[11px] font-mono text-muted-foreground flex items-center gap-1.5">
          <Shield className="w-3 h-3 text-emerald-500" />
          <span>talkspace.app/live-workspace</span>
        </div>

        <div className="w-12" />
      </div>

      {/* Mockup Workspace Container */}
      <div className="grid grid-cols-1 md:grid-cols-12 h-[480px] sm:h-[540px] text-xs">
        {/* Mockup Sidebar (4 cols on desktop) */}
        <div className="hidden md:flex md:col-span-4 flex-col border-r border-border/60 bg-sidebar/70 select-none">
          {/* Header */}
          <div className="p-3.5 border-b border-border/40 flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-foreground">
              <span className="w-6 h-6 rounded-lg bg-primary/20 text-primary flex items-center justify-center font-bold text-xs">
                T
              </span>
              <span>TalkSpace Hub</span>
            </div>
            <Badge variant="glow" className="text-[10px] px-1.5 py-0">
              Live
            </Badge>
          </div>

          {/* Channels & Direct Chats list */}
          <div className="p-3 space-y-4 flex-1 overflow-hidden">
            <div className="space-y-1">
              <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-2">
                Channels
              </div>
              <div className="p-2 rounded-xl bg-primary text-primary-foreground font-semibold flex items-center justify-between shadow-glow">
                <div className="flex items-center gap-2">
                  <Hash className="w-3.5 h-3.5" />
                  <span>general</span>
                </div>
                <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full">3</span>
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-2">
                Direct Conversations
              </div>
              <div className="p-2 rounded-xl hover:bg-muted/50 text-foreground flex items-center justify-between cursor-pointer">
                <div className="flex items-center gap-2">
                  <Avatar name="Sarah Connor" size="xs" status="online" />
                  <span className="font-medium">Sarah Connor</span>
                </div>
                <Circle className="w-2 h-2 fill-emerald-500 text-emerald-500" />
              </div>
              <div className="p-2 rounded-xl hover:bg-muted/50 text-foreground flex items-center justify-between cursor-pointer">
                <div className="flex items-center gap-2">
                  <Avatar name="David Miller" size="xs" status="online" />
                  <span className="font-medium">David Miller</span>
                </div>
                <Circle className="w-2 h-2 fill-emerald-500 text-emerald-500" />
              </div>
              <div className="p-2 rounded-xl hover:bg-muted/50 text-foreground flex items-center justify-between cursor-pointer">
                <div className="flex items-center gap-2">
                  <Avatar name="Elena Rostova" size="xs" status="away" />
                  <span className="font-medium">Elena Rostova</span>
                </div>
                <Circle className="w-2 h-2 fill-amber-500 text-amber-500" />
              </div>
            </div>
          </div>

          {/* User Profile Bar */}
          <div className="p-3 border-t border-border/40 bg-muted/20 flex items-center gap-2.5">
            <Avatar name="Alex Rivers" size="sm" status="online" />
            <div className="truncate">
              <div className="font-bold text-foreground leading-none">Alex Rivers</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">Online &bull; Pro</div>
            </div>
          </div>
        </div>

        {/* Mockup Chat Viewport (8 cols on desktop) */}
        <div className="col-span-12 md:col-span-8 flex flex-col bg-background/50">
          {/* Chat Header */}
          <div className="h-14 border-b border-border/60 px-4 flex items-center justify-between bg-card/40">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-primary/20 text-primary flex items-center justify-center font-bold text-xs">
                <Hash className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-foreground leading-none">general</div>
                <div className="text-[10px] text-muted-foreground mt-0.5">
                  Public collaborative channel &bull; 8 active
                </div>
              </div>
            </div>

            <Badge variant="outline" className="text-[10px] py-0.5 gap-1">
              <Sparkles className="w-3 h-3 text-indigo-400" />
              <span>Realtime</span>
            </Badge>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 p-4 space-y-4 overflow-y-auto">
            {/* Incoming message 1 */}
            <div className="flex gap-2.5 max-w-[80%]">
              <Avatar name="Sarah Connor" size="xs" className="mt-1" />
              <div className="space-y-1">
                <div className="text-[11px] font-semibold text-muted-foreground">Sarah Connor</div>
                <div className="p-3 rounded-2xl rounded-tl-sm bg-card border border-border/70 text-foreground leading-relaxed shadow-subtle">
                  Welcome to TalkSpace! Has everyone checked the new collaborative feature set? 🚀
                </div>
                <div className="text-[9px] text-muted-foreground ml-1">10:42 AM</div>
              </div>
            </div>

            {/* Outgoing message (My message) */}
            <div className="flex gap-2.5 max-w-[80%] ml-auto flex-row-reverse">
              <div className="space-y-1 text-right">
                <div className="p-3 rounded-2xl rounded-tr-sm bg-gradient-to-tr from-indigo-600 to-purple-600 text-white leading-relaxed shadow-glow text-left">
                  Yes, real-time message synchronization is instantaneous. Attached the updated team brief below!
                  <div className="mt-2.5 p-2 rounded-xl bg-white/15 border border-white/20 flex items-center gap-2 text-[11px] font-medium">
                    <FileText className="w-4 h-4 text-white" />
                    <span className="truncate">TalkSpace_Roadmap_2026.pdf</span>
                  </div>
                </div>
                <div className="text-[9px] text-muted-foreground flex items-center justify-end gap-1 mr-1">
                  <span>10:44 AM</span>
                  <CheckCheck className="w-3 h-3 text-indigo-400" />
                </div>
              </div>
            </div>

            {/* Incoming message 2 */}
            <div className="flex gap-2.5 max-w-[80%]">
              <Avatar name="David Miller" size="xs" className="mt-1" />
              <div className="space-y-1">
                <div className="text-[11px] font-semibold text-muted-foreground">David Miller</div>
                <div className="p-3 rounded-2xl rounded-tl-sm bg-card border border-border/70 text-foreground leading-relaxed shadow-subtle">
                  The UI is remarkably responsive. Loving both the dark and light modes!
                </div>
                <div className="text-[9px] text-muted-foreground ml-1">10:45 AM</div>
              </div>
            </div>

            {/* Live Typing Indicator */}
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground italic px-1 pt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping" />
              <span>Sarah is typing...</span>
            </div>
          </div>

          {/* Mockup Composer */}
          <div className="p-3 border-t border-border/60 bg-card/30">
            <div className="flex items-center gap-2 p-1.5 rounded-xl bg-muted/60 border border-input">
              <button type="button" className="p-1 text-muted-foreground hover:text-foreground">
                <Paperclip className="w-3.5 h-3.5" />
              </button>
              <button type="button" className="p-1 text-muted-foreground hover:text-foreground">
                <Smile className="w-3.5 h-3.5" />
              </button>
              <input
                type="text"
                readOnly
                value="Great! Let's schedule the live collaboration session..."
                className="flex-1 bg-transparent border-0 text-xs text-foreground focus:outline-none"
              />
              <button
                type="button"
                className="w-7 h-7 rounded-lg bg-primary text-white flex items-center justify-center shadow-glow"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Subtle Floating Interactive Notification Badges */}
      <div className="hidden lg:flex items-center gap-3 absolute -bottom-5 right-8 p-3 rounded-2xl bg-card border border-border shadow-glow text-xs font-semibold animate-bounce duration-1000">
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
        <span className="text-foreground">New live message received</span>
        <span className="text-[10px] text-muted-foreground">just now</span>
      </div>

      <div className="hidden lg:flex items-center gap-2.5 absolute top-16 -left-6 p-2.5 rounded-2xl bg-card border border-border shadow-premium text-xs font-semibold">
        <Avatar name="Elena Rostova" size="xs" status="online" />
        <span className="text-foreground">Elena accepted your chat request</span>
      </div>
    </div>
  );
}

export default ProductMockup;
