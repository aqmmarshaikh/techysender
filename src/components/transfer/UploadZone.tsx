import { useCallback, useRef, useState } from 'react';
import { Upload, FolderUp, AlertCircle } from 'lucide-react';
import { useTransferStore } from '../../store/transferStore';
import { Button } from '../ui/Button';
import { formatFileSize } from '../../types/file';
import { MAX_TRANSFER_SIZE } from '../../types/transfer';
import './UploadZone.css';

export function UploadZone() {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const { addFiles, totalSize, isOverLimit } = useTransferStore();

  const handleFiles = useCallback((files: FileList | File[]) => {
    addFiles(files);
  }, [addFiles]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Only set false if we're leaving the drop zone (not entering a child)
    if (e.currentTarget === e.target) {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const { files } = e.dataTransfer;
    if (files.length > 0) {
      handleFiles(files);
    }
  }, [handleFiles]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = e.target;
    if (files && files.length > 0) {
      handleFiles(files);
    }
    // Reset input so the same file can be selected again
    e.target.value = '';
  }, [handleFiles]);

  const currentSize = totalSize();
  const remaining = MAX_TRANSFER_SIZE - currentSize;

  return (
    <div
      className={`upload-zone ${isDragging ? 'upload-zone-dragging' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      role="button"
      tabIndex={0}
      aria-label="File upload drop zone"
      onClick={() => fileInputRef.current?.click()}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          fileInputRef.current?.click();
        }
      }}
    >
      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="upload-zone-input"
        onChange={handleFileSelect}
        aria-hidden="true"
      />
      <input
        ref={folderInputRef}
        type="file"
        multiple
        // @ts-expect-error webkitdirectory is not in the standard typings
        webkitdirectory=""
        directory=""
        className="upload-zone-input"
        onChange={handleFileSelect}
        aria-hidden="true"
      />

      {/* Drag indicator overlay */}
      {isDragging && (
        <div className="upload-zone-overlay">
          <Upload size={48} />
          <span>Drop files here</span>
        </div>
      )}

      {/* Content */}
      <div className="upload-zone-body">
        <div className="upload-zone-icon-wrapper">
          <div className="upload-zone-icon-ring" />
          <div className="upload-zone-icon-inner">
            <Upload size={26} />
          </div>
        </div>

        <h3 className="upload-zone-title">Drag & Drop Files Here</h3>
        <p className="upload-zone-text">or click to browse your files</p>

        <div className="upload-zone-buttons" onClick={(e) => e.stopPropagation()}>
          <Button
            variant="primary"
            size="md"
            icon={<Upload size={15} />}
            onClick={() => fileInputRef.current?.click()}
          >
            Browse Files
          </Button>
          <Button
            variant="secondary"
            size="md"
            icon={<FolderUp size={15} />}
            onClick={() => folderInputRef.current?.click()}
          >
            Upload Folder
          </Button>
        </div>

        <div className="upload-zone-meta">
          {isOverLimit() ? (
            <span className="upload-zone-warning">
              <AlertCircle size={14} />
              Exceeds 200 MB limit — remove some files
            </span>
          ) : currentSize > 0 ? (
            <span className="upload-zone-info">
              {formatFileSize(remaining)} remaining of 200 MB
            </span>
          ) : (
            <span className="upload-zone-info">
              Maximum total size: 200 MB
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
