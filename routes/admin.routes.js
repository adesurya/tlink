const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const adminController = require('../controllers/admin.controller');
const { isAdmin } = require('../middlewares/auth.middleware');

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    
    cb(new Error('Only image files are allowed!'));
  }
});

// Apply admin middleware to all routes
router.use(isAdmin);

// Dashboard routes
router.get('/dashboard', adminController.getDashboard);

// Product routes
router.get('/products', adminController.getProducts);
router.get('/products/add', adminController.getAddProduct);
router.post('/products/add', upload.single('image'), adminController.postAddProduct);
router.get('/products/edit/:id', adminController.getEditProduct);
router.post('/products/edit/:id', upload.single('image'), adminController.postEditProduct);
router.get('/products/delete/:id', adminController.deleteProduct);

// Category routes
router.get('/categories', adminController.getCategories);
router.get('/categories/add', adminController.getAddCategory);
router.post('/categories/add', adminController.postAddCategory);
router.get('/categories/edit/:id', adminController.getEditCategory);
router.post('/categories/edit/:id', adminController.postEditCategory);
router.get('/categories/delete/:id', adminController.deleteCategory);

// User routes
router.get('/users', adminController.getUsers);
router.get('/users/add', adminController.getAddUser);
router.post('/users/add', adminController.postAddUser);
router.get('/users/edit/:id', adminController.getEditUser);
router.post('/users/edit/:id', adminController.postEditUser);
router.get('/users/delete/:id', adminController.deleteUser);

module.exports = router;