import { useState, useEffect } from 'react';
import { Copy, Check, Link2, Loader2 } from 'lucide-react';
import { useWebRTCStore } from '../../store/webrtcStore';
import { QRCodePanel } from '../sharing/QRCodePanel';
import { ShareButtons } from '../sharing/ShareButtons';
import { Button } from '../ui/Button';
import { copyToClipboard } from '../../lib/linkGenerator';
import './LinkDisplay.css';

export function LinkDisplay() {
  const shareUrl = useWebRTCStore(s => s.shareUrl);
  const resetWebRTC = useWebRTCStore(s => s.reset);
  
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2500);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  if (!shareUrl) return null;

  const handleCopy = async () => {
    if (shareUrl) {
      const success = await copyToClipboard(shareUrl);
      if (success) setCopied(true);
    }
  };

  const handleCancel = () => {
    resetWebRTC();
  };

  return (
    <div className="link-display animate-fade-in-scale">
      {/* Waiting header */}
      <div className="link-display-header">
        <div className="link-display-success-icon" style={{ animation: 'pulse 2s infinite', color: 'var(--color-cyan)' }}>
          <Loader2 size={40} className="animate-spin" />
        </div>
        <h2 className="link-display-title">Waiting for Receiver...</h2>
        <p className="link-display-subtitle">
          Share this link with the receiver. The transfer will begin automatically when they connect.
        </p>
      </div>

      {/* Link box */}
      <div className="link-display-url-box">
        <div className="link-display-url-icon">
          <Link2 size={16} />
        </div>
        <input
          type="text"
          className="link-display-url-input"
          value={shareUrl}
          readOnly
          onClick={(e) => (e.target as HTMLInputElement).select()}
          aria-label="Transfer link"
        />
        <Button
          variant={copied ? 'success' : 'primary'}
          size="sm"
          icon={copied ? <Check size={14} /> : <Copy size={14} />}
          onClick={handleCopy}
        >
          {copied ? 'Copied!' : 'Copy'}
        </Button>
      </div>

      {/* QR Code */}
      <QRCodePanel url={shareUrl} />

      {/* Share buttons */}
      <ShareButtons url={shareUrl} />

      {/* Security notice */}
      <div className="link-display-security">
        <div className="link-display-security-dot" />
        <span>Direct WebRTC Connection · End-to-end encrypted · Stay on this page</span>
      </div>

      {/* Cancel */}
      <div className="link-display-new">
        <Button variant="secondary" size="lg" onClick={handleCancel} fullWidth>
          Cancel Transfer
        </Button>
      </div>
    </div>
  );
}
