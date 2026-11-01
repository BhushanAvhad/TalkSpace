import React, { useEffect, useState } from 'react';
import { X, FileText, Image as ImageIcon } from 'lucide-react';
import { formatBytes, getDocumentMeta } from './DocumentCard';

export function FilePreviewTray({ files, onRemove, onClearAll }) {
  const [previews, setPreviews] = useState([]);

  useEffect(() => {
    // Generate object URLs for image previews
    const newPreviews = files.map((file) => {
      const isImg = file.type.startsWith('image/');
      return {
        file,
        previewUrl: isImg ? URL.createObjectURL(file) : null,
      };
    });

    setPreviews(newPreviews);

    // Cleanup generated object URLs
    return () => {
      newPreviews.forEach((item) => {
        if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
      });
    };
  }, [files]);

  if (!files || files.length === 0) return null;

  return (
    <div className="p-2 mb-2 rounded-2xl bg-muted/40 border border-border/80 flex flex-col gap-1.5 animate-fade-in select-none">
      <div className="flex items-center justify-between px-1 text-[11px] font-semibold text-muted-foreground">
        <span>
          Attachments ready to send ({files.length})
        </span>
        <button
          type="button"
          onClick={onClearAll}
          className="text-muted-foreground hover:text-destructive text-[10px] underline font-medium"
        >
          Remove all
        </button>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1 max-h-32">
        {previews.map(({ file, previewUrl }, index) => {
          const isImg = !!previewUrl;
          const meta = getDocumentMeta(file.name);
          const Icon = meta.icon;

          return (
            <div
              key={`${file.name}-${index}`}
              className="relative group flex items-center gap-2 p-1.5 pr-6 rounded-xl bg-card border border-border text-foreground text-xs shadow-subtle flex-shrink-0 max-w-[200px]"
            >
              {isImg ? (
                <img
                  src={previewUrl}
                  alt={file.name}
                  className="w-9 h-9 rounded-lg object-cover flex-shrink-0 border border-border/60"
                />
              ) : (
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 border ${meta.badgeClass}`}
                >
                  <Icon className={`w-4 h-4 ${meta.iconClass}`} />
                </div>
              )}

              <div className="min-w-0 flex-1">
                <div className="truncate font-semibold text-[11px] leading-tight" title={file.name}>
                  {file.name}
                </div>
                <div className="text-[10px] text-muted-foreground">
                  {formatBytes(file.size)}
                </div>
              </div>

              {/* Individual remove button */}
              <button
                type="button"
                onClick={() => onRemove(index)}
                className="absolute right-1 top-1/2 -translate-y-1/2 p-1 rounded-lg text-muted-foreground hover:text-destructive hover:bg-muted transition-colors"
                title="Remove file"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default FilePreviewTray;

