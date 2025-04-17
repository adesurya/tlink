const mongoose = require('mongoose');
const User = require('../models/user.model');
const dbConfig = require('../config/db.config');

// Connect to MongoDB
mongoose.connect(dbConfig.mongoURI, dbConfig.options)
  .then(() => {
    console.log('MongoDB Connected');
    createDefaultAdmin();
  })
  .catch(err => {
    console.error('MongoDB Connection Error:', err);
    process.exit(1);
  });

// Create default admin account
async function createDefaultAdmin() {
  try {
    // Check if admin already exists
    const adminExists = await User.findOne({ username: 'admin' });
    
    if (adminExists) {
      console.log('Admin user already exists');
      process.exit(0);
    }
    
    // Create admin user
    const admin = new User({
      username: 'admin',
      email: 'admintaplink@sijago.ai',
      password: 'admin123',  // Change this to a stronger password in production
      fullName: 'Administrator',
      role: 'admin',
      isActive: true
    });
    
    // Generate affiliate code
    admin.affiliateCode = admin.generateAffiliateCode();
    
    await admin.save();
    
    console.log('Default admin user created successfully:');
    console.log('- Username: admin');
    console.log('- Password: admin123');
    console.log('- Email: admintaplink@sijago.ai');
    console.log('\nIMPORTANT: Change this password immediately after first login!');
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
}