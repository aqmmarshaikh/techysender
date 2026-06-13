import { useState, useEffect } from 'react';

interface CountdownResult {
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
  formatted: string;
}

export function useCountdown(expiresAt: number): CountdownResult {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const remaining = Math.max(0, expiresAt - now);
  const isExpired = remaining <= 0;

  const totalSeconds = Math.floor(remaining / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (n: number) => String(n).padStart(2, '0');
  const formatted = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;

  return { hours, minutes, seconds, isExpired, formatted };
}
