import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Sparkles } from 'lucide-react';
import logo from '../../assets/safemaga-logo.png';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <header className="bg-white border-b border-[#e8e4df] sticky top-0 z-50 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 font-extrabold text-xl text-brand-800 hover:text-brand-900 transition group">
          <img src={logo} alt="SafeMaga Logo" className="w-10 h-10 object-contain group-hover:scale-105 transition-transform drop-shadow-xs" />
          <span className="tracking-tight text-slate-900 font-black text-xl">
            Safe<span className="text-[#451e11]">Maga</span>
          </span>
        </Link>

        <nav className="flex items-center gap-6">
          <Link
            to="/"
            className={`text-sm font-semibold transition ${
              isActive('/') ? 'text-brand-800 font-bold' : 'text-slate-600 hover:text-brand-800'
            }`}
          >
            Home
          </Link>

          <Link
            to="/visa-timeline"
            className={`text-sm font-bold flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
              isActive('/visa-timeline')
                ? 'bg-brand-100 text-brand-800 ring-1 ring-brand-300'
                : 'text-brand-800 hover:bg-brand-50'
            }`}
          >
            <Sparkles size={15} />
            Visa AI Predictor
          </Link>

          <Link
            to="/about"
            className={`text-sm font-semibold transition ${
              isActive('/about') ? 'text-brand-800 font-bold' : 'text-slate-600 hover:text-brand-800'
            }`}
          >
            About Us
          </Link>


          {user && (
            <button
              onClick={logout}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 transition"
            >
              Logout ({user.name || 'User'})
            </button>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
