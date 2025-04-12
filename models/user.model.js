const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  fullName: {
    type: String,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  affiliateCode: {
    type: String,
    unique: true,
    sparse: true
  },
  profileImage: {
    type: String
  },
  lastLogin: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp on save
UserSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Only hash the password if it's modified (or new)
  if (!this.isModified('password')) return next();
  
  // Generate a salt
  bcrypt.genSalt(10, (err, salt) => {
    if (err) return next(err);
    
    // Hash the password using our new salt
    bcrypt.hash(this.password, salt, (err, hash) => {
      if (err) return next(err);
      
      // Override the cleartext password with the hashed one
      this.password = hash;
      next();
    });
  });
});

// Compare password method
UserSchema.methods.comparePassword = function(candidatePassword) {
  return new Promise((resolve, reject) => {
    bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
      if (err) return reject(err);
      return resolve(isMatch);
    });
  });
};

// Generate affiliate code
UserSchema.methods.generateAffiliateCode = function() {
  // Combination of username prefix and random string
  const prefix = this.username.slice(0, this.username.length > 3 ? 3 : this.username.length).toUpperCase();
  const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
  
  return `${prefix}-${randomStr}`;
};

module.exports = mongoose.model('User', UserSchema);