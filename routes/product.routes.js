const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const { isAuth } = require('../middlewares/auth.middleware');

// Get all products
router.get('/', productController.getAllProducts);

// Get viral products
router.get('/viral', productController.getViralProducts);

// Get hot products
router.get('/hot', productController.getHotProducts);

// Get top rated products
router.get('/top-rated', productController.getTopRatedProducts);

// Get products by category
router.get('/category/:id', productController.getCategoryProducts);

// Get product detail
router.get('/:id', productController.getProductDetail);

// Handle affiliate link click - require auth
router.get('/:id/affiliate', isAuth, productController.handleAffiliateClick);

module.exports = router;