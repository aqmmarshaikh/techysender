import { Eye, Download, BarChart3 } from 'lucide-react';
import './AnalyticsDisplay.css';

interface AnalyticsDisplayProps {
  viewCount: number;
  downloadCount: number;
}

export function AnalyticsDisplay({ viewCount, downloadCount }: AnalyticsDisplayProps) {
  return (
    <div className="analytics-display">
      <div className="analytics-item">
        <div className="analytics-icon">
          <Eye size={14} />
        </div>
        <div className="analytics-info">
          <span className="analytics-value">{viewCount}</span>
          <span className="analytics-label">Views</span>
        </div>
      </div>
      <div className="analytics-divider" />
      <div className="analytics-item">
        <div className="analytics-icon">
          <Download size={14} />
        </div>
        <div className="analytics-info">
          <span className="analytics-value">{downloadCount}</span>
          <span className="analytics-label">Downloads</span>
        </div>
      </div>
      <div className="analytics-divider" />
      <div className="analytics-item">
        <div className="analytics-icon">
          <BarChart3 size={14} />
        </div>
        <div className="analytics-info">
          <span className="analytics-value">Anonymous</span>
          <span className="analytics-label">Tracking</span>
        </div>
      </div>
    </div>
  );
}
