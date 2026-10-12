/**
 * SafeMaga Database Seeding Utility.
 * Resets collections and seeds sample users and baseline research data.
 * Usage: node database/seeds/seedDatabase.js
 */

const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const { connectDatabase, disconnectDatabase } = require('../connection');
const userSchema = require('../schemas/userSchema');
const analysisSchema = require('../schemas/analysisSchema');

const User = mongoose.models.User || mongoose.model('User', userSchema);
const Analysis = mongoose.models.Analysis || mongoose.model('Analysis', analysisSchema);

const seedDatabase = async () => {
  try {
    console.log('[Seed Utility] Starting database seeding...');
    await connectDatabase();

    const dataFilePath = path.join(__dirname, 'sampleData.json');
    const rawData = fs.readFileSync(dataFilePath, 'utf-8');
    const { users, analyses } = JSON.parse(rawData);

    // Clean existing collections
    console.log('[Seed Utility] Purging existing records...');
    await User.deleteMany({});
    await Analysis.deleteMany({});

    // Insert Users
    console.log(`[Seed Utility] Inserting ${users.length} team member users...`);
    const createdUsers = await User.insertMany(users);
    console.log(`[Seed Utility] Successfully seeded ${createdUsers.length} users.`);

    // Insert Analyses
    console.log(`[Seed Utility] Inserting ${analyses.length} baseline experiments...`);
    const createdAnalyses = await Analysis.insertMany(analyses);
    console.log(`[Seed Utility] Successfully seeded ${createdAnalyses.length} experiment records.`);

    console.log('[Seed Utility] Database seeding completed successfully!');
  } catch (err) {
    console.error(`[Seed Utility] Error during seeding: ${err.message}`);
  } finally {
    await disconnectDatabase();
  }
};

if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;
