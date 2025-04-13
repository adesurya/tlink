const Product = require('../models/product.model');
const Category = require('../models/category.model');
const User = require('../models/user.model');
const { formatCurrency } = require('../utils/helpers');

class AdminController {
  // Dashboard
  async getDashboard(req, res) {
    try {
      // Count statistics
      const totalProducts = await Product.countDocuments();
      const totalCategories = await Category.countDocuments();
      const totalUsers = await User.countDocuments();
      const totalAdmins = await User.countDocuments({ role: 'admin' });
      
      // Get latest products
      const latestProducts = await Product.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('category');
      
      // Get latest users
      const latestUsers = await User.find()
        .sort({ createdAt: -1 })
        .limit(5);
      
        res.render('admin/dashboard', {
            title: 'Admin Dashboard',
            totalProducts,
            totalCategories,
            totalUsers,
            totalAdmins,
            latestProducts,
            latestUsers,
            formatCurrency,
            user: req.session.user,  // Pastikan selalu mengirim objek user
            currentUser: req.session.user, // Untuk template yang mengharapkan currentUser
            error: req.flash('error'),
            success: req.flash('success')
          });
        } catch (error) {
          console.error('Error loading admin dashboard:', error);
          req.flash('error', 'Terjadi kesalahan saat memuat dashboard');
          res.redirect('/');
        }
    }
  
