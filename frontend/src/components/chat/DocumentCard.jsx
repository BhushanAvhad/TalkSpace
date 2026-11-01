import React, { useState } from 'react';
import {
  FileText,
  Download,
  FileSpreadsheet,
  FileBarChart,
  FileCode,
  File,
  Check,
  ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/useAuthStore';

// Format bytes into human-readable size
export function formatBytes(bytes, decimals = 1) {
  if (!bytes || bytes === 0) return 'Document';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// Map extensions to color themes and icons
export function getDocumentMeta(fileName = '') {
  const ext = (fileName.split('.').pop() || '').toLowerCase();

  switch (ext) {
    case 'pdf':
      return {
        label: 'PDF Document',
        ext: 'PDF',
        icon: FileText,
        badgeClass: 'bg-rose-500/15 text-rose-500 border-rose-500/30',
        iconClass: 'text-rose-500',
      };
    case 'doc':
    case 'docx':
      return {
        label: 'Word Document',
        ext: 'DOCX',
        icon: FileText,
        badgeClass: 'bg-blue-500/15 text-blue-500 border-blue-500/30',
        iconClass: 'text-blue-500',
      };
    case 'xls':
    case 'xlsx':
    case 'csv':
      return {
        label: 'Spreadsheet',
        ext: ext.toUpperCase(),
        icon: FileSpreadsheet,
        badgeClass: 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30',
        iconClass: 'text-emerald-500',
      };
    case 'ppt':
    case 'pptx':
      return {
        label: 'Presentation',
        ext: 'PPTX',
        icon: FileBarChart,
        badgeClass: 'bg-amber-500/15 text-amber-500 border-amber-500/30',
        iconClass: 'text-amber-500',
      };
    case 'txt':
    default:
      return {
        label: 'Text File',
        ext: ext.toUpperCase() || 'FILE',
        icon: File,
        badgeClass: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30',
        iconClass: 'text-indigo-400',
      };
  }
}

export function DocumentCard({ fileURL, fileName, fileSize, isMe }) {
  const { user } = useAuthStore();
  const [downloading, setDownloading] = useState(false);
  const meta = getDocumentMeta(fileName);
  const Icon = meta.icon;

  // Append authenticated username parameter for protected attachment verification
  const secureDownloadURL = user?.username
    ? `${fileURL}?user=${encodeURIComponent(user.username)}`
    : fileURL;

  const handleDownload = () => {
    setDownloading(true);
    setTimeout(() => setDownloading(false), 2000);
  };

  return (
    <div
      className={cn(
        'group/doc flex items-center gap-3 p-3 rounded-2xl border transition-all text-xs max-w-sm sm:max-w-md select-none',
        isMe
          ? 'bg-white/10 border-white/20 hover:bg-white/15 text-white'
          : 'bg-card border-border/80 hover:border-primary/40 text-foreground shadow-subtle'
      )}
    >
      {/* File Type Badge / Icon */}
      <div
        className={cn(
          'w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 border font-bold text-xs shadow-subtle',
          meta.badgeClass
        )}
      >
        <Icon className={cn('w-5 h-5', meta.iconClass)} />
      </div>

      {/* File Details */}
      <div className="flex-1 min-w-0 pr-1">
        <div className="truncate font-semibold text-xs leading-tight" title={fileName}>
          {fileName || 'Document'}
        </div>
        <div
          className={cn(
            'flex items-center gap-2 text-[10px] mt-1',
            isMe ? 'text-white/80' : 'text-muted-foreground'
          )}
        >
          <span className="font-semibold uppercase tracking-wider">{meta.ext}</span>
          <span>&bull;</span>
          <span>{formatBytes(fileSize)}</span>
        </div>
      </div>

      {/* Download Action Button */}
      <a
        href={secureDownloadURL}
        download={fileName || 'document'}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleDownload}
        className={cn(
          'p-2 rounded-xl transition-all flex items-center justify-center flex-shrink-0',
          isMe
            ? 'bg-white/20 hover:bg-white/30 text-white'
            : 'bg-muted hover:bg-primary hover:text-primary-foreground text-foreground shadow-subtle'
        )}
        title={`Download ${fileName}`}
      >
        {downloading ? (
          <Check className="w-4 h-4 text-emerald-400" />
        ) : (
          <Download className="w-4 h-4" />
        )}
      </a>
    </div>
  );
}

export default DocumentCard;

