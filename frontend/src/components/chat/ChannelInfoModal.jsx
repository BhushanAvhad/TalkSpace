import React from 'react';
import {
  Hash,
  Users,
  Shield,
  Sparkles,
  Calendar,
  Circle,
  MessageSquare,
  User,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/Dialog';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useChatStore } from '@/stores/useChatStore';

export function ChannelInfoModal({ open, onOpenChange }) {
  const { currentChat, activeUsers, setCurrentChat } = useChatStore();
  const isGroup = currentChat === 'group';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-6 bg-card border-border text-foreground shadow-2xl rounded-3xl">
        <DialogHeader className="space-y-1">
          <div className="flex items-center gap-3">
            {isGroup ? (
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold shadow-glow">
                <Hash className="w-5 h-5" />
              </div>
            ) : (
              <Avatar name={currentChat} size="md" status="online" />
            )}
            <div>
              <DialogTitle className="text-lg font-bold">
                {isGroup ? '#general' : `@${currentChat}`}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                {isGroup ? 'Public Channel Information' : 'Direct Conversation Profile'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Description */}
          <div className="p-3.5 rounded-2xl bg-muted/30 border border-border/60 text-xs leading-relaxed text-muted-foreground space-y-1">
            <span className="font-semibold text-foreground block">
              {isGroup ? 'About this channel' : 'Direct Message Details'}
            </span>
            <p>
              {isGroup
                ? 'Welcome to #general — the default public channel for all TalkSpace users. Messages sent here are stored in Supabase and broadcast in real time to everyone connected.'
                : `This is a private 1-on-1 direct messaging session between you and @${currentChat}. All conversations are encrypted and saved securely.`}
            </p>
          </div>

          {/* Member Roster (for Group) */}
          {isGroup ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold px-1 text-foreground">
                <span className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-primary" />
                  Online Members ({activeUsers.length})
                </span>
                <Badge variant="glow" className="text-[10px]">
                  Realtime
                </Badge>
              </div>

              <div className="max-h-48 overflow-y-auto space-y-1 pr-1 rounded-2xl border border-border/60 p-2 bg-muted/20">
                {activeUsers.map((username) => (
                  <div
                    key={username}
                    className="flex items-center justify-between p-2 rounded-xl hover:bg-muted/60 transition-colors text-xs"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <Avatar name={username} size="xs" status="online" />
                      <span className="font-medium truncate text-foreground">@{username}</span>
                    </div>
                    <Button
                      size="xs"
                      variant="ghost"
                      className="h-6 text-[11px] text-muted-foreground hover:text-foreground"
                      onClick={() => {
                        setCurrentChat(username);
                        onOpenChange(false);
                      }}
                    >
                      Message
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-3.5 rounded-2xl bg-muted/20 border border-border/60 space-y-2 text-xs">
              <div className="flex items-center justify-between text-muted-foreground">
                <span>Direct Contact</span>
                <span className="font-semibold text-foreground">@{currentChat}</span>
              </div>
              <div className="flex items-center justify-between text-muted-foreground">
                <span>Presence</span>
                <span className="text-emerald-500 font-semibold flex items-center gap-1">
                  <Circle className="w-2 h-2 fill-emerald-500" /> Active Now
                </span>
              </div>
              <div className="flex items-center justify-between text-muted-foreground">
                <span>History Retention</span>
                <span className="font-semibold text-foreground">Persistent (Supabase)</span>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ChannelInfoModal;

