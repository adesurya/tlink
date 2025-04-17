// scripts/cron.js

require('dotenv').config();
const cron = require('node-cron');
const { generateSitemap } = require('../utils/sitemap-generator');
const mongoose = require('mongoose');
const dbConfig = require('../config/db.config');

// Connect to MongoDB
mongoose.connect(dbConfig.mongoURI, dbConfig.options)
  .then(() => console.log('MongoDB Connected for cron jobs'))
  .catch(err => {
    console.error('MongoDB Connection Error:', err);
    process.exit(1);
  });

// Schedule sitemap update - runs at midnight every day
cron.schedule('0 0 * * *', async () => {
  console.log('Running scheduled sitemap update...');
  try {
    await generateSitemap();
    console.log('Sitemap updated successfully');
  } catch (error) {
    console.error('Error updating sitemap:', error);
  }
});

console.log('Cron jobs scheduled');

// Handle process termination
process.on('SIGINT', async () => {
  console.log('Closing MongoDB connection...');
  await mongoose.connection.close();
  process.exit(0);
});