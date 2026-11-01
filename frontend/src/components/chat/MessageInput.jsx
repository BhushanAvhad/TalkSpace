import React, { useState, useRef, useEffect } from 'react';
import { Paperclip, Smile, Send, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/stores/useAuthStore';
import { useChatStore } from '@/stores/useChatStore';

const POPULAR_EMOJIS = [
  '😀', '😂', '🔥', '🚀', '❤️', '👍', '🎉', '✨',
  '🙌', '💯', '😎', '💡', '👋', '👀', '😍', '👏',
  '🥳', '🤝', '⚡', '🌟', '💻', '☕', '🎯', '✅'
];

export function MessageInput() {
  const { user } = useAuthStore();
  const { sendTextMessage, sendFileMessage, emitTyping } = useChatStore();

  const [text, setText] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [text]);

  const handleSend = () => {
    if (!text.trim()) return;
    sendTextMessage(text, user?.username);
    setText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    } else {
      emitTyping();
    }
  };

  const handleEmojiClick = (emoji) => {
    setText((prev) => prev + emoji);
    setShowEmoji(false);
    textareaRef.current?.focus();
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (data.fileURL) {
        sendFileMessage(
          { fileURL: data.fileURL, fileName: file.name },
          user?.username
        );
      }
    } catch (err) {
      console.error('File upload error:', err);
      alert('Failed to upload file. Please try again.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="p-3 sm:p-4 border-t border-border bg-card/60 backdrop-blur-md relative">
      {/* Emoji Picker Popover */}
      {showEmoji && (
        <div className="absolute bottom-20 left-4 z-50 p-3 rounded-2xl border border-border bg-popover shadow-premium grid grid-cols-6 gap-2 animate-fade-in w-72">
          <div className="col-span-6 flex items-center justify-between pb-1 border-b border-border/40 text-xs font-semibold text-muted-foreground">
            <span>Select an emoji</span>
            <button
              type="button"
              onClick={() => setShowEmoji(false)}
              className="p-1 hover:text-foreground"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          {POPULAR_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => handleEmojiClick(emoji)}
              className="text-lg p-1.5 rounded-lg hover:bg-muted transition-transform hover:scale-125 flex items-center justify-center"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        className="hidden"
      />

      <div className="flex items-end gap-2 bg-muted/40 border border-input rounded-2xl p-1.5 focus-within:ring-2 focus-within:ring-ring focus-within:border-transparent transition-all shadow-subtle">
        {/* Attachment Button */}
        <Button
          type="button"
          size="icon-sm"
          variant="ghost"
          disabled={isUploading}
          onClick={() => fileInputRef.current?.click()}
          title="Upload image or file"
          className="text-muted-foreground hover:text-foreground flex-shrink-0"
        >
          {isUploading ? (
            <Loader2 className="w-4 h-4 animate-spin text-primary" />
          ) : (
            <Paperclip className="w-4 h-4" />
          )}
        </Button>

        {/* Emoji Button */}
        <Button
          type="button"
          size="icon-sm"
          variant="ghost"
          onClick={() => setShowEmoji((prev) => !prev)}
          title="Insert emoji"
          className="text-muted-foreground hover:text-foreground flex-shrink-0"
        >
          <Smile className="w-4 h-4" />
        </Button>

        {/* Auto-expanding Input Textarea */}
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Write a message to TalkSpace... (Enter to send)"
          rows={1}
          className="flex-1 bg-transparent border-0 resize-none py-2 px-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none min-h-[36px] max-h-[120px]"
        />

        {/* Send Button */}
        <Button
          type="button"
          size="icon"
          variant="primary"
          onClick={handleSend}
          disabled={!text.trim() && !isUploading}
          title="Send message"
          className="rounded-xl flex-shrink-0"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

export default MessageInput;
