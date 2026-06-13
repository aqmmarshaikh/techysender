import React from 'react';
import './Button.css';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
  loading?: boolean;
  fullWidth?: boolean;
  glow?: boolean;
}

export function Button({
  variant = 'primary',
  size = 'md',
  icon,
  iconRight,
  loading = false,
  fullWidth = false,
  glow = false,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const classes = [
    'btn',
    `btn-${variant}`,
    `btn-${size}`,
    fullWidth && 'btn-full',
    glow && 'btn-glow',
    loading && 'btn-loading',
    className,
  ].filter(Boolean).join(' ');

  return (
    <button
      className={classes}
      disabled={disabled || loading}
      {...props}
    >
      <span className="btn-ripple" aria-hidden="true" />
      {loading && (
        <span className="btn-spinner" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" className="btn-spinner-svg">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeDasharray="60 30" />
          </svg>
        </span>
      )}
      {icon && !loading && <span className="btn-icon">{icon}</span>}
      {children && <span className="btn-text">{children}</span>}
      {iconRight && <span className="btn-icon btn-icon-right">{iconRight}</span>}
    </button>
  );
}
