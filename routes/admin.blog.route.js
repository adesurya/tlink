// routes/admin.blog.route.js - Admin blog routes
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const blogController = require('../controllers/blog.controller');
const { isAuth, isAdmin } = require('../middlewares/auth.middleware');

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Create directory if it doesn't exist
    const fs = require('fs');
    const dir = 'public/uploads/blog';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
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

// Admin blog management routes
router.get('/', isAdmin, blogController.getAdminPosts);
router.get('/add', isAdmin, blogController.getAddPost);
router.post('/add', isAdmin, upload.single('thumbnail'), blogController.postAddPost);
router.get('/edit/:id', isAdmin, blogController.getEditPost);
router.post('/edit/:id', isAdmin, upload.single('thumbnail'), blogController.postEditPost);
router.get('/delete/:id', isAdmin, blogController.deletePost);

// Image upload endpoint for TinyMCE
router.post('/upload-image', isAdmin, upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    // Return the URL to the uploaded file
    const location = `/uploads/blog/${req.file.filename}`;
    res.json({ location });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ error: 'Image upload failed' });
  }
});

module.exports = router;