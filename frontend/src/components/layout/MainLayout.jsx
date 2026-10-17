import React from 'react';

// Page container. The global Header and Footer are rendered once in App.jsx (not here).
const MainLayout = ({ children, className = '' }) => {
  return (
    <main className={`mx-auto w-full max-w-6xl px-4 py-8 ${className}`}>
      {children}
    </main>
  );
};

export default MainLayout;
