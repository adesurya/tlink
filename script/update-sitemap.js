// scripts/update-sitemap.js

require('dotenv').config();
const mongoose = require('mongoose');
const { generateSitemap } = require('../utils/sitemap-generator');
const dbConfig = require('../config/db.config');

// Connect to database and generate sitemap
async function updateSitemap() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(dbConfig.mongoURI, dbConfig.options);
    console.log('MongoDB Connected');
    
    // Generate sitemap
    await generateSitemap();
    
    // Close connection and exit
    console.log('Closing MongoDB connection...');
    await mongoose.connection.close();
    console.log('Done!');
    process.exit(0);
  } catch (error) {
    console.error('Error updating sitemap:', error);
    process.exit(1);
  }
}

// Execute the function
updateSitemap();