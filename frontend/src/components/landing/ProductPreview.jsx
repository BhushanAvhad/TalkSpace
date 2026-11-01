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
  Shield,
  Search,
  MoreVertical,
} from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';

export function ProductPreview() {
  return (
    <div className="w-full rounded-2xl border border-border/80 bg-card shadow-2xl overflow-hidden backdrop-blur-md transition-all text-xs">
      {/* Window Controls Bar */}
      <div className="h-9 bg-muted/40 border-b border-border/60 px-4 flex items-center justify-between select-none">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block" />
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
        </div>

        <div className="text-[11px] font-mono text-muted-foreground flex items-center gap-1.5">
          <Shield className="w-3 h-3 text-indigo-400" />
          <span>talkspace.internal/channel/general</span>
        </div>

        <div className="w-10" />
      </div>

      {/* Main Preview Container */}
      <div className="grid grid-cols-1 md:grid-cols-12 h-[420px] sm:h-[460px]">
        {/* Sidebar Preview (4 cols) */}
        <div className="hidden md:flex md:col-span-4 flex-col border-r border-border/60 bg-sidebar/80 select-none">
          {/* Header */}
          <div className="p-3 border-b border-border/40 flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-foreground">
              <span className="w-5 h-5 rounded-md bg-primary text-white flex items-center justify-center font-bold text-[10px]">
                T
              </span>
              <span className="text-xs">TalkSpace Team</span>
            </div>
            <Badge variant="glow" className="text-[9px] px-1.5 py-0">
              Live
            </Badge>
          </div>

          {/* Channels & Direct Conversations */}
          <div className="p-3 space-y-4 flex-1 overflow-hidden">
            <div className="space-y-1">
              <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-1">
                Channels
              </div>
              <div className="p-1.5 rounded-lg bg-primary text-primary-foreground font-semibold flex items-center justify-between shadow-glow">
                <div className="flex items-center gap-1.5">
                  <Hash className="w-3.5 h-3.5" />
                  <span>general</span>
                </div>
                <span className="text-[9px] bg-white/20 px-1 rounded-full">3</span>
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-1">
                Direct Messages
              </div>
              <div className="p-1.5 rounded-lg hover:bg-muted/60 text-foreground flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Avatar name="Sarah Connor" size="xs" status="online" />
                  <span className="font-medium">Sarah Connor</span>
                </div>
                <Circle className="w-1.5 h-1.5 fill-emerald-500 text-emerald-500" />
              </div>

              <div className="p-1.5 rounded-lg hover:bg-muted/60 text-foreground flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Avatar name="David Miller" size="xs" status="online" />
                  <span className="font-medium">David Miller</span>
                </div>
                <Circle className="w-1.5 h-1.5 fill-emerald-500 text-emerald-500" />
              </div>

              <div className="p-1.5 rounded-lg hover:bg-muted/60 text-foreground flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Avatar name="Elena Rostova" size="xs" status="away" />
                  <span className="font-medium">Elena Rostova</span>
                </div>
                <Circle className="w-1.5 h-1.5 fill-amber-500 text-amber-500" />
              </div>
            </div>
          </div>

          {/* User Status Bar */}
          <div className="p-2.5 border-t border-border/40 bg-muted/20 flex items-center gap-2">
            <Avatar name="Alex Rivers" size="xs" status="online" />
            <div className="truncate">
              <div className="font-bold text-foreground leading-none">Alex Rivers</div>
              <div className="text-[9px] text-muted-foreground mt-0.5">Connected</div>
            </div>
          </div>
        </div>

        {/* Chat Thread Viewport (8 cols) */}
        <div className="col-span-12 md:col-span-8 flex flex-col bg-background/60">
          {/* Header */}
          <div className="h-12 border-b border-border/60 px-4 flex items-center justify-between bg-card/40">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-primary/20 text-primary flex items-center justify-center font-bold">
                <Hash className="w-3.5 h-3.5" />
              </div>
              <div>
                <div className="font-bold text-foreground leading-none">general</div>
                <div className="text-[9px] text-muted-foreground mt-0.5">
                  Public Channel &bull; 8 Online
                </div>
              </div>
            </div>

            <Badge variant="outline" className="text-[9px] py-0 gap-1">
              <Sparkles className="w-2.5 h-2.5 text-indigo-400" />
              <span>Real-Time</span>
            </Badge>
          </div>

          {/* Message Thread */}
          <div className="flex-1 p-3.5 space-y-3 overflow-y-auto">
            {/* Message 1 */}
            <div className="flex gap-2 max-w-[85%]">
              <Avatar name="Sarah Connor" size="xs" className="mt-0.5" />
              <div className="space-y-0.5">
                <div className="text-[10px] font-semibold text-muted-foreground">Sarah Connor</div>
                <div className="p-2.5 rounded-xl rounded-tl-sm bg-card border border-border/80 text-foreground leading-relaxed shadow-subtle">
                  Welcome everyone to TalkSpace! Real-time sync is active across all sessions.
                </div>
                <div className="text-[8px] text-muted-foreground ml-1">10:24 AM</div>
              </div>
            </div>

            {/* Outgoing Message */}
            <div className="flex gap-2 max-w-[85%] ml-auto flex-row-reverse">
              <div className="space-y-0.5 text-right">
                <div className="p-2.5 rounded-xl rounded-tr-sm bg-gradient-to-tr from-indigo-600 to-purple-600 text-white leading-relaxed shadow-glow text-left">
                  Everything looks crisp. Sharing the architecture brief below:
                  <div className="mt-2 p-1.5 rounded-lg bg-white/15 border border-white/20 flex items-center gap-2 text-[10px] font-medium">
                    <FileText className="w-3.5 h-3.5 text-white" />
                    <span className="truncate">TalkSpace_Specs.pdf</span>
                  </div>
                </div>
                <div className="text-[8px] text-muted-foreground flex items-center justify-end gap-1 mr-1">
                  <span>10:26 AM</span>
                  <CheckCheck className="w-2.5 h-2.5 text-indigo-400" />
                </div>
              </div>
            </div>

            {/* Message 3 */}
            <div className="flex gap-2 max-w-[85%]">
              <Avatar name="David Miller" size="xs" className="mt-0.5" />
              <div className="space-y-0.5">
                <div className="text-[10px] font-semibold text-muted-foreground">David Miller</div>
                <div className="p-2.5 rounded-xl rounded-tl-sm bg-card border border-border/80 text-foreground leading-relaxed shadow-subtle">
                  Fast delivery and zero lag! Ready to start direct messaging.
                </div>
                <div className="text-[8px] text-muted-foreground ml-1">10:28 AM</div>
              </div>
            </div>

            {/* Live Typing */}
            <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground italic px-1">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping" />
              <span>Sarah is typing...</span>
            </div>
          </div>

          {/* Composer */}
          <div className="p-2.5 border-t border-border/60 bg-card/40">
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-muted/60 border border-input">
              <button type="button" className="p-1 text-muted-foreground hover:text-foreground">
                <Paperclip className="w-3.5 h-3.5" />
              </button>
              <button type="button" className="p-1 text-muted-foreground hover:text-foreground">
                <Smile className="w-3.5 h-3.5" />
              </button>
              <input
                type="text"
                readOnly
                value="Great! Let's connect on private chat now..."
                className="flex-1 bg-transparent border-0 text-xs text-foreground focus:outline-none"
              />
              <button
                type="button"
                className="w-6 h-6 rounded-md bg-primary text-white flex items-center justify-center shadow-glow"
              >
                <Send className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductPreview;

