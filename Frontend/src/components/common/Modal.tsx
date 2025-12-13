import React from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ open, title, onClose, children, footer }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="relative w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl">
        <button className="absolute right-3 top-3 text-gray-500 hover:text-gray-800" onClick={onClose} aria-label="Close">
          <X className="h-5 w-5" />
        </button>
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <div className="mt-4 text-sm text-gray-700">{children}</div>
        {footer && <div className="mt-6 flex justify-end gap-2">{footer}</div>}
      </div>
    </div>
  );
};
