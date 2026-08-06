import { Link } from 'react-router-dom';
import { Zap, Shield, ExternalLink, Heart } from 'lucide-react';
import './Footer.css';

export function Footer() {
  return (
    <footer className="footer">
      <div className="footer-glow" aria-hidden="true" />
      <div className="container footer-inner">
        {/* Top Section */}
        <div className="footer-top">
          <div className="footer-brand">
            <Link to="/" className="footer-logo">
              <div className="footer-logo-icon">
                <Zap size={18} />
              </div>
              <span className="footer-logo-text">TECHY<span className="text-gradient">SENDER</span></span>
            </Link>
            <p className="footer-tagline">Fast. Temporary. Private.</p>
            <p className="footer-description">
              Encrypted browser-based file sharing. No accounts required.
              Your files, your privacy.
            </p>
          </div>

          <div className="footer-columns">
            <div className="footer-column">
              <h4 className="footer-column-title">Product</h4>
              <Link to="/send" className="footer-link">Send Files</Link>
              <Link to="/receive" className="footer-link">Receive Files</Link>
              <Link to="/privacy" className="footer-link">Privacy</Link>
              <Link to="/developer" className="footer-link">Developer</Link>
            </div>

            <div className="footer-column">
              <h4 className="footer-column-title">Security</h4>
              <span className="footer-feature">
                <Shield size={14} />
                End-to-End Encrypted
              </span>
              <span className="footer-feature">
                <Shield size={14} />
                No Server Storage
              </span>
              <span className="footer-feature">
                <Shield size={14} />
                24h Auto-Delete
              </span>
            </div>

            <div className="footer-column">
              <h4 className="footer-column-title">Technology</h4>
              <span className="footer-tech">WebRTC P2P</span>
              <span className="footer-tech">AES-256-GCM</span>
              <span className="footer-tech">Web Crypto API</span>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="footer-divider" />

        {/* Bottom Section */}
        <div className="footer-bottom">
          <p className="footer-copyright">
            &copy; {new Date().getFullYear()} TECHYSENDER. Open source project built with <Heart size={12} className="footer-heart" /> for privacy.
          </p>
          <div className="footer-bottom-links">
            <a href="https://github.com/aqmmarshaikh/techysender.git" target="_blank" rel="noopener noreferrer" className="footer-bottom-link">
              <ExternalLink size={16} />
              <span>GitHub</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
