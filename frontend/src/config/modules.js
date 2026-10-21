/**
 * SafeMaga module registry - the single place that tells the Header, Footer, Home, About and the
 * "coming soon" placeholders which pages exist.
 *
 * HOW A TEAMMATE REGISTERS THEIR PAGES
 *   1. Build your page and add its <Route> in src/App.jsx.
 *   2. In this file set `live: true` on your item(s). That removes the placeholder page for that path and
 *      the "Soon" badge in the menus. (Remove any duplicate placeholder <Route> if you added a real one.)
 *   3. Need a new menu entry? Add an item here - Header and Footer pick it up automatically.
 */

export const PLATFORM = {
  name: 'SafeMaga',
  tagline: 'Smart Foreign Migration Guidance and Readiness Platform for Sri Lankans',
  code: 'J26-IT-369',
  institution: 'SLIIT Faculty of Computing',
  supervisors: [
    { name: 'Dr. Junius Anjana', role: 'Supervisor' },
    { name: 'Prof. Samantha Rajapaksha', role: 'Co-Supervisor' },
  ],
};

// `live: false` => the route renders the ComingSoon placeholder.  `auth: true` => login required.
export const MODULES = [
  {
    no: 1,
    title: 'Agency, Passport & Complaints',
    summary: 'Passport validity checking, verified agency discovery on a map, and AI-assisted complaint handling.',
    owner: 'Perera J.P.M.V.', studentId: 'IT23312494', role: 'Team Leader',
    badge: 'bg-brand', accent: 'border-brand',
    items: [
      { to: '/passport', label: 'Passport validity checker', live: false },
      { to: '/agencies', label: 'Agency directory & map', live: false },
      { to: '/complaints', label: 'File a complaint', live: false },
    ],
  },
  {
    no: 2,
    title: 'Legal, Documents & Costs',
    summary: 'Step-by-step visa guidance, destination document requirements, AI document reading, cost planning and approval-risk insight.',
    owner: 'M.T. Thamadhi', studentId: 'IT23175402', role: 'Member 2',
    badge: 'bg-secondary', accent: 'border-secondary',
    base: '/guidance',
    adminTo: '/guidance/admin', adminLabel: 'Visa guidance admin',
    items: [
      { to: '/guidance/countries', label: 'Countries & visa guide', live: true },
      { to: '/guidance/requirements', label: 'Document requirements', live: true },
      { to: '/guidance/costs', label: 'Cost planner', live: true },
      { to: '/guidance/documents', label: 'AI document reader', live: true, auth: true },
      { to: '/guidance/risk', label: 'Approval risk', live: true, auth: true },
      { to: '/guidance/alerts', label: 'Expiry alerts', live: true, auth: true },
    ],
  },
  {
    no: 3,
    title: 'Visa Time & Migration Tracking',
    summary: 'Machine-learning visa turnaround prediction and a timeline to track every migration step.',
    owner: 'Bandara R.M.C.T.', studentId: 'IT23193468', role: 'Member 3',
    badge: 'bg-action', accent: 'border-action',
    items: [{ to: '/timeline', label: 'Timeline & visa time prediction', live: false }],
  },
  {
    no: 4,
    title: 'Fraud Detection & Multilingual Guidance',
    summary: 'AI scam and fraudulent-advertisement detection, fraud awareness, and a multilingual chatbot.',
    owner: 'N.A.A.S. Nishshanka', studentId: 'IT23463288', role: 'Member 4',
    badge: 'bg-accent', accent: 'border-accent',
    items: [
      { to: '/fraud', label: 'Scam & fraud checker', live: false },
      { to: '/chatbot', label: 'Multilingual chatbot', live: false },
    ],
  },
];

const moduleItems = (no) => MODULES.find((m) => m.no === no).items;

/**
 * Top navigation (Header bottom bar, Footer links). `labelKey` is looked up in src/i18n/strings.js,
 * falling back to `label`. Items with `children` render a dropdown.
 */
export const NAV = [
  { key: 'home', label: 'Home', labelKey: 'home', to: '/', exact: true },
  { key: 'about', label: 'About Us', labelKey: 'about', to: '/about' },
  { key: 'agencies', label: 'Agencies', labelKey: 'agencies', to: '/agencies', module: 1 },
  { key: 'guidance', label: 'Visa Guidance', labelKey: 'guidance', to: '/guidance', module: 2, children: moduleItems(2) },
  { key: 'timeline', label: 'Timeline', labelKey: 'timeline', to: '/timeline', module: 3 },
  { key: 'fraud', label: 'Fraud & Chatbot', labelKey: 'fraudChatbot', to: '/fraud', module: 4, children: moduleItems(4) },
  { key: 'announcements', label: 'Announcements', labelKey: 'announcements', to: '/announcements' },
];

// Where the global Header search box sends the query (Module 2's country list filters by ?search=).
export const SEARCH_PATH = '/guidance/countries';

// Admin consoles shown in the Header user menu for role = admin.
export const ADMIN_LINKS = MODULES.filter((m) => m.adminTo).map((m) => ({ to: m.adminTo, label: m.adminLabel }));

// Routes that appear in menus/links but whose pages are not built yet -> rendered by pages/ComingSoon.jsx.
const EXTRA_PLACEHOLDERS = [
  { to: '/announcements', label: 'Announcements', note: 'Platform announcements.' },
  { to: '/faq', label: 'FAQ', note: 'Frequently asked questions.' },
  { to: '/legal-aid', label: 'Legal Aid', note: 'Legal aid information for migrant workers.' },
  { to: '/forums', label: 'Community Forum', note: 'Community discussion forums.' },
  { to: '/forums/srilanka', label: 'Sri Lanka Community', note: 'Community forum.' },
  { to: '/forums/diaspora', label: 'Global Diaspora', note: 'Community forum.' },
  { to: '/forums/prep', label: 'Pre-Departure Prep', note: 'Community forum.' },
  { to: '/officer-dashboard', label: 'Officer Dashboard', module: 1, note: 'Complaint intelligence dashboard for officers.' },
];

export const PLACEHOLDERS = [
  ...MODULES.flatMap((m) => m.items.filter((i) => !i.live).map((i) => ({ to: i.to, label: i.label, module: m.no }))),
  ...EXTRA_PLACEHOLDERS,
].filter((p, idx, all) => all.findIndex((q) => q.to === p.to) === idx);

export const moduleByNo = (no) => MODULES.find((m) => m.no === no);
