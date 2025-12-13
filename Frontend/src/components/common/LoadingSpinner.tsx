import React from 'react';
import clsx from 'clsx';

interface Props {
  label?: string;
  className?: string;
}

export const LoadingSpinner: React.FC<Props> = ({ label, className }) => (
  <div className={clsx('flex items-center gap-2 text-sm text-gray-600', className)}>
    <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary/40 border-t-primary" />
    {label && <span>{label}</span>}
  </div>
);
