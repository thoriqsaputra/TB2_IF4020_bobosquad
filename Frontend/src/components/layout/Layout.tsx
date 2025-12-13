import React from 'react';
import { Header } from './Header';
import { Footer } from './Footer';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="flex min-h-screen flex-col bg-gray-50 text-gray-900">
    <Header />
    <main className="flex-1">{children}</main>
    <Footer />
  </div>
);
