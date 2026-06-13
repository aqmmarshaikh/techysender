import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Send, Download, Shield, ExternalLink, Menu, X, Zap } from 'lucide-react';
import { Button } from '../ui/Button';
import './Navbar.css';

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="navbar" role="navigation" aria-label="Main navigation">
      <div className="navbar-inner container">
        {/* Logo */}
        <Link to="/" className="navbar-logo" aria-label="BYTEPORT home">
          <div className="navbar-logo-icon">
            <Zap size={20} />
          </div>
          <span className="navbar-logo-text">BYTE<span className="text-gradient">PORT</span></span>
        </Link>

        {/* Desktop Nav */}
        <div className="navbar-links">
          <Link to="/send" className={`navbar-link ${isActive('/send') ? 'navbar-link-active' : ''}`}>
            <Send size={16} />
            <span>Send</span>
          </Link>
          <Link to="/receive" className={`navbar-link ${isActive('/receive') ? 'navbar-link-active' : ''}`}>
            <Download size={16} />
            <span>Receive</span>
          </Link>
          <Link to="/privacy" className={`navbar-link ${isActive('/privacy') ? 'navbar-link-active' : ''}`}>
            <Shield size={16} />
            <span>Privacy</span>
          </Link>
        </div>

        {/* Desktop Actions */}
        <div className="navbar-actions">
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="navbar-link navbar-github"
            aria-label="GitHub repository"
          >
            <ExternalLink size={18} />
          </a>
          <Link to="/send">
            <Button variant="primary" size="sm" icon={<Send size={14} />}>
              Send Files
            </Button>
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="navbar-mobile-toggle"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <div className={`navbar-mobile ${mobileOpen ? 'navbar-mobile-open' : ''}`}>
        <div className="navbar-mobile-inner">
          <Link to="/send" className="navbar-mobile-link" onClick={() => setMobileOpen(false)}>
            <Send size={18} />
            <span>Send Files</span>
          </Link>
          <Link to="/receive" className="navbar-mobile-link" onClick={() => setMobileOpen(false)}>
            <Download size={18} />
            <span>Receive Files</span>
          </Link>
          <Link to="/privacy" className="navbar-mobile-link" onClick={() => setMobileOpen(false)}>
            <Shield size={18} />
            <span>Privacy</span>
          </Link>
          <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="navbar-mobile-link">
            <ExternalLink size={18} />
            <span>GitHub</span>
          </a>
          <div className="navbar-mobile-cta">
            <Link to="/send" onClick={() => setMobileOpen(false)}>
              <Button variant="primary" size="lg" fullWidth icon={<Send size={16} />}>
                Start Sending
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
