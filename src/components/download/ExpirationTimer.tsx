import { Clock } from 'lucide-react';
import { useCountdown } from '../../hooks/useCountdown';
import './ExpirationTimer.css';

interface ExpirationTimerProps {
  expiresAt: number;
}

export function ExpirationTimer({ expiresAt }: ExpirationTimerProps) {
  const { hours, minutes, seconds, isExpired } = useCountdown(expiresAt);

  if (isExpired) {
    return (
      <div className="expiration-timer expiration-expired">
        <Clock size={14} />
        <span>Expired</span>
      </div>
    );
  }

  const isUrgent = hours === 0 && minutes < 30;

  return (
    <div className={`expiration-timer ${isUrgent ? 'expiration-urgent' : ''}`}>
      <Clock size={14} />
      <span className="expiration-label">Expires in</span>
      <div className="expiration-digits">
        <div className="expiration-unit">
          <span className="expiration-value">{String(hours).padStart(2, '0')}</span>
          <span className="expiration-suffix">h</span>
        </div>
        <span className="expiration-colon">:</span>
        <div className="expiration-unit">
          <span className="expiration-value">{String(minutes).padStart(2, '0')}</span>
          <span className="expiration-suffix">m</span>
        </div>
        <span className="expiration-colon">:</span>
        <div className="expiration-unit">
          <span className="expiration-value">{String(seconds).padStart(2, '0')}</span>
          <span className="expiration-suffix">s</span>
        </div>
      </div>
    </div>
  );
}
