import React, { useState, useEffect } from 'react';
import {
  X,
  Download,
  ExternalLink,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Image as ImageIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/stores/useAuthStore';

export function ImageViewer({ src, alt, onClose }) {
  const { user } = useAuthStore();
  const [zoomed, setZoomed] = useState(false);
  const [dimensions, setDimensions] = useState(null);

  // Keyboard Escape listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!src) return null;

  // Append authenticated username parameter for protected attachment verification
  const secureSrc = user?.username
    ? `${src}?user=${encodeURIComponent(user.username)}`
    : src;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-fade-in select-none"
      onClick={onClose}
    >
      {/* Top Header Bar */}
      <div
        className="absolute top-0 left-0 right-0 p-4 sm:p-6 flex items-center justify-between text-white z-20"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2.5 min-w-0 max-w-md">
          <div className="p-2 rounded-xl bg-white/10 backdrop-blur-md">
            <ImageIcon className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="min-w-0">
            <div className="truncate font-semibold text-xs sm:text-sm">{alt || 'Image Preview'}</div>
            {dimensions && (
              <div className="text-[11px] text-white/60">
                {dimensions.width} &times; {dimensions.height} px
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Zoom Toggle */}
          <Button
            size="icon-sm"
            variant="ghost"
            onClick={() => setZoomed(!zoomed)}
            className="text-white/80 hover:text-white hover:bg-white/10"
            title={zoomed ? 'Zoom out' : 'Zoom in'}
          >
            {zoomed ? <ZoomOut className="w-4 h-4" /> : <ZoomIn className="w-4 h-4" />}
          </Button>

          {/* Download Full Size */}
          <a
            href={secureSrc}
            download={alt || 'talkspace-image'}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button
              size="icon-sm"
              variant="ghost"
              className="text-white/80 hover:text-white hover:bg-white/10"
              title="Download image"
            >
              <Download className="w-4 h-4" />
            </Button>
          </a>

          {/* Open in New Tab */}
          <a href={secureSrc} target="_blank" rel="noopener noreferrer">
            <Button
              size="icon-sm"
              variant="ghost"
              className="text-white/80 hover:text-white hover:bg-white/10"
              title="Open full size in new tab"
            >
              <ExternalLink className="w-4 h-4" />
            </Button>
          </a>

          {/* Close */}
          <Button
            size="icon-sm"
            variant="ghost"
            onClick={onClose}
            className="text-white/80 hover:text-white hover:bg-white/10 ml-2"
            title="Close viewer (Esc)"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Main Image Viewport */}
      <div
        className="max-w-5xl max-h-[82vh] overflow-hidden rounded-2xl border border-white/10 shadow-2xl relative flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={secureSrc}
          alt={alt || 'Preview'}
          onLoad={(e) => {
            setDimensions({
              width: e.currentTarget.naturalWidth,
              height: e.currentTarget.naturalHeight,
            });
          }}
          className={`object-contain transition-all duration-300 max-h-[82vh] rounded-2xl ${
            zoomed ? 'scale-150 cursor-zoom-out' : 'scale-100 cursor-zoom-in'
          }`}
          onClick={() => setZoomed(!zoomed)}
        />
      </div>
    </div>
  );
}

export default ImageViewer;

