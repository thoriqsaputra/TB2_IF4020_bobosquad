import React from 'react';
import { Upload } from 'lucide-react';
import clsx from 'clsx';

interface FileUploadProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  fileName?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({ label, error, fileName, className, ...rest }) => (
  <label className="flex flex-col gap-2 text-sm font-medium text-gray-700">
    {label}
    <div
      className={clsx(
        'flex items-center justify-between rounded-lg border-2 border-dashed border-gray-200 px-4 py-3 text-gray-600 shadow-sm',
        'hover:border-primary hover:text-primary transition-colors cursor-pointer',
        error && 'border-red-400 text-red-600',
      )}
    >
      <div className="flex items-center gap-3">
        <Upload className="h-5 w-5" />
        <span className="text-sm">{fileName || 'Choose a file (PDF, Image, or Text)'}</span>
      </div>
      <span className="rounded-md bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-700">Browse</span>
    </div>
    <input type="file" className={clsx('hidden', className)} {...rest} />
    {error && <span className="text-xs font-normal text-red-600">{error}</span>}
  </label>
);
