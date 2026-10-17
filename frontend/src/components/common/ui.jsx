export const PageTitle = ({ title, sub }) => (
  <div className="mb-6">
    <h1 className="text-2xl font-bold md:text-3xl">{title}</h1>
    {sub && <p className="mt-1 max-w-3xl text-gray-600">{sub}</p>}
    <div className="mt-3 h-1 w-16 rounded-sm bg-secondary" />
  </div>
);

export const ErrorBox = ({ msg }) => msg ? <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{msg}</div> : null;

const STATUS = {
  valid: 'bg-accent-light text-emerald-800', warning: 'bg-yellow-100 text-yellow-800', invalid: 'bg-red-100 text-red-700',
  unverified: 'bg-gray-100 text-gray-600', low: 'bg-accent-light text-emerald-800', medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-red-100 text-red-700', ok: 'bg-accent-light text-emerald-800', critical: 'bg-red-100 text-red-700', expired: 'bg-red-200 text-red-800',
};
export const Chip = ({ kind, children }) => <span className={`chip ${STATUS[kind] || STATUS.unverified}`}>{children ?? kind}</span>;

export const Field = ({ label, children }) => (
  <div><label className="label">{label}</label>{children}</div>
);

export const Check = ({ label, checked, onChange }) => (
  <label className="flex cursor-pointer items-center gap-2 text-sm">
    <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4 accent-secondary" />{label}
  </label>
);
