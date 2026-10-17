import React from 'react';
import { Link } from 'react-router-dom';
import { NAV, PLATFORM } from '@/config/modules';
import { useLang } from '@/i18n';

export default function Footer() {
  const { t } = useLang();
  const label = (item) => {
    const v = item.labelKey ? t(item.labelKey) : item.label;
    return v === item.labelKey ? item.label : v;
  };

  return (
    <footer className="w-full bg-[#2A2A2A] text-white">
      {/* Top Brown Navigation Sub-bar */}
  

      {/* Main Footer Content */}
      <div className="relative bg-[#333333] py-8 overflow-hidden">
        
        {/* World Map Background Image Container */}
        <div className="absolute inset-0 opacity-25 pointer-events-none flex items-center justify-center">
          <img 
            src="/map.jpeg" 
            alt="World Map Background" 
            className="w-full h-full object-cover"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8 items-center text-sm">
          
          {/* Left Column: Contact Info */}
          <div className="space-y-2 bg-[#2A2A2A]/80 p-4 rounded-lg border border-[#444]">
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-amber-200">Hotline:</span>
              <span className="text-slate-200">0765899875</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-amber-200">Visit:</span>
              <span className="text-slate-200">info@gmail.com</span>
            </div>
          </div>

          {/* Center Column: Helpful Resources & Social Icons */}
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div>
              <h4 className="font-semibold text-amber-200 mb-2 font-serif text-base">Helpful Resources</h4>
              <ul className="space-y-1 text-xs text-slate-300">
                <li><Link to="/faq" className="hover:text-amber-200 transition-colors">FAQ</Link></li>
                <li><Link to="/legal-aid" className="hover:text-amber-200 transition-colors">Legal Aid</Link></li>
                <li><Link to="/guidance/requirements" className="hover:text-amber-200 transition-colors">Document Requirements</Link></li>
                <li><Link to="/guidance/costs" className="hover:text-amber-200 transition-colors">Cost Planner</Link></li>
                <li><Link to="/about" className="hover:text-amber-200 transition-colors">About Us</Link></li>
              </ul>
            </div>

            {/* Social Media Icons (Inline SVG) */}
            <div className="flex items-center space-x-3 pt-1">
              {/* Facebook */}
              <a href="#" className="w-8 h-8 rounded-full bg-slate-200 text-[#333] flex items-center justify-center hover:bg-white transition-colors" title="Facebook">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>
              {/* Youtube */}
              <a href="#" className="w-8 h-8 rounded-full bg-slate-200 text-[#333] flex items-center justify-center hover:bg-white transition-colors" title="YouTube">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
              </a>
              {/* Instagram */}
              <a href="#" className="w-8 h-8 rounded-full bg-slate-200 text-[#333] flex items-center justify-center hover:bg-white transition-colors" title="Instagram">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </a>
            </div>
          </div>

          {/* Right Column: Community Connection & Explore Forums */}
          <div className="space-y-4 bg-[#2A2A2A]/80 p-4 rounded-lg border border-[#444]">
            <div>
              <h4 className="font-semibold text-white mb-2 text-sm font-serif">Community connection</h4>
              <div className="flex items-center bg-white rounded-sm overflow-hidden p-0.5 max-w-xs">
                <input 
                  type="text" 
                  placeholder="Sign up for community updates" 
                  className="text-xs px-2 py-1 text-slate-800 bg-transparent focus:outline-hidden w-full"
                />
                <button className="bg-[#B89753] hover:bg-[#a68442] text-slate-900 text-xs px-3 py-1 font-semibold rounded-sm">
                  Subscribe
                </button>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-1.5 text-xs font-serif">Explore Forums</h4>
              <ul className="space-y-1 text-xs text-slate-300">
                <li><Link to="/forums/srilanka" className="hover:text-amber-200 transition-colors">&gt; Srilanka Community</Link></li>
                <li><Link to="/forums/diaspora" className="hover:text-amber-200 transition-colors">&gt; Global Diaspora</Link></li>
                <li><Link to="/forums/prep" className="hover:text-amber-200 transition-colors">&gt; Pre-Departure Prep</Link></li>
              </ul>
            </div>

            <div>
              <Link 
                to="/forums" 
                className="inline-block bg-[#D4BC8E] hover:bg-[#c2aa7c] text-slate-900 text-xs font-semibold px-4 py-1.5 rounded-sm shadow-sm"
              >
                Join Community Forum
              </Link>
            </div>
          </div>

        </div>
      </div>

      {/* Bottom Copyright Bar */}
      <div className="bg-[#1F1F1F] py-3 px-4 border-t border-[#333] text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="space-y-1 text-center sm:text-left">
            <p>© {new Date().getFullYear()} {PLATFORM.name} · Group {PLATFORM.code} · {PLATFORM.institution}. All rights reserved.</p>
            <p className="text-slate-500">Guidance only — always confirm requirements with the official embassy or immigration website. SafeMaga is not an official government service.</p>
          </div>
          <div className="flex items-center space-x-3">
            <a href="#" className="w-6 h-6 rounded-full bg-slate-300 text-[#222] flex items-center justify-center hover:bg-white text-[10px]" title="Facebook">
              <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            </a>
            <a href="#" className="w-6 h-6 rounded-full bg-slate-300 text-[#222] flex items-center justify-center hover:bg-white text-[10px]" title="YouTube">
              <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
            </a>
            <a href="#" className="w-6 h-6 rounded-full bg-slate-300 text-[#222] flex items-center justify-center hover:bg-white text-[10px]" title="Instagram">
              <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}