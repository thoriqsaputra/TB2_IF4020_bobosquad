import React from 'react';
import clsx from 'clsx';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', loading, className, disabled, ...rest }) => {
  const base =
    'inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-offset-2';
  const variants: Record<'primary' | 'secondary' | 'ghost', string> = {
    primary: 'bg-primary text-white hover:bg-blue-600 focus:ring-primary',
    secondary: 'bg-secondary text-white hover:bg-indigo-600 focus:ring-secondary',
    ghost: 'bg-white text-gray-800 border border-gray-200 hover:bg-gray-50 focus:ring-gray-300',
  };

  return (
    <button
      className={clsx(base, variants[variant], className, (loading || disabled) && 'opacity-70 cursor-not-allowed')}
      disabled={disabled || loading}
      {...rest}
    >
      {loading && <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/60 border-t-transparent" />}
      {children}
    </button>
  );
};
