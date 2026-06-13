import { Link } from 'react-router-dom';
import { Send, Download, Shield, Zap, Lock } from 'lucide-react';
import { Button } from '../ui/Button';
import './Hero.css';

export function Hero() {
  return (
    <section className="hero" id="hero">
      {/* Ambient glow effects */}
      <div className="hero-glow hero-glow-cyan" aria-hidden="true" />
      <div className="hero-glow hero-glow-purple" aria-hidden="true" />

      <div className="container hero-inner">
        {/* Badge */}
        <div className="hero-badge animate-fade-in-up">
          <Lock size={12} />
          <span>End-to-End Encrypted</span>
          <span className="hero-badge-dot" />
          <span>No Sign-up Required</span>
        </div>

        {/* Heading */}
        <h1 className="hero-title animate-fade-in-up anim-delay-1">
          Share Files.<br />
          <span className="text-gradient">Not Compromises.</span>
        </h1>

        {/* Subtitle */}
        <p className="hero-subtitle animate-fade-in-up anim-delay-2">
          Encrypted browser-based transfers without accounts.
          Send files securely with a single link — your data never touches our servers unencrypted.
        </p>

        {/* CTAs */}
        <div className="hero-actions animate-fade-in-up anim-delay-3">
          <Link to="/send">
            <Button variant="primary" size="xl" icon={<Send size={18} />} glow>
              Send Files
            </Button>
          </Link>
          <Link to="/receive">
            <Button variant="secondary" size="xl" icon={<Download size={18} />}>
              Receive Files
            </Button>
          </Link>
        </div>

        {/* Trust indicators */}
        <div className="hero-trust animate-fade-in-up anim-delay-4">
          <div className="hero-trust-item">
            <Shield size={16} />
            <span>Private</span>
          </div>
          <div className="hero-trust-divider" />
          <div className="hero-trust-item">
            <Zap size={16} />
            <span>Fast</span>
          </div>
          <div className="hero-trust-divider" />
          <div className="hero-trust-item">
            <Lock size={16} />
            <span>Temporary</span>
          </div>
        </div>

        {/* Animated transfer visualization */}
        <div className="hero-visual animate-fade-in-scale anim-delay-5" aria-hidden="true">
          <div className="hero-visual-inner">
            {/* Sender node */}
            <div className="hero-node hero-node-sender">
              <div className="hero-node-icon">
                <Send size={20} />
              </div>
              <span className="hero-node-label">Sender</span>
            </div>

            {/* Animated data stream */}
            <div className="hero-stream">
              <div className="hero-stream-line" />
              <div className="hero-stream-particle hero-stream-p1" />
              <div className="hero-stream-particle hero-stream-p2" />
              <div className="hero-stream-particle hero-stream-p3" />
              <div className="hero-stream-lock">
                <Lock size={14} />
              </div>
            </div>

            {/* Receiver node */}
            <div className="hero-node hero-node-receiver">
              <div className="hero-node-icon">
                <Download size={20} />
              </div>
              <span className="hero-node-label">Receiver</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
