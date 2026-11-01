import React from 'react';
import { Download, FileText, CheckCheck, ExternalLink } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { cn } from '@/lib/utils';

export function MessageBubble({ message, isMe }) {
  const { user, message: text, timestamp, fileURL, fileName } = message;

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

  return (
    <div
      className={cn(
        'flex gap-2.5 max-w-[85%] sm:max-w-[75%] transition-all animate-fade-in group',
        isMe ? 'ml-auto flex-row-reverse' : 'mr-auto'
      )}
    >
      {/* Avatar (for others) */}
      {!isMe && (
        <Avatar name={user} size="sm" className="mt-1 flex-shrink-0" />
      )}

      {/* Bubble Container */}
      <div className={cn('flex flex-col', isMe ? 'items-end' : 'items-start')}>
        {/* Username Header (for group chat / incoming) */}
        {!isMe && (
          <span className="text-[11px] font-semibold text-muted-foreground mb-1 ml-1">
            {user}
          </span>
        )}

        <div
          className={cn(
            'relative px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-subtle break-words space-y-2',
            isMe
              ? 'bg-gradient-to-tr from-indigo-600 to-purple-600 text-white rounded-tr-sm shadow-glow'
              : 'bg-card border border-border/80 text-foreground rounded-tl-sm'
          )}
        >
          {/* File Attachment Card */}
          {fileURL && (
            <div className="pt-1">
              {isImage(fileURL, fileName) ? (
                <a
                  href={fileURL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block rounded-xl overflow-hidden border border-white/20 max-w-sm hover:opacity-95 transition-opacity"
                >
                  <img
                    src={fileURL}
                    alt={fileName || 'Attachment'}
                    className="max-h-60 w-auto object-cover rounded-xl"
                  />
                </a>
              ) : (
                <a
                  href={fileURL}
                  download={fileName || 'attachment'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    'flex items-center gap-2.5 p-2.5 rounded-xl border transition-all text-xs font-medium',
                    isMe
                      ? 'bg-white/10 border-white/20 hover:bg-white/20 text-white'
                      : 'bg-muted/60 border-border hover:bg-muted text-foreground'
                  )}
                >
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-4 h-4 text-indigo-400" />
                  </div>
                  <div className="truncate flex-1">
                    <div className="truncate font-semibold">{fileName || 'Attached file'}</div>
                    <div className="text-[10px] opacity-75">Click to download</div>
                  </div>
                  <Download className="w-3.5 h-3.5 opacity-80" />
                </a>
              )}
            </div>
          )}

          {/* Text Message */}
          {text && (!fileURL || text !== `Shared a file: ${fileName}`) && (
            <p className="whitespace-pre-wrap">{text}</p>
          )}

          {/* Timestamp and Delivery ticks */}
          <div
            className={cn(
              'flex items-center justify-end gap-1 text-[10px] select-none',
              isMe ? 'text-white/70' : 'text-muted-foreground'
            )}
          >
            <span>{formatTime(timestamp)}</span>
            {isMe && <CheckCheck className="w-3 h-3 text-white/90" />}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MessageBubble;
