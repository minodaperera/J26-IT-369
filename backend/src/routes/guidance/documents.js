const router = require('express').Router();
const multer = require('multer');
const Document = require('../../models/UserDocument');
const { protect } = require('../../middleware/authMiddleware');
const { asyncHandler } = require('../../middleware/requestHelpers');
const ml = require('../../services/guidanceAiService');
const { sixMonthRule } = require('../../utils/expiry');

// Files are kept in memory only and discarded after extraction (documents are not retained on servers).
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ok = ['image/jpeg', 'image/png', 'application/pdf'].includes(file.mimetype);
    cb(ok ? null : Object.assign(new Error('Only JPG, PNG or PDF files are allowed'), { status: 400 }), ok);
  },
});

const DOC_TYPES = ['passport', 'medical', 'police_clearance', 'contract', 'other'];

router.use(protect);

router.get(
  '/',
  asyncHandler(async (req, res) => res.json(await Document.find({ user: req.user.id }).sort('-createdAt')))
);

// Upload -> OCR / LLM extraction (ML service) -> validation -> store metadata only.
router.post(
  '/upload',
  upload.single('file'),
  asyncHandler(async (req, res) => {
    const docType = req.body.docType;
    if (!DOC_TYPES.includes(docType)) return res.status(400).json({ message: 'Invalid docType' });
    if (!req.file) return res.status(400).json({ message: 'File is required' });

    const result = await ml.extractDocument(req.file, docType);
    const issues = [...(result.issues || [])];
    const checks = { ...(result.checks || {}) };
    let status = result.status || 'unverified';

    const expiry = result.expiryDate ? new Date(result.expiryDate) : null;
    if (expiry && !isNaN(expiry)) {
      if (expiry < new Date()) {
        issues.push('Document has already expired');
        status = 'invalid';
      } else if (docType === 'passport') {
        const travel = req.body.travelDate ? new Date(req.body.travelDate) : new Date();
        checks.sixMonthRule = sixMonthRule(expiry, travel);
        if (!checks.sixMonthRule) {
          issues.push('Passport is valid for less than 6 months beyond the travel date');
          if (status !== 'invalid') status = 'warning';
        }
      }
    }

    const doc = await Document.create({
      user: req.user.id,
      docType,
      label: req.body.label || docType.replace('_', ' '),
      fields: result.fields || {},
      issueDate: result.issueDate || undefined,
      expiryDate: expiry && !isNaN(expiry) ? expiry : undefined,
      validation: { status, issues, checks },
      confidence: result.confidence,
      extractionMethod: result.method,
    });
    res.status(201).json(doc);
  })
);

// Manual entry / correction (e.g. when OCR confidence is low).
router.post(
  '/',
  asyncHandler(async (req, res) => {
    const { docType, label, expiryDate, issueDate, fields, category } = req.body;
    if (!DOC_TYPES.includes(docType)) return res.status(400).json({ message: 'Invalid docType' });
    const doc = await Document.create({
      user: req.user.id, docType, label, expiryDate: expiryDate || undefined, issueDate,
      fields: { ...(fields || {}), ...(category ? { documentCategory: category } : {}) },
      validation: { status: 'unverified', issues: [], checks: {} }, extractionMethod: 'manual',
    });
    res.status(201).json(doc);
  })
);

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const doc = await Document.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!doc) return res.status(404).json({ message: 'Document not found' });
    res.json({ message: 'Deleted' });
  })
);

module.exports = router;
