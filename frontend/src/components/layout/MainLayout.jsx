import React from 'react';
import Navbar from '../common/Navbar';

const MainLayout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-[#faf8f5] text-slate-900 font-sans antialiased">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      <footer className="border-t border-[#e8e4df] bg-white py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            &copy; {new Date().getFullYear()} SafeMaga Intelligent Analytics. All rights reserved.
          </div>
          <div className="flex items-center gap-6">
            <a href="/" className="hover:text-brand-800 transition">Home</a>
            <a href="/about" className="hover:text-brand-800 transition">About Us</a>
            <a href="/visa-timeline" className="hover:text-brand-800 transition">Visa Predictor</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
