const router = require('express').Router();
const { body } = require('express-validator');
const Country = require('../../models/Country');
const SavingsPlan = require('../../models/SavingsPlan');
const { protect } = require('../../middleware/authMiddleware');
const { validate, asyncHandler } = require('../../middleware/requestHelpers');

const rate = () => Number(process.env.USD_TO_LKR) || 300;

function buildEstimate(country, visaTypeName, stayMonths) {
  const visa = country.visaTypes.find((v) => v.type === visaTypeName) || country.visaTypes[0];
  const c = country.costs || {};
  const items = [
    { key: 'visaFee', label: 'Visa fee', usd: visa?.visaFeeUSD || 0 },
    { key: 'agencyFee', label: 'Typical agency fee (avoid by applying directly)', usd: c.agencyFeeUSD || 0, optional: true },
    { key: 'medical', label: 'Medical examination', usd: c.medicalUSD || 0 },
    { key: 'policeClearance', label: 'Police clearance', usd: c.policeClearanceUSD || 0 },
    { key: 'airfare', label: 'Return airfare', usd: c.airfareUSD || 0 },
    { key: 'insurance', label: 'Travel insurance', usd: c.insuranceUSD || 0 },
    { key: 'accommodation', label: `Accommodation (${stayMonths} mo)`, usd: (c.accommodationPerMonthUSD || 0) * stayMonths },
    { key: 'other', label: 'Other / miscellaneous', usd: c.otherUSD || 0 },
  ].map((i) => ({ ...i, lkr: Math.round(i.usd * rate()) }));
  const totalUSD = items.reduce((s, i) => s + i.usd, 0);
  const withoutAgencyUSD = items.filter((i) => !i.optional).reduce((s, i) => s + i.usd, 0);
  return {
    country: country.name, visaType: visa?.type, stayMonths, rate: rate(), items,
    totalUSD, totalLKR: Math.round(totalUSD * rate()),
    totalWithoutAgencyLKR: Math.round(withoutAgencyUSD * rate()),
    potentialSavingLKR: Math.round((totalUSD - withoutAgencyUSD) * rate()),
  };
}

router.get(
  '/estimate',
  asyncHandler(async (req, res) => {
    const country = await Country.findOne({ slug: req.query.country });
    if (!country) return res.status(404).json({ message: 'Country not found' });
    const stay = Math.max(1, Math.min(12, Number(req.query.months) || 1));
    res.json(buildEstimate(country, req.query.visaType, stay));
  })
);

// Monthly savings planner: how much to save per month to reach the target by a deadline.
router.post(
  '/savings-plan',
  protect,
  [
    body('country').notEmpty(),
    body('months').isInt({ min: 1, max: 60 }).withMessage('Months must be 1-60'),
    body('currentSavingsLKR').optional().isFloat({ min: 0 }),
  ],
  validate,
  asyncHandler(async (req, res) => {
    const country = await Country.findOne({ slug: req.body.country });
    if (!country) return res.status(404).json({ message: 'Country not found' });
    const est = buildEstimate(country, req.body.visaType, Number(req.body.stayMonths) || 1);
    const target = req.body.excludeAgency ? est.totalWithoutAgencyLKR : est.totalLKR;
    const current = Number(req.body.currentSavingsLKR) || 0;
    const months = Number(req.body.months);
    const remaining = Math.max(0, target - current);
    const monthly = Math.ceil(remaining / months);
    const targetDate = new Date();
    targetDate.setMonth(targetDate.getMonth() + months);
    const plan = await SavingsPlan.create({
      user: req.user.id, country: country._id, targetAmountLKR: target, currentSavingsLKR: current,
      months, monthlyRequiredLKR: monthly, targetDate,
    });
    const schedule = Array.from({ length: months }, (_, i) => ({
      month: i + 1, saved: Math.min(target, current + monthly * (i + 1)),
    }));
    res.status(201).json({ plan, estimate: est, schedule });
  })
);

router.get(
  '/savings-plan',
  protect,
  asyncHandler(async (req, res) => {
    res.json(await SavingsPlan.find({ user: req.user.id }).populate('country', 'name slug').sort('-createdAt'));
  })
);

module.exports = router;
