import React from 'react';

export const Footer: React.FC = () => (
  <footer className="border-t border-gray-100 bg-white py-6">
    <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 text-sm text-gray-600 md:flex-row">
      <span>© {new Date().getFullYear()} CertiChain. All rights reserved.</span>
      <span className="text-gray-500">Built for TB2_IF4020</span>
    </div>
  </footer>
);
