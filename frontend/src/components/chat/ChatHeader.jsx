import React, { useState } from 'react';
import {
  Hash,
  Menu,
  MoreVertical,
  Info,
  ArrowLeft,
  Circle,
  Users,
  Search,
  X,
  ShieldCheck,
  Layers,
  Bell,
  BellOff,
  User,
} from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ChannelInfoModal } from './ChannelInfoModal';
import { UserProfileModal } from './UserProfileModal';
import { useChatStore } from '@/stores/useChatStore';
import { toast } from 'sonner';

export function ChatHeader({
  onOpenMobileSidebar,
  onOpenSearchModal,
  onSearchConversation,
  conversationSearchQuery,
}) {
  const {
    currentChat,
    setCurrentChat,
    activeUsers,
    sharedMediaOpen,
    toggleSharedMedia,
    mutedChats,
    toggleMuteChat,
    userProfiles,
  } = useChatStore();

  const [infoOpen, setInfoOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  const isGroup = currentChat === 'group';
  const isMuted = mutedChats.includes(currentChat);

  const partnerProfile = !isGroup ? userProfiles[currentChat] : null;

  const handleToggleMute = () => {
    toggleMuteChat(currentChat);
    if (isMuted) {
      toast.success(`Unmuted ${isGroup ? '#general' : `@${currentChat}`}`);
    } else {
      toast.info(`Muted notifications for ${isGroup ? '#general' : `@${currentChat}`}`);
    }
  };

  const handleHeaderClick = () => {
    if (isGroup) {
      setInfoOpen(true);
    } else {
      setProfileOpen(true);
    }
  };

  return (
    <>
      <header className="h-16 flex items-center justify-between px-4 sm:px-6 border-b border-border bg-card/75 backdrop-blur-md select-none relative z-10">
        <div className="flex items-center gap-3 min-w-0">
          {/* Mobile menu trigger */}
          <Button
            size="icon-sm"
            variant="outline"
            className="md:hidden flex-shrink-0"
            onClick={onOpenMobileSidebar}
            aria-label="Open sidebar drawer"
          >
            <Menu className="w-4 h-4" />
          </Button>

          {/* Back to group button if currently in private chat */}
          {!isGroup && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setCurrentChat('group')}
              className="text-xs gap-1.5 px-2 flex-shrink-0 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline font-medium">#general</span>
            </Button>
          )}

          {/* Avatar & Title */}
          <div
            className="flex items-center gap-2.5 min-w-0 cursor-pointer hover:opacity-90 transition-opacity"
            onClick={handleHeaderClick}
            title={isGroup ? 'Click to view group details' : `Click to view @${currentChat}'s profile`}
          >
            {isGroup ? (
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold shadow-glow flex-shrink-0">
                <Hash className="w-4 h-4" />
              </div>
            ) : (
              <Avatar
                src={partnerProfile?.avatarUrl}
                name={currentChat}
                size="md"
                status="online"
                className="flex-shrink-0"
              />
            )}

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-sm sm:text-base leading-none text-foreground truncate">
                  {isGroup ? 'general' : `@${currentChat}`}
                </h2>
                {isGroup ? (
                  <Badge variant="glow" className="text-[10px] py-0 px-1.5 hidden sm:inline-flex">
                    Public
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="text-[10px] py-0 px-1.5 hidden sm:inline-flex">
                    Direct
                  </Badge>
                )}
                {isMuted && (
                  <Badge variant="warning" className="text-[10px] py-0 px-1.5 gap-1">
                    <BellOff className="w-2.5 h-2.5" /> Muted
                  </Badge>
                )}
              </div>

              <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5 truncate">
                {isGroup ? (
                  <>
                    <Users className="w-3 h-3 text-indigo-400" />
                    <span>{activeUsers.length} online</span>
                    <span>&bull;</span>
                    <span className="text-[11px] font-medium text-indigo-400">48h retention</span>
                  </>
                ) : (
                  <>
                    <Circle className="w-2 h-2 fill-emerald-500 text-emerald-500" />
                    <span>{partnerProfile?.statusText || 'Active now'}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Conversation in-chat search toggle */}
          {showSearch ? (
            <div className="flex items-center gap-1 bg-muted/60 border border-input rounded-xl px-2 py-1 animate-fade-in">
              <Search className="w-3.5 h-3.5 text-muted-foreground" />
              <input
                type="text"
                value={conversationSearchQuery || ''}
                onChange={(e) => onSearchConversation?.(e.target.value)}
                placeholder="Search messages..."
                className="bg-transparent text-xs text-foreground placeholder:text-muted-foreground focus:outline-none w-28 sm:w-44"
                autoFocus
              />
              <button
                type="button"
                onClick={() => {
                  onSearchConversation?.('');
                  setShowSearch(false);
                }}
                className="text-muted-foreground hover:text-foreground p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <Button
              size="icon-sm"
              variant="ghost"
              onClick={() => setShowSearch(true)}
              title="Search messages in conversation"
              className="text-muted-foreground hover:text-foreground"
            >
              <Search className="w-4 h-4" />
            </Button>
          )}

          {/* Global Search (Ctrl+K) */}
          <Button
            size="icon-sm"
            variant="ghost"
            onClick={onOpenSearchModal}
            title="Global Search (Ctrl+K)"
            className="text-muted-foreground hover:text-foreground hidden sm:inline-flex"
          >
            <div className="flex items-center gap-1 text-xs">
              <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-muted border border-border/80">
                ⌘K
              </kbd>
            </div>
          </Button>

          {/* Mute/Unmute toggle */}
          <Button
            size="icon-sm"
            variant={isMuted ? 'secondary' : 'ghost'}
            onClick={handleToggleMute}
            title={isMuted ? 'Unmute conversation notifications' : 'Mute conversation notifications'}
            className={isMuted ? 'text-amber-500 hover:text-amber-400' : 'text-muted-foreground hover:text-foreground'}
          >
            {isMuted ? <BellOff className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
          </Button>

          {/* Shared media gallery panel trigger */}
          <Button
            size="icon-sm"
            variant={sharedMediaOpen ? 'primary' : 'ghost'}
            onClick={toggleSharedMedia}
            title="Shared Media & Files"
            className={sharedMediaOpen ? 'shadow-glow' : 'text-muted-foreground hover:text-foreground'}
          >
            <Layers className="w-4 h-4" />
          </Button>

          {/* Channel or User details */}
          <Button
            size="icon-sm"
            variant="ghost"
            onClick={handleHeaderClick}
            title={isGroup ? 'Channel Details' : 'User Details'}
            className="text-muted-foreground hover:text-foreground"
          >
            {isGroup ? <Info className="w-4 h-4" /> : <User className="w-4 h-4" />}
          </Button>
        </div>
      </header>

      {/* Group Info Modal */}
      <ChannelInfoModal open={infoOpen} onOpenChange={setInfoOpen} />

      {/* User Profile Modal for direct chat partner */}
      {!isGroup && (
        <UserProfileModal
          open={profileOpen}
          onOpenChange={setProfileOpen}
          targetUsername={currentChat}
        />
      )}
    </>
  );
}

export default ChatHeader;
