import {
  FileText, Image, Film, Music, Archive, File, FileCode,
} from 'lucide-react';
import type { DownloadFileInfo } from '../../store/downloadStore';
import { formatFileSize, getFileExtension } from '../../types/file';
import './DownloadFileList.css';

interface DownloadFileListProps {
  files: DownloadFileInfo[];
  totalSize: number;
}

function getIcon(type: string, name: string) {
  const ext = getFileExtension(name);
  if (type.startsWith('image/')) return <Image size={18} />;
  if (type.startsWith('video/')) return <Film size={18} />;
  if (type.startsWith('audio/')) return <Music size={18} />;
  if (type === 'application/pdf') return <FileText size={18} />;
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) return <Archive size={18} />;
  if (['js', 'ts', 'py', 'java', 'html', 'css', 'json'].includes(ext)) return <FileCode size={18} />;
  return <File size={18} />;
}

function getIconClass(type: string): string {
  if (type.startsWith('image/')) return 'dl-file-icon-image';
  if (type.startsWith('video/')) return 'dl-file-icon-video';
  if (type.startsWith('audio/')) return 'dl-file-icon-audio';
  if (type === 'application/pdf') return 'dl-file-icon-doc';
  return 'dl-file-icon-default';
}

export function DownloadFileList({ files, totalSize }: DownloadFileListProps) {
  return (
    <div className="dl-file-list">
      <div className="dl-file-list-header">
        <span className="dl-file-count">
          {files.length} file{files.length !== 1 ? 's' : ''}
        </span>
        <span className="dl-file-total">{formatFileSize(totalSize)}</span>
      </div>

      <div className="dl-file-items">
        {files.map((file, i) => (
          <div key={i} className="dl-file-item">
            <div className={`dl-file-icon ${getIconClass(file.type)}`}>
              {getIcon(file.type, file.name)}
            </div>
            <div className="dl-file-info">
              <span className="dl-file-name">{file.name}</span>
              <span className="dl-file-size">{formatFileSize(file.size)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
