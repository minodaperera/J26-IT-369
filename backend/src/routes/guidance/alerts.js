const router = require('express').Router();
const Document = require('../../models/UserDocument');
const { protect } = require('../../middleware/authMiddleware');
const { asyncHandler } = require('../../middleware/requestHelpers');
const { daysUntil, severityFor } = require('../../utils/expiry');

// In-app expiry alerts: computed on demand from stored document expiry dates.
router.get(
  '/',
  protect,
  asyncHandler(async (req, res) => {
    const docs = await Document.find({ user: req.user.id, expiryDate: { $exists: true } });
    const alerts = docs
      .map((d) => {
        const days = daysUntil(d.expiryDate);
        const severity = severityFor(days);
        return {
          documentId: d._id, docType: d.docType, label: d.label, expiryDate: d.expiryDate, daysLeft: days, severity,
          message:
            days < 0
              ? `${d.label} expired ${Math.abs(days)} day(s) ago. Renew it before applying.`
              : `${d.label} expires in ${days} day(s).`,
        };
      })
      .filter((a) => a.severity !== 'ok')
      .sort((a, b) => a.daysLeft - b.daysLeft);
    res.json(alerts);
  })
);

module.exports = router;
