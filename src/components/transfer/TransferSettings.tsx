import { Wifi, Cloud, Lock, Clock, BarChart3 } from 'lucide-react';
import { useTransferStore } from '../../store/transferStore';
import './TransferSettings.css';

export function TransferSettings() {
  const { settings, updateSettings } = useTransferStore();

  return (
    <div className="transfer-settings">
      <h3 className="transfer-settings-title">Transfer Settings</h3>

      <div className="transfer-settings-grid">
        {/* Mode Selector */}
        <div className="setting-group">
          <span className="setting-label">Transfer Mode</span>
          <div className="setting-toggle">
            <button
              className={`setting-toggle-btn ${settings.mode === 'relay' ? 'setting-toggle-active' : ''}`}
              onClick={() => updateSettings({ mode: 'relay' })}
            >
              <Cloud size={14} />
              <span>Relay</span>
            </button>
            <button
              className={`setting-toggle-btn ${settings.mode === 'direct' ? 'setting-toggle-active' : ''}`}
              onClick={() => updateSettings({ mode: 'direct' })}
            >
              <Wifi size={14} />
              <span>Direct</span>
            </button>
          </div>
        </div>

        {/* Encryption */}
        <div className="setting-item">
          <div className="setting-item-icon setting-icon-cyan">
            <Lock size={14} />
          </div>
          <div className="setting-item-info">
            <span className="setting-item-label">Encryption</span>
            <span className="setting-item-value">AES-256-GCM</span>
          </div>
          <span className="setting-badge setting-badge-on">Enabled</span>
        </div>

        {/* Expiration */}
        <div className="setting-item">
          <div className="setting-item-icon setting-icon-purple">
            <Clock size={14} />
          </div>
          <div className="setting-item-info">
            <span className="setting-item-label">Expires After</span>
            <span className="setting-item-value">24 hours</span>
          </div>
          <span className="setting-badge setting-badge-info">Auto-delete</span>
        </div>

        {/* Analytics */}
        <div className="setting-item">
          <div className="setting-item-icon setting-icon-cyan">
            <BarChart3 size={14} />
          </div>
          <div className="setting-item-info">
            <span className="setting-item-label">Analytics</span>
            <span className="setting-item-value">Anonymous only</span>
          </div>
          <span className="setting-badge setting-badge-on">Enabled</span>
        </div>
      </div>
    </div>
  );
}
