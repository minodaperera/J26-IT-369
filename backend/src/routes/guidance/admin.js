// Admin console API. Every route requires a logged-in user whose role is "admin".
// Privacy: uploaded files are never stored, and admins only see AGGREGATE document statistics
// (counts per type/status) - never the extracted contents of a user's documents.
const router = require('express').Router();
const { protect, adminOnly } = require('../../middleware/authMiddleware');
const { asyncHandler } = require('../../middleware/requestHelpers');
const User = require('../../models/User');
const Country = require('../../models/Country');
const Document = require('../../models/UserDocument');
const Prediction = require('../../models/RiskPrediction');
const SavingsPlan = require('../../models/SavingsPlan');
const ml = require('../../services/guidanceAiService');

router.use(protect, adminOnly);

/* ---------- Overview ---------- */
router.get(
  '/stats',
  asyncHandler(async (req, res) => {
    const now = new Date();
    const in30 = new Date(now.getTime() + 30 * 864e5);
    const [users, admins, countries, docs, predictions, plans, byType, byStatus, expired, expiring, avg, topCountries, recentUsers, mlHealth] =
      await Promise.all([
        User.countDocuments(),
        User.countDocuments({ role: 'admin' }),
        Country.countDocuments(),
        Document.countDocuments(),
        Prediction.countDocuments(),
        SavingsPlan.countDocuments(),
        Document.aggregate([{ $group: { _id: '$docType', count: { $sum: 1 } } }]),
        Document.aggregate([{ $group: { _id: '$validation.status', count: { $sum: 1 } } }]),
        Document.countDocuments({ expiryDate: { $lt: now } }),
        Document.countDocuments({ expiryDate: { $gte: now, $lte: in30 } }),
        Prediction.aggregate([{ $group: { _id: null, avg: { $avg: '$approvalProbability' } } }]),
        Prediction.aggregate([
          { $group: { _id: '$country', checks: { $sum: 1 }, avg: { $avg: '$approvalProbability' } } },
          { $sort: { checks: -1 } },
          { $limit: 5 },
          { $lookup: { from: 'countries', localField: '_id', foreignField: '_id', as: 'c' } },
          { $unwind: '$c' },
          { $project: { _id: 0, name: '$c.name', checks: 1, avg: 1 } },
        ]),
        User.find().sort('-createdAt').limit(5).select('name email role createdAt'),
        ml.health(),
      ]);
    res.json({
      totals: { users, admins, countries, documents: docs, riskChecks: predictions, savingsPlans: plans },
      documents: {
        byType: Object.fromEntries(byType.map((x) => [x._id, x.count])),
        byStatus: Object.fromEntries(byStatus.map((x) => [x._id || 'unverified', x.count])),
        expired, expiringIn30Days: expiring,
      },
      risk: { averageApprovalProbability: avg[0]?.avg ?? null, topCountries },
      recentUsers,
      system: { api: 'ok', ml: mlHealth },
    });
  })
);

/* ---------- Users ---------- */
router.get(
  '/users',
  asyncHandler(async (req, res) => {
    const q = (req.query.search || '').trim();
    const filter = q ? { $or: [{ name: new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') }, { email: new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') }] } : {};
    const users = await User.find(filter).sort('-createdAt').limit(200).select('name email role language createdAt').lean();
    const counts = await Document.aggregate([{ $group: { _id: '$user', n: { $sum: 1 } } }]);
    const map = Object.fromEntries(counts.map((c) => [String(c._id), c.n]));
    res.json(users.map((u) => ({ ...u, documentCount: map[String(u._id)] || 0 })));
  })
);

router.put(
  '/users/:id/role',
  asyncHandler(async (req, res) => {
    const { role } = req.body;
    const allowed = User.schema.path('role').enumValues;
    if (!allowed.includes(role)) return res.status(400).json({ message: `Role must be one of: ${allowed.join(', ')}` });
    if (String(req.user.id) === req.params.id) return res.status(400).json({ message: 'You cannot change your own role' });
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('name email role');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  })
);

router.delete(
  '/users/:id',
  asyncHandler(async (req, res) => {
    if (String(req.user.id) === req.params.id) return res.status(400).json({ message: 'You cannot delete your own account' });
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    await Promise.all([
      Document.deleteMany({ user: user._id }),
      Prediction.deleteMany({ user: user._id }),
      SavingsPlan.deleteMany({ user: user._id }),
    ]);
    res.json({ message: 'User and related records deleted' });
  })
);

/* ---------- Countries (content management) ---------- */
const num = (v, d = 0) => (Number.isFinite(Number(v)) && v !== '' && v !== null ? Number(v) : d);
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

function cleanCountry(b) {
  const name = String(b.name || '').trim();
  if (!name) throw Object.assign(new Error('Country name is required'), { status: 400 });
  if (!Number.isFinite(Number(b.isoNumeric)) || Number(b.isoNumeric) <= 0)
    throw Object.assign(new Error('ISO numeric code is required (e.g. 392 for Japan)'), { status: 400 });
  const costs = b.costs || {};
  return {
    name,
    slug: slugify(name),
    isoNumeric: Number(b.isoNumeric),
    isoAlpha3: (b.isoAlpha3 || '').toUpperCase().slice(0, 3),
    region: b.region || '',
    visaDifficulty: clamp(num(b.visaDifficulty, 3), 1, 5),
    safetyRating: clamp(num(b.safetyRating, 3), 1, 5),
    avgMonthlySalaryUSD: num(b.avgMonthlySalaryUSD),
    embassy: { name: b.embassy?.name || '', phone: b.embassy?.phone || '', website: b.embassy?.website || '' },
    costs: {
      agencyFeeUSD: num(costs.agencyFeeUSD), medicalUSD: num(costs.medicalUSD), airfareUSD: num(costs.airfareUSD),
      insuranceUSD: num(costs.insuranceUSD), policeClearanceUSD: num(costs.policeClearanceUSD),
      accommodationPerMonthUSD: num(costs.accommodationPerMonthUSD), otherUSD: num(costs.otherUSD),
    },
    visaTypes: (b.visaTypes || []).map((v) => ({
      type: v.type,
      category: v.category === 'work' ? 'work' : 'visit',
      processingDays: { min: num(v.processingDays?.min), max: num(v.processingDays?.max) },
      stayDuration: v.stayDuration || '',
      visaFeeUSD: num(v.visaFeeUSD),
      requiredDocuments: (v.requiredDocuments || []).map((d) => String(d).trim()).filter(Boolean),
      steps: (v.steps || []).filter((s) => s && s.title).map((s, i) => ({ order: i + 1, title: s.title, description: s.description || '' })),
    })),
    lastVerified: b.lastVerified ? new Date(b.lastVerified) : new Date(),
  };
}

router.post(
  '/countries',
  asyncHandler(async (req, res) => res.status(201).json(await Country.create(cleanCountry(req.body))))
);

router.put(
  '/countries/:id',
  asyncHandler(async (req, res) => {
    const c = await Country.findByIdAndUpdate(req.params.id, cleanCountry(req.body), { new: true, runValidators: true });
    if (!c) return res.status(404).json({ message: 'Country not found' });
    res.json(c);
  })
);

router.delete(
  '/countries/:id',
  asyncHandler(async (req, res) => {
    const c = await Country.findByIdAndDelete(req.params.id);
    if (!c) return res.status(404).json({ message: 'Country not found' });
    res.json({ message: 'Country deleted' });
  })
);

module.exports = router;
