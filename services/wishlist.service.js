// services/wishlist.service.js
const Wishlist = require('../models/wishlist.model');
const Product = require('../models/product.model');

class WishlistService {
  // Get user's wishlist
  async getUserWishlist(userId) {
    try {
      let wishlist = await Wishlist.findOne({ user: userId }).populate({
        path: 'products',
        populate: {
          path: 'category'
        }
      });
      
      if (!wishlist) {
        // Create a new wishlist if none exists
        wishlist = new Wishlist({
          user: userId,
          products: []
        });
        await wishlist.save();
      }
      
      return wishlist;
    } catch (error) {
      console.error('Error getting user wishlist:', error);
      throw error;
    }
  }
  
  // Add product to wishlist
  async addToWishlist(userId, productId) {
    try {
      // Check if product exists
      const product = await Product.findById(productId);
      if (!product) {
        throw new Error('Product not found');
      }
      
      // Find user's wishlist or create a new one
      let wishlist = await Wishlist.findOne({ user: userId });
      
      if (!wishlist) {
        wishlist = new Wishlist({
          user: userId,
          products: [productId]
        });
      } else {
        // Check if product is already in wishlist
        if (!wishlist.products.includes(productId)) {
          wishlist.products.push(productId);
        }
      }
      
      await wishlist.save();
      return wishlist;
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      throw error;
    }
  }
  
  // Remove product from wishlist
  async removeFromWishlist(userId, productId) {
    try {
      const wishlist = await Wishlist.findOne({ user: userId });
      
      if (!wishlist) {
        throw new Error('Wishlist not found');
      }
      
      // Remove product from wishlist
      wishlist.products = wishlist.products.filter(
        product => product.toString() !== productId.toString()
      );
      
      await wishlist.save();
      return wishlist;
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      throw error;
    }
  }
  
  // Check if product is in wishlist
  async isProductInWishlist(userId, productId) {
    try {
      const wishlist = await Wishlist.findOne({ user: userId });
      
      if (!wishlist) {
        return false;
      }
      
      return wishlist.products.some(
        product => product.toString() === productId.toString()
      );
    } catch (error) {
      console.error('Error checking wishlist:', error);
      throw error;
    }
  }
}

module.exports = new WishlistService();