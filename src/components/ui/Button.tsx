import React from 'react';
import { cn } from '@/utils';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  const base = 'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';
  
  const variants: Record<ButtonVariant, string> = {
    primary:   'bg-cyan-500 text-white hover:bg-cyan-600 active:bg-cyan-700 shadow-sm',
    secondary: 'bg-navy-950 text-white hover:bg-navy-800 active:bg-navy-700 shadow-sm',
    ghost:     'text-navy-700 hover:bg-navy-50 active:bg-navy-100',
    danger:    'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 shadow-sm',
    outline:   'border border-navy-200 text-navy-700 hover:bg-navy-50 bg-white',
  };
  
  const sizes: Record<ButtonSize, string> = {
    sm:  'h-8  px-3 text-sm',
    md:  'h-10 px-4 text-sm',
    lg:  'h-11 px-6 text-base',
  };

  return (
    <button
      className={cn(base, variants[variant], sizes[size], fullWidth && 'w-full', className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : leftIcon}
      {children}
      {!loading && rightIcon}
    </button>
  );
}
