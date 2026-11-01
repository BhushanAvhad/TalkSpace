import React, { useState } from 'react';
import {
  Download,
  FileText,
  CheckCheck,
  ExternalLink,
  Copy,
  Check,
  Smile,
  Maximize2,
} from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { ImagePreview } from './ImagePreview';
import { DocumentCard } from './DocumentCard';
import { useChatStore } from '@/stores/useChatStore';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const QUICK_REACTIONS = ['👍', '❤️', '🔥', '😂', '🎉'];

export function MessageBubble({ message, isMe }) {
  const {
    user,
    message: text,
    timestamp,
    fileURL,
    fileName,
    fileSize,
    fileType,
    messageId,
  } = message;

  const { messageReactions, toggleReaction } = useChatStore();
  const [copied, setCopied] = useState(false);

  // System message treatment
  if (user === 'System') {
    return (
      <div className="flex justify-center my-2 select-none">
        <span className="px-3 py-1 rounded-full bg-muted/60 border border-border/60 text-[11px] text-muted-foreground font-medium flex items-center gap-1.5 shadow-subtle">
          <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60" />
          {text}
        </span>
      </div>
    );
  }

  // Format timestamp (e.g. 3:45 PM)
  const formatTime = (isoString) => {
    if (!isoString) return '';
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  const isImage = (url, name) => {
    const target = (url || name || '').toLowerCase();
    return (
      target.endsWith('.png') ||
      target.endsWith('.jpg') ||
      target.endsWith('.jpeg') ||
      target.endsWith('.webp') ||
      target.endsWith('.gif')
    );
  };

  const handleCopyText = () => {
    if (!text) return;
    navigator.clipboard?.writeText(text);
    setCopied(true);
    toast.success('Message copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const currentReactions = messageReactions[messageId] || {};
  const activeReactions = Object.entries(currentReactions).filter(([_, count]) => count > 0);

  // Check if text is just a placeholder caption like "Shared a file: ..."
  const hasCustomText =
    text &&
    text !== `Shared a file: ${fileName}` &&
    text !== 'Shared an image' &&
    text !== `Shared ${fileName}`;

  return (
    <div
      className={cn(
        'flex gap-2.5 max-w-[85%] sm:max-w-[75%] transition-all animate-fade-in group relative',
        isMe ? 'ml-auto flex-row-reverse' : 'mr-auto'
      )}
    >
      {/* Avatar (for incoming messages) */}
      {!isMe && (
        <Avatar name={user} size="sm" className="mt-1 flex-shrink-0" />
      )}

      {/* Bubble Container */}
      <div className={cn('flex flex-col min-w-0', isMe ? 'items-end' : 'items-start')}>
        {/* Username Header (for incoming messages) */}
        {!isMe && (
          <span className="text-[11px] font-semibold text-muted-foreground mb-1 ml-1">
            @{user}
          </span>
        )}

        {/* Message Bubble Body */}
        <div
          className={cn(
            'relative px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-subtle break-words space-y-2 select-text',
            isMe
              ? 'bg-gradient-to-tr from-indigo-600 to-purple-600 text-white rounded-tr-sm shadow-glow'
              : 'bg-card border border-border/80 text-foreground rounded-tl-sm'
          )}
        >
          {/* File Attachment Card */}
          {fileURL && (
            <div className="pt-0.5">
              {isImage(fileURL, fileName) ? (
                <ImagePreview
                  fileURL={fileURL}
                  fileName={fileName}
                  isMe={isMe}
                />
              ) : (
                <DocumentCard
                  fileURL={fileURL}
                  fileName={fileName}
                  fileSize={fileSize}
                  isMe={isMe}
                />
              )}
            </div>
          )}

          {/* Text Message or Custom Caption */}
          {hasCustomText && (
            <p className="whitespace-pre-wrap leading-relaxed">{text}</p>
          )}

          {/* Timestamp and Delivery ticks */}
          <div
            className={cn(
              'flex items-center justify-end gap-1 text-[10px] select-none pt-0.5',
              isMe ? 'text-white/75' : 'text-muted-foreground'
            )}
          >
            <span>{formatTime(timestamp)}</span>
            {isMe && <CheckCheck className="w-3 h-3 text-white/90" />}
          </div>
        </div>

        {/* Reactions Row (if any) */}
        {activeReactions.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1 px-1">
            {activeReactions.map(([emoji, count]) => (
              <button
                key={emoji}
                type="button"
                onClick={() => toggleReaction(messageId, emoji)}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] bg-muted/60 border border-border/80 hover:bg-muted transition-colors shadow-subtle"
              >
                <span>{emoji}</span>
                <span className="font-semibold text-foreground text-[10px]">{count}</span>
              </button>
            ))}
          </div>
        )}

        {/* Hover Action Bar */}
        <div
          className={cn(
            'absolute top-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5 p-1 rounded-xl bg-card border border-border shadow-premium z-10',
            isMe ? '-left-2 -translate-x-full' : '-right-2 translate-x-full'
          )}
        >
          {QUICK_REACTIONS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => toggleReaction(messageId, emoji)}
              className="p-1 hover:bg-muted rounded-lg text-xs transition-transform hover:scale-125"
              title={`React with ${emoji}`}
            >
              {emoji}
            </button>
          ))}

          {text && (
            <button
              type="button"
              onClick={handleCopyText}
              className="p-1 hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground text-xs"
              title="Copy text"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default MessageBubble;
