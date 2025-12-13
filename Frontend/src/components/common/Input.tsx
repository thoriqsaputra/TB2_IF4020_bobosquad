import React from 'react';
import clsx from 'clsx';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({ label, error, className, ...rest }, ref) => (
  <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
    {label}
    <input
      ref={ref}
      className={clsx(
        'rounded-lg border-2 border-gray-200 px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30',
        error && 'border-red-400 focus:border-red-500 focus:ring-red-200',
        className,
      )}
      {...rest}
    />
    {error && <span className="text-xs font-normal text-red-600">{error}</span>}
  </label>
));

Input.displayName = 'Input';
