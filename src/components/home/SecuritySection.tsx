import { Lock, Eye, Server, Trash2 } from 'lucide-react';
import './SecuritySection.css';

const securityFeatures = [
  {
    icon: <Lock size={22} />,
    title: 'Client-Side Encryption',
    description: 'Files are encrypted in your browser before they ever leave your device. We use AES-256-GCM — the same standard used by governments and banks.',
  },
  {
    icon: <Eye size={22} />,
    title: 'Zero-Knowledge Architecture',
    description: 'Encryption keys are stored in the URL fragment (#key), which your browser never sends to our servers. We literally cannot decrypt your files.',
  },
  {
    icon: <Server size={22} />,
    title: 'No Permanent Storage',
    description: 'Files are either transferred directly via WebRTC or stored temporarily (max 24h) in encrypted form. We never store plaintext data.',
  },
  {
    icon: <Trash2 size={22} />,
    title: 'Automatic Deletion',
    description: 'All transfer data, metadata, and analytics are automatically purged after 24 hours. No traces remain.',
  },
];

export function SecuritySection() {
  return (
    <section className="security-section section" id="security">
      <div className="container">
        <div className="security-header">
          <span className="section-label">Security</span>
          <h2 className="section-title">Your Privacy is <span className="text-gradient">Non-Negotiable</span></h2>
          <p className="section-subtitle">We built BYTEPORT so that even we can't access your files. Here's how.</p>
        </div>

        <div className="security-content">
          {/* Encryption flow visualization */}
          <div className="security-visual" aria-hidden="true">
            <div className="security-visual-card glass-panel">
              <div className="security-code">
                <div className="security-code-line">
                  <span className="security-code-key">algorithm</span>
                  <span className="security-code-sep">:</span>
                  <span className="security-code-val">"AES-256-GCM"</span>
                </div>
                <div className="security-code-line">
                  <span className="security-code-key">key_location</span>
                  <span className="security-code-sep">:</span>
                  <span className="security-code-val">"browser_only"</span>
                </div>
                <div className="security-code-line">
                  <span className="security-code-key">server_access</span>
                  <span className="security-code-sep">:</span>
                  <span className="security-code-val security-code-false">"none"</span>
                </div>
                <div className="security-code-line">
                  <span className="security-code-key">expiration</span>
                  <span className="security-code-sep">:</span>
                  <span className="security-code-val">"24_hours"</span>
                </div>
                <div className="security-code-line">
                  <span className="security-code-key">storage</span>
                  <span className="security-code-sep">:</span>
                  <span className="security-code-val">"encrypted_only"</span>
                </div>
              </div>
              <div className="security-visual-glow" />
            </div>
          </div>

          {/* Feature list */}
          <div className="security-features">
            {securityFeatures.map((feature, i) => (
              <div key={i} className="security-feature">
                <div className="security-feature-icon">
                  {feature.icon}
                </div>
                <div className="security-feature-content">
                  <h3 className="security-feature-title">{feature.title}</h3>
                  <p className="security-feature-description">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
