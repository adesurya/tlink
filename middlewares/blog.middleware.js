// middlewares/blog.middleware.js
const BlogPost = require('../models/blog.model');

// Middleware to fetch recent blog posts for all pages
const fetchRecentBlogPosts = async (req, res, next) => {
  try {
    if (!res.locals.recentBlogPosts) {
      const recentBlogPosts = await BlogPost.find({ isPublished: true })
        .populate('category')
        .sort({ publishedAt: -1 })
        .limit(3);
      
      res.locals.recentBlogPosts = recentBlogPosts;
      console.log(`Middleware loaded ${recentBlogPosts.length} recent blog posts`);
    }
    
    next();
  } catch (error) {
    console.error('Error fetching recent blog posts in middleware:', error);
    // Continue to next middleware even if there's an error
    res.locals.recentBlogPosts = [];
    next();
  }
};

module.exports = {
  fetchRecentBlogPosts
};