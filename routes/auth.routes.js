const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const authController = require('../controllers/auth.controller');
const { isAuth } = require('../middlewares/auth.middleware');

// Login routes
router.get('/login', authController.getLogin);
router.post('/login', [
  check('email', 'Email harus valid').isEmail(),
  check('password', 'Password harus diisi').not().isEmpty()
], authController.postLogin);

// Register routes
router.get('/register', authController.getRegister);
router.post('/register', [
  check('username', 'Username harus minimal 3 karakter').isLength({ min: 3 }),
  check('email', 'Email harus valid').isEmail(),
  check('password', 'Password harus minimal 6 karakter').isLength({ min: 6 }),
  check('confirmPassword', 'Konfirmasi password harus sama dengan password').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Konfirmasi password tidak cocok');
    }
    return true;
  })
], authController.postRegister);

// Logout route
router.get('/logout', authController.logout);

// Profile routes
router.get('/profile', isAuth, authController.getProfile);
router.post('/profile', isAuth, authController.updateProfile);

module.exports = router;