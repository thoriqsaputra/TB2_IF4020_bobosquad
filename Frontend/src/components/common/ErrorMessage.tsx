import React from 'react';
import { AlertTriangle } from 'lucide-react';
import clsx from 'clsx';

interface ErrorMessageProps {
  message?: string;
  className?: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, className }) => {
  if (!message) return null;
  return (
    <div className={clsx('flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700', className)}>
      <AlertTriangle className="h-4 w-4" />
      <span>{message}</span>
    </div>
  );
};
