// routes/blog.routes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const blogController = require('../controllers/blog.controller');
const { isAuth, isAdmin } = require('../middlewares/auth.middleware');

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/blog/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'blog-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif|webp/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    
    cb(new Error('Only image files are allowed!'));
  }
});

// Public routes
router.get('/', blogController.getAllPosts);
router.get('/post/:slug', blogController.getPost);
router.get('/api/recent-posts', blogController.getRecentPostsAPI);

// Admin routes - both pattern styles for compatibility
router.get('/admin/blog/add', isAdmin, blogController.getAddPost);
router.post('/admin/blog/add', isAdmin, upload.single('thumbnail'), blogController.postAddPost);


// API routes
router.get('/api/recent-posts', blogController.getRecentPostsAPI);

// Image upload endpoint for TinyMCE
router.post('/admin/upload-image', isAdmin, upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const location = `/uploads/blog/${req.file.filename}`;
    res.json({ location });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ error: 'Image upload failed' });
  }
});

module.exports = router;