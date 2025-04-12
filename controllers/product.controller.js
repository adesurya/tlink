const productService = require('../services/product.service');
const affiliateService = require('../services/affiliate.service');
const Category = require('../models/category.model');
const { formatCurrency, truncateText } = require('../utils/helpers');

class ProductController {
  // Display all products page
  async getAllProducts(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const { products, currentPage, totalPages, total } = await productService.getAllProducts(req.query, page);
      const categories = await Category.find({ isActive: true }).sort({ displayOrder: 1 });
      
      res.render('products/index', {
        title: 'All Products',
        products,
        categories,
        currentPage,
        totalPages,
        total,
        query: req.query
      });
    } catch (error) {
      console.error('Error fetching products:', error);
      res.status(500).render('500', { title: '500 - Server Error' });
    }
  }
  
  // Display single product page
  async getProductDetail(req, res) {
    try {
      const productId = req.params.id;
      const product = await productService.getProductById(productId);
      
      if (!product) {
        return res.status(404).render('404', { title: '404 - Product Not Found' });
      }
      
      // Increment view count
      await productService.incrementViewCount(productId);
      
      // Format commission for display
      const formattedProduct = {
        ...product.toObject(),
        formattedTotalCommission: formatCurrency(product.totalCommission),
        commissionSources: product.commissionSources.map(source => ({
          ...source,
          formattedAmount: formatCurrency(source.amount)
        }))
      };
      
      // Get related products
      const relatedProducts = await productService.getAllProducts({
        category: product.category._id,
        _id: { $ne: product._id }
      }, 1, 4);
      
      // Format related products with commission info
      const formattedRelatedProducts = relatedProducts.products.map(relProd => ({
        ...relProd.toObject(),
        formattedCommission: formatCurrency(relProd.commission)
      }));
      
      res.render('products/detail', {
        title: product.name,
        product: formattedProduct,
        relatedProducts: formattedRelatedProducts
      });
    } catch (error) {
      console.error('Error fetching product details:', error);
      res.status(500).render('500', { title: '500 - Server Error' });
    }
  }
  
  // Handle affiliate link click
  async handleAffiliateClick(req, res) {
    try {
      const productId = req.params.id;
      const product = await productService.getProductById(productId);
      
      if (!product) {
        return res.status(404).redirect('/products');
      }
      
      // Track the click with user info from session
      affiliateService.trackAffiliateClick(productId, req.session.user.id);
      
      // Redirect to the affiliate link
      res.redirect(product.affiliateLink);
    } catch (error) {
      console.error('Error handling affiliate click:', error);
      res.status(500).render('500', { title: '500 - Server Error' });
    }
  }
  
  // Display category products
  async getCategoryProducts(req, res) {
    try {
      const categoryId = req.params.id;
      const page = parseInt(req.query.page) || 1;
      
      const category = await Category.findById(categoryId);
      
      if (!category) {
        return res.status(404).render('404', { title: '404 - Category Not Found' });
      }
      
      const { products, currentPage, totalPages, total } = await productService.getProductsByCategory(categoryId, page);
      const categories = await Category.find({ isActive: true }).sort({ displayOrder: 1 });
      
      res.render('products/category', {
        title: `${category.name} Products`,
        category,
        products,
        categories,
        currentPage,
        totalPages,
        total
      });
    } catch (error) {
      console.error('Error fetching category products:', error);
      res.status(500).render('500', { title: '500 - Server Error' });
    }
  }
  
  // Display viral products
  async getViralProducts(req, res) {
    try {
      const viralProducts = await productService.getViralProducts();
      const categories = await Category.find({ isActive: true }).sort({ displayOrder: 1 });
      
      res.render('products/viral', {
        title: 'Viral Products',
        products: viralProducts,
        categories
      });
    } catch (error) {
      console.error('Error fetching viral products:', error);
      res.status(500).render('500', { title: '500 - Server Error' });
    }
  }
  
  // Display hot products
  async getHotProducts(req, res) {
    try {
      const hotProducts = await productService.getHotProducts();
      const categories = await Category.find({ isActive: true }).sort({ displayOrder: 1 });
      
      res.render('products/hot', {
        title: 'Hot Products',
        products: hotProducts,
        categories
      });
    } catch (error) {
      console.error('Error fetching hot products:', error);
      res.status(500).render('500', { title: '500 - Server Error' });
    }
  }
  
  // Display top rated products
  async getTopRatedProducts(req, res) {
    try {
      const topRatedProducts = await productService.getTopRatedProducts();
      const categories = await Category.find({ isActive: true }).sort({ displayOrder: 1 });
      
      res.render('products/top-rated', {
        title: 'Top Rated Products',
        products: topRatedProducts,
        categories
      });
    } catch (error) {
      console.error('Error fetching top rated products:', error);
      res.status(500).render('500', { title: '500 - Server Error' });
    }
  }
}

module.exports = new ProductController();