import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/common/Button';

export const NotFound: React.FC = () => (
  <div className="mx-auto flex max-w-xl flex-col items-center gap-4 px-4 py-20 text-center">
    <h1 className="text-3xl font-bold text-gray-900">Page not found</h1>
    <p className="text-sm text-gray-600">The page you are looking for does not exist.</p>
    <Link to="/">
      <Button>Go Home</Button>
    </Link>
  </div>
);
