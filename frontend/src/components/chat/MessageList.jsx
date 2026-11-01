import React, { useEffect, useRef, useState } from 'react';
import {
  MessageSquare,
  Sparkles,
  ChevronDown,
  Smile,
  FileText,
  Search,
  Clock,
  Shield,
} from 'lucide-react';
import { MessageBubble } from './MessageBubble';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/stores/useAuthStore';
import { useChatStore } from '@/stores/useChatStore';
import { cn } from '@/lib/utils';

export function MessageList({ searchQuery = '' }) {
  const { user } = useAuthStore();
  const { currentChat, groupMessages, privateMessages, typingUser, sendTextMessage } =
    useChatStore();

  const scrollContainerRef = useRef(null);
  const bottomRef = useRef(null);
  const [showScrollBottom, setShowScrollBottom] = useState(false);

  const rawMessages =
    currentChat === 'group' ? groupMessages : privateMessages[currentChat] || [];

  // Filter messages if conversation search query is active
  const activeMessages = searchQuery
    ? rawMessages.filter(
        (m) =>
          (m.message || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
          (m.fileName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
          (m.user || '').toLowerCase().includes(searchQuery.toLowerCase())
      )
    : rawMessages;

  // Track scroll position to toggle "Scroll to bottom" button
  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 120;
    setShowScrollBottom(!isNearBottom);
  };

  // Auto-scroll to bottom on new message or when changing chat
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [rawMessages.length, typingUser, currentChat]);

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Group messages by date
  const formatDateLabel = (isoString) => {
    if (!isoString) return 'Recent';
    try {
      const date = new Date(isoString);
      const today = new Date();
      const yesterday = new Date();
      yesterday.setDate(today.getDate() - 1);

      if (date.toDateString() === today.toDateString()) return 'Today';
      if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';

      return date.toLocaleDateString([], {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
      });
    } catch {
      return 'Recent';
    }
  };

  const isGroup = currentChat === 'group';

  return (
    <div
      ref={scrollContainerRef}
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 relative select-none"
    >
      {/* Welcome Conversation Banner */}
      {!searchQuery && (
        <div className="py-6 text-center space-y-2 max-w-sm mx-auto select-none border-b border-border/40 mb-4 animate-fade-in">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 text-primary mx-auto flex items-center justify-center font-bold shadow-glow">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-sm sm:text-base text-foreground">
            {isGroup ? 'Welcome to #general!' : `Direct chat with @${currentChat}`}
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {isGroup
              ? 'This is the public TalkSpace channel. All messages are synchronized in real-time with connected team members.'
              : `All direct messages between you and @${currentChat} are encrypted and safely stored in Supabase.`}
          </p>

          {/* 48-Hour Retention Notice (Only displayed in public #general channel) */}
          {isGroup && (
            <div className="mt-3 p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs flex items-center justify-center gap-2 max-w-md mx-auto shadow-subtle animate-fade-in">
              <Clock className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
              <span className="text-[11px] leading-tight text-foreground/80">
                Messages and shared files in this public channel are automatically deleted after <strong>48 hours</strong>. Private conversations are retained indefinitely.
              </span>
            </div>
          )}
        </div>
      )}

      {/* Search Result Banner */}
      {searchQuery && (
        <div className="px-3 py-2 rounded-xl bg-muted/60 border border-border/60 text-xs text-muted-foreground flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Search className="w-3.5 h-3.5 text-primary" />
            Showing search results for &ldquo;<strong className="text-foreground">{searchQuery}</strong>&rdquo;
          </span>
          <span className="font-semibold text-foreground">
            {activeMessages.length} match{activeMessages.length === 1 ? '' : 'es'}
          </span>
        </div>
      )}

      {/* Messages Render or Empty State */}
      {activeMessages.length === 0 ? (
        <div className="py-12">
          <EmptyState
            icon={MessageSquare}
            title={searchQuery ? 'No matching messages found' : 'No messages in this chat yet'}
            description={
              searchQuery
                ? 'Try a different keyword or clear your search to view all messages.'
                : 'Send your first message or choose a quick prompt below to start the conversation!'
            }
          />

          {!searchQuery && (
            <div className="flex flex-wrap items-center justify-center gap-2 mt-4 max-w-md mx-auto">
              {['Say hello 👋', 'Hey everyone! ✨', 'What is everyone working on? 💻'].map(
                (quickPrompt) => (
                  <button
                    key={quickPrompt}
                    type="button"
                    onClick={() => sendTextMessage(quickPrompt, user?.username)}
                    className="px-3 py-1.5 rounded-full text-xs bg-muted/60 hover:bg-muted text-foreground border border-border/60 transition-all hover:scale-105 shadow-subtle"
                  >
                    {quickPrompt}
                  </button>
                )
              )}
            </div>
          )}
        </div>
      ) : (
        activeMessages.map((msg, index) => {
          const prevMsg = activeMessages[index - 1];
          const showDateDivider =
            !prevMsg ||
            formatDateLabel(prevMsg.timestamp) !== formatDateLabel(msg.timestamp);

          return (
            <React.Fragment key={msg.messageId || `${msg.timestamp}-${index}`}>
              {showDateDivider && (
                <div className="flex items-center justify-center my-3 select-none">
                  <div className="h-[1px] bg-border/60 flex-1 max-w-xs" />
                  <span className="px-3 py-0.5 text-[11px] font-semibold text-muted-foreground bg-muted/40 border border-border/60 rounded-full mx-2 shadow-subtle">
                    {formatDateLabel(msg.timestamp)}
                  </span>
                  <div className="h-[1px] bg-border/60 flex-1 max-w-xs" />
                </div>
              )}

              <MessageBubble
                message={msg}
                isMe={msg.user?.toLowerCase() === user?.username?.toLowerCase()}
              />
            </React.Fragment>
          );
        })
      )}

      {/* Animated Typing Indicator */}
      {typingUser && typingUser.toLowerCase() !== user?.username?.toLowerCase() && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground px-2 py-1.5 animate-fade-in bg-muted/30 border border-border/40 rounded-xl max-w-xs">
          <div className="flex gap-1 items-center px-1">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce" />
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.2s]" />
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.4s]" />
          </div>
          <span className="font-medium text-foreground">@{typingUser}</span>
          <span className="italic">is typing...</span>
        </div>
      )}

      <div ref={bottomRef} />

      {/* Floating Scroll To Bottom Button */}
      {showScrollBottom && (
        <button
          type="button"
          onClick={scrollToBottom}
          className="fixed bottom-24 right-8 z-30 p-2.5 rounded-full bg-primary text-primary-foreground shadow-glow hover:scale-110 active:scale-95 transition-all flex items-center justify-center animate-fade-in"
          title="Scroll to latest messages"
        >
          <ChevronDown className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

export default MessageList;
