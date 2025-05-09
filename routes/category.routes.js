const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category.controller');

// Get all categories
router.get('/', categoryController.getAllCategories);

// Get categories (API)
router.get('/api', categoryController.getCategoriesAPI);

module.exports = router;