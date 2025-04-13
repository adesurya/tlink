// File: controllers/product.controller.js

const mongoose = require('mongoose');
const productService = require('../services/product.service');
const affiliateService = require('../services/affiliate.service');
const Category = require('../models/category.model');
const { formatCurrency, truncateText } = require('../utils/helpers');
const wishlistService = require('../services/wishlist.service');

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
        query: req.query,
        req: req
      });
    } catch (error) {
      console.error('Error fetching products:', error);
      res.status(500).render('500', { title: '500 - Server Error' });
    }
  }
  
  async getProductDetail(req, res) {
    try {
      const productId = req.params.id;
      const product = await productService.getProductById(productId);
      
      if (!product) {
        return res.status(404).render('404', { title: '404 - Product Not Found' });
      }
      
      // Increment view count
      await productService.incrementViewCount(productId);
      
      // Check if product is in user's wishlist
      let isInWishlist = false;
      if (req.session.user) {
        try {
          isInWishlist = await wishlistService.isProductInWishlist(req.session.user.id, productId);
        } catch (err) {
          console.error('Error checking wishlist:', err);
        }
      }
      
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
      
      // Base URL for images and links
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      const currentPath = req.originalUrl;
      
      // Prepare metadata for SEO and social sharing
      // Generate clean description (remove HTML tags, limit length)
      const cleanDescription = product.description.replace(/<\/?[^>]+(>|$)/g, "").substring(0, 160);
      
      // Generate keywords from tags and category
      let keywords = [];
      if (product.tags && product.tags.length > 0) {
        keywords = [...product.tags];
      }
      if (product.category && product.category.name) {
        keywords.push(product.category.name);
      }
      keywords.push('affiliate', 'komisi', 'produk');
      
      // Canonical URL
      const canonicalUrl = `${baseUrl}/products/${product._id}`;
      
      // Prepare JSON-LD structured data
      const priceFormatted = product.discountPrice > 0 ? 
        `${product.discountPrice.toLocaleString('id-ID')}` : 
        `${product.price.toLocaleString('id-ID')}`;
      
      const structuredData = JSON.stringify({
        "@context": "https://schema.org/",
        "@type": "Product",
        "name": product.name,
        "image": [
          `${baseUrl}${product.image}`,
          ...(product.images || []).map(img => `${baseUrl}${img}`)
        ],
        "description": cleanDescription,
        "brand": {
          "@type": "Brand",
          "name": "Taplink SIJAGO AI"
        },
        "offers": {
          "@type": "Offer",
          "url": canonicalUrl,
          "priceCurrency": "IDR",
          "price": product.discountPrice > 0 ? product.discountPrice : product.price,
          "priceValidUntil": new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
          "availability": "https://schema.org/InStock"
        }
      });
      
      res.render('products/detail', {
        title: product.name,
        product: formattedProduct,
        relatedProducts: formattedRelatedProducts,
        isInWishlist,
        user: req.session.user,
        baseUrl, // Pass baseUrl to template
        currentPath, // Pass currentPath to template
        
        // SEO metadata
        metaDescription: cleanDescription,
        metaKeywords: keywords.join(', '),
        canonicalUrl,
        
        // OpenGraph metadata
        ogTitle: product.name,
        ogDescription: cleanDescription,
        ogType: 'product',
        ogUrl: canonicalUrl,
        ogImage: `${baseUrl}${product.image}`,
        
        // Twitter Card metadata
        twitterTitle: product.name,
        twitterDescription: cleanDescription,
        twitterImage: `${baseUrl}${product.image}`,
        
        // Structured data
        structuredData: structuredData
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
      if (req.session.user && req.session.user.id) {
        affiliateService.trackAffiliateClick(productId, req.session.user.id);
      }
      
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
      // Ambil parameter dari URL
      const categoryParam = req.params.id;
      const page = parseInt(req.query.page) || 1;
      
      // Coba cari kategori berdasarkan ID atau slug
      let category;
      
      // Cek jika parameter adalah ObjectId valid
      if (mongoose.Types.ObjectId.isValid(categoryParam)) {
        category = await Category.findById(categoryParam);
      } else {
        // Jika bukan ObjectId valid, coba cari berdasarkan slug
        category = await Category.findOne({ slug: categoryParam });
      }
      
      if (!category) {
        return res.status(404).render('404', { title: '404 - Category Not Found' });
      }
      
      const { products, currentPage, totalPages, total } = await productService.getProductsByCategory(category._id, page);
      const categories = await Category.find({ isActive: true }).sort({ displayOrder: 1 });
      
      res.render('products/category', {
        title: `${category.name} Products`,
        category,
        products,
        categories,
        currentPage,
        totalPages,
        total,
        req: req,
        user: req.session.user
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
        categories,
        req: req,
        user: req.session.user
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
        categories,
        req: req,
        user: req.session.user
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
        categories,
        req: req,
        user: req.session.user
      });
    } catch (error) {
      console.error('Error fetching top rated products:', error);
      res.status(500).render('500', { title: '500 - Server Error' });
    }
  }
}

module.exports = new ProductController();