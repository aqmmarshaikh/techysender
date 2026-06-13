import { Wifi, ArrowRight } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { StatusBadge } from '../ui/StatusBadge';
import './TransferOptions.css';

export function TransferOptions() {
  return (
    <section className="transfer-options section" id="transfer-options">
      <div className="container">
        <div className="transfer-options-header">
          <span className="section-label">Transfer Architecture</span>
          <h2 className="section-title">Pure <span className="text-gradient">Peer-to-Peer</span></h2>
          <p className="section-subtitle">No intermediate storage. Your files go directly from your device to theirs.</p>
        </div>

        <div className="transfer-options-grid" style={{ gridTemplateColumns: 'minmax(0, 600px)', justifyContent: 'center' }}>
          <GlassCard variant="cyan" padding="xl" className="transfer-option-card">
            <div className="transfer-option-badge">
              <StatusBadge status="active" label="Direct WebRTC" />
            </div>
            <div className="transfer-option-icon transfer-option-icon-cyan">
              <Wifi size={28} />
            </div>
            <h3 className="transfer-option-title">Direct Connection</h3>
            <p className="transfer-option-subtitle">End-to-End Encrypted via WebRTC Data Channels</p>
            <ul className="transfer-option-features">
              <li><ArrowRight size={14} /> Fastest possible speeds (LAN capable)</li>
              <li><ArrowRight size={14} /> Zero server storage</li>
              <li><ArrowRight size={14} /> AES-256-GCM chunk-level encryption</li>
              <li><ArrowRight size={14} /> Both users must be online simultaneously</li>
            </ul>
            <div className="transfer-option-flow">
              <span className="transfer-flow-step">Sender generates link</span>
              <span className="transfer-flow-arrow">→</span>
              <span className="transfer-flow-step">Receiver connects</span>
              <span className="transfer-flow-arrow">→</span>
              <span className="transfer-flow-step">Encrypted stream begins</span>
            </div>
          </GlassCard>
        </div>
      </div>
    </section>
  );
}
