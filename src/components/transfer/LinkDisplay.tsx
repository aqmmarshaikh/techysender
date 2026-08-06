import { useState, useEffect } from 'react';
import { Copy, Check, Link2, Loader2, RefreshCw } from 'lucide-react';
import { useWebRTCStore } from '../../store/webrtcStore';
import { QRCodePanel } from '../sharing/QRCodePanel';
import { ShareButtons } from '../sharing/ShareButtons';
import { Button } from '../ui/Button';
import { copyToClipboard } from '../../lib/linkGenerator';
import './LinkDisplay.css';

export function LinkDisplay() {
  const shareUrl = useWebRTCStore(s => s.shareUrl);
  const shortUrl = useWebRTCStore(s => s.shortUrl);
  const generateNewShortLink = useWebRTCStore(s => s.generateNewShortLink);
  const resetWebRTC = useWebRTCStore(s => s.reset);
  
  const [copiedLong, setCopiedLong] = useState(false);
  const [copiedShort, setCopiedShort] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (copiedLong) {
      const timer = setTimeout(() => setCopiedLong(false), 2500);
      return () => clearTimeout(timer);
    }
  }, [copiedLong]);

  useEffect(() => {
    if (copiedShort) {
      const timer = setTimeout(() => setCopiedShort(false), 2500);
      return () => clearTimeout(timer);
    }
  }, [copiedShort]);

  if (!shareUrl) return null;

  const handleCopyLong = async () => {
    if (shareUrl) {
      const success = await copyToClipboard(shareUrl);
      if (success) setCopiedLong(true);
    }
  };

  const handleCopyShort = async () => {
    if (shortUrl) {
      const success = await copyToClipboard(shortUrl);
      if (success) setCopiedShort(true);
    }
  };

  const handleGenerateNewShortLink = async () => {
    setIsGenerating(true);
    await generateNewShortLink();
    setIsGenerating(false);
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

      {/* Short Link box */}
      {shortUrl && (
        <div className="link-display-url-box" style={{ marginBottom: '1rem' }}>
          <div className="link-display-url-icon">
            <Link2 size={16} />
          </div>
          <input
            type="text"
            className="link-display-url-input"
            value={shortUrl}
            readOnly
            onClick={(e) => (e.target as HTMLInputElement).select()}
            aria-label="Short transfer link"
          />
          <Button
            variant={copiedShort ? 'success' : 'primary'}
            size="sm"
            icon={copiedShort ? <Check size={14} /> : <Copy size={14} />}
            onClick={handleCopyShort}
          >
            {copiedShort ? 'Copied!' : 'Copy'}
          </Button>
        </div>
      )}

      {/* Long Link box */}
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
          variant={copiedLong ? 'success' : 'primary'}
          size="sm"
          icon={copiedLong ? <Check size={14} /> : <Copy size={14} />}
          onClick={handleCopyLong}
        >
          {copiedLong ? 'Copied!' : 'Copy'}
        </Button>
      </div>

      {/* Generate new link button */}
      {shortUrl && (
        <div style={{ marginTop: '0.5rem', marginBottom: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
          <Button variant="ghost" size="sm" onClick={handleGenerateNewShortLink} disabled={isGenerating} icon={isGenerating ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}>
            Generate New Short Link
          </Button>
        </div>
      )}

      {/* QR Code */}
      <QRCodePanel url={shortUrl || shareUrl} />

      {/* Share buttons */}
      <ShareButtons url={shortUrl || shareUrl} />

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
