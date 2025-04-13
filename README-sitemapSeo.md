# Sitemap & Robots.txt Implementation Guide for TapLink

This guide explains how to implement and maintain the sitemap.xml and robots.txt files in your TapLink application.

## File Locations and Structure

### 1. Static Files
- `/public/robots.txt` - The robots file that guides search engine crawlers
- `/public/sitemap.xml` - The XML sitemap file listing all your pages

### 2. Supporting Scripts
- `/utils/sitemap-generator.js` - Core functionality for generating the sitemap
- `/scripts/update-sitemap.js` - Standalone script to manually update the sitemap
- `/scripts/cron.js` - Scheduled task to automatically update the sitemap daily
- `/scripts/setup-sitemap.js` - Initial setup script that runs once at installation

### 3. Controller and Routes
- `/controllers/sitemap.controller.js` - Controller with methods to serve and regenerate the sitemap
- Route additions in your app.js or route files

## Installation Steps

1. **Install Required Dependencies**
   ```bash
   npm install node-cron --save
   ```

2. **Create the New Files**
   Copy all the provided scripts to their appropriate locations in your project structure.

3. **Update Package.json**
   Add the new scripts to your package.json:
   ```json
   "scripts": {
     // ... your existing scripts
     "sitemap": "node scripts/update-sitemap.js",
     "cron": "node scripts/cron.js",
     "postinstall": "node scripts/setup-sitemap.js"
   }
   ```

4. **Update App.js**
   Add the route handlers to your application:
   ```javascript
   // In app.js or routes/index.routes.js
   const sitemapController = require('./controllers/sitemap.controller');
   router.get('/sitemap.xml', sitemapController.getSitemap);
   
   // If using admin regeneration feature, add this to admin routes
   router.get('/admin/regenerate-sitemap', isAdmin, sitemapController.regenerateSitemap);
   ```

5. **Setup Environment Variable**
   Make sure your `.env` file has the BASE_URL variable:
   ```
   BASE_URL=https://your-domain.com
   ```

6. **Run Initial Setup**
   ```bash
   npm run postinstall
   ```

7. **Generate First Sitemap**
   ```bash
   npm run sitemap
   ```

## Usage

### Manual Sitemap Generation
To manually generate the sitemap (helpful after adding many new products):
```bash
npm run sitemap
```

### Automatic Updates
To run the cron job that automatically updates the sitemap daily:
```bash
npm run cron
```

In production, you should set up this cron job to run continuously. You can do this:

1. **Using a Process Manager** (recommended)
   If you're using PM2:
   ```bash
   pm2 start scripts/cron.js --name "sitemap-cron"
   ```

2. **Using Server Cron**
   Alternatively, set up a system cron job:
   ```
   0 0 * * * cd /path/to/your/app && node scripts/update-sitemap.js
   ```

### Admin Interface
If you've added the admin route, administrators can trigger a sitemap regeneration by visiting:
```
/admin/regenerate-sitemap
```

## Maintenance

### Updating robots.txt
If you need to change your robots.txt rules:
1. Edit the file directly at `/public/robots.txt`
2. OR Update the template in `scripts/setup-sitemap.js` for future installations

### Customizing the Sitemap
To change which pages are included or their priorities:
1. Edit the `generateSitemap` function in `/utils/sitemap-generator.js`

## Troubleshooting

### Sitemap Not Generating
1. Check MongoDB connection
2. Verify write permissions to the public directory
3. Look for errors in the console

### Robots.txt Not Being Served
1. Make sure the file exists in the public directory
2. Verify the static file serving is configured correctly in Express

### Wrong URLs in Sitemap
1. Check your BASE_URL environment variable
2. Verify the URL generation in the sitemap generator

## Best Practices

1. **Keep It Updated**: Regenerate your sitemap when adding new content
2. **Validate Your Sitemap**: Use tools like [XML Sitemap Validator](https://www.xml-sitemaps.com/validate-xml-sitemap.html)
3. **Submit to Search Engines**: Submit your sitemap URL to Google Search Console and Bing Webmaster Tools
4. **Monitor Crawling**: Use Google Search Console to see if there are any crawling issues

Following this guide will ensure your TapLink application has proper sitemap.xml and robots.txt files that help search engines discover and index your content effectively.