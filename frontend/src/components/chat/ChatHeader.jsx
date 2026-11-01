import React from 'react';
import {
  Hash,
  Menu,
  MoreVertical,
  Phone,
  Video,
  Info,
  ArrowLeft,
  Circle,
  Users,
} from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useChatStore } from '@/stores/useChatStore';

export function ChatHeader({ onOpenMobileSidebar }) {
  const { currentChat, setCurrentChat, activeUsers } = useChatStore();
  const isGroup = currentChat === 'group';

  return (
    <header className="h-16 flex items-center justify-between px-4 sm:px-6 border-b border-border bg-card/60 backdrop-blur-md select-none">
      <div className="flex items-center gap-3">
        {/* Mobile menu trigger */}
        <Button
          size="icon-sm"
          variant="outline"
          className="md:hidden"
          onClick={onOpenMobileSidebar}
        >
          <Menu className="w-4 h-4" />
        </Button>

        {/* Back to group button if currently in private chat */}
        {!isGroup && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setCurrentChat('group')}
            className="text-xs gap-1.5 px-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Group</span>
          </Button>
        )}

        {/* Avatar & Title */}
        <div className="flex items-center gap-2.5">
          {isGroup ? (
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold shadow-glow">
              <Hash className="w-5 h-5" />
            </div>
          ) : (
            <Avatar name={currentChat} size="md" status="online" />
          )}

          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-sm sm:text-base leading-none text-foreground">
                {isGroup ? 'General Discussion' : currentChat}
              </h2>
              {isGroup && (
                <Badge variant="glow" className="text-[10px] py-0 px-1.5 hidden sm:inline-flex">
                  Public Channel
                </Badge>
              )}
            </div>

            <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5">
              {isGroup ? (
                <>
                  <Users className="w-3 h-3 text-indigo-400" />
                  <span>{activeUsers.length} members online</span>
                </>
              ) : (
                <>
                  <Circle className="w-2 h-2 fill-emerald-500 text-emerald-500" />
                  <span>Active direct chat session</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Header Actions */}
      <div className="flex items-center gap-1">
        <Button size="icon-sm" variant="ghost" title="Channel Info">
          <Info className="w-4 h-4 text-muted-foreground" />
        </Button>
      </div>
    </header>
  );
}

export default ChatHeader;
