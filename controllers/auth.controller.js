const User = require('../models/user.model');
const { validationResult } = require('express-validator');

class AuthController {
  // Show login page
  getLogin(req, res) {
    // If user is already logged in, redirect to home
    if (req.session.user) {
      return res.redirect('/');
    }
    
    res.render('auth/login', {
      title: 'Login',
      error: req.flash('error'),
      success: req.flash('success')
    });
  }
  
  // Handle login
  async postLogin(req, res) {
    try {
      const { email, password } = req.body;
      
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        req.flash('error', errors.array()[0].msg);
        return res.redirect('/auth/login');
      }
      
      // Find user by email
      const user = await User.findOne({ email });
      
      // If user not found
      if (!user) {
        req.flash('error', 'Email atau password tidak valid');
        return res.redirect('/auth/login');
      }
      
      // Check if user is active
      if (!user.isActive) {
        req.flash('error', 'Akun Anda telah dinonaktifkan. Silakan hubungi admin');
        return res.redirect('/auth/login');
      }
      
      // Check password
      const isMatch = await user.comparePassword(password);
      
      if (!isMatch) {
        req.flash('error', 'Email atau password tidak valid');
        return res.redirect('/auth/login');
      }
      
      // Update last login
      user.lastLogin = new Date();
      await user.save();
      
      // Set session
      req.session.user = {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        affiliateCode: user.affiliateCode
      };
      
      // Redirect based on returnTo or role
      const returnTo = req.session.returnTo || '/';
      delete req.session.returnTo;
      
      res.redirect(returnTo);
    } catch (error) {
      console.error('Login error:', error);
      req.flash('error', 'Terjadi kesalahan saat login. Silakan coba lagi');
      res.redirect('/auth/login');
    }
  }
  
  // Show register page
  getRegister(req, res) {
    // If user is already logged in, redirect to home
    if (req.session.user) {
      return res.redirect('/');
    }
    
    res.render('auth/register', {
      title: 'Register',
      error: req.flash('error'),
      success: req.flash('success')
    });
  }
  
  // Handle register
  async postRegister(req, res) {
    try {
      const { username, email, password, confirmPassword, fullName, phone } = req.body;
      
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        req.flash('error', errors.array()[0].msg);
        return res.redirect('/auth/register');
      }
      
      // Check if passwords match
      if (password !== confirmPassword) {
        req.flash('error', 'Password tidak cocok');
        return res.redirect('/auth/register');
      }
      
      // Check if email already exists
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        req.flash('error', 'Email sudah digunakan');
        return res.redirect('/auth/register');
      }
      
      // Check if username already exists
      const usernameExists = await User.findOne({ username });
      if (usernameExists) {
        req.flash('error', 'Username sudah digunakan');
        return res.redirect('/auth/register');
      }
      
      // Create new user
      const user = new User({
        username,
        email,
        password,
        fullName,
        phone
      });
      
      // Generate affiliate code
      user.affiliateCode = user.generateAffiliateCode();
      
      // Save user
      await user.save();
      
      req.flash('success', 'Registrasi berhasil! Silakan login');
      res.redirect('/auth/login');
    } catch (error) {
      console.error('Register error:', error);
      req.flash('error', 'Terjadi kesalahan saat registrasi. Silakan coba lagi');
      res.redirect('/auth/register');
    }
  }
  
  // Handle logout
  logout(req, res) {
    // Destroy session
    req.session.destroy((err) => {
      if (err) {
        console.error('Logout error:', err);
      }
      res.redirect('/auth/login');
    });
  }
  
  // Show profile page
  async getProfile(req, res) {
    try {
      // Check if user is logged in
      if (!req.session.user) {
        return res.redirect('/auth/login');
      }
      
      // Get user from database
      const user = await User.findById(req.session.user.id);
      
      if (!user) {
        req.flash('error', 'User tidak ditemukan');
        return res.redirect('/');
      }
      
      res.render('auth/profile', {
        title: 'Profile',
        user,
        error: req.flash('error'),
        success: req.flash('success')
      });
    } catch (error) {
      console.error('Profile error:', error);
      req.flash('error', 'Terjadi kesalahan saat memuat profile');
      res.redirect('/');
    }
  }
  
  // Handle profile update
  async updateProfile(req, res) {
    try {
      // Check if user is logged in
      if (!req.session.user) {
        return res.redirect('/auth/login');
      }
      
      const { fullName, phone } = req.body;
      
      // Get user from database
      let user = await User.findById(req.session.user.id);
      
      if (!user) {
        req.flash('error', 'User tidak ditemukan');
        return res.redirect('/');
      }
      
      // Update user
      user.fullName = fullName;
      user.phone = phone;
      
      // Save changes
      await user.save();
      
      req.flash('success', 'Profile berhasil diperbarui');
      res.redirect('/auth/profile');
    } catch (error) {
      console.error('Update profile error:', error);
      req.flash('error', 'Terjadi kesalahan saat memperbarui profile');
      res.redirect('/auth/profile');
    }
  }
}

module.exports = new AuthController();