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
  CornerUpLeft,
  Pencil,
  Trash2,
  AlertCircle,
} from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { ImagePreview } from './ImagePreview';
import { DocumentCard } from './DocumentCard';
import { useChatStore } from '@/stores/useChatStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const QUICK_REACTIONS = ['👍', '❤️', '🔥', '😂', '🎉', '🚀'];

export function MessageBubble({ message, isMe }) {
  const { user: currentUser } = useAuthStore();
  const {
    toggleReaction,
    setReplyingTo,
    setEditingMessage,
    deleteMessage,
  } = useChatStore();

  const {
    user,
    message: text,
    timestamp,
    fileURL,
    fileName,
    fileSize,
    fileType,
    messageId,
    replyTo,
    isEdited,
    isDeleted,
    reactions = {},
    avatarUrl,
    profilePicture,
  } = message;

  const [copied, setCopied] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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

  const handleScrollToReplied = (targetId) => {
    if (!targetId) return;
    const targetEl = document.getElementById(`msg-${targetId}`);
    if (targetEl) {
      targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      targetEl.classList.add('ring-2', 'ring-indigo-500', 'bg-indigo-500/10');
      setTimeout(() => targetEl.classList.remove('ring-2', 'ring-indigo-500', 'bg-indigo-500/10'), 2500);
    } else {
      toast.info('Referenced message is not in current view or expired');
    }
  };

  const handleDelete = () => {
    deleteMessage(messageId);
    setShowDeleteConfirm(false);
    toast.success('Message deleted');
  };

  // Parse reactions object: { [emoji]: string[] | number }
  const activeReactions = Object.entries(reactions || {}).filter(([_, val]) => {
    if (Array.isArray(val)) return val.length > 0;
    return typeof val === 'number' && val > 0;
  });

  // Check if text is just a placeholder caption like "Shared a file: ..."
  const hasCustomText =
    text &&
    text !== `Shared a file: ${fileName}` &&
    text !== 'Shared an image' &&
    text !== `Shared ${fileName}`;

  return (
    <div
      id={`msg-${messageId}`}
      className={cn(
        'flex gap-2.5 max-w-[85%] sm:max-w-[75%] transition-all animate-fade-in group relative rounded-2xl p-1',
        isMe ? 'ml-auto flex-row-reverse' : 'mr-auto'
      )}
    >
      {/* Avatar (for incoming messages) */}
      {!isMe && (
        <Avatar
          name={user}
          src={avatarUrl || profilePicture}
          size="sm"
          className="mt-1 flex-shrink-0"
        />
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
            'relative px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-subtle break-words space-y-2 select-text transition-all',
            isDeleted
              ? 'bg-muted/40 border border-border/60 text-muted-foreground italic rounded-2xl'
              : isMe
              ? 'bg-gradient-to-tr from-indigo-600 to-purple-600 text-white rounded-tr-sm shadow-glow'
              : 'bg-card border border-border/80 text-foreground rounded-tl-sm'
          )}
        >
          {/* Quoted Reply Banner (if message is a reply to another) */}
          {!isDeleted && replyTo && (
            <div
              onClick={() => handleScrollToReplied(replyTo.messageId)}
              className={cn(
                'flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs mb-1 cursor-pointer transition-colors border',
                isMe
                  ? 'bg-black/20 border-white/20 text-white/90 hover:bg-black/30'
                  : 'bg-muted/60 border-border text-foreground hover:bg-muted'
              )}
              title="Click to jump to quoted message"
            >
              <div className="w-0.5 h-6 rounded-full bg-indigo-400 flex-shrink-0" />
              <div className="min-w-0">
                <div className="font-bold text-[10px] text-indigo-300">
                  @{replyTo.user}
                </div>
                <div className="text-[11px] truncate max-w-xs opacity-85">
                  {replyTo.text || 'Attachment'}
                </div>
              </div>
            </div>
          )}

          {/* Deleted Message State */}
          {isDeleted ? (
            <div className="flex items-center gap-2 py-0.5 text-xs text-muted-foreground">
              <Trash2 className="w-3.5 h-3.5 opacity-60" />
              <span>This message was deleted</span>
            </div>
          ) : (
            <>
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
            </>
          )}

          {/* Timestamp, Edited Badge, Delivery ticks */}
          <div
            className={cn(
              'flex items-center justify-end gap-1.5 text-[10px] select-none pt-0.5',
              isMe ? 'text-white/75' : 'text-muted-foreground'
            )}
          >
            {isEdited && !isDeleted && (
              <span className="italic text-[10px] opacity-80">(edited)</span>
            )}
            <span>{formatTime(timestamp)}</span>
            {isMe && !isDeleted && <CheckCheck className="w-3 h-3 text-white/90" />}
          </div>
        </div>

        {/* Persistent Reactions Row */}
        {!isDeleted && activeReactions.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1 px-1">
            {activeReactions.map(([emoji, val]) => {
              const users = Array.isArray(val) ? val : [];
              const count = Array.isArray(val) ? val.length : val;
              const hasReacted = users.includes(currentUser?.username);

              return (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => toggleReaction(messageId, emoji)}
                  className={cn(
                    'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] border transition-all shadow-subtle',
                    hasReacted
                      ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-400 font-semibold'
                      : 'bg-muted/60 border-border/80 hover:bg-muted text-foreground'
                  )}
                  title={users.length > 0 ? `Reacted by: ${users.join(', ')}` : emoji}
                >
                  <span>{emoji}</span>
                  <span className="text-[10px]">{count}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Delete Confirmation Popover */}
        {showDeleteConfirm && (
          <div className="mt-1 p-2 rounded-xl bg-card border border-destructive/40 shadow-lg text-xs space-y-1.5 animate-scale-in z-20">
            <div className="flex items-center gap-1.5 text-destructive font-medium text-[11px]">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Delete this message for everyone?</span>
            </div>
            <div className="flex items-center justify-end gap-1">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="px-2 py-0.5 rounded-lg text-[11px] bg-muted hover:bg-muted/80 text-foreground"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="px-2 py-0.5 rounded-lg text-[11px] bg-destructive text-destructive-foreground font-semibold hover:bg-destructive/90"
              >
                Delete
              </button>
            </div>
          </div>
        )}

        {/* Hover Action Bar */}
        {!isDeleted && (
          <div
            className={cn(
              'absolute top-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5 p-1 rounded-xl bg-card border border-border shadow-premium z-10',
              isMe ? '-left-2 -translate-x-full' : '-right-2 translate-x-full'
            )}
          >
            {/* Quick Reactions */}
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

            {/* Reply Button */}
            <button
              type="button"
              onClick={() =>
                setReplyingTo({
                  messageId,
                  user,
                  text: hasCustomText ? text : fileName || 'Attachment',
                })
              }
              className="p-1 hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground text-xs"
              title="Reply to message"
            >
              <CornerUpLeft className="w-3.5 h-3.5" />
            </button>

            {/* Copy Button */}
            {text && (
              <button
                type="button"
                onClick={handleCopyText}
                className="p-1 hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground text-xs"
                title="Copy text"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            )}

            {/* Edit Button (Own messages only) */}
            {isMe && !fileURL && (
              <button
                type="button"
                onClick={() => setEditingMessage(message)}
                className="p-1 hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground text-xs"
                title="Edit message"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Delete Button (Own messages only) */}
            {isMe && (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="p-1 hover:bg-destructive/10 rounded-lg text-muted-foreground hover:text-destructive text-xs"
                title="Delete message"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default MessageBubble;
