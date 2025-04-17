// controllers/home.controller.js
const Product = require('../models/product.model');
const Category = require('../models/category.model');
const Banner = require('../models/banner.model');
const BlogPost = require('../models/blog.model');

class HomeController {
  // Main homepage
  async getHomepage(req, res) {
    try {
      // Get featured products
      const featuredProducts = await Product.find({ isFeatured: true, isActive: true })
        .populate('category')
        .sort({ displayOrder: 1 })
        .limit(8);
      
      // Get new arrivals
      const newArrivals = await Product.find({ isActive: true })
        .sort({ createdAt: -1 })
        .limit(8);
      
      // Get bestsellers
      const bestsellers = await Product.find({ isActive: true, isBestseller: true })
        .sort({ salesCount: -1 })
        .limit(8);
      
      // Get active categories
      const categories = await Category.find({ isActive: true, showOnHomepage: true })
        .sort({ displayOrder: 1 });
      
      // Get active banners
      const banners = await Banner.find({ isActive: true })
        .sort({ displayOrder: 1 });
      
      // Get recent blog posts
      const recentBlogPosts = await BlogPost.find({ isPublished: true })
        .populate('category')
        .sort({ publishedAt: -1 })
        .limit(3);
      
      console.log(`Loaded ${recentBlogPosts.length} recent blog posts for homepage`);
      
      if (recentBlogPosts.length > 0) {
        console.log('First blog post:', {
          title: recentBlogPosts[0].title,
          slug: recentBlogPosts[0].slug,
          hasCategory: !!recentBlogPosts[0].category
        });
      }
      
      res.render('home/index', {
        title: 'Homepage',
        featuredProducts,
        newArrivals,
        bestsellers,
        categories,
        banners,
        recentBlogPosts
      });
    } catch (error) {
      console.error('Error loading homepage:', error);
      res.status(500).render('500', { title: '500 - Server Error' });
    }
  }
  
  // About us page
  async getAboutPage(req, res) {
    try {
      res.render('home/about', {
        title: 'About Us'
      });
    } catch (error) {
      console.error('Error loading about page:', error);
      res.status(500).render('500', { title: '500 - Server Error' });
    }
  }
  
  // Contact page
  async getContactPage(req, res) {
    try {
      res.render('home/contact', {
        title: 'Contact Us'
      });
    } catch (error) {
      console.error('Error loading contact page:', error);
      res.status(500).render('500', { title: '500 - Server Error' });
    }
  }
  
  // Terms and conditions page
  async getTermsPage(req, res) {
    try {
      res.render('home/terms', {
        title: 'Terms and Conditions'
      });
    } catch (error) {
      console.error('Error loading terms page:', error);
      res.status(500).render('500', { title: '500 - Server Error' });
    }
  }
  
  // Privacy policy page
  async getPrivacyPage(req, res) {
    try {
      res.render('home/privacy', {
        title: 'Privacy Policy'
      });
    } catch (error) {
      console.error('Error loading privacy page:', error);
      res.status(500).render('500', { title: '500 - Server Error' });
    }
  }
}

module.exports = new HomeController();