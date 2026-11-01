import React, { useState } from 'react';
import {
  Hash,
  Users,
  Search,
  MessageSquare,
  LogOut,
  Bell,
  UserPlus,
  Sparkles,
  ChevronRight,
  Shield,
  Circle,
} from 'lucide-react';
import { Logo } from '@/components/brand/Logo';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { useAuthStore } from '@/stores/useAuthStore';
import { useChatStore } from '@/stores/useChatStore';
import { cn } from '@/lib/utils';

export function Sidebar({ className, onCloseMobile }) {
  const { user, logout } = useAuthStore();
  const {
    currentChat,
    setCurrentChat,
    activeUsers,
    chatRequests,
    sendChatRequest,
    respondChatRequest,
  } = useChatStore();

  const [search, setSearch] = useState('');

  // Filter online users (excluding current user)
  const otherUsers = activeUsers.filter(
    (u) => u.toLowerCase() !== user?.username?.toLowerCase()
  );

  const filteredUsers = otherUsers.filter((u) =>
    u.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelectChat = (target) => {
    setCurrentChat(target);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <aside
      className={cn(
        'w-80 h-full flex flex-col bg-sidebar border-r border-sidebar-border text-sidebar-foreground select-none',
        className
      )}
    >
      {/* Top Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border/60">
        <Logo variant="full" size="sm" />
        <ThemeToggle />
      </div>

      {/* User Search */}
      <div className="p-3 border-b border-sidebar-border/40">
        <Input
          placeholder="Search users or channels..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          icon={<Search className="w-3.5 h-3.5" />}
          className="h-8 text-xs bg-muted/40"
        />
      </div>

      {/* Main Navigation List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-6">
        {/* Pending Chat Requests Alert (if any) */}
        {chatRequests.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-amber-500 uppercase tracking-wider px-1">
              <span className="flex items-center gap-1.5">
                <Bell className="w-3.5 h-3.5" /> Chat Requests
              </span>
              <Badge variant="warning" className="px-1.5 py-0 text-[10px]">
                {chatRequests.length}
              </Badge>
            </div>

            <div className="space-y-1.5">
              {chatRequests.map((req) => (
                <div
                  key={req.from}
                  className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs space-y-2"
                >
                  <div className="font-semibold text-foreground flex items-center gap-1.5">
                    <UserPlus className="w-3.5 h-3.5 text-amber-500" />
                    <span>{req.from}</span>
                    <span className="text-muted-foreground font-normal">wants to chat</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="xs"
                      variant="primary"
                      className="flex-1 h-6 text-[11px]"
                      onClick={() => respondChatRequest(req.from, true)}
                    >
                      Accept
                    </Button>
                    <Button
                      size="xs"
                      variant="outline"
                      className="flex-1 h-6 text-[11px]"
                      onClick={() => respondChatRequest(req.from, false)}
                    >
                      Decline
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Public Channels */}
        <div className="space-y-1">
          <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider px-2 mb-2 flex items-center justify-between">
            <span>Channels</span>
            <span className="text-[10px] font-normal text-muted-foreground">Public</span>
          </div>

          <button
            type="button"
            onClick={() => handleSelectChat('group')}
            className={cn(
              'w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-medium transition-all',
              currentChat === 'group'
                ? 'bg-primary text-primary-foreground shadow-glow'
                : 'hover:bg-muted text-foreground'
            )}
          >
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  'w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs',
                  currentChat === 'group' ? 'bg-white/20' : 'bg-muted text-muted-foreground'
                )}
              >
                <Hash className="w-4 h-4" />
              </div>
              <div className="text-left">
                <div className="font-semibold leading-none">General Group</div>
                <div
                  className={cn(
                    'text-[10px] mt-0.5',
                    currentChat === 'group' ? 'text-primary-foreground/80' : 'text-muted-foreground'
                  )}
                >
                  Public channel
                </div>
              </div>
            </div>

            <Badge
              variant={currentChat === 'group' ? 'secondary' : 'outline'}
              className="text-[10px] px-1.5 py-0"
            >
              {activeUsers.length} online
            </Badge>
          </button>
        </div>

        {/* Direct Messages & Online Users Directory */}
        <div className="space-y-1">
          <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider px-2 mb-2 flex items-center justify-between">
            <span>Direct Messages</span>
            <span className="text-[10px] text-emerald-500 font-semibold flex items-center gap-1">
              <Circle className="w-2 h-2 fill-emerald-500 text-emerald-500" />
              {otherUsers.length} Active
            </span>
          </div>

          {filteredUsers.length === 0 ? (
            <div className="px-3 py-4 text-center rounded-xl bg-muted/20 border border-border/30 text-xs text-muted-foreground">
              {search ? 'No matching users found.' : 'No other users currently online.'}
            </div>
          ) : (
            filteredUsers.map((partner) => {
              const isSelected = currentChat === partner;
              return (
                <div
                  key={partner}
                  className={cn(
                    'group w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer',
                    isSelected
                      ? 'bg-primary text-primary-foreground shadow-glow'
                      : 'hover:bg-muted text-foreground'
                  )}
                  onClick={() => handleSelectChat(partner)}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Avatar name={partner} size="sm" status="online" />
                    <div className="truncate text-left">
                      <div className="font-semibold truncate leading-none">{partner}</div>
                      <div
                        className={cn(
                          'text-[10px] mt-0.5 truncate',
                          isSelected ? 'text-primary-foreground/80' : 'text-emerald-500 font-medium'
                        )}
                      >
                        Active now
                      </div>
                    </div>
                  </div>

                  {/* Send chat request button */}
                  {!isSelected && (
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      title={`Send chat request to ${partner}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        sendChatRequest(partner, user?.username);
                        alert(`Chat request sent to ${partner}`);
                      }}
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                    </Button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Bottom Profile Bar */}
      <div className="p-3 border-t border-sidebar-border/60 bg-muted/20 flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          <Avatar name={user?.username || 'You'} size="sm" status="online" />
          <div className="min-w-0">
            <div className="font-bold text-xs truncate leading-none text-foreground">
              {user?.username}
            </div>
            <div className="text-[10px] text-muted-foreground mt-0.5 truncate">
              Connected to TalkSpace
            </div>
          </div>
        </div>

        <Button
          size="icon-sm"
          variant="ghost"
          onClick={logout}
          title="Sign Out"
          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
        >
          <LogOut className="w-4 h-4" />
        </Button>
      </div>
    </aside>
  );
}

export default Sidebar;

