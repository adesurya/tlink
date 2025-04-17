// Create file at: scripts/setup-sitemap.js

const fs = require('fs');
const path = require('path');

// Create initial robots.txt
function createRobotsTxt() {
  const robotsPath = path.join(__dirname, '../public/robots.txt');
  
  // Check if robots.txt already exists
  if (fs.existsSync(robotsPath)) {
    console.log('robots.txt already exists, skipping creation');
    return;
  }
  
  // Content for robots.txt
  const robotsContent = `# robots.txt for TapLink SIJAGO AI

User-agent: *
Allow: /
Allow: /products/
Allow: /products/category/
Allow: /categories/
Allow: /products/viral
Allow: /products/hot
Allow: /products/top-rated

# Disallow admin and auth pages
Disallow: /admin/
Disallow: /auth/
Disallow: /user/

# Disallow search results pages
Disallow: /products?*
Disallow: /products/?*

# Sitemap location
Sitemap: ${process.env.BASE_URL || 'https://yourdomain.com'}/sitemap.xml
`;

  // Write robots.txt
  try {
    fs.writeFileSync(robotsPath, robotsContent);
    console.log('Created robots.txt successfully');
  } catch (error) {
    console.error('Error creating robots.txt:', error);
  }
}

// Create empty sitemap.xml
function createEmptySitemap() {
  const sitemapPath = path.join(__dirname, '../public/sitemap.xml');
  
  // Check if sitemap.xml already exists
  if (fs.existsSync(sitemapPath)) {
    console.log('sitemap.xml already exists, skipping creation');
    return;
  }
  
  // Content for initial sitemap.xml
  const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${process.env.BASE_URL || 'https://yourdomain.com'}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`;

  // Write sitemap.xml
  try {
    fs.writeFileSync(sitemapPath, sitemapContent);
    console.log('Created initial sitemap.xml successfully');
  } catch (error) {
    console.error('Error creating sitemap.xml:', error);
  }
}

// Run setup
console.log('Setting up SEO files...');
createRobotsTxt();
createEmptySitemap();
console.log('SEO files setup complete');