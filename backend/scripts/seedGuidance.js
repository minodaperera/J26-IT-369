/**
 * Module 2 seed: countries (visa guides + costs), document requirements, and dev accounts.
 *
 *   npm run seed:guidance            # inserts anything missing; never overwrites admin edits
 *   npm run seed:guidance -- --reset # wipes the Module 2 reference collections first
 *
 * Only Module 2 collections are touched (Country, DocRequirement). Users are created if missing, never deleted.
 * Data files live in database/seeds/guidance/.
 */
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');

const Country = require('../src/models/Country');
const DocRequirement = require('../src/models/DocRequirement');
const User = require('../src/models/User');
const countries = require('../../database/seeds/guidance/countries');
const requirements = require('../../database/seeds/guidance/requirements.json');

const reset = process.argv.includes('--reset');
const isProd = process.env.NODE_ENV === 'production';

async function upsertBySlug(Model, docs, label) {
  if (reset) await Model.deleteMany({});
  const ops = docs.map((d) => ({ updateOne: { filter: { slug: d.slug }, update: { $setOnInsert: d }, upsert: true } }));
  const r = await Model.bulkWrite(ops);
  console.log(`[seed:guidance] ${label}: ${r.upsertedCount} added, ${docs.length - r.upsertedCount} already present${reset ? ' (after reset)' : ''}`);
}

async function ensureUser({ name, email, password, role }) {
  if (await User.findOne({ email })) return console.log(`[seed:guidance] user ${email} already exists`);
  await User.create({ name, email, password, role }); // password is hashed by the model's pre-save hook
  console.log(`[seed:guidance] created ${role} ${email}`);
}

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/safemaga_db', { serverSelectionTimeoutMS: 5000 });
    await upsertBySlug(Country, countries, 'countries');
    await upsertBySlug(DocRequirement, requirements, 'document requirements');

    if (isProd && !process.env.SEED_ADMIN_PASSWORD) {
      console.log('[seed:guidance] NODE_ENV=production and SEED_ADMIN_PASSWORD not set - skipping default users.');
    } else {
      await ensureUser({ name: 'Admin', email: 'admin@safemaga.lk', password: process.env.SEED_ADMIN_PASSWORD || 'Admin@12345', role: 'admin' });
      if (!isProd) await ensureUser({ name: 'Demo Traveller', email: 'demo.lk@gmail.com', password: 'demo1234', role: 'user' });
      if (!isProd) console.log('[seed:guidance] DEV ONLY accounts: admin@safemaga.lk / Admin@12345 , demo.lk@gmail.com / demo1234 - change before any deployment.');
    }
  } catch (err) {
    console.error(`[seed:guidance] failed: ${err.message}`);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
})();
