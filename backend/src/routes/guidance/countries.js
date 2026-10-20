const router = require('express').Router();
const Country = require('../../models/Country');
const { asyncHandler } = require('../../middleware/requestHelpers');

// Summary list for the interactive world map (colour-coded by difficulty / safety / cost).
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const rate = Number(process.env.USD_TO_LKR) || 300;
    const list = await Country.find().sort('name').lean();
    res.json(
      list.map((c) => {
        const c0 = c.costs || {};
        const oneOffUSD =
          (c0.agencyFeeUSD || 0) + (c0.medicalUSD || 0) + (c0.airfareUSD || 0) + (c0.insuranceUSD || 0) +
          (c0.policeClearanceUSD || 0) + (c0.otherUSD || 0) + (c.visaTypes?.[0]?.visaFeeUSD || 0);
        return {
          _id: c._id, name: c.name, slug: c.slug, isoNumeric: c.isoNumeric, region: c.region,
          visaDifficulty: c.visaDifficulty, safetyRating: c.safetyRating,
          avgMonthlySalaryUSD: c.avgMonthlySalaryUSD,
          estimatedCostLKR: Math.round(oneOffUSD * rate),
          visaTypes: c.visaTypes.map((v) => v.type),
        };
      })
    );
  })
);

router.get(
  '/:slug',
  asyncHandler(async (req, res) => {
    const country = await Country.findOne({ slug: req.params.slug }).lean();
    if (!country) return res.status(404).json({ message: 'Country not found' });
    res.json(country);
  })
);

module.exports = router;
