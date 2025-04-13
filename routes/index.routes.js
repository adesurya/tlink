// Update in routes/index.routes.js
// Modify the home page route to fetch high commission products

const express = require('express');
const router = express.Router();
const productService = require('../services/product.service');
const Category = require('../models/category.model');
const { formatCurrency } = require('../utils/helpers');
const sitemapController = require('../controllers/sitemap.controller');

// Home page
router.get('/', async (req, res) => {
  try {
    // Get featured products
    const featuredProducts = await productService.getAllProducts({ isFeatured: true }, 1, 6);
    
    // Get viral products
    const viralProducts = await productService.getViralProducts(8);
    
    // Get hot products
    const hotProducts = await productService.getHotProducts(4);
    
    // Get top rated products
    const topRatedProducts = await productService.getTopRatedProducts(4);
    
    // Get products with highest commission (NEW)
    const highCommissionProducts = await productService.getHighCommissionProducts(10);
    
    // Get categories
    const categories = await Category.find({ isActive: true }).sort({ displayOrder: 1 });
    
    res.render('home', {
      title: 'Taplink - Raih Cuan Affiliate bersama Taplink SIJAGO AI!',
      featuredProducts: featuredProducts.products,
      viralProducts,
      hotProducts,
      topRatedProducts,
      highCommissionProducts, // Pass the high commission products to the template
      categories,
      formatCurrency // Pass the currency formatter function to the template
    });
  } catch (error) {
    console.error('Error loading home page:', error);
    res.status(500).render('500', { title: '500 - Server Error' });
  }
});

// About page
router.get('/about', (req, res) => {
  res.render('about', { title: 'About Us' });
});

// Contact page
router.get('/contact', (req, res) => {
  res.render('contact', { title: 'Contact Us' });
});

router.get('/sitemap.xml', sitemapController.getSitemap);

module.exports = router;

