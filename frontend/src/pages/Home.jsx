import React from 'react';
import { Link } from 'react-router-dom';
import { MODULES, PLATFORM } from '@/config/modules';
import { useLang } from '@/i18n';
import { useAuth } from '@/context/AuthContext';

const Home = () => {
  const { t } = useLang();
  const { user } = useAuth();
  return (
    <div>
      <section className="rounded-2xl border border-gray-200 px-6 py-14 text-center md:px-16">
        <p className="mb-3 inline-block rounded-full bg-accent-light px-3 py-1 text-xs font-semibold text-emerald-800">{PLATFORM.name} · {PLATFORM.code}</p>
        <h1 className="mx-auto max-w-3xl text-3xl font-extrabold leading-tight md:text-5xl">
          Travel abroad with confidence — <span className="text-secondary">without relying on agents</span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-gray-600">{PLATFORM.tagline}. {t('tagline')}.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link to="/guidance" className="btn">{t('explore')}</Link>
          {!user && <Link to="/register" className="btn-outline">{t('getStarted')}</Link>}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="mb-1 text-xl">Four components, one platform</h2>
        <p className="mb-5 text-sm text-gray-600">Pages marked “Soon” belong to components that are still being merged into the platform.</p>
        <div className="grid gap-4 md:grid-cols-2">
          {MODULES.map((m) => (
            <div key={m.no} className={`card border-t-4 ${m.accent}`}>
              <div className="mb-2 flex items-center gap-3">
                <span className={`grid h-8 w-8 place-items-center rounded-full text-sm font-bold text-white ${m.badge}`}>{m.no}</span>
                <h3 className="text-lg">{m.title}</h3>
              </div>
              <p className="text-sm text-gray-600">{m.summary}</p>
              <ul className="mt-4 flex flex-wrap gap-2">
                {m.items.map((i) => (
                  <li key={i.to}>
                    <Link to={i.to} className="btn-outline px-3 py-1 text-xs">
                      {i.label}{!i.live && <span className="chip bg-gray-100 text-gray-500">{t('soon')}</span>}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
