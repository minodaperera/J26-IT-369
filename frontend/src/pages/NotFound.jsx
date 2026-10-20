import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="text-center py-16 px-4">
      <h1 className="text-6xl font-black text-blue-600 mb-2">404</h1>
      <h2 className="text-2xl font-bold text-slate-800 mb-2">Page Not Found</h2>
      <p className="text-slate-500 mb-8 max-w-sm mx-auto">
        The requested research portal route does not exist.
      </p>
      <Link
        to="/"
        className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md transition-all active:scale-95"
      >
        Back to Home
      </Link>
    </div>
  );
};

export default NotFound;
