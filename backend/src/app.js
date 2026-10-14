const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const Agency = require('./models/Agency');
const CountryRule = require('./models/CountryRule');
const apiRoutes = require('./routes/index'); // Teammate's modular routes

const app = express();

app.use(cors());
app.use(express.json());

// Mount modular routes (includes /api/health, /api/auth, /api/predict)
app.use('/api', apiRoutes);

// Agency Search Endpoint
app.get('/api/agencies', async (req, res) => {
  try {
    const q = (req.query.q || '').trim();
    const district = (req.query.district || '').trim();
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filterQuery = {};
    if (q) {
      filterQuery.$or = [
        { agencyName: { $regex: q, $options: 'i' } },
        { licenseNo: { $regex: q, $options: 'i' } },
        { address: { $regex: q, $options: 'i' } },
      ];
    }
    if (district) {
      filterQuery.district = { $regex: district, $options: 'i' };
    }

    const totalRecords = await Agency.countDocuments(filterQuery);
    const agencies = await Agency.find(filterQuery).skip(skip).limit(limit).lean();

    res.json({
      data: agencies,
      pagination: {
        total: totalRecords,
        page,
        limit,
        totalPages: Math.ceil(totalRecords / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching agencies:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Country Rules Endpoint
app.get('/api/country-rules', async (req, res) => {
  try {
    const rules = await CountryRule.find().sort({ country: 1 }).lean();
    res.json(rules);
  } catch (error) {
    console.error('Error fetching country rules:', error);
    res.status(500).json({ error: 'Failed to fetch country rules' });
  }
});

module.exports = app;