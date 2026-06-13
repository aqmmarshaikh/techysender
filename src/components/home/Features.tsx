import { Zap, Shield, Clock, Globe, Smartphone, Eye } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import './Features.css';

const features = [
  {
    icon: <Shield size={24} />,
    title: 'End-to-End Encrypted',
    description: 'AES-256-GCM encryption ensures your files are secure. Encryption keys never leave your browser.',
    accent: 'cyan' as const,
  },
  {
    icon: <Zap size={24} />,
    title: 'Lightning Fast',
    description: 'WebRTC peer-to-peer transfers send files directly between browsers with no middleman.',
    accent: 'purple' as const,
  },
  {
    icon: <Clock size={24} />,
    title: 'Auto-Expiring',
    description: 'All transfers automatically expire after 24 hours. No data lingers on our servers.',
    accent: 'cyan' as const,
  },
  {
    icon: <Eye size={24} />,
    title: 'Zero Knowledge',
    description: 'We never see your files. Decryption happens entirely in your browser using URL fragment keys.',
    accent: 'purple' as const,
  },
  {
    icon: <Globe size={24} />,
    title: 'No Accounts',
    description: 'No registration, no email, no tracking. Just select files, share a link, and transfer.',
    accent: 'cyan' as const,
  },
  {
    icon: <Smartphone size={24} />,
    title: 'Works Everywhere',
    description: 'Fully responsive design works seamlessly on desktop, tablet, and mobile browsers.',
    accent: 'purple' as const,
  },
];

export function Features() {
  return (
    <section className="features section" id="features">
      <div className="container">
        <div className="features-header">
          <span className="section-label">Features</span>
          <h2 className="section-title">Built for Privacy.<br /><span className="text-gradient">Designed for Speed.</span></h2>
          <p className="section-subtitle">Every feature exists to make file sharing faster, safer, and simpler.</p>
        </div>

        <div className="features-grid">
          {features.map((feature, i) => (
            <GlassCard key={i} variant={feature.accent} padding="lg" className={`feature-card animate-fade-in-up anim-delay-${i + 1}`}>
              <div className={`feature-icon feature-icon-${feature.accent}`}>
                {feature.icon}
              </div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
            </GlassCard>
          ))}
        </div>
      </div>
    </section>
  );
}
