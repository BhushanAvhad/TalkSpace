import React, { useState, useRef, useEffect } from 'react';
import {
  Paperclip,
  Smile,
  Send,
  Loader2,
  X,
  UploadCloud,
  CornerDownLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { AttachmentMenu } from './AttachmentMenu';
import { FilePreviewTray } from './FilePreviewTray';
import { useAuthStore } from '@/stores/useAuthStore';
import { useChatStore } from '@/stores/useChatStore';
import { toast } from 'sonner';

const EMOJI_CATEGORIES = {
  Popular: ['😀', '😂', '🔥', '🚀', '❤️', '👍', '🎉', '✨', '🙌', '💯', '😎', '💡'],
  Reactions: ['😍', '👏', '🥳', '🤝', '⚡', '🌟', '💻', '☕', '🎯', '✅', '👀', '👋'],
  Faces: ['😊', '😇', '🤔', '🤫', '🤩', '😴', '🤯', '🥳', '🥺', '🤗', '😋', '😎'],
  Symbols: ['⭐', '💥', '🔔', '🔒', '💡', '📌', '📈', '🚀', '🎨', '⚙️', '🌐', '🏆'],
};

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 MB

export function MessageInput() {
  const { user } = useAuthStore();
  const { sendTextMessage, sendFileMessage, emitTyping, currentChat } = useChatStore();

  const [text, setText] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [activeCategory, setActiveCategory] = useState('Popular');
  const [stagedFiles, setStagedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  const imageInputRef = useRef(null);
  const docInputRef = useRef(null);
  const textareaRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const abortControllerRef = useRef(null);
  const lastTypingEmitRef = useRef(0);

  // Auto-resize textarea based on text content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 140)}px`;
    }
  }, [text]);

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(e.target) &&
        !e.target.closest('[data-emoji-trigger]')
      ) {
        setShowEmoji(false);
      }
    };

    if (showEmoji) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showEmoji]);

  // Handle stage files with size and extension validation
  const stageFiles = (filesList) => {
    const validFiles = [];
    for (const file of Array.from(filesList)) {
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`"${file.name}" exceeds the 25 MB limit.`);
        continue;
      }
      validFiles.push(file);
    }

    if (validFiles.length > 0) {
      setStagedFiles((prev) => [...prev, ...validFiles].slice(0, 10)); // Max 10 files
    }
  };

  const handleRemoveStagedFile = (indexToRemove) => {
    setStagedFiles((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleClearAllStagedFiles = () => {
    setStagedFiles([]);
  };

  // Drag and drop event handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      stageFiles(e.dataTransfer.files);
    }
  };

  const handleCancelUpload = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsUploading(false);
      setUploadStatus('');
      toast.info('Upload cancelled.');
    }
  };

  const handleSend = async () => {
    const hasText = !!text.trim();
    const hasFiles = stagedFiles.length > 0;

    if (!hasText && !hasFiles) return;
    if (isUploading) return;

    // If only text is entered
    if (hasText && !hasFiles) {
      sendTextMessage(text, user?.username);
      setText('');
      if (textareaRef.current) textareaRef.current.style.height = 'auto';
      return;
    }

    // If files are staged, upload them
    setIsUploading(true);
    setUploadStatus(`Uploading ${stagedFiles.length} file${stagedFiles.length > 1 ? 's' : ''}...`);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    const formData = new FormData();
    stagedFiles.forEach((file) => formData.append('files', file));

    const isPrivate = currentChat !== 'group';
    formData.append('isPrivate', String(isPrivate));
    formData.append('sender', user?.username || '');
    if (isPrivate) {
      formData.append('target', currentChat);
    }

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server responded with ${response.status}`);
      }

      const result = await response.json();
      const uploadedFiles = result.files || [];

      // Dispatch each uploaded file message
      uploadedFiles.forEach((fileInfo, index) => {
        // Attach text message as caption on the first file if provided
        const caption = index === 0 && hasText ? text.trim() : '';
        sendFileMessage(fileInfo, user?.username, caption);
      });

      toast.success(
        `Successfully shared ${uploadedFiles.length} file${uploadedFiles.length > 1 ? 's' : ''}!`
      );

      // Reset composer
      setText('');
      setStagedFiles([]);
      if (textareaRef.current) textareaRef.current.style.height = 'auto';
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('File upload failure:', err);
        toast.error(err.message || 'Failed to upload attachments. Please try again.');
      }
    } finally {
      setIsUploading(false);
      setUploadStatus('');
      abortControllerRef.current = null;
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    } else {
      // Throttle typing indicator emits to once every 1.5 seconds
      const now = Date.now();
      if (now - lastTypingEmitRef.current > 1500) {
        emitTyping();
        lastTypingEmitRef.current = now;
      }
    }
  };

  const handleEmojiClick = (emoji) => {
    setText((prev) => prev + emoji);
    textareaRef.current?.focus();
  };

  const placeholderText =
    currentChat === 'group'
      ? 'Message #general (Enter to send, Shift+Enter for new line)...'
      : `Message @${currentChat} (Enter to send)...`;

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className="p-3 sm:p-4 border-t border-border bg-card/75 backdrop-blur-md relative select-none"
    >
      {/* Drag & Drop Overlay */}
      {isDragging && (
        <div className="absolute inset-2 z-50 rounded-2xl border-2 border-dashed border-primary bg-primary/10 backdrop-blur-sm flex flex-col items-center justify-center gap-1.5 pointer-events-none animate-fade-in text-primary">
          <UploadCloud className="w-8 h-8 animate-bounce" />
          <span className="font-bold text-sm">Drop files here to attach</span>
          <span className="text-[11px] text-muted-foreground">Up to 25 MB per file</span>
        </div>
      )}

      {/* Uploading Status Pill with Cancel Option */}
      {isUploading && (
        <div className="absolute -top-10 left-4 z-20 flex items-center gap-2.5 px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs shadow-glow animate-fade-in font-medium">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          <span>{uploadStatus || 'Uploading attachments...'}</span>
          <button
            type="button"
            onClick={handleCancelUpload}
            className="hover:bg-white/20 p-0.5 rounded-full text-white/80 hover:text-white transition-colors"
            title="Cancel upload"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Staged File Previews Tray */}
      <FilePreviewTray
        files={stagedFiles}
        onRemove={handleRemoveStagedFile}
        onClearAll={handleClearAllStagedFiles}
      />

      {/* Attachment Popover Menu */}
      <AttachmentMenu
        open={showAttachmentMenu}
        onClose={() => setShowAttachmentMenu(false)}
        onSelectImages={() => imageInputRef.current?.click()}
        onSelectDocuments={() => docInputRef.current?.click()}
      />

      {/* Hidden File Inputs */}
      <input
        type="file"
        ref={imageInputRef}
        accept="image/png,image/jpeg,image/webp,image/gif"
        multiple
        onChange={(e) => {
          if (e.target.files) stageFiles(e.target.files);
          e.target.value = '';
        }}
        className="hidden"
      />
      <input
        type="file"
        ref={docInputRef}
        accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv"
        multiple
        onChange={(e) => {
          if (e.target.files) stageFiles(e.target.files);
          e.target.value = '';
        }}
        className="hidden"
      />

      {/* Emoji Picker Popover */}
      {showEmoji && (
        <div
          ref={emojiPickerRef}
          className="absolute bottom-20 left-4 z-50 p-3 rounded-2xl border border-border bg-popover text-popover-foreground shadow-2xl space-y-2 animate-fade-in w-72 sm:w-80 select-none"
        >
          <div className="flex items-center justify-between pb-1 border-b border-border/50 text-xs font-semibold text-muted-foreground">
            <span>Emojis</span>
            <button
              type="button"
              onClick={() => setShowEmoji(false)}
              className="p-1 hover:text-foreground rounded-lg"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[11px] font-medium">
            {Object.keys(EMOJI_CATEGORIES).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`px-2 py-0.5 rounded-lg transition-colors ${
                  activeCategory === cat
                    ? 'bg-primary text-primary-foreground font-semibold'
                    : 'text-muted-foreground hover:bg-muted'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-6 gap-1.5 max-h-44 overflow-y-auto pt-1">
            {EMOJI_CATEGORIES[activeCategory].map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => handleEmojiClick(emoji)}
                className="text-lg p-1 rounded-lg hover:bg-muted transition-transform hover:scale-125 flex items-center justify-center"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Composer Box */}
      <div className="flex items-end gap-2 bg-muted/40 border border-input rounded-2xl p-1.5 focus-within:ring-2 focus-within:ring-ring focus-within:border-transparent transition-all shadow-subtle">
        {/* Attachment Button */}
        <Button
          type="button"
          size="icon-sm"
          variant="ghost"
          data-attachment-trigger="true"
          disabled={isUploading}
          onClick={() => setShowAttachmentMenu((prev) => !prev)}
          title="Share images or documents"
          className="text-muted-foreground hover:text-foreground flex-shrink-0"
        >
          <Paperclip className="w-4 h-4" />
        </Button>

        {/* Emoji Button */}
        <Button
          type="button"
          size="icon-sm"
          variant="ghost"
          data-emoji-trigger="true"
          onClick={() => setShowEmoji((prev) => !prev)}
          title="Insert emoji"
          className="text-muted-foreground hover:text-foreground flex-shrink-0"
        >
          <Smile className="w-4 h-4" />
        </Button>

        {/* Multiline Textarea */}
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholderText}
          rows={1}
          className="flex-1 bg-transparent border-0 resize-none py-2 px-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none min-h-[38px] max-h-[140px] leading-relaxed"
        />

        {/* Send Button */}
        <Button
          type="button"
          size="icon"
          variant="primary"
          onClick={handleSend}
          disabled={(!text.trim() && stagedFiles.length === 0) || isUploading}
          title={stagedFiles.length > 0 ? `Send with ${stagedFiles.length} file(s)` : 'Send message (Enter)'}
          className="rounded-xl flex-shrink-0 shadow-glow"
        >
          {isUploading ? (
            <Loader2 className="w-4 h-4 animate-spin text-white" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </Button>
      </div>

      {/* Helper Bar */}
      <div className="hidden sm:flex items-center justify-between text-[10px] text-muted-foreground/75 px-3 pt-1.5 select-none">
        <div className="flex items-center gap-2">
          <span>
            <strong className="text-foreground/80">Enter ↵</strong> to send
          </span>
          <span>&bull;</span>
          <span>
            <strong className="text-foreground/80">Shift + Enter</strong> for new line
          </span>
          <span>&bull;</span>
          <span>Drag & drop files anytime</span>
        </div>
        <span>Encrypted &bull; 25 MB max</span>
      </div>
    </div>
  );
}

export default MessageInput;
