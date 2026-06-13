import './ProgressBar.css';

interface ProgressBarProps {
  value: number;
  max?: number;
  variant?: 'cyan' | 'purple' | 'gradient' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  label?: string;
  animated?: boolean;
  indeterminate?: boolean;
  className?: string;
}

export function ProgressBar({
  value,
  max = 100,
  variant = 'gradient',
  size = 'md',
  showLabel = false,
  label,
  animated = true,
  indeterminate = false,
  className = '',
}: ProgressBarProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div className={`progress-wrapper ${className}`}>
      {(showLabel || label) && (
        <div className="progress-label">
          {label && <span className="progress-label-text">{label}</span>}
          {showLabel && <span className="progress-label-value">{Math.round(percentage)}%</span>}
        </div>
      )}
      <div className={`progress-track progress-${size}`} role="progressbar" aria-valuenow={percentage} aria-valuemin={0} aria-valuemax={100}>
        {indeterminate ? (
          <div className={`progress-fill progress-${variant} progress-indeterminate`} />
        ) : (
          <div
            className={`progress-fill progress-${variant} ${animated ? 'progress-animated' : ''}`}
            style={{ width: `${percentage}%` }}
          >
            <div className="progress-shine" />
          </div>
        )}
      </div>
    </div>
  );
}
