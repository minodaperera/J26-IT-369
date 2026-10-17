import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, ChevronDown, User, Menu, X, LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useLang } from '@/i18n';
import { NAV, ADMIN_LINKS, SEARCH_PATH } from '@/config/modules';

const LANGS = [
  ['en', 'English'],
  ['si', 'සිංහල'],
  ['ta', 'தமிழ்'],
];

export default function Header() {
  const { user, loading, logout, isAdmin } = useAuth();
  const { lang, setLang, t } = useLang();
  const location = useLocation();
  const navigate = useNavigate();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState(null); // mobile accordion
  const [searchQuery, setSearchQuery] = useState('');
  const userMenuRef = useRef(null);

  // t() returns the key itself when a translation is missing -> fall back to the English label
  const label = (item) => {
    const v = item.labelKey ? t(item.labelKey) : item.label;
    return v === item.labelKey ? item.label : v;
  };

  const isActive = (to, exact) =>
    exact ? location.pathname === to : location.pathname === to || location.pathname.startsWith(`${to}/`);

  // close menus on navigation, Escape, or click outside
  useEffect(() => {
    setMobileOpen(false);
    setUserOpen(false);
    setOpenGroup(null);
  }, [location.pathname]);

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && (setUserOpen(false), setMobileOpen(false));
    const onClick = (e) => userMenuRef.current && !userMenuRef.current.contains(e.target) && setUserOpen(false);
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onClick);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onClick);
    };
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (q) navigate(`${SEARCH_PATH}?search=${encodeURIComponent(q)}`);
  };

  const handleLogout = () => {
    logout();
    setUserOpen(false);
    setMobileOpen(false);
    navigate('/');
  };

  const languageSelect = (className = '') => (
    <select
      value={lang}
      onChange={(e) => setLang(e.target.value)}
      aria-label="Language"
      className={`cursor-pointer bg-transparent text-xs font-semibold italic text-amber-100 hover:text-white focus:outline-hidden ${className}`}
    >
      {LANGS.map(([code, name]) => (
        <option key={code} value={code} className="bg-white not-italic text-slate-900">{name}</option>
      ))}
    </select>
  );

  const userLinks = [
    { to: '/guidance/dashboard', label: t('myDashboard') === 'myDashboard' ? 'My dashboard' : t('myDashboard') },
    { to: '/guidance/documents', label: 'AI document reader' },
    { to: '/guidance/alerts', label: 'Expiry alerts' },
  ];

  return (
    <header className="w-full bg-[#4A2E1B] text-white shadow-md">
      {/* Top main header section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col lg:flex-row items-center justify-between gap-4">
        {/* Left: logo & subtitle */}
        <div className="flex items-center space-x-4 w-full lg:w-auto justify-between lg:justify-start">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white p-1 shadow-inner flex items-center justify-center overflow-hidden shrink-0">
              <img
                src="/logo2.jpeg"
                alt="SafeMaga Logo"
                className="w-full h-full object-cover rounded-full group-hover:scale-105 transition-transform"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            </div>
            <div>
              <div className="text-xl md:text-2xl font-bold tracking-wider font-serif text-white">
                SAFE<span className="text-emerald-400">මග</span>
              </div>
              <div className="text-xs md:text-sm text-amber-200/90 font-medium tracking-wide">Migration Guidance Platform</div>
            </div>
          </Link>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
            className="lg:hidden p-2 rounded-lg text-amber-200 hover:text-white hover:bg-[#382113]"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Search */}
        <div className="w-full lg:w-72">
          <form onSubmit={handleSearch} role="search" className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('search') === 'search' ? 'Search...' : t('search')}
              aria-label="Search countries"
              className="w-full bg-[#654326] text-amber-100 placeholder:text-amber-200/60 text-sm rounded-full py-2 pl-4 pr-10 border border-[#7A5230] focus:outline-hidden focus:ring-2 focus:ring-amber-400/50 shadow-inner"
            />
            <button type="submit" aria-label="Search" className="absolute right-3 top-2.5 text-amber-200/80 hover:text-white">
              <Search className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Hotline & contact (SLBFE) */}
        <div className="hidden xl:flex flex-col text-xs text-amber-100/90 space-y-1 border-l border-[#654326] pl-6">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-amber-200">SLBFE Hotline :</span>
            <span>1989 / (+94)11 2 880 500</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-amber-200">Visit :</span>
            <span>info_center@slbfe.lk</span>
          </div>
        </div>

        {/* Right: auth & language */}
        <div className="hidden lg:flex items-center space-x-4">
          {loading ? (
            <div className="w-40 h-8" aria-hidden="true" />
          ) : user ? (
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setUserOpen(!userOpen)}
                aria-haspopup="menu"
                aria-expanded={userOpen}
                className="flex items-center space-x-2 rounded-full pl-1 pr-3 py-1 hover:bg-[#654326] transition-colors"
              >
                <span className="w-9 h-9 rounded-full bg-white text-[#4A2E1B] flex items-center justify-center font-bold shadow-md">
                  {user.name ? user.name.charAt(0).toUpperCase() : <User className="w-5 h-5" />}
                </span>
                <span className="text-sm text-amber-100 max-w-[8rem] truncate">{user.name}</span>
                <ChevronDown className="w-3.5 h-3.5 text-amber-200" />
              </button>
              {userOpen && (
                <div role="menu" className="absolute right-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-lg bg-white text-slate-800 shadow-xl ring-1 ring-black/10">
                  <div className="border-b border-gray-100 px-4 py-3">
                    <p className="truncate text-sm font-semibold">{user.name}</p>
                    <p className="truncate text-xs text-gray-500">{user.email}</p>
                    {isAdmin && <span className="mt-1 inline-block rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-800">admin</span>}
                  </div>
                  {userLinks.map((l) => (
                    <Link key={l.to} to={l.to} role="menuitem" className="block px-4 py-2 text-sm hover:bg-amber-50">{l.label}</Link>
                  ))}
                  {isAdmin && ADMIN_LINKS.map((l) => (
                    <Link key={l.to} to={l.to} role="menuitem" className="block border-t border-gray-100 px-4 py-2 text-sm font-semibold text-[#4A2E1B] hover:bg-amber-50">{t('adminConsole') === 'adminConsole' ? 'Admin console' : t('adminConsole')}: {l.label}</Link>
                  ))}
                  <button onClick={handleLogout} role="menuitem" className="flex w-full items-center gap-2 border-t border-gray-100 px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50">
                    <LogOut className="w-4 h-4" /> {t('logout')}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Link to="/login" className="px-4 py-1.5 rounded-md border border-amber-300/60 text-amber-100 text-sm font-medium hover:bg-amber-100 hover:text-[#4A2E1B] transition-colors shadow-sm">{t('login')}</Link>
              <Link to="/register" className="px-4 py-1.5 rounded-md border border-amber-300/60 text-amber-100 text-sm font-medium hover:bg-amber-100 hover:text-[#4A2E1B] transition-colors shadow-sm">{t('register')}</Link>
            </div>
          )}
          {languageSelect()}
        </div>
      </div>

      {/* Bottom navigation bar (desktop) */}
      <nav className="bg-[#382113] border-t border-[#5c3a23] hidden lg:block" aria-label="Main">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-12">
            {NAV.map((item) => {
              const active = isActive(item.to, item.exact);
              const linkCls = `px-3 py-2 text-sm font-serif tracking-wide transition-colors whitespace-nowrap ${
                active ? 'text-amber-300 font-bold border-b-2 border-amber-300' : 'text-amber-100/90 hover:text-white hover:bg-[#4A2E1B]/50 rounded-sm'
              }`;
              if (!item.children) {
                return <Link key={item.key} to={item.to} className={linkCls}>{label(item)}</Link>;
              }
              return (
                <div key={item.key} className="relative group">
                  <Link to={item.to} className={`${linkCls} inline-flex items-center gap-1`}>
                    {label(item)} <ChevronDown className="w-3.5 h-3.5" />
                  </Link>
                  <div className="invisible absolute left-0 top-full z-50 w-64 pt-1 opacity-0 transition group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                    <ul className="overflow-hidden rounded-lg bg-white text-slate-800 shadow-xl ring-1 ring-black/10">
                      {item.children.map((c) => (
                        <li key={c.to}>
                          <Link to={c.to} className="flex items-center justify-between px-4 py-2 text-sm hover:bg-amber-50">
                            <span>{c.label}</span>
                            {!c.live && <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-500">{t('soon') === 'soon' ? 'Soon' : t('soon')}</span>}
                            {c.live && c.auth && !user && <span className="text-[10px] text-gray-400">login</span>}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden bg-[#382113] border-t border-[#5c3a23] px-4 pt-3 pb-5 space-y-2 max-h-[80vh] overflow-y-auto">
          <div className="flex items-center justify-between py-2 border-b border-[#5c3a23] mb-2 gap-3">
            {user ? (
              <>
                <span className="truncate text-sm text-amber-100">{user.name}{isAdmin ? ' (admin)' : ''}</span>
                <button onClick={handleLogout} className="px-4 py-1.5 rounded-sm border border-amber-300 text-amber-100 text-sm font-medium">{t('logout')}</button>
              </>
            ) : (
              <>
                <Link to="/login" className="px-4 py-1.5 rounded-sm border border-amber-300 text-amber-100 text-sm font-medium">{t('login')}</Link>
                <Link to="/register" className="px-4 py-1.5 rounded-sm border border-amber-300 text-amber-100 text-sm font-medium">{t('register')}</Link>
              </>
            )}
            {languageSelect()}
          </div>

          {NAV.map((item) => (
            <div key={item.key}>
              <div className="flex items-center">
                <Link to={item.to} className="block flex-1 px-3 py-2 rounded-sm text-base font-serif text-amber-100 hover:bg-[#4A2E1B]">{label(item)}</Link>
                {item.children && (
                  <button
                    onClick={() => setOpenGroup(openGroup === item.key ? null : item.key)}
                    aria-label={`Toggle ${item.label} pages`}
                    aria-expanded={openGroup === item.key}
                    className="p-2 text-amber-200"
                  >
                    <ChevronDown className={`w-4 h-4 transition-transform ${openGroup === item.key ? 'rotate-180' : ''}`} />
                  </button>
                )}
              </div>
              {item.children && openGroup === item.key && (
                <ul className="ml-4 mb-1 border-l border-[#5c3a23] pl-3">
                  {item.children.map((c) => (
                    <li key={c.to}>
                      <Link to={c.to} className="flex items-center justify-between px-2 py-1.5 text-sm text-amber-100/90 hover:text-white">
                        <span>{c.label}</span>
                        {!c.live && <span className="text-[10px] text-amber-300">{t('soon') === 'soon' ? 'Soon' : t('soon')}</span>}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}

          {user && (
            <div className="mt-2 border-t border-[#5c3a23] pt-2">
              {userLinks.map((l) => <Link key={l.to} to={l.to} className="block px-3 py-1.5 text-sm text-amber-100">{l.label}</Link>)}
              {isAdmin && ADMIN_LINKS.map((l) => <Link key={l.to} to={l.to} className="block px-3 py-1.5 text-sm font-semibold text-amber-300">{l.label}</Link>)}
            </div>
          )}
        </div>
      )}
    </header>
  );
}
