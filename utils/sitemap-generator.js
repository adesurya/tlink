// Create file at: utils/sitemap-generator.js

const fs = require('fs');
const path = require('path');
const Product = require('../models/product.model');
const Category = require('../models/category.model');

// Base URL of your website
const BASE_URL = process.env.BASE_URL || 'https://yourdomain.com';

/**
 * Generate sitemap.xml file with dynamic content
 */
async function generateSitemap() {
  try {
    console.log('Starting sitemap generation...');
    
    // Fetch all products
    const products = await Product.find()
      .select('_id updatedAt')
      .lean();
    
    // Fetch all categories
    const categories = await Category.find({ isActive: true })
      .select('slug updatedAt')
      .lean();
    
    // Start XML content
    let xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Static pages -->
  <url>
    <loc>${BASE_URL}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${BASE_URL}/products</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${BASE_URL}/products/viral</loc>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${BASE_URL}/products/hot</loc>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${BASE_URL}/products/top-rated</loc>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
`;
    
    // Add categories
    if (categories && categories.length > 0) {
      xmlContent += `\n  <!-- Categories -->\n`;
      
      categories.forEach(category => {
        const lastmod = category.updatedAt ? 
          new Date(category.updatedAt).toISOString().split('T')[0] : 
          new Date().toISOString().split('T')[0];
          
        xmlContent += `  <url>
    <loc>${BASE_URL}/products/category/${category.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>\n`;
      });
    }
    
    // Add products
    if (products && products.length > 0) {
      xmlContent += `\n  <!-- Products -->\n`;
      
      products.forEach(product => {
        const lastmod = product.updatedAt ? 
          new Date(product.updatedAt).toISOString().split('T')[0] : 
          new Date().toISOString().split('T')[0];
          
        xmlContent += `  <url>
    <loc>${BASE_URL}/products/${product._id}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>\n`;
      });
    }
    
    // Close XML content
    xmlContent += `</urlset>`;
    
    // Write to file
    const filePath = path.join(__dirname, '../public/sitemap.xml');
    fs.writeFileSync(filePath, xmlContent);
    
    console.log(`Sitemap generated successfully at ${filePath}`);
    return true;
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return false;
  }
}

module.exports = {
  generateSitemap
};