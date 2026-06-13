import { useTransferStore } from '../../store/transferStore';
import { FileRow } from './FileRow';
import { formatFileSize } from '../../types/file';
import { Trash2 } from 'lucide-react';
import { Button } from '../ui/Button';
import './FileList.css';

export function FileList() {
  const { files, clearFiles, totalSize, isOverLimit } = useTransferStore();

  if (files.length === 0) return null;

  return (
    <div className="file-list">
      <div className="file-list-header">
        <div className="file-list-info">
          <span className="file-list-count">{files.length} file{files.length !== 1 ? 's' : ''}</span>
          <span className="file-list-dot">·</span>
          <span className={`file-list-size ${isOverLimit() ? 'file-list-size-error' : ''}`}>
            {formatFileSize(totalSize())}
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          icon={<Trash2 size={14} />}
          onClick={clearFiles}
        >
          Clear All
        </Button>
      </div>

      <div className="file-list-items">
        {files.map(file => (
          <FileRow key={file.id} file={file} />
        ))}
      </div>
    </div>
  );
}
