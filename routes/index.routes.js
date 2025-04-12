const express = require('express');
const router = express.Router();
const productService = require('../services/product.service');
const Category = require('../models/category.model');

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
    
    // Get categories
    const categories = await Category.find({ isActive: true }).sort({ displayOrder: 1 });
    
    res.render('home', {
      title: 'taplink - Raih Cuan Affiliate bersama Taplink SIJAGO AI!',
      featuredProducts: featuredProducts.products,
      viralProducts,
      hotProducts,
      topRatedProducts,
      categories
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

module.exports = router;