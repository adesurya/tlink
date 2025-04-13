// controllers/sitemap.controller.js

const path = require('path');
const fs = require('fs');
const { generateSitemap } = require('../utils/sitemap-generator');

class SitemapController {
  // Serve sitemap.xml file
  async getSitemap(req, res) {
    try {
      const sitemapPath = path.join(__dirname, '../public/sitemap.xml');
      
      // Check if sitemap exists
      if (fs.existsSync(sitemapPath)) {
        res.header('Content-Type', 'application/xml');
        return res.sendFile(sitemapPath);
      }
      
      // Generate sitemap if it doesn't exist
      const success = await generateSitemap();
      
      if (success) {
        res.header('Content-Type', 'application/xml');
        return res.sendFile(sitemapPath);
      } else {
        throw new Error('Failed to generate sitemap');
      }
    } catch (error) {
      console.error('Error serving sitemap:', error);
      res.status(500).send('Error generating sitemap');
    }
  }
  
  // Admin function to manually regenerate sitemap
  async regenerateSitemap(req, res) {
    try {
      // Check if user is admin
      if (!req.session.user || req.session.user.role !== 'admin') {
        req.flash('error', 'Unauthorized access');
        return res.redirect('/admin/dashboard');
      }
      
      const success = await generateSitemap();
      
      if (success) {
        req.flash('success', 'Sitemap berhasil di-regenerate');
      } else {
        req.flash('error', 'Gagal me-regenerate sitemap');
      }
      
      res.redirect('/admin/dashboard');
    } catch (error) {
      console.error('Error regenerating sitemap:', error);
      req.flash('error', 'Terjadi kesalahan saat me-regenerate sitemap');
      res.redirect('/admin/dashboard');
    }
  }
}

module.exports = new SitemapController();