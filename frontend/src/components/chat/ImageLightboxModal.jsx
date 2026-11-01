import React from 'react';
import { X, Download, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function ImageLightboxModal({ src, alt, onClose }) {
  if (!src) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      {/* Top Toolbar */}
      <div
        className="absolute top-4 right-4 flex items-center gap-2 z-10"
        onClick={(e) => e.stopPropagation()}
      >
        <a
          href={src}
          download={alt || 'talkspace-image'}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button
            size="icon-sm"
            variant="outline"
            className="bg-black/60 border-white/20 text-white hover:bg-white/20"
            title="Download full size"
          >
            <Download className="w-4 h-4" />
          </Button>
        </a>

        <a href={src} target="_blank" rel="noopener noreferrer">
          <Button
            size="icon-sm"
            variant="outline"
            className="bg-black/60 border-white/20 text-white hover:bg-white/20"
            title="Open original in new tab"
          >
            <ExternalLink className="w-4 h-4" />
          </Button>
        </a>

        <Button
          size="icon-sm"
          variant="outline"
          onClick={onClose}
          className="bg-black/60 border-white/20 text-white hover:bg-white/20"
          title="Close lightbox"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Main Image Frame */}
      <div
        className="max-w-4xl max-h-[85vh] overflow-hidden rounded-2xl shadow-2xl border border-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={src}
          alt={alt || 'Enlarged media preview'}
          className="w-full h-full object-contain max-h-[85vh]"
        />
      </div>
    </div>
  );
}

export default ImageLightboxModal;

