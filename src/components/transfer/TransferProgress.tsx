import { useTransferStore } from '../../store/transferStore';
import { ProgressBar } from '../ui/ProgressBar';
import { StatusBadge } from '../ui/StatusBadge';
import { formatFileSize, formatSpeed, formatTime } from '../../types/file';
import { Lock, Zap } from 'lucide-react';
import './TransferProgress.css';

export function TransferProgress() {
  const transfer = useTransferStore(s => s.transfer);

  if (!transfer || (transfer.status !== 'UPLOADING' && transfer.status !== 'CONNECTING')) {
    return null;
  }

  const percentage = transfer.totalSize > 0
    ? (transfer.uploadedSize / transfer.totalSize) * 100
    : 0;

  const remaining = transfer.totalSize - transfer.uploadedSize;
  const eta = transfer.currentSpeed > 0
    ? remaining / transfer.currentSpeed
    : 0;

  return (
    <div className="transfer-progress">
      <div className="transfer-progress-header">
        <div className="transfer-progress-status">
          <StatusBadge
            status="info"
            label={transfer.status === 'CONNECTING' ? 'Connecting...' : 'Encrypting & Uploading'}
            pulse
          />
        </div>
        <span className="transfer-progress-percent">{Math.round(percentage)}%</span>
      </div>

      <ProgressBar
        value={percentage}
        variant="gradient"
        size="lg"
        animated
      />

      <div className="transfer-progress-stats">
        <div className="transfer-stat">
          <Lock size={12} />
          <span>{formatFileSize(transfer.uploadedSize)} / {formatFileSize(transfer.totalSize)}</span>
        </div>
        <div className="transfer-stat">
          <Zap size={12} />
          <span>{formatSpeed(transfer.currentSpeed)}</span>
        </div>
        {eta > 0 && (
          <div className="transfer-stat">
            <span>~{formatTime(eta)} remaining</span>
          </div>
        )}
      </div>

      {/* Terminal-style status messages */}
      <div className="transfer-terminal">
        <div className="terminal-line terminal-line-done">
          <span className="terminal-prefix">✓</span>
          <span>Encryption keys generated</span>
        </div>
        <div className="terminal-line terminal-line-done">
          <span className="terminal-prefix">✓</span>
          <span>AES-256-GCM cipher initialized</span>
        </div>
        <div className="terminal-line terminal-line-active">
          <span className="terminal-prefix terminal-cursor">▸</span>
          <span>Encrypting file chunks...</span>
        </div>
      </div>
    </div>
  );
}
