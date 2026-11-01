import React, { useState } from 'react';
import { Maximize2, AlertCircle, Download, Loader2 } from 'lucide-react';
import { ImageViewer } from './ImageViewer';
import { useAuthStore } from '@/stores/useAuthStore';
import { cn } from '@/lib/utils';

export function ImagePreview({ fileURL, fileName, isMe }) {
  const { user } = useAuthStore();
  const [loaded, setLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [viewerOpen, setViewerOpen] = useState(false);

  // Append authenticated username parameter for protected attachment verification
  const secureURL = user?.username
    ? `${fileURL}?user=${encodeURIComponent(user.username)}`
    : fileURL;

  if (hasError) {
    return (
      <div className="p-3 rounded-2xl bg-muted/40 border border-border/80 flex items-center gap-2.5 text-xs text-muted-foreground select-none">
        <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
        <span>Failed to load image &ldquo;{fileName || 'attachment'}&rdquo;</span>
      </div>
    );
  }

  return (
    <>
      <div
        className="relative group/thumb cursor-pointer rounded-2xl overflow-hidden border border-white/20 max-w-sm sm:max-w-md shadow-subtle bg-muted/20"
        onClick={() => setViewerOpen(true)}
      >
        {/* Loading skeleton */}
        {!loaded && (
          <div className="h-48 w-64 bg-muted/60 animate-pulse flex items-center justify-center text-muted-foreground text-xs">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
          </div>
        )}

        <img
          src={secureURL}
          alt={fileName || 'Attached image'}
          onLoad={() => setLoaded(true)}
          onError={() => setHasError(true)}
          className={cn(
            'max-h-72 w-auto object-cover rounded-2xl transition-all duration-300 group-hover/thumb:scale-[1.02]',
            loaded ? 'opacity-100' : 'opacity-0 h-0 w-0'
          )}
          loading="lazy"
        />

        {/* Hover overlay with action buttons */}
        {loaded && (
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white">
            <div className="p-2 rounded-xl bg-black/60 backdrop-blur-md shadow-premium hover:bg-black/80 transition-colors">
              <Maximize2 className="w-4 h-4" />
            </div>
          </div>
        )}
      </div>

      {/* Full screen Lightbox Viewer */}
      {viewerOpen && (
        <ImageViewer
          src={fileURL}
          alt={fileName}
          onClose={() => setViewerOpen(false)}
        />
      )}
    </>
  );
}

export default ImagePreview;

