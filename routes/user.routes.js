// routes/user.routes.js
const express = require('express');
const router = express.Router();
const wishlistController = require('../controllers/wishlist.controller');
const { isAuth } = require('../middlewares/auth.middleware');

// Wishlist routes
router.get('/wishlist', isAuth, wishlistController.getWishlist);

// Add to wishlist (AJAX)
router.post('/wishlist/add/:id', isAuth, wishlistController.addToWishlist);

// Remove from wishlist (AJAX)
router.post('/wishlist/remove/:id', isAuth, wishlistController.removeFromWishlist);

// Add to wishlist (non-AJAX fallback)
router.get('/wishlist/add/:id', isAuth, wishlistController.addToWishlistRedirect);

// Remove from wishlist (non-AJAX fallback)
router.get('/wishlist/remove/:id', isAuth, wishlistController.removeFromWishlistRedirect);

module.exports = router;