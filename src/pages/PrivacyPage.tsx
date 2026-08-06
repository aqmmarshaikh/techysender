import { Shield, Lock, Eye, Server, Trash2, Globe } from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { SEO } from '../components/seo/SEO';
import { getPrivacyPageSchema, getBreadcrumbSchema } from '../components/seo/StructuredData';
import './PrivacyPage.css';

export function PrivacyPage() {
  const schemas = [
    getPrivacyPageSchema(),
    getBreadcrumbSchema([
      { name: 'Home', url: 'https://byteport.app/' },
      { name: 'Privacy Policy', url: 'https://byteport.app/privacy' },
    ]),
  ];

  return (
    <article className="page-content">
      <SEO
        title="Privacy Policy — BYTEPORT Zero-Knowledge Encrypted Sharing"
        description="BYTEPORT is built on a zero-knowledge architecture. Learn how your files are protected with AES-GCM encryption and direct WebRTC peer-to-peer transfers."
        canonical="https://byteport.app/privacy"
        structuredData={schemas}
      />
      <div className="container privacy-page">
        <header className="privacy-header">
          <div className="privacy-icon-wrapper" aria-hidden="true">
            <Shield size={32} />
          </div>
          <h1 className="privacy-title">Privacy <span className="text-gradient">Policy</span></h1>
          <p className="privacy-subtitle">
            BYTEPORT is built on a zero-knowledge architecture. Here's exactly what we do — and don't do — with your data.
          </p>
        </header>

        <section className="privacy-grid" aria-label="Privacy Commitments">
          <GlassCard variant="cyan" padding="lg">
            <div className="privacy-card-icon" aria-hidden="true"><Lock size={22} /></div>
            <h2>What We Encrypt</h2>
            <p>All files are encrypted client-side using AES-256-GCM before leaving your browser. Encryption keys are embedded in URL fragments that never reach our servers.</p>
          </GlassCard>

          <GlassCard variant="default" padding="lg">
            <div className="privacy-card-icon" aria-hidden="true"><Eye size={22} /></div>
            <h2>What We Can See</h2>
            <p>We can see: transfer metadata (file count, total size), anonymous analytics (view count, download count), and expiration timestamps. We cannot see: file contents, file names, or encryption keys.</p>
          </GlassCard>

          <GlassCard variant="default" padding="lg">
            <div className="privacy-card-icon" aria-hidden="true"><Server size={22} /></div>
            <h2>What We Store</h2>
            <p>Absolutely nothing. No file data touches our servers at all — transfers happen peer-to-peer using direct WebRTC connections.</p>
          </GlassCard>

          <GlassCard variant="purple" padding="lg">
            <div className="privacy-card-icon" aria-hidden="true"><Trash2 size={22} /></div>
            <h2>What We Delete</h2>
            <p>Everything. All transfer data, metadata, signaling information, and analytics are automatically purged after 24 hours. No exceptions.</p>
          </GlassCard>

          <GlassCard variant="default" padding="lg">
            <div className="privacy-card-icon" aria-hidden="true"><Globe size={22} /></div>
            <h2>No Tracking</h2>
            <p>We don't use cookies, advertising trackers, or analytics services. We don't collect IP addresses, email addresses, or any personal information.</p>
          </GlassCard>

          <GlassCard variant="default" padding="lg">
            <div className="privacy-card-icon" aria-hidden="true"><Shield size={22} /></div>
            <h2>Open Source</h2>
            <p>BYTEPORT's code is open source. You can inspect every line to verify our privacy claims. Trust through transparency.</p>
          </GlassCard>
        </section>
      </div>
    </article>
  );
}
