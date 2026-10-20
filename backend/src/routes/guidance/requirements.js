// Document requirements by destination and travel purpose (from the requirements dataset),
// plus a readiness check that compares them with the documents the user has scanned.
const router = require('express').Router();
const DocRequirement = require('../../models/DocRequirement');
const Document = require('../../models/UserDocument');
const { protect } = require('../../middleware/authMiddleware');
const { asyncHandler } = require('../../middleware/requestHelpers');

const PURPOSES = {
  traveler: 'Tourist / visiting',
  medical: 'Medical treatment',
  business: 'Business',
  student: 'Student',
  child: 'Travelling with a child / newborn',
};

// Which requirement category a document type satisfies on its own. Anything else ("other", "contract")
// is matched through fields.documentCategory, set by the ML classifier or by the user.
const CATEGORY_BY_DOCTYPE = {
  passport: 'Standard Identity Papers',
  police_clearance: 'Standard Identity Papers',
  medical: 'Health & Vaccinations',
};

const pickPurpose = (q) => (PURPOSES[q] ? q : 'traveler');

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const list = await DocRequirement.find()
      .sort('name')
      .select('name slug entryType biometrics interview')
      .lean();
    res.json({ purposes: PURPOSES, countries: list });
  })
);

router.get(
  '/:slug',
  asyncHandler(async (req, res) => {
    const rec = await DocRequirement.findOne({ slug: req.params.slug }).lean();
    if (!rec) return res.status(404).json({ message: 'No document-requirement data for this country yet' });
    const purpose = pickPurpose(req.query.purpose);
    res.json({
      name: rec.name, slug: rec.slug, passportType: rec.passportType, entryType: rec.entryType,
      biometrics: rec.biometrics, interview: rec.interview, notes: rec.notes,
      purpose, purposeLabel: PURPOSES[purpose],
      checklist: rec.categories
        .slice()
        .sort((a, b) => a.order - b.order)
        .map((c) => ({ order: c.order, category: c.category, text: c.requirements[purpose] })),
    });
  })
);

router.get(
  '/:slug/readiness',
  protect,
  asyncHandler(async (req, res) => {
    const rec = await DocRequirement.findOne({ slug: req.params.slug }).lean();
    if (!rec) return res.status(404).json({ message: 'No document-requirement data for this country yet' });
    const purpose = pickPurpose(req.query.purpose);
    const docs = await Document.find({ user: req.user.id }).lean();
    const now = new Date();

    const items = rec.categories
      .slice()
      .sort((a, b) => a.order - b.order)
      .map((c) => {
        const matching = docs.filter((d) => (d.fields?.documentCategory || CATEGORY_BY_DOCTYPE[d.docType]) === c.category);
        const usable = matching.filter(
          (d) => d.validation?.status !== 'invalid' && (!d.expiryDate || new Date(d.expiryDate) >= now)
        );
        const status = usable.length ? 'covered' : matching.length ? 'expired' : 'missing';
        return {
          order: c.order, category: c.category, text: c.requirements[purpose], status,
          documents: matching.map((d) => ({ id: d._id, label: d.label, docType: d.docType, expiryDate: d.expiryDate })),
        };
      });

    const covered = items.filter((i) => i.status === 'covered').length;
    res.json({
      country: rec.name, purpose, purposeLabel: PURPOSES[purpose],
      readinessPercent: items.length ? Math.round((covered / items.length) * 100) : 0,
      items,
      note: 'Approximate: a scanned document in a category does not prove it meets every item listed. Always check the official embassy requirements.',
    });
  })
);

module.exports = router;
