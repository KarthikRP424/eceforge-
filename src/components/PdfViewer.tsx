import { useState } from 'react';
import { Download, ExternalLink, Maximize2, Minimize2, FileText, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface PdfViewerProps {
  url: string;
  title: string;
  fileSize?: number;
  onDownload?: () => void;
}

export function PdfViewer({ url, title, fileSize, onDownload }: PdfViewerProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hasError, setHasError] = useState(false);

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleDownloadClick = () => {
    if (onDownload) onDownload();
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/\s+/g, '_')}.pdf`;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div
      className={`flex flex-col bg-navy-950 rounded-2xl overflow-hidden border border-navy-800 shadow-xl transition-all duration-300 ${
        isFullscreen ? 'fixed inset-4 z-50 rounded-xl' : 'w-full h-[650px] sm:h-[750px]'
      }`}
    >
      {/* Viewer Header */}
      <div className="bg-navy-900 border-b border-navy-800 px-4 py-3 flex items-center justify-between gap-3 text-white">
        <div className="flex items-center gap-2 min-w-0">
          <FileText size={18} className="text-cyan-400 flex-shrink-0" />
          <span className="text-sm font-medium truncate max-w-sm sm:max-w-md">{title}</span>
          {fileSize ? (
            <span className="text-2xs text-navy-400 font-mono hidden sm:inline">
              ({formatFileSize(fileSize)})
            </span>
          ) : null}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="text-navy-300 hover:text-white hover:bg-white/10 hidden sm:inline-flex"
            aria-label={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </Button>

          <a href={url} target="_blank" rel="noopener noreferrer">
            <Button
              variant="ghost"
              size="sm"
              className="text-navy-300 hover:text-white hover:bg-white/10"
              leftIcon={<ExternalLink size={15} />}
            >
              Open in Tab
            </Button>
          </a>

          <Button
            variant="primary"
            size="sm"
            onClick={handleDownloadClick}
            leftIcon={<Download size={15} />}
          >
            Download PDF
          </Button>
        </div>
      </div>

      {/* Viewer Body */}
      <div className="flex-1 w-full bg-slate-900 relative">
        {hasError ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-navy-300">
            <AlertCircle size={40} className="text-amber-400 mb-3" />
            <h4 className="text-base font-semibold text-white mb-1">Embedded preview unavailable</h4>
            <p className="text-xs text-navy-400 max-w-sm mb-4">
              Your browser may not support inline PDF viewing or blocked the frame. You can still download or open the file directly.
            </p>
            <div className="flex gap-3">
              <Button variant="primary" size="sm" onClick={handleDownloadClick} leftIcon={<Download size={14} />}>
                Download File
              </Button>
              <a href={url} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm" className="bg-transparent text-white border-navy-600">
                  Direct Link
                </Button>
              </a>
            </div>
          </div>
        ) : (
          <iframe
            src={`${url}#toolbar=1&navpanes=0&scrollbar=1`}
            className="w-full h-full border-0"
            title={title}
            onError={() => setHasError(true)}
          />
        )}
      </div>
    </div>
  );
}
