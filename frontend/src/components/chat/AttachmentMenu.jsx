import React, { useRef, useEffect } from 'react';
import { Image as ImageIcon, FileText, UploadCloud, X } from 'lucide-react';

export function AttachmentMenu({ open, onClose, onSelectImages, onSelectDocuments }) {
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        !e.target.closest('[data-attachment-trigger]')
      ) {
        onClose();
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={menuRef}
      className="absolute bottom-20 left-4 z-40 w-56 p-2 rounded-2xl border border-border bg-popover text-popover-foreground shadow-2xl space-y-1 animate-fade-in select-none"
    >
      <div className="px-2 py-1 text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center justify-between border-b border-border/50 mb-1">
        <span>Share Media</span>
        <button
          type="button"
          onClick={onClose}
          className="p-0.5 hover:text-foreground text-muted-foreground"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Upload Images Option */}
      <button
        type="button"
        onClick={() => {
          onClose();
          onSelectImages();
        }}
        className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-foreground hover:bg-muted/80 transition-colors text-left"
      >
        <div className="w-8 h-8 rounded-lg bg-indigo-500/15 text-indigo-500 flex items-center justify-center flex-shrink-0">
          <ImageIcon className="w-4 h-4" />
        </div>
        <div>
          <div>Photos & Images</div>
          <div className="text-[10px] text-muted-foreground font-normal">PNG, JPG, WEBP, GIF</div>
        </div>
      </button>

      {/* Upload Documents Option */}
      <button
        type="button"
        onClick={() => {
          onClose();
          onSelectDocuments();
        }}
        className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-foreground hover:bg-muted/80 transition-colors text-left"
      >
        <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-500 flex items-center justify-center flex-shrink-0">
          <FileText className="w-4 h-4" />
        </div>
        <div>
          <div>Documents & Files</div>
          <div className="text-[10px] text-muted-foreground font-normal">PDF, DOCX, XLSX, TXT</div>
        </div>
      </button>
    </div>
  );
}

export default AttachmentMenu;

