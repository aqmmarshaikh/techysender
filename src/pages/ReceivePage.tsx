import { useEffect, useState } from 'react';
import { Link, useSearchParams, useLocation, useNavigate } from 'react-router-dom';
import { Download, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { GlassCard } from '../components/ui/GlassCard';
import { ProgressBar } from '../components/ui/ProgressBar';
import { useWebRTCStore } from '../store/webrtcStore';
import { formatFileSize, formatSpeed } from '../types/file';
import './ReceivePage.css';

export function ReceivePage() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const sessionId = searchParams.get('id');
  const keyString = location.hash.substring(1);

  const {
    connectionState,
    progress,
    receivedFiles,
    initializeAsReceiver,
    disconnect,
    reset,
    error
  } = useWebRTCStore();

  const [hasInitialized, setHasInitialized] = useState(false);
  const [joinUrl, setJoinUrl] = useState('');
  const [joinError, setJoinError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Attempt to connect immediately if valid link
    if (sessionId && keyString && !hasInitialized) {
      setHasInitialized(true);
      initializeAsReceiver(sessionId, keyString).catch(console.error);
    }
  }, [sessionId, keyString, hasInitialized]);

  useEffect(() => {
    // Component mounted
  }, []);

  const handleCancel = () => {
    reset();
    setHasInitialized(false); // allow re-trigger if needed
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    setJoinError('');
    try {
      const url = new URL(joinUrl);
      const id = url.searchParams.get('id');
      const hash = url.hash;
      
      if (!id || !hash) {
        setJoinError('Invalid link format. Ensure it includes the ID and key.');
        return;
      }
      
      // Navigate to the same page but with the parsed params
      navigate(`/receive${url.search}${url.hash}`);
    } catch {
      setJoinError('Invalid URL. Please paste a complete transfer link.');
    }
  };

  // ── Missing / Invalid Link State (Join Transfer UI) ──
  if (!sessionId || !keyString) {
    return (
      <div className="page-content">
        <div className="container receive-page">
          <div className="receive-header">
            <h1 className="receive-title">Join a <span className="text-gradient">Transfer</span></h1>
            <p className="receive-subtitle">Paste the secure transfer link provided by the sender.</p>
          </div>
          
          <GlassCard variant="purple" padding="xl" className="receive-card">
            <form onSubmit={handleJoin} className="receive-content">
              <div className="receive-icon" style={{ color: 'var(--color-purple)' }}>
                <Download size={40} />
              </div>
              <h3 className="receive-card-title">Paste Transfer Link</h3>
              
              <input 
                type="text" 
                className="receive-url-input" 
                placeholder="e.g. http://.../receive?id=abc#key"
                value={joinUrl}
                onChange={e => setJoinUrl(e.target.value)}
                autoFocus
              />
              
              {joinError && (
                <div style={{ color: 'var(--color-danger)', marginBottom: '1rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <AlertCircle size={14} />
                  <span>{joinError}</span>
                </div>
              )}
              
              <Button type="submit" variant="primary" size="xl" glow fullWidth>
                Connect to Transfer
              </Button>
            </form>
          </GlassCard>

          <div className="receive-back" style={{ display: 'flex', justifyContent: 'center' }}>
            <Link to="/">
              <Button variant="ghost" size="lg">Return to Home</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── State: Failed ──
  if (connectionState === 'failed') {
    return (
      <div className="page-content">
        <div className="container receive-page">
          <div className="receive-header">
            <h1 className="receive-title text-danger">Connection <span className="text-gradient">Failed</span></h1>
            <p className="receive-subtitle">{error || 'An unexpected error occurred.'}</p>
          </div>
          <GlassCard variant="danger" padding="xl" className="receive-card">
            <div className="receive-content">
              <Button variant="primary" size="lg" onClick={() => {
                setHasInitialized(false);
                reset();
              }}>Try Again</Button>
            </div>
          </GlassCard>
        </div>
      </div>
    );
  }

  // ── State: Connecting ──
  if (connectionState === 'connecting' || connectionState === 'idle') {
    return (
      <div className="page-content">
        <div className="container receive-page">
          <div className="receive-header">
            <h1 className="receive-title">Connecting to <span className="text-gradient">Sender</span></h1>
            <p className="receive-subtitle">
              Establishing a secure, direct peer-to-peer connection.
            </p>
          </div>

          <GlassCard variant="purple" padding="xl" className="receive-card">
            <div className="receive-waiting-content">
              <div className="receive-status-box" style={{ padding: '2rem' }}>
                <Loader2 className="spinner" size={32} style={{ color: 'var(--color-purple)', marginBottom: '1rem' }} />
                <span>Negotiating P2P connection...</span>
              </div>
              <Button variant="ghost" onClick={handleCancel}>Cancel</Button>
            </div>
          </GlassCard>
        </div>
      </div>
    );
  }

  // ── State: Connected (Waiting for Sender to click Transfer) ──
  if (connectionState === 'connected') {
    return (
      <div className="page-content">
        <div className="container receive-page">
          <div className="receive-header">
            <h1 className="receive-title">Ready to <span className="text-gradient">Receive</span></h1>
            <p className="receive-subtitle">
              Connected successfully! Waiting for the sender to start the transfer.
            </p>
          </div>
          <GlassCard variant="cyan" padding="xl" className="receive-card">
            <div className="receive-content">
              <div className="receive-icon" style={{ animation: 'pulse 2s infinite', color: 'var(--color-cyan)' }}>
                <Download size={40} />
              </div>
              <h3 className="receive-card-title">Stand By...</h3>
              <p className="receive-card-text">
                Your browser is ready to securely receive files.
              </p>
            </div>
          </GlassCard>
        </div>
      </div>
    );
  }

  // ── State: Transferring / Completed ──
  const progressPercent = progress.totalBytes > 0 
    ? (progress.transferredBytes / progress.totalBytes) * 100 
    : 0;

  return (
    <div className="page-content">
      <div className="container receive-page">
        <div className="receive-header">
          <h1 className="receive-title">
            {connectionState === 'completed' ? 'Transfer Complete' : 'Receiving Files'}
          </h1>
          <p className="receive-subtitle">
            Direct WebRTC Connection Active
          </p>
        </div>

        <GlassCard variant={connectionState === 'completed' ? 'default' : 'cyan'} padding="xl" className="receive-card">
          <div className="receive-transfer-content">
            
            <div className="download-progress-section">
              <div className="download-progress-header">
                <span className="download-progress-label">
                  {connectionState === 'completed' ? 'Finished' : 'Receiving...'}
                </span>
                <span className="download-progress-percent">
                  {Math.round(progressPercent)}%
                </span>
              </div>
              
              <ProgressBar
                value={progressPercent}
                variant={connectionState === 'completed' ? 'success' : 'cyan'}
                size="lg"
                animated={connectionState === 'transferring'}
              />
              
              <div className="download-progress-stats">
                <span>
                  {formatFileSize(progress.transferredBytes)} / {formatFileSize(progress.totalBytes)}
                </span>
                {connectionState === 'transferring' && (
                  <span>
                    {formatSpeed(progress.currentSpeed)}
                  </span>
                )}
              </div>
            </div>

            {/* Received Files List */}
            {receivedFiles.length > 0 && (
              <div className="received-files-list">
                <h4>Files Received</h4>
                {receivedFiles.map((f, i) => (
                  <div key={i} className="received-file-item">
                    <span>{f.name}</span>
                    <span className="received-file-size">{formatFileSize(f.size)}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="receive-actions">
              <Button variant="secondary" onClick={handleCancel}>
                {connectionState === 'completed' ? 'Close' : 'Cancel Transfer'}
              </Button>
            </div>

          </div>
        </GlassCard>
      </div>
    </div>
  );
}
