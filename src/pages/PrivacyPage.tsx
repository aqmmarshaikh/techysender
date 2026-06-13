import { Shield, Lock, Eye, Server, Trash2, Globe } from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import './PrivacyPage.css';

export function PrivacyPage() {
  return (
    <div className="page-content">
      <div className="container privacy-page">
        <div className="privacy-header">
          <div className="privacy-icon-wrapper">
            <Shield size={32} />
          </div>
          <h1 className="privacy-title">Privacy <span className="text-gradient">Policy</span></h1>
          <p className="privacy-subtitle">
            BYTEPORT is built on a zero-knowledge architecture. Here's exactly what we do — and don't do — with your data.
          </p>
        </div>

        <div className="privacy-grid">
          <GlassCard variant="cyan" padding="lg">
            <div className="privacy-card-icon"><Lock size={22} /></div>
            <h3>What We Encrypt</h3>
            <p>All files are encrypted client-side using AES-256-GCM before leaving your browser. Encryption keys are embedded in URL fragments that never reach our servers.</p>
          </GlassCard>

          <GlassCard variant="default" padding="lg">
            <div className="privacy-card-icon"><Eye size={22} /></div>
            <h3>What We Can See</h3>
            <p>We can see: transfer metadata (file count, total size), anonymous analytics (view count, download count), and expiration timestamps. We cannot see: file contents, file names, or encryption keys.</p>
          </GlassCard>

          <GlassCard variant="default" padding="lg">
            <div className="privacy-card-icon"><Server size={22} /></div>
            <h3>What We Store</h3>
            <p>Absolutely nothing. No file data touches our servers at all — transfers happen peer-to-peer using direct WebRTC connections.</p>
          </GlassCard>

          <GlassCard variant="purple" padding="lg">
            <div className="privacy-card-icon"><Trash2 size={22} /></div>
            <h3>What We Delete</h3>
            <p>Everything. All transfer data, metadata, signaling information, and analytics are automatically purged after 24 hours. No exceptions.</p>
          </GlassCard>

          <GlassCard variant="default" padding="lg">
            <div className="privacy-card-icon"><Globe size={22} /></div>
            <h3>No Tracking</h3>
            <p>We don't use cookies, advertising trackers, or analytics services. We don't collect IP addresses, email addresses, or any personal information.</p>
          </GlassCard>

          <GlassCard variant="default" padding="lg">
            <div className="privacy-card-icon"><Shield size={22} /></div>
            <h3>Open Source</h3>
            <p>BYTEPORT's code is open source. You can inspect every line to verify our privacy claims. Trust through transparency.</p>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
