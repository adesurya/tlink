// controllers/blog.controller.js
const BlogPost = require('../models/blog.model');
const Category = require('../models/category.model');
const Product = require('../models/product.model');
const { slugify } = require('../utils/helpers');

class BlogController {
  // Get all blog posts (public)
  async getAllPosts(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;
      const category = req.query.category;
      const tag = req.query.tag;
      
      const filter = { isPublished: true };
      
      // Filter by category if provided
      if (category) {
        filter.category = category;
      }
      
      // Filter by tag if provided
      if (tag) {
        filter.tags = tag;
      }
      
      const totalPosts = await BlogPost.countDocuments(filter);
      const posts = await BlogPost.find(filter)
        .populate('category')
        .populate('author', 'username fullName')
        .sort({ publishedAt: -1 })
        .skip(skip)
        .limit(limit);
      
      // Get all categories for the sidebar
      const categories = await Category.find({ isActive: true }).sort({ displayOrder: 1 });
      
      // Get recent posts for sidebar
      const recentPosts = await BlogPost.find({ isPublished: true })
        .sort({ publishedAt: -1 })
        .limit(5);
      
      // Determine if user is admin
      let isAdmin = false;
      if (req.session && req.session.user) {
        isAdmin = req.session.user.isAdmin === true;
      }
      
      if (req.query.format === 'json') {
        return res.json({
          success: true,
          posts,
          currentPage: page,
          totalPages: Math.ceil(totalPosts / limit),
          totalPosts
        });
      }
      
      // Get popular tags
      const allPosts = await BlogPost.find({ isPublished: true }).select('tags');
      const tagMap = {};
      
      allPosts.forEach(post => {
        if (post.tags && post.tags.length > 0) {
          post.tags.forEach(tag => {
            if (tagMap[tag]) {
              tagMap[tag]++;
            } else {
              tagMap[tag] = 1;
            }
          });
        }
      });
      
      // Convert to array and sort by count
      const popularTags = Object.keys(tagMap)
        .map(name => ({ name, count: tagMap[name] }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10); // Get top 10 tags
      
      res.render('blog/index', {
        title: 'Product Reviews Blog',
        posts,
        categories,
        recentPosts,
        popularTags,
        currentPage: page,
        totalPages: Math.ceil(totalPosts / limit),
        totalPosts,
        currentCategory: category,
        currentTag: tag,
        isAdmin: isAdmin,
        baseUrl: `${req.protocol}://${req.get('host')}`
      });
    } catch (error) {
      console.error('Error fetching blog posts:', error);
      res.status(500).render('500', { title: '500 - Server Error' });
    }
  }
  
  // Get single blog post (public)
  async getPost(req, res) {
    try {
      const slug = req.params.slug;
      const post = await BlogPost.findOne({ slug, isPublished: true })
        .populate('category')
        .populate('author', 'username fullName')
        .populate('relatedProducts');
      
      if (!post) {
        return res.status(404).render('404', { title: '404 - Post Not Found' });
      }
      
      // Increment view count
      post.viewCount += 1;
      await post.save();
      
      // Get categories for sidebar
      const categories = await Category.find({ isActive: true }).sort({ displayOrder: 1 });
      
      // Get related posts in the same category
      const relatedPosts = await BlogPost.find({
        category: post.category._id,
        _id: { $ne: post._id },
        isPublished: true
      })
        .sort({ publishedAt: -1 })
        .limit(4);
      
      // Determine if user is admin
      const isAdmin = req.session && req.session.user && req.session.user.isAdmin === true;
      
      res.render('blog/post', {
        title: post.title,
        post,
        categories,
        relatedPosts,
        isAdmin: isAdmin,
        baseUrl: `${req.protocol}://${req.get('host')}`
      });
    } catch (error) {
      console.error('Error fetching blog post:', error);
      res.status(500).render('500', { title: '500 - Server Error' });
    }
  }
  
