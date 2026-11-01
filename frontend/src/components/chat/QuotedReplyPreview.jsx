import React from 'react';
import { CornerUpLeft, X, FileText, Image as ImageIcon } from 'lucide-react';
import { useChatStore } from '@/stores/useChatStore';

export function QuotedReplyPreview() {
  const { replyingTo, clearReplyingTo } = useChatStore();

  if (!replyingTo) return null;

  return (
    <div className="flex items-center justify-between px-3 py-2 bg-muted/60 border-t border-border/80 text-xs text-foreground backdrop-blur-sm animate-fade-in">
      <div className="flex items-center gap-2 min-w-0">
        <div className="w-1 h-7 rounded-full bg-indigo-500 flex-shrink-0" />
        <CornerUpLeft className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
        <div className="min-w-0">
          <div className="font-semibold text-indigo-400 text-[11px] leading-tight">
            Replying to @{replyingTo.user}
          </div>
          <div className="text-muted-foreground truncate text-[11px] max-w-md">
            {replyingTo.text || 'Attachment'}
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={clearReplyingTo}
        className="p-1 hover:bg-muted text-muted-foreground hover:text-foreground rounded-lg transition-colors flex-shrink-0"
        title="Cancel reply"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

export default QuotedReplyPreview;

