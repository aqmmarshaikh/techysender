import type React from 'react';
import './GlassCard.css';

interface GlassCardProps {
  children: React.ReactNode;
  variant?: 'default' | 'cyan' | 'purple' | 'subtle' | 'strong';
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  onClick?: () => void;
}

export function GlassCard({
  children,
  variant = 'default',
  hover = true,
  padding = 'lg',
  className = '',
  onClick,
}: GlassCardProps) {
  const classes = [
    'glass-card-component',
    `glass-card-${variant}`,
    `glass-card-pad-${padding}`,
    hover && 'glass-card-hover',
    onClick && 'glass-card-clickable',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={classes} onClick={onClick} role={onClick ? 'button' : undefined} tabIndex={onClick ? 0 : undefined}>
      {children}
    </div>
  );
}