  // Admin: Get all blog posts
  async getAdminPosts(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = 10;
      const skip = (page - 1) * limit;
      
      const totalPosts = await BlogPost.countDocuments();
      const posts = await BlogPost.find()
        .populate('category')
        .populate('author', 'username')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
      
      res.render('admin/blog/index', {
        title: 'Manage Blog Posts',
        posts,
        currentPage: page,
        totalPages: Math.ceil(totalPosts / limit),
        totalPosts,
        success: req.flash('success'),
        error: req.flash('error')
      });
    } catch (error) {
      console.error('Error fetching admin blog posts:', error);
      req.flash('error', 'Failed to load blog posts');
      res.redirect('/admin/dashboard');
    }
  }
  
  // Admin: Add blog post form
  async getAddPost(req, res) {
    try {
      console.log('Loading add post form');
      const categories = await Category.find().sort({ name: 1 });
      const products = await Product.find().select('_id name category price discountPrice image').sort({ name: 1 }).populate('category');
      
      console.log('Categories loaded:', categories.length);
      console.log('Products loaded:', products.length);
      
      res.render('admin/blog/add', {
        title: 'Add New Blog Post',
        categories,
        products,
        error: req.flash('error'),
        success: req.flash('success')
      });
    } catch (error) {
      console.error('Error loading add blog post form:', error);
      req.flash('error', 'Failed to load form: ' + error.message);
      res.redirect('/admin/blog');
    }
  }
  
  // Admin: Add blog post process
  async postAddPost(req, res) {
    try {
      console.log('Received form submission for new post');
      
      const {
        title, content, summary, category, tags,
        relatedProducts, isPublished
      } = req.body;
      
      console.log('Form data:', { 
        title, 
        categoryId: category,
        hasRelatedProducts: !!relatedProducts,
        isPublished: isPublished === 'on'
      });
      
      if (!title) {
        req.flash('error', 'Title is required');
        return res.redirect('/admin/blog/add');
      }
      
      // Generate slug from title
      const slug = slugify(title);
      
      // Check if slug already exists
      const existingPost = await BlogPost.findOne({ slug });
      
      if (existingPost) {
        req.flash('error', 'A post with this title already exists');
        return res.redirect('/admin/blog/add');
      }
      
      // Handle thumbnail upload
      let thumbnail = '/images/blog/default.jpg';
      if (req.file) {
        thumbnail = `/uploads/blog/${req.file.filename}`;
        console.log('Uploaded thumbnail:', thumbnail);
      }
      
      // Make sure the user is logged in and has an ID
      if (!req.session || !req.session.user || !req.session.user.id) {
        console.log('User session missing or invalid');
        req.flash('error', 'User authentication required');
        return res.redirect('/admin/blog/add');
      }
      
      // Convert relatedProducts to array if it's a single value
      let relatedProductsArray = [];
      if (relatedProducts) {
        relatedProductsArray = Array.isArray(relatedProducts) ? relatedProducts : [relatedProducts];
      }
      
      // Create new blog post
      const blogPost = new BlogPost({
        title,
        slug,
        content,
        summary: summary || undefined, // Use undefined to trigger auto-generation in pre-save hook
        thumbnail,
        category,
        tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
        relatedProducts: relatedProductsArray,
        author: req.session.user.id,
        isPublished: isPublished === 'on',
        publishedAt: isPublished === 'on' ? Date.now() : null,
        viewCount: 0
      });
      
      await blogPost.save();
      console.log('Blog post created successfully:', blogPost._id);
      
      req.flash('success', 'Blog post created successfully');
      res.redirect('/admin/blog');
    } catch (error) {
      console.error('Error adding blog post:', error);
      req.flash('error', 'Failed to create blog post: ' + error.message);
      res.redirect('/admin/blog/add');
    }
  }
  
  // Admin: Edit blog post form
  async getEditPost(req, res) {
    try {
      const postId = req.params.id;
      const post = await BlogPost.findById(postId);
      
      if (!post) {
        req.flash('error', 'Blog post not found');
        return res.redirect('/admin/blog');
      }
      
      const categories = await Category.find().sort({ name: 1 });
      const products = await Product.find().select('_id name category price discountPrice image').sort({ name: 1 }).populate('category');
      
      res.render('admin/blog/edit', {
        title: 'Edit Blog Post',
        post,
        categories,
        products,
        error: req.flash('error'),
        success: req.flash('success')
      });
    } catch (error) {
      console.error('Error loading edit blog post form:', error);
      req.flash('error', 'Failed to load edit form: ' + error.message);
      res.redirect('/admin/blog');
    }
  }
  
  // Admin: Edit blog post process
  async postEditPost(req, res) {
    try {
      const postId = req.params.id;
      const {
        title, content, summary, category, tags,
        relatedProducts, isPublished
      } = req.body;
      
      // Find post
      const post = await BlogPost.findById(postId);
      
      if (!post) {
        req.flash('error', 'Blog post not found');
        return res.redirect('/admin/blog');
      }
      
      // Generate new slug if title changed
      let slug = post.slug;
      if (title !== post.title) {
        slug = slugify(title);
        
        // Check if new slug already exists (excluding this post)
        const existingPost = await BlogPost.findOne({ 
          slug, 
          _id: { $ne: postId } 
        });
        
        if (existingPost) {
          req.flash('error', 'A post with this title already exists');
          return res.redirect(`/admin/blog/edit/${postId}`);
        }
      }
      
      // Handle thumbnail upload
      if (req.file) {
        post.thumbnail = `/uploads/blog/${req.file.filename}`;
      }
      
      // Convert relatedProducts to array if it's a single value
      let relatedProductsArray = [];
      if (relatedProducts) {
        relatedProductsArray = Array.isArray(relatedProducts) ? relatedProducts : [relatedProducts];
      }
      
      // Update post
      post.title = title;
      post.slug = slug;
      post.content = content;
      post.summary = summary || null; // null will trigger auto-generation in pre-save hook
      post.category = category;
      post.tags = tags ? tags.split(',').map(tag => tag.trim()) : [];
      post.relatedProducts = relatedProductsArray;
      
      // Handle publishing status change
      const wasPublished = post.isPublished;
      post.isPublished = isPublished === 'on';
      
      // Set publishedAt date if publishing for the first time
      if (!wasPublished && post.isPublished) {
        post.publishedAt = Date.now();
      }
      
      await post.save();
      console.log('Blog post updated successfully:', post._id);
      
      req.flash('success', 'Blog post updated successfully');
      res.redirect('/admin/blog');
    } catch (error) {
      console.error('Error updating blog post:', error);
      req.flash('error', 'Failed to update blog post: ' + error.message);
      res.redirect(`/admin/blog/edit/${req.params.id}`);
    }
  }
  
  // Admin: Delete blog post
  async deletePost(req, res) {
    try {
      const postId = req.params.id;
      
      const result = await BlogPost.findByIdAndDelete(postId);
      if (!result) {
        req.flash('error', 'Blog post not found');
        return res.redirect('/admin/blog');
      }
      
      console.log('Blog post deleted successfully:', postId);
      req.flash('success', 'Blog post deleted successfully');
      res.redirect('/admin/blog');
    } catch (error) {
      console.error('Error deleting blog post:', error);
      req.flash('error', 'Failed to delete blog post: ' + error.message);
      res.redirect('/admin/blog');
    }
  }
  
  // API: Get recent blog posts for homepage
  async getRecentPostsAPI(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 10;
      
      const posts = await BlogPost.find({ isPublished: true })
        .populate('category')
        .sort({ publishedAt: -1 })
        .limit(limit);
      
      res.json({
        success: true,
        data: posts
      });
    } catch (error) {
      console.error('Error fetching recent posts API:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch recent posts'
      });
    }
  }
  
  // Get recent blog posts for homepage section
  async getRecentPosts(req, res, next) {
    try {
      const limit = 10; // Showing 10 posts in the homepage section
      
      const posts = await BlogPost.find({ isPublished: true })
        .populate('category')
        .sort({ publishedAt: -1 })
        .limit(limit);
      
      // Add posts to res.locals to make them available in the template
      res.locals.recentBlogPosts = posts;
      next();
    } catch (error) {
      console.error('Error fetching recent posts for homepage:', error);
      // Continue to next middleware even if there's an error
      res.locals.recentBlogPosts = [];
      next();
    }
  }
}

module.exports = new BlogController();