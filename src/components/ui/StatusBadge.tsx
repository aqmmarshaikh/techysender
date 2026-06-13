import './StatusBadge.css';

interface StatusBadgeProps {
  status: 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'active';
  label: string;
  pulse?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

export function StatusBadge({
  status,
  label,
  pulse = false,
  size = 'md',
  className = '',
}: StatusBadgeProps) {
  return (
    <span className={`status-badge status-${status} status-size-${size} ${className}`}>
      <span className={`status-dot ${pulse ? 'status-dot-pulse' : ''}`} />
      <span className="status-label">{label}</span>
    </span>
  );
}
