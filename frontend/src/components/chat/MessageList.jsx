import React, { useEffect, useRef } from 'react';
import { MessageSquare, Sparkles } from 'lucide-react';
import { MessageBubble } from './MessageBubble';
import { EmptyState } from '@/components/ui/EmptyState';
import { useAuthStore } from '@/stores/useAuthStore';
import { useChatStore } from '@/stores/useChatStore';

export function MessageList() {
  const { user } = useAuthStore();
  const { currentChat, groupMessages, privateMessages, typingUser } = useChatStore();
  const bottomRef = useRef(null);

  const activeMessages =
    currentChat === 'group'
      ? groupMessages
      : privateMessages[currentChat] || [];

  // Scroll to bottom on new message or when changing chat
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeMessages.length, typingUser, currentChat]);

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
      {/* Welcome header for the conversation */}
      <div className="py-6 text-center space-y-2 max-w-sm mx-auto select-none border-b border-border/40 mb-4">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 text-primary mx-auto flex items-center justify-center font-bold shadow-glow">
          <Sparkles className="w-6 h-6" />
        </div>
        <h3 className="font-bold text-sm text-foreground">
          {currentChat === 'group'
            ? 'Welcome to the #general channel!'
            : `Direct conversation with @${currentChat}`}
        </h3>
        <p className="text-xs text-muted-foreground leading-relaxed">
          {currentChat === 'group'
            ? 'This is the start of the general community room. Messages are synchronized across all connected users.'
            : `All direct messages between you and ${currentChat} are encrypted and saved securely.`}
        </p>
      </div>

      {/* Messages */}
      {activeMessages.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="No messages in this chat yet"
          description="Send a message below or share an attachment to begin your live conversation."
        />
      ) : (
        activeMessages.map((msg, index) => (
          <MessageBubble
            key={msg.messageId || `${msg.timestamp}-${index}`}
            message={msg}
            isMe={msg.user?.toLowerCase() === user?.username?.toLowerCase()}
          />
        ))
      )}

      {/* Typing Indicator */}
      {typingUser && typingUser.toLowerCase() !== user?.username?.toLowerCase() && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground italic px-2 animate-fade-in">
          <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
          <span>{typingUser} is typing...</span>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}

export default MessageList;