  // Product Management
  async getProducts(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = 10;
      const skip = (page - 1) * limit;
      
      const totalProducts = await Product.countDocuments();
      const products = await Product.find()
        .populate('category')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
      
      res.render('admin/products/index', {
        title: 'Manage Products',
        products,
        currentPage: page,
        totalPages: Math.ceil(totalProducts / limit),
        totalProducts,
        formatCurrency,
        // Tambahkan nilai default untuk flash message
        success: req.flash('success'),
        error: req.flash('error')
      });
    } catch (error) {
      console.error('Error loading admin products:', error);
      req.flash('error', 'Terjadi kesalahan saat memuat daftar produk');
      res.redirect('/admin/dashboard');
    }
  }
  
  // Add Product Form
  async getAddProduct(req, res) {
    try {
      const categories = await Category.find().sort({ name: 1 });
      
      res.render('admin/products/add', {
        title: 'Add New Product',
        categories,
        product: {},
        error: req.flash('error'),
        success: req.flash('success')
      });
    } catch (error) {
      console.error('Error loading add product form:', error);
      req.flash('error', 'Terjadi kesalahan saat memuat form tambah produk');
      res.redirect('/admin/products');
    }
  }
  

  // Update postAddProduct method
  async postAddProduct(req, res) {
    try {
      const {
        name, description, price, discountPrice, 
        commission, category, affiliateLink, 
        isViral, isHot, isTopRated, isFeatured, highCommission,
        tags, detailInformation
      } = req.body;
      
      // Get specifications from form
      const specLabels = req.body['specLabel[]'] || [];
      const specValues = req.body['specValue[]'] || [];
      const specifications = [];
      
      // Convert to arrays if they're not already
      const labelsArray = Array.isArray(specLabels) ? specLabels : [specLabels];
      const valuesArray = Array.isArray(specValues) ? specValues : [specValues];
      
      // Create specifications array
      labelsArray.forEach((label, index) => {
        if (label.trim() && valuesArray[index] && valuesArray[index].trim()) {
          specifications.push({
            label: label.trim(),
            value: valuesArray[index].trim()
          });
        }
      });
      
      // Get how to use steps
      const howToUseSteps = req.body['howToUse[]'] || [];
      const howToUse = Array.isArray(howToUseSteps) 
        ? howToUseSteps.filter(step => step.trim())
        : howToUseSteps.trim() ? [howToUseSteps] : [];
      
      // Handle main image upload
      let image = '/images/products/default.jpg';
      if (req.files && req.files.image && req.files.image.length > 0) {
        image = `/uploads/${req.files.image[0].filename}`;
      }
      
      // Handle additional images
      let additionalImages = [];
      if (req.files && req.files.additionalImages) {
        additionalImages = req.files.additionalImages.map(file => `/uploads/${file.filename}`);
      }
      
      // Calculate commission sources
      const totalCommission = parseFloat(commission);
      const tiktokCommission = totalCommission * 0.4;
      const iboominCashback = totalCommission * 0.6;
      
      // Create new product
      const product = new Product({
        name,
        description,
        price: parseFloat(price),
        discountPrice: parseFloat(discountPrice) || 0,
        commission: parseFloat(commission),
        highCommission: highCommission === 'on',
        commissionSources: [
          {
            name: 'TikTok Komisi',
            amount: tiktokCommission,
            rate: 10,
            icon: 'fab fa-tiktok'
          },
          {
            name: 'iBooming Cashback',
            amount: iboominCashback,
            rate: 1.66,
            icon: 'fas fa-circle'
          }
        ],
        totalCommission: totalCommission,
        category,
        image,
        images: additionalImages,
        affiliateLink,
        isViral: isViral === 'on',
        isHot: isHot === 'on',
        isTopRated: isTopRated === 'on',
        isFeatured: isFeatured === 'on',
        tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
        detailInformation, // Add detail information
        specifications,    // Add specifications
        howToUse           // Add how to use steps
      });
      
      await product.save();
      
      req.flash('success', 'Produk berhasil ditambahkan');
      res.redirect('/admin/products');
    } catch (error) {
      console.error('Error adding product:', error);
      req.flash('error', 'Terjadi kesalahan saat menambahkan produk');
      res.redirect('/admin/products/add');
    }
  }

  // Update postEditProduct method
  async postEditProduct(req, res) {
    try {
      const productId = req.params.id;
      const {
        name, description, price, discountPrice, 
        commission, category, affiliateLink, 
        isViral, isHot, isTopRated, isFeatured, highCommission,
        tags, detailInformation
      } = req.body;
      
      // Find product
      const product = await Product.findById(productId);
      
      if (!product) {
        req.flash('error', 'Produk tidak ditemukan');
        return res.redirect('/admin/products');
      }
      
      // Get specifications from form
      const specLabels = req.body['specLabel[]'] || [];
      const specValues = req.body['specValue[]'] || [];
      const specifications = [];
      
      // Convert to arrays if they're not already
      const labelsArray = Array.isArray(specLabels) ? specLabels : [specLabels];
      const valuesArray = Array.isArray(specValues) ? specValues : [specValues];
      
      // Create specifications array
      labelsArray.forEach((label, index) => {
        if (label.trim() && valuesArray[index] && valuesArray[index].trim()) {
          specifications.push({
            label: label.trim(),
            value: valuesArray[index].trim()
          });
        }
      });
      
      // Get how to use steps
      const howToUseSteps = req.body['howToUse[]'] || [];
      const howToUse = Array.isArray(howToUseSteps) 
        ? howToUseSteps.filter(step => step.trim())
        : howToUseSteps.trim() ? [howToUseSteps] : [];
      
      // Handle main image upload
      if (req.files && req.files.image && req.files.image.length > 0) {
        product.image = `/uploads/${req.files.image[0].filename}`;
      }
      
      // Handle existing images (remove deleted ones)
      const existingImages = req.body['existingImages[]'] || [];
      const deleteImages = req.body['deleteImages[]'] || [];
      
      // Convert to arrays if they're not already
      const existingImagesArray = Array.isArray(existingImages) ? existingImages : [existingImages];
      const deleteImagesArray = Array.isArray(deleteImages) ? deleteImages : [deleteImages];
      
      // Filter out images marked for deletion
      const remainingImages = product.images.filter(img => 
        !deleteImagesArray.includes(img) && existingImagesArray.includes(img)
      );
      
      // Handle new additional images
      const newAdditionalImages = [];
      if (req.files && req.files.additionalImages) {
        newAdditionalImages.push(...req.files.additionalImages.map(file => `/uploads/${file.filename}`));
      }
      
      // Combine remaining images with new ones
      product.images = [...remainingImages, ...newAdditionalImages];
      
      // Calculate commission sources
      const totalCommission = parseFloat(commission);
      const tiktokCommission = totalCommission * 0.4;
      const iboominCashback = totalCommission * 0.6;
      
      // Update product
      product.name = name;
      product.description = description;
      product.price = parseFloat(price);
      product.discountPrice = parseFloat(discountPrice) || 0;
      product.commission = parseFloat(commission);
      product.highCommission = highCommission === 'on';
      product.commissionSources = [
        {
          name: 'TikTok Komisi',
          amount: tiktokCommission,
          rate: 10,
          icon: 'fab fa-tiktok'
        },
        {
          name: 'iBooming Cashback',
          amount: iboominCashback,
          rate: 1.66,
          icon: 'fas fa-circle'
        }
      ];
      product.totalCommission = totalCommission;
      product.category = category;
      product.affiliateLink = affiliateLink;
      product.isViral = isViral === 'on';
      product.isHot = isHot === 'on';
      product.isTopRated = isTopRated === 'on';
      product.isFeatured = isFeatured === 'on';
      product.tags = tags ? tags.split(',').map(tag => tag.trim()) : [];
      product.detailInformation = detailInformation; // Update detail information
      product.specifications = specifications;       // Update specifications
      product.howToUse = howToUse;                  // Update how to use steps
      product.updatedAt = Date.now();
      
      console.log('Saving product with details:', {
        detailInformation: product.detailInformation,
        specifications: product.specifications,
        howToUse: product.howToUse
      });
      
      await product.save();
      
      req.flash('success', 'Produk berhasil diperbarui');
      res.redirect('/admin/products');
    } catch (error) {
      console.error('Error updating product:', error);
      req.flash('error', 'Terjadi kesalahan saat memperbarui produk');
      res.redirect(`/admin/products/edit/${req.params.id}`);
    }
  }
  
  // Edit Product Form
  async getEditProduct(req, res) {
    try {
      const productId = req.params.id;
      const product = await Product.findById(productId);
      
      if (!product) {
        req.flash('error', 'Produk tidak ditemukan');
        return res.redirect('/admin/products');
      }
      
      const categories = await Category.find().sort({ name: 1 });
      
      res.render('admin/products/edit', {
        title: 'Edit Product',
        product,
        categories,
        error: req.flash('error'),
        success: req.flash('success')
      });
    } catch (error) {
      console.error('Error loading edit product form:', error);
      req.flash('error', 'Terjadi kesalahan saat memuat form edit produk');
      res.redirect('/admin/products');
    }
  }
  
  
  // Delete Product
  async deleteProduct(req, res) {
    try {
      const productId = req.params.id;
      
      await Product.findByIdAndDelete(productId);
      
      req.flash('success', 'Produk berhasil dihapus');
      res.redirect('/admin/products');
    } catch (error) {
      console.error('Error deleting product:', error);
      req.flash('error', 'Terjadi kesalahan saat menghapus produk');
      res.redirect('/admin/products');
    }
  }
  
  // Category Management
  async getCategories(req, res) {
    try {
      const categories = await Category.find().sort({ displayOrder: 1 });
      
      res.render('admin/categories/index', {
        title: 'Manage Categories',
        categories,
        error: req.flash('error'),
        success: req.flash('success')
      });
    } catch (error) {
      console.error('Error loading admin categories:', error);
      req.flash('error', 'Terjadi kesalahan saat memuat daftar kategori');
      res.redirect('/admin/dashboard');
    }
  }
  
  // Add Category Form
  async getAddCategory(req, res) {
    res.render('admin/categories/add', {
      title: 'Add New Category',
      category: {},
      error: req.flash('error'),
      success: req.flash('success')
    });
  }
  
  // Add Category Process
  async postAddCategory(req, res) {
    try {
      const { name, description, icon, displayOrder } = req.body;
      
      // Generate slug
      const slug = name.toLowerCase().replace(/\s+/g, '-');
      
      // Check if slug already exists
      const existingCategory = await Category.findOne({ slug });
      
      if (existingCategory) {
        req.flash('error', 'Kategori dengan nama yang sama sudah ada');
        return res.redirect('/admin/categories/add');
      }
      
      // Create new category
      const category = new Category({
        name,
        slug,
        description,
        icon,
        displayOrder: parseInt(displayOrder) || 0
      });
      
      await category.save();
      
      req.flash('success', 'Kategori berhasil ditambahkan');
      res.redirect('/admin/categories');
    } catch (error) {
      console.error('Error adding category:', error);
      req.flash('error', 'Terjadi kesalahan saat menambahkan kategori');
      res.redirect('/admin/categories/add');
    }
  }
  
  // Edit Category Form
  async getEditCategory(req, res) {
    try {
      const categoryId = req.params.id;
      const category = await Category.findById(categoryId);
      
      if (!category) {
        req.flash('error', 'Kategori tidak ditemukan');
        return res.redirect('/admin/categories');
      }
      
      res.render('admin/categories/edit', {
        title: 'Edit Category',
        category,
        error: req.flash('error'),
        success: req.flash('success')
      });
    } catch (error) {
      console.error('Error loading edit category form:', error);
      req.flash('error', 'Terjadi kesalahan saat memuat form edit kategori');
      res.redirect('/admin/categories');
    }
  }
  
  // Edit Category Process
  async postEditCategory(req, res) {
    try {
      const categoryId = req.params.id;
      const { name, description, icon, displayOrder, isActive } = req.body;
      
      // Find category
      const category = await Category.findById(categoryId);
      
      if (!category) {
        req.flash('error', 'Kategori tidak ditemukan');
        return res.redirect('/admin/categories');
      }
      
      // Generate slug
      const slug = name.toLowerCase().replace(/\s+/g, '-');
      
      // Check if slug already exists (excluding this category)
      const existingCategory = await Category.findOne({ 
        slug, 
        _id: { $ne: categoryId } 
      });
      
      if (existingCategory) {
        req.flash('error', 'Kategori dengan nama yang sama sudah ada');
        return res.redirect(`/admin/categories/edit/${categoryId}`);
      }
      
      // Update category
      category.name = name;
      category.slug = slug;
      category.description = description;
      category.icon = icon;
      category.displayOrder = parseInt(displayOrder) || 0;
      category.isActive = isActive === 'on';
      category.updatedAt = Date.now();
      
      await category.save();
      
      req.flash('success', 'Kategori berhasil diperbarui');
      res.redirect('/admin/categories');
    } catch (error) {
      console.error('Error updating category:', error);
      req.flash('error', 'Terjadi kesalahan saat memperbarui kategori');
      res.redirect(`/admin/categories/edit/${req.params.id}`);
    }
  }
  
  // Delete Category
  async deleteCategory(req, res) {
    try {
      const categoryId = req.params.id;
      
      // Check if category is used in products
      const productsWithCategory = await Product.countDocuments({ category: categoryId });
      
      if (productsWithCategory > 0) {
        req.flash('error', `Kategori tidak dapat dihapus karena digunakan oleh ${productsWithCategory} produk`);
        return res.redirect('/admin/categories');
      }
      
      await Category.findByIdAndDelete(categoryId);
      
      req.flash('success', 'Kategori berhasil dihapus');
      res.redirect('/admin/categories');
    } catch (error) {
      console.error('Error deleting category:', error);
      req.flash('error', 'Terjadi kesalahan saat menghapus kategori');
      res.redirect('/admin/categories');
    }
  }
  
  // User Management
  async getUsers(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = 10;
      const skip = (page - 1) * limit;
      
      const totalUsers = await User.countDocuments();
      const users = await User.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
      
      res.render('admin/users/index', {
        title: 'Manage Users',
        users,
        currentPage: page,
        totalPages: Math.ceil(totalUsers / limit),
        totalUsers,
        currentUser: req.session.user, // Tambahkan ini
        error: req.flash('error'),
        success: req.flash('success')
      });
    } catch (error) {
      console.error('Error loading admin users:', error);
      req.flash('error', 'Terjadi kesalahan saat memuat daftar pengguna');
      res.redirect('/admin/dashboard');
    }
  }
  
  // Add User Form
  async getAddUser(req, res) {
    res.render('admin/users/add', {
      title: 'Add New User',
      user: {},
      error: req.flash('error'),
      success: req.flash('success')
    });
  }
  
  // Add User Process
  async postAddUser(req, res) {
    try {
      const {
        username, email, password, fullName,
        phone, role
      } = req.body;
      
      // Check if email already exists
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        req.flash('error', 'Email sudah digunakan');
        return res.redirect('/admin/users/add');
      }
      
      // Check if username already exists
      const usernameExists = await User.findOne({ username });
      if (usernameExists) {
        req.flash('error', 'Username sudah digunakan');
        return res.redirect('/admin/users/add');
      }
      
      // Create new user
      const user = new User({
        username,
        email,
        password,
        fullName,
        phone,
        role: role || 'user'
      });
      
      // Generate affiliate code
      user.affiliateCode = user.generateAffiliateCode();
      
      await user.save();
      
      req.flash('success', 'Pengguna berhasil ditambahkan');
      res.redirect('/admin/users');
    } catch (error) {
      console.error('Error adding user:', error);
      req.flash('error', 'Terjadi kesalahan saat menambahkan pengguna');
      res.redirect('/admin/users/add');
    }
  }
  
  // Edit User Form
  async getEditUser(req, res) {
    try {
      const userId = req.params.id;
      const user = await User.findById(userId);
      
      if (!user) {
        req.flash('error', 'Pengguna tidak ditemukan');
        return res.redirect('/admin/users');
      }
      
      res.render('admin/users/edit', {
        title: 'Edit User',
        user,
        error: req.flash('error'),
        success: req.flash('success')
      });
    } catch (error) {
      console.error('Error loading edit user form:', error);
      req.flash('error', 'Terjadi kesalahan saat memuat form edit pengguna');
      res.redirect('/admin/users');
    }
  }
  
  // Edit User Process
  async postEditUser(req, res) {
    try {
      const userId = req.params.id;
      const {
        fullName, phone, role, isActive
      } = req.body;
      
      // Find user
      const user = await User.findById(userId);
      
      if (!user) {
        req.flash('error', 'Pengguna tidak ditemukan');
        return res.redirect('/admin/users');
      }
      
      // Update user
      user.fullName = fullName;
      user.phone = phone;
      user.role = role || 'user';
      user.isActive = isActive === 'on';
      user.updatedAt = Date.now();
      
      // Handle password change
      if (req.body.password && req.body.password.trim() !== '') {
        user.password = req.body.password;
      }
      
      await user.save();
      
      req.flash('success', 'Pengguna berhasil diperbarui');
      res.redirect('/admin/users');
    } catch (error) {
      console.error('Error updating user:', error);
      req.flash('error', 'Terjadi kesalahan saat memperbarui pengguna');
      res.redirect(`/admin/users/edit/${req.params.id}`);
    }
  }
  
  // Delete User
  async deleteUser(req, res) {
    try {
      const userId = req.params.id;
      
      // Prevent self-deletion
      if (userId === req.session.user.id) {
        req.flash('error', 'Anda tidak dapat menghapus akun Anda sendiri');
        return res.redirect('/admin/users');
      }
      
      await User.findByIdAndDelete(userId);
      
      req.flash('success', 'Pengguna berhasil dihapus');
      res.redirect('/admin/users');
    } catch (error) {
      console.error('Error deleting user:', error);
      req.flash('error', 'Terjadi kesalahan saat menghapus pengguna');
      res.redirect('/admin/users');
    }
  }
}

module.exports = new AdminController();