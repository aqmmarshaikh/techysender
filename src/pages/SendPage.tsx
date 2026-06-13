import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Send, AlertCircle } from 'lucide-react';
import { useTransferStore } from '../store/transferStore';
import { useWebRTCStore } from '../store/webrtcStore';
import { Button } from '../components/ui/Button';
import { UploadZone } from '../components/transfer/UploadZone';
import { FileList } from '../components/transfer/FileList';
import { LinkDisplay } from '../components/transfer/LinkDisplay';
import { ProgressBar } from '../components/ui/ProgressBar';
import { formatFileSize, formatSpeed } from '../types/file';
import './SendPage.css';

export function SendPage() {
  // Local File State
  const { files, isOverLimit } = useTransferStore();

  // WebRTC Direct State
  const {
    connectionState,
    progress,
    error,
    initializeAsSender,
    sendFiles,
    reset
  } = useWebRTCStore();

  const hasFiles = files.length > 0;
  
  const isIdle = connectionState === 'idle';
  const isWaiting = connectionState === 'waiting';
  const isConnecting = connectionState === 'connecting';
  const isConnected = connectionState === 'connected';
  const isTransferring = connectionState === 'transferring';
  const isCompleted = connectionState === 'completed';
  const isFailed = connectionState === 'failed' || connectionState === 'disconnected';
  
  const canGenerate = hasFiles && !isOverLimit() && isIdle;

  useEffect(() => {
    // Component mounted
  }, []);

  const handleGenerateLink = () => {
    initializeAsSender().catch(console.error);
  };

  const handleSend = () => {
    if (isConnected) {
      sendFiles(files.map(f => f.file));
    }
  };

  // ── Success State ──
  if (isCompleted) {
    return (
      <div className="page-content">
        <div className="container send-page">
          <div className="send-header">
            <h1 className="send-title">Transfer <span className="text-gradient">Complete!</span></h1>
            <p className="send-subtitle">All files have been successfully sent to the receiver.</p>
          </div>
          <div className="send-back">
            <Button variant="primary" size="lg" onClick={() => {
              useTransferStore.getState().clearFiles();
              reset();
            }}>Send More Files</Button>
          </div>
        </div>
      </div>
    );
  }

  // ── Waiting for Receiver State ──
  if (isWaiting || isConnecting) {
    return (
      <div className="page-content">
        <div className="container send-page">
          <LinkDisplay />
        </div>
      </div>
    );
  }

  return (
    <div className="page-content">
      <div className="container send-page">
        <div className="send-header">
          <h1 className="send-title">
            Send <span className="text-gradient">Files</span>
          </h1>
          <p className="send-subtitle">
            {isConnected 
              ? 'You are securely connected to the receiver via WebRTC.'
              : 'Select files to generate a secure peer-to-peer transfer link.'}
          </p>
        </div>

        {/* Direct Connection Status Indicator */}
        {isConnected && (
          <div className="direct-status-banner connected">
            <div className="status-dot green"></div>
            <span>Connected to receiver. Ready to transfer.</span>
          </div>
        )}

        {/* Upload Zone */}
        {isIdle && <UploadZone />}

        {/* File List */}
        <FileList />
        
        {/* Direct Transfer Progress */}
        {isTransferring && (
          <div className="direct-progress-card">
            <div className="download-progress-header">
              <span className="download-progress-label">Sending...</span>
              <span className="download-progress-percent">
                {progress.totalBytes > 0 
                  ? Math.round((progress.transferredBytes / progress.totalBytes) * 100) 
                  : 0}%
              </span>
            </div>
            <ProgressBar
              value={progress.totalBytes > 0 
                ? (progress.transferredBytes / progress.totalBytes) * 100 
                : 0}
              variant="cyan"
              size="lg"
              animated
            />
            <div className="download-progress-stats">
              <span>{formatFileSize(progress.transferredBytes)} / {formatFileSize(progress.totalBytes)}</span>
              <span>{formatSpeed(progress.currentSpeed)}</span>
            </div>
          </div>
        )}

        {/* Error Display */}
        {(error || isFailed) && (
          <div className="send-error">
            <AlertCircle size={16} />
            <span>{error || 'Connection to receiver was lost.'}</span>
          </div>
        )}

        {/* Action Buttons */}
        {canGenerate && (
          <div className="send-action">
            <Button
              variant="primary"
              size="xl"
              icon={<Send size={18} />}
              onClick={handleGenerateLink}
              fullWidth
              glow
            >
              Generate Direct Link
            </Button>
          </div>
        )}

        {isConnected && !isTransferring && (
          <div className="send-action">
            <Button
              variant="primary"
              size="xl"
              icon={<Send size={18} />}
              onClick={handleSend}
              fullWidth
              glow
            >
              Start Transfer
            </Button>
          </div>
        )}

        {/* Back link */}
        {isIdle && (
          <div className="send-back">
            <Link to="/">
              <Button variant="ghost" size="sm">← Back to Home</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
