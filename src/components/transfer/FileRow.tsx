import { X, FileText, Image, Film, Music, FileCode, Archive, File } from 'lucide-react';
import type { TransferFile } from '../../types/transfer';
import { formatFileSize, getFileExtension } from '../../types/file';
import { useTransferStore } from '../../store/transferStore';
import { ProgressBar } from '../ui/ProgressBar';
import './FileRow.css';

interface FileRowProps {
  file: TransferFile;
}

function getFileIcon(type: string, name: string) {
  const ext = getFileExtension(name);
  if (type.startsWith('image/')) return <Image size={18} />;
  if (type.startsWith('video/')) return <Film size={18} />;
  if (type.startsWith('audio/')) return <Music size={18} />;
  if (type === 'application/pdf') return <FileText size={18} />;
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) return <Archive size={18} />;
  if (['js', 'ts', 'py', 'java', 'cpp', 'html', 'css', 'json', 'xml', 'md'].includes(ext)) return <FileCode size={18} />;
  return <File size={18} />;
}

function getFileIconClass(type: string): string {
  if (type.startsWith('image/')) return 'file-icon-image';
  if (type.startsWith('video/')) return 'file-icon-video';
  if (type.startsWith('audio/')) return 'file-icon-audio';
  if (type === 'application/pdf') return 'file-icon-doc';
  return 'file-icon-default';
}

export function FileRow({ file }: FileRowProps) {
  const removeFile = useTransferStore(s => s.removeFile);
  const isUploading = file.status === 'uploading';
  const isCompleted = file.status === 'completed';

  return (
    <div className={`file-row ${isCompleted ? 'file-row-completed' : ''}`}>
      <div className="file-row-main">
        {/* Preview thumbnail or icon */}
        <div className={`file-row-icon ${getFileIconClass(file.type)}`}>
          {file.previewUrl ? (
            <img src={file.previewUrl} alt="" className="file-row-thumb" />
          ) : (
            getFileIcon(file.type, file.name)
          )}
        </div>

        {/* File info */}
        <div className="file-row-info">
          <span className="file-row-name" title={file.name}>{file.name}</span>
          <span className="file-row-size">{formatFileSize(file.size)}</span>
        </div>

        {/* Status / Remove */}
        <div className="file-row-actions">
          {isCompleted && (
            <span className="file-row-check">✓</span>
          )}
          {!isUploading && !isCompleted && (
            <button
              className="file-row-remove"
              onClick={() => removeFile(file.id)}
              aria-label={`Remove ${file.name}`}
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Progress bar during upload */}
      {(isUploading || isCompleted) && (
        <div className="file-row-progress">
          <ProgressBar
            value={file.progress}
            variant={isCompleted ? 'success' : 'gradient'}
            size="sm"
          />
        </div>
      )}
    </div>
  );
}
