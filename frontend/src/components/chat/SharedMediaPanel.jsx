import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Image as ImageIcon,
  FileText,
  Download,
  Calendar,
  Layers,
  Sparkles,
  Maximize2,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ImageViewer } from './ImageViewer';
import { formatBytes, getDocumentMeta } from './DocumentCard';
import { useChatStore } from '@/stores/useChatStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { cn } from '@/lib/utils';

export function SharedMediaPanel({ open, onClose }) {
  const { user } = useAuthStore();
  const { currentChat, groupMessages, privateMessages } = useChatStore();
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'images' | 'documents'
  const [viewerImage, setViewerImage] = useState(null);

  const activeMessages =
    currentChat === 'group' ? groupMessages : privateMessages[currentChat] || [];

  // Extract all messages containing a fileURL
  const fileMessages = activeMessages.filter((m) => !!m.fileURL);

  const isImageFile = (url, name) => {
    const target = (url || name || '').toLowerCase();
    return (
      target.endsWith('.png') ||
      target.endsWith('.jpg') ||
      target.endsWith('.jpeg') ||
      target.endsWith('.webp') ||
      target.endsWith('.gif')
    );
  };

  const images = fileMessages.filter((m) => isImageFile(m.fileURL, m.fileName));
  const documents = fileMessages.filter((m) => !isImageFile(m.fileURL, m.fileName));

  const displayedItems =
    activeTab === 'images'
      ? images
      : activeTab === 'documents'
      ? documents
      : fileMessages;

  if (!open) return null;

  return (
    <>
      <motion.aside
        initial={{ x: '100%', opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: '100%', opacity: 0 }}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
        className="w-80 sm:w-96 h-full flex flex-col bg-card border-l border-border text-foreground select-none z-30 shadow-2xl relative"
      >
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-border/80">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm leading-none text-foreground">
                Shared Media & Files
              </h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {currentChat === 'group' ? '#general channel' : `@${currentChat}`}
              </p>
            </div>
          </div>

          <Button
            size="icon-sm"
            variant="ghost"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Tab Controls */}
        <div className="p-3 border-b border-border/60">
          <div className="grid grid-cols-3 p-1 rounded-xl bg-muted/60 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={cn(
                'py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5',
                activeTab === 'all'
                  ? 'bg-card text-foreground shadow-subtle font-bold'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <span>All</span>
              <span className="text-[10px] opacity-75">({fileMessages.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('images')}
              className={cn(
                'py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5',
                activeTab === 'images'
                  ? 'bg-card text-foreground shadow-subtle font-bold'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <span>Images</span>
              <span className="text-[10px] opacity-75">({images.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('documents')}
              className={cn(
                'py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5',
                activeTab === 'documents'
                  ? 'bg-card text-foreground shadow-subtle font-bold'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <span>Docs</span>
              <span className="text-[10px] opacity-75">({documents.length})</span>
            </button>
          </div>
        </div>

        {/* Media Content Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {displayedItems.length === 0 ? (
            <div className="py-16 text-center space-y-2 select-none">
              <div className="w-12 h-12 rounded-2xl bg-muted/60 mx-auto flex items-center justify-center text-muted-foreground">
                <Layers className="w-5 h-5 opacity-60" />
              </div>
              <p className="font-semibold text-xs text-foreground">
                No {activeTab === 'all' ? 'files' : activeTab} shared yet
              </p>
              <p className="text-[11px] text-muted-foreground max-w-xs mx-auto">
                Attachments sent in this conversation will be listed here automatically.
              </p>
            </div>
          ) : activeTab === 'images' ? (
            /* Images Grid View */
            <div className="grid grid-cols-2 gap-2">
              {images.map((imgMsg, idx) => {
                const secureSrc = user?.username
                  ? `${imgMsg.fileURL}?user=${encodeURIComponent(user.username)}`
                  : imgMsg.fileURL;

                return (
                  <div
                    key={`${imgMsg.messageId}-${idx}`}
                    className="relative group aspect-square rounded-xl overflow-hidden border border-border/80 bg-muted/20 cursor-pointer shadow-subtle"
                    onClick={() => setViewerImage(imgMsg)}
                  >
                    <img
                      src={secureSrc}
                      alt={imgMsg.fileName || 'Shared image'}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                      <Maximize2 className="w-4 h-4" />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Documents or All Files List View */
            <div className="space-y-2">
              {displayedItems.map((item, idx) => {
                const isImg = isImageFile(item.fileURL, item.fileName);
                const meta = getDocumentMeta(item.fileName);
                const Icon = isImg ? ImageIcon : meta.icon;

                const secureDownload = user?.username
                  ? `${item.fileURL}?user=${encodeURIComponent(user.username)}`
                  : item.fileURL;

                return (
                  <div
                    key={`${item.messageId}-${idx}`}
                    className="flex items-center justify-between p-2.5 rounded-xl border border-border/70 hover:border-border bg-card shadow-subtle text-xs transition-colors"
                  >
                    <div
                      className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer"
                      onClick={() => {
                        if (isImg) setViewerImage(item);
                        else window.open(secureDownload, '_blank');
                      }}
                    >
                      <div
                        className={cn(
                          'w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 border',
                          isImg
                            ? 'bg-indigo-500/15 text-indigo-500 border-indigo-500/30'
                            : meta.badgeClass
                        )}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 truncate">
                        <div className="font-semibold truncate leading-tight text-foreground" title={item.fileName}>
                          {item.fileName || (isImg ? 'Photo' : 'Document')}
                        </div>
                        <div className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1.5">
                          <span>@{item.user}</span>
                          <span>&bull;</span>
                          <span>{formatBytes(item.fileSize)}</span>
                        </div>
                      </div>
                    </div>

                    <a
                      href={secureDownload}
                      download={item.fileName || 'download'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground ml-2 flex-shrink-0"
                      title="Download file"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </motion.aside>

      {/* Lightbox Viewer */}
      {viewerImage && (
        <ImageViewer
          src={viewerImage.fileURL}
          alt={viewerImage.fileName}
          onClose={() => setViewerImage(null)}
        />
      )}
    </>
  );
}

export default SharedMediaPanel;

