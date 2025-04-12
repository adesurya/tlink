const Category = require('../models/category.model');

class CategoryController {
  // Get all categories
  async getAllCategories(req, res) {
    try {
      const categories = await Category.find({ isActive: true }).sort({ displayOrder: 1 });
      
      res.render('categories/index', {
        title: 'All Categories',
        categories
      });
    } catch (error) {
      console.error('Error fetching categories:', error);
      res.status(500).render('500', { title: '500 - Server Error' });
    }
  }
  
  // Get categories for API (JSON response)
  async getCategoriesAPI(req, res) {
    try {
      const categories = await Category.find({ isActive: true }).sort({ displayOrder: 1 });
      
      res.json({ 
        success: true, 
        data: categories 
      });
    } catch (error) {
      console.error('Error fetching categories for API:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to fetch categories' 
      });
    }
  }
}

module.exports = new CategoryController();