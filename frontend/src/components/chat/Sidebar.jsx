import React, { useState } from 'react';
import {
  Hash,
  Users,
  Search,
  MessageSquare,
  LogOut,
  Bell,
  BellOff,
  UserPlus,
  Sparkles,
  ChevronRight,
  Shield,
  Circle,
  Home,
  Settings,
  Activity,
  Wifi,
  WifiOff,
  User,
} from 'lucide-react';
import { Logo } from '@/components/brand/Logo';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { UserProfileModal } from './UserProfileModal';
import { useAuthStore } from '@/stores/useAuthStore';
import { useChatStore } from '@/stores/useChatStore';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export function Sidebar({ className, onCloseMobile, onBackToHome, onOpenSearchModal }) {
  const { user, logout } = useAuthStore();
  const {
    currentChat,
    setCurrentChat,
    activeUsers,
    chatRequests,
    sendChatRequest,
    respondChatRequest,
    unreadCounts,
    connectionStatus,
    mutedChats,
    userProfiles,
  } = useChatStore();

  const [search, setSearch] = useState('');
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [inspectedUser, setInspectedUser] = useState(null);

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

  const handleSendChatRequest = (partner) => {
    sendChatRequest(partner, user?.username);
    toast.success(`Chat request sent to @${partner}`);
  };

  const handleOpenMyProfile = () => {
    setInspectedUser(null);
    setProfileModalOpen(true);
  };

  const handleOpenUserProfile = (username) => {
    setInspectedUser(username);
    setProfileModalOpen(true);
  };

  const isConnected = connectionStatus === 'connected';

  return (
    <>
      <aside
        className={cn(
          'w-80 h-full flex flex-col bg-sidebar border-r border-sidebar-border text-sidebar-foreground select-none relative',
          className
        )}
      >
        {/* Top Brand Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border/60">
          <Logo variant="full" size="sm" showTagline={false} />
          
          <div className="flex items-center gap-1">
            {onBackToHome && (
              <Button
                size="icon-sm"
                variant="ghost"
                onClick={onBackToHome}
                title="Return to Landing Page"
                className="text-muted-foreground hover:text-foreground"
              >
                <Home className="w-4 h-4" />
              </Button>
            )}
            <ThemeToggle />
          </div>
        </div>

        {/* Live Workspace & Connection Status Banner */}
        <div className="px-4 py-2 border-b border-sidebar-border/40 bg-muted/20 flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-2 text-muted-foreground">
            <span
              className={cn(
                'w-2 h-2 rounded-full',
                isConnected ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]' : 'bg-rose-500'
              )}
            />
            <span className="font-medium text-foreground">TalkSpace Realtime</span>
          </div>

          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
            {isConnected ? (
              <span className="text-emerald-500 font-semibold flex items-center gap-1">
                <Wifi className="w-3 h-3" /> Live
              </span>
            ) : (
              <span className="text-rose-500 font-semibold flex items-center gap-1">
                <WifiOff className="w-3 h-3" /> Offline
              </span>
            )}
          </div>
        </div>

        {/* Search Bar with Global Search Trigger */}
        <div className="p-3 border-b border-sidebar-border/40 flex items-center gap-2">
          <Input
            placeholder="Search channels or users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<Search className="w-3.5 h-3.5 text-muted-foreground" />}
            className="h-8 text-xs bg-muted/40 rounded-xl flex-1"
          />
          {onOpenSearchModal && (
            <button
              type="button"
              onClick={onOpenSearchModal}
              title="Global Search (Ctrl+K)"
              className="p-1.5 rounded-xl border border-border/80 bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground text-[10px] font-mono flex items-center justify-center flex-shrink-0"
            >
              ⌘K
            </button>
          )}
        </div>

        {/* Scrollable Navigation List */}
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
                    className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs space-y-2 animate-fade-in"
                  >
                    <div className="flex items-center gap-2">
                      <Avatar name={req.from} size="xs" />
                      <span className="font-semibold text-foreground">@{req.from}</span>
                      <span className="text-[11px] text-muted-foreground">wants to chat</span>
                    </div>

                    <div className="flex items-center gap-1.5 justify-end">
                      <Button
                        size="xs"
                        variant="ghost"
                        onClick={() => respondChatRequest(req.from, false)}
                        className="text-[11px] h-6 px-2 hover:bg-muted"
                      >
                        Decline
                      </Button>
                      <Button
                        size="xs"
                        variant="primary"
                        onClick={() => respondChatRequest(req.from, true)}
                        className="text-[11px] h-6 px-2.5"
                      >
                        Accept
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Channels / Group section */}
          <div className="space-y-1">
            <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider px-2 mb-2 flex items-center justify-between">
              <span>Public Channels</span>
              <span className="text-[10px] font-medium text-indigo-400">48h retention</span>
            </div>

            <button
              type="button"
              onClick={() => handleSelectChat('group')}
              className={cn(
                'w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-medium transition-all group',
                currentChat === 'group'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-glow'
                  : 'hover:bg-muted text-foreground'
              )}
            >
              <div className="flex items-center gap-2 min-w-0">
                <div
                  className={cn(
                    'w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs',
                    currentChat === 'group' ? 'bg-white/20' : 'bg-muted text-muted-foreground'
                  )}
                >
                  <Hash className="w-4 h-4" />
                </div>
                <div className="truncate text-left font-semibold">general</div>
              </div>

              <div className="flex items-center gap-1.5">
                {mutedChats.includes('group') && (
                  <BellOff className="w-3 h-3 text-amber-400" title="Notifications muted" />
                )}
                {unreadCounts['group'] > 0 && currentChat !== 'group' && (
                  <Badge variant="glow" className="px-1.5 py-0 text-[10px]">
                    {unreadCounts['group']}
                  </Badge>
                )}
                <span
                  className={cn(
                    'text-[10px] px-1.5 py-0.5 rounded-full font-medium',
                    currentChat === 'group' ? 'bg-white/20 text-white' : 'text-muted-foreground'
                  )}
                >
                  {activeUsers.length} online
                </span>
              </div>
            </button>
          </div>

          {/* Direct Messages (Active Online Users) */}
          <div className="space-y-1">
            <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider px-2 mb-2 flex items-center justify-between">
              <span>Direct Messages</span>
              <span className="text-[10px] font-semibold text-emerald-500">
                {otherUsers.length} Online
              </span>
            </div>

            {filteredUsers.length === 0 ? (
              <div className="px-3 py-6 text-center text-xs text-muted-foreground border border-dashed border-sidebar-border/60 rounded-xl space-y-1">
                <Users className="w-5 h-5 mx-auto text-muted-foreground/60" />
                <p className="font-semibold text-foreground/80">
                  {search ? 'No matching users found' : 'No other users active'}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {search ? 'Try another search term' : 'Invite friends or open another tab to test!'}
                </p>
              </div>
            ) : (
              filteredUsers.map((partner) => {
                const isSelected = currentChat === partner;
                const unread = unreadCounts[partner] || 0;
                const partnerProfile = userProfiles[partner];
                const isMuted = mutedChats.includes(partner);

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
                      <Avatar
                        src={partnerProfile?.avatarUrl}
                        name={partner}
                        size="sm"
                        status="online"
                      />
                      <div className="truncate text-left">
                        <div className="font-semibold truncate leading-none">@{partner}</div>
                        <div
                          className={cn(
                            'text-[10px] mt-0.5 truncate',
                            isSelected
                              ? 'text-primary-foreground/80'
                              : 'text-emerald-500 font-medium'
                          )}
                        >
                          {partnerProfile?.statusText || 'Active now'}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {isMuted && (
                        <BellOff className="w-3 h-3 text-amber-400" title="Muted" />
                      )}

                      {unread > 0 && !isSelected && (
                        <Badge variant="glow" className="px-1.5 py-0 text-[10px]">
                          {unread}
                        </Badge>
                      )}

                      {!isSelected && (
                        <Button
                          size="icon-sm"
                          variant="ghost"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                          title={`Send chat request to @${partner}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSendChatRequest(partner);
                          }}
                        >
                          <UserPlus className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Bottom User Profile Section */}
        <div className="p-3 border-t border-sidebar-border/60 bg-muted/20 flex items-center justify-between">
          <div
            className="flex items-center gap-2.5 min-w-0 cursor-pointer hover:opacity-85 transition-opacity"
            onClick={handleOpenMyProfile}
            title="Edit profile & account settings"
          >
            <Avatar
              src={user?.avatarUrl}
              name={user?.username || 'You'}
              size="sm"
              status="online"
            />
            <div className="min-w-0">
              <div className="font-bold text-xs truncate leading-none text-foreground">
                @{user?.username}
              </div>
              <div className="text-[10px] text-muted-foreground mt-0.5 truncate flex items-center gap-1">
                <span>{user?.statusText || 'Edit profile'}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <Button
              size="icon-sm"
              variant="ghost"
              onClick={handleOpenMyProfile}
              title="Profile & Settings"
              className="text-muted-foreground hover:text-foreground"
            >
              <Settings className="w-4 h-4" />
            </Button>

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
        </div>
      </aside>

      {/* User Profile Modal */}
      <UserProfileModal
        open={profileModalOpen}
        onOpenChange={setProfileModalOpen}
        targetUsername={inspectedUser}
      />
    </>
  );
}

export default Sidebar;
