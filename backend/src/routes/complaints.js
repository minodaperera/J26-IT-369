const express = require('express');
const router = express.Router();
const Complaint = require('../models/Complaint'); // adjust path if needed

async function generateReferenceNumber() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const dateStr = `${year}${month}${day}`;

  const startOfDay = new Date(today.setHours(0, 0, 0, 0));
  const endOfDay = new Date(today.setHours(23, 59, 59, 999));

  const todayCount = await Complaint.countDocuments({
    createdAt: { $gte: startOfDay,$lte: endOfDay },
  });

  const sequence = String(todayCount + 1).padStart(6, '0');
  return `SM-${dateStr}-${sequence}`;
}

// POST: Submit a new complaint
router.post('/', async (req, res) => {
  try {
    const {
      fullName,
      phone,
      email,
      nic,
      passportNumber,
      agencyName,
      agencyLicenceNo,
      isManualAgency,
      category,
      description,
    } = req.body;

    if (!fullName || !phone || !email || !nic || !agencyName || !category || !description) {
      return res.status(400).json({ error: 'Missing required fields.' });
    }

    const referenceNumber = await generateReferenceNumber();

    const newComplaint = new Complaint({
      referenceNumber,
      fullName,
      phone,
      email,
      nic,
      passportNumber,
      agencyName,
      agencyLicenceNo,
      isManualAgency,
      category,
      description,
    });

    const savedComplaint = await newComplaint.save();

    res.status(201).json({
      message: 'Complaint registered successfully',
      referenceNumber: savedComplaint.referenceNumber,
      complaintId: savedComplaint._id,
    });
  } catch (error) {
    console.error('Error submitting complaint:', error);
    res.status(500).json({ error: 'Failed to process complaint submission.' });
  }
});

// GET: Lookup complaint status by Reference Number
router.get('/track/:refNo', async (req, res) => {
  try {
    const complaint = await Complaint.findOne({
      referenceNumber: req.params.refNo.trim().toUpperCase(),
    }).select('referenceNumber category agencyName status createdAt aiIntelligence.priorityLevel');

    if (!complaint) {
      return res.status(404).json({ error: 'Complaint reference number not found.' });
    }

    res.json(complaint);
  } catch (error) {
    res.status(500).json({ error: 'Server error retrieving complaint status.' });
  }
});

module.exports = router;