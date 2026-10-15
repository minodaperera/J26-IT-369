import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { PLACEHOLDERS, moduleByNo } from '@/config/modules';

// Shown for menu/footer links whose page has not been merged yet. See src/config/modules.js to mark a page `live`.
export default function ComingSoon() {
  const { pathname } = useLocation();
  const entry = PLACEHOLDERS.find((p) => p.to === pathname);
  const mod = entry?.module ? moduleByNo(entry.module) : null;
  return (
    <div className="mx-auto max-w-xl py-16 text-center">
      <div className="mb-4 text-5xl">🚧</div>
      <h1 className="text-2xl">{entry?.label || 'Coming soon'}</h1>
      <p className="mt-3 text-gray-600">
        This page is not available yet.
        {mod ? ` It belongs to component ${mod.no} (${mod.title}) and will appear once that part is merged into the platform.` : ' It will be added in a later release.'}
      </p>
      {entry?.note && <p className="mt-1 text-sm text-gray-500">{entry.note}</p>}
      <div className="mt-8 flex justify-center gap-3">
        <Link to="/" className="btn">Back to home</Link>
        <Link to="/guidance" className="btn-outline">Visa guidance</Link>
      </div>
    </div>
  );
}
