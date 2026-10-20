// Module 2 - Legal, Document & Cost Guidance. Mounted at /api/guidance (see routes/index.js).
const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const ml = require('../services/guidanceAiService');

const router = express.Router();

router.use(helmet());
router.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 600, standardHeaders: true, legacyHeaders: false }));

router.get('/health', async (req, res) => res.json({ status: 'ok', module: 'guidance', ai: await ml.health() }));

router.use('/countries', require('./guidance/countries'));
router.use('/costs', require('./guidance/costs'));
router.use('/requirements', require('./guidance/requirements'));
router.use('/documents', require('./guidance/documents'));
router.use('/alerts', require('./guidance/alerts'));
router.use('/risk', require('./guidance/risk'));
router.use('/admin', require('./guidance/admin'));

module.exports = router;
