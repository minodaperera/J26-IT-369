const router = require('express').Router();
const { body } = require('express-validator');
const Country = require('../../models/Country');
const Prediction = require('../../models/RiskPrediction');
const { protect } = require('../../middleware/authMiddleware');
const { validate, asyncHandler } = require('../../middleware/requestHelpers');
const ml = require('../../services/guidanceAiService');

const rate = () => Number(process.env.USD_TO_LKR) || 300;

router.use(protect);

router.post(
  '/predict',
  [
    body('country').notEmpty().withMessage('Country is required'),
    body('age').isInt({ min: 16, max: 90 }).withMessage('Age must be 16-90'),
    body('monthlyIncomeLKR').isFloat({ min: 0 }),
    body('savingsLKR').isFloat({ min: 0 }),
    body('employment').isIn(['employed', 'self_employed', 'student', 'unemployed']),
  ],
  validate,
  asyncHandler(async (req, res) => {
    const country = await Country.findOne({ slug: req.body.country });
    if (!country) return res.status(404).json({ message: 'Country not found' });

    const c = country.costs || {};
    const tripCostLKR = Math.round(
      ((c.airfareUSD || 0) + (c.insuranceUSD || 0) + (c.accommodationPerMonthUSD || 0) + (c.otherUSD || 0)) * rate()
    );

    const payload = {
      country_difficulty: country.visaDifficulty,
      age: Number(req.body.age),
      monthly_income_lkr: Number(req.body.monthlyIncomeLKR),
      savings_lkr: Number(req.body.savingsLKR),
      employment: req.body.employment,
      travel_history_count: Number(req.body.travelHistoryCount) || 0,
      previous_rejections: Number(req.body.previousRejections) || 0,
      bank_statement_months: Number(req.body.bankStatementMonths) || 0,
      has_return_ticket: !!req.body.hasReturnTicket,
      has_accommodation: !!req.body.hasAccommodation,
      has_sponsor_or_invitation: !!req.body.hasSponsor,
      trip_days: Number(req.body.tripDays) || 14,
      estimated_trip_cost_lkr: tripCostLKR,
    };

    const result = await ml.predictRejection(payload);
    await Prediction.create({
      user: req.user.id, country: country._id, input: payload,
      approvalProbability: result.approval_probability, riskLevel: result.risk_level, weakPoints: result.weak_points,
    });
    res.json({ country: country.name, ...result });
  })
);

router.get(
  '/history',
  asyncHandler(async (req, res) =>
    res.json(await Prediction.find({ user: req.user.id }).populate('country', 'name slug').sort('-createdAt').limit(20))
  )
);

module.exports = router;
