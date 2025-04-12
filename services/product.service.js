const Product = require('../models/product.model');
const Category = require('../models/category.model');
const appConfig = require('../config/app.config');

class ProductService {
  // Get all products with optional filtering
  async getAllProducts(query = {}, page = 1, limit = appConfig.perPage) {
    try {
      const skip = (page - 1) * limit;
      const filter = {};
      
      // Apply category filter if provided
      if (query.category) {
        filter.category = query.category;
      }
      
      // Apply viral filter if provided
      if (query.isViral) {
        filter.isViral = true;
      }
      
      // Apply hot filter if provided
      if (query.isHot) {
        filter.isHot = true;
      }
      
      // Apply top rated filter if provided
      if (query.isTopRated) {
        filter.isTopRated = true;
      }
      
      // Apply featured filter if provided
      if (query.isFeatured) {
        filter.isFeatured = true;
      }
      
      // Apply search filter if provided
      if (query.search) {
        filter.$or = [
          { name: { $regex: query.search, $options: 'i' } },
          { description: { $regex: query.search, $options: 'i' } }
        ];
      }
      
      const products = await Product.find(filter)
        .populate('category')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
      
      const total = await Product.countDocuments(filter);
      
      return {
        products,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        total
      };
    } catch (error) {
      throw error;
    }
  }
  
  // Get viral products
  async getViralProducts(limit = 10) {
    try {
      return await Product.find({ isViral: true })
        .populate('category')
        .sort({ views: -1 })
        .limit(limit);
    } catch (error) {
      throw error;
    }
  }
  
  // Get hot products
  async getHotProducts(limit = 10) {
    try {
      return await Product.find({ isHot: true })
        .populate('category')
        .sort({ createdAt: -1 })
        .limit(limit);
    } catch (error) {
      throw error;
    }
  }
  
  // Get top rated products
  async getTopRatedProducts(limit = 10) {
    try {
      return await Product.find({ isTopRated: true })
        .populate('category')
        .sort({ ratings: -1 })
        .limit(limit);
    } catch (error) {
      throw error;
    }
  }
  
  // Get products by category
  async getProductsByCategory(categoryId, page = 1, limit = appConfig.perPage) {
    try {
      const skip = (page - 1) * limit;
      
      const products = await Product.find({ category: categoryId })
        .populate('category')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
      
      const total = await Product.countDocuments({ category: categoryId });
      
      return {
        products,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        total
      };
    } catch (error) {
      throw error;
    }
  }
  
  // Get single product by ID
  async getProductById(id) {
    try {
      const product = await Product.findById(id).populate('category');
      
      // If product doesn't have commissionSources, generate them based on commission
      if (product && product.commission && (!product.commissionSources || product.commissionSources.length === 0)) {
        // Default breakdown: 40% TikTok, 60% iBooming Cashback
        const totalCommissionAmount = product.price * (product.commission / 100);
        const tiktokAmount = totalCommissionAmount * 0.4;
        const iboominAmount = totalCommissionAmount * 0.6;
        
        product.commissionSources = [
          {
            name: 'TikTok Komisi',
            amount: tiktokAmount,
            rate: 10,
            icon: 'fab fa-tiktok'
          },
          {
            name: 'iBooming Cashback',
            amount: iboominAmount,
            rate: 1.66,
            icon: 'fas fa-circle'
          }
        ];
        
        product.totalCommission = totalCommissionAmount;
        
        // Save the updated product
        await product.save();
      }
      
      return product;
    } catch (error) {
      throw error;
    }
  }

  async incrementViewCount(productId) {
    try {
      // Update product to increment view count by 1
      return await Product.findByIdAndUpdate(
        productId,
        { $inc: { viewCount: 1 } },
        { new: true }
      );
    } catch (error) {
      console.error('Error incrementing view count:', error);
      throw error;
    }
  }
  
}

module.exports = new ProductService();