// controllers/wishlist.controller.js
const wishlistService = require('../services/wishlist.service');
const { formatCurrency } = require('../utils/helpers');

class WishlistController {
  // Get user's wishlist page
  async getWishlist(req, res) {
    try {
      if (!req.session.user) {
        req.flash('error', 'Anda harus login terlebih dahulu');
        return res.redirect('/auth/login');
      }
      
      const wishlist = await wishlistService.getUserWishlist(req.session.user.id);
      
      res.render('user/wishlist', {
        title: 'Produk Tersimpan',
        wishlist,
        formatCurrency,
        error: req.flash('error'),
        success: req.flash('success')
      });
    } catch (error) {
      console.error('Error loading wishlist:', error);
      req.flash('error', 'Terjadi kesalahan saat memuat daftar produk tersimpan');
      res.redirect('/');
    }
  }
  
  // Add product to wishlist (AJAX)
  async addToWishlist(req, res) {
    try {
      const productId = req.params.id;
      
      if (!req.session.user) {
        return res.status(401).json({
          success: false,
          message: 'Anda harus login terlebih dahulu'
        });
      }
      
      await wishlistService.addToWishlist(req.session.user.id, productId);
      
      res.json({
        success: true,
        message: 'Produk berhasil disimpan'
      });
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat menyimpan produk'
      });
    }
  }
  
  // Remove product from wishlist (AJAX)
  async removeFromWishlist(req, res) {
    try {
      const productId = req.params.id;
      
      if (!req.session.user) {
        return res.status(401).json({
          success: false,
          message: 'Anda harus login terlebih dahulu'
        });
      }
      
      await wishlistService.removeFromWishlist(req.session.user.id, productId);
      
      res.json({
        success: true,
        message: 'Produk berhasil dihapus dari daftar tersimpan'
      });
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat menghapus produk dari daftar tersimpan'
      });
    }
  }
  
  // Add product to wishlist (non-AJAX fallback)
  async addToWishlistRedirect(req, res) {
    try {
      const productId = req.params.id;
      const returnTo = req.query.returnTo || '/products/' + productId;
      
      if (!req.session.user) {
        req.flash('error', 'Anda harus login terlebih dahulu');
        return res.redirect('/auth/login?returnTo=' + encodeURIComponent(returnTo));
      }
      
      await wishlistService.addToWishlist(req.session.user.id, productId);
      
      req.flash('success', 'Produk berhasil disimpan');
      res.redirect(returnTo);
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      req.flash('error', 'Terjadi kesalahan saat menyimpan produk');
      res.redirect('/products/' + req.params.id);
    }
  }
  
  // Remove product from wishlist (non-AJAX fallback)
  async removeFromWishlistRedirect(req, res) {
    try {
      const productId = req.params.id;
      const returnTo = req.query.returnTo || '/user/wishlist';
      
      if (!req.session.user) {
        req.flash('error', 'Anda harus login terlebih dahulu');
        return res.redirect('/auth/login');
      }
      
      await wishlistService.removeFromWishlist(req.session.user.id, productId);
      
      req.flash('success', 'Produk berhasil dihapus dari daftar tersimpan');
      res.redirect(returnTo);
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      req.flash('error', 'Terjadi kesalahan saat menghapus produk dari daftar tersimpan');
      res.redirect('/user/wishlist');
    }
  }
}

module.exports = new WishlistController();