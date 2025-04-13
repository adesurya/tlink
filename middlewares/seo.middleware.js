// middlewares/seo.middleware.js

/**
 * Middleware to add base URL and other SEO-related variables to all responses
 */
const seoMiddleware = (req, res, next) => {
  // Add baseUrl to all responses
  res.locals.baseUrl = `${req.protocol}://${req.get('host')}`;
  res.locals.currentPath = req.originalUrl;
  
  // Default SEO values
  res.locals.metaDescription = 'Portal produk affiliate SIJAGO AI dengan komisi tinggi. Temukan produk viral, hot, dan top-rated untuk meningkatkan penghasilan Anda.';
  res.locals.metaKeywords = 'affiliate, taplink, sijago, komisi, produk viral';
  res.locals.canonicalUrl = `${res.locals.baseUrl}${req.originalUrl}`;
  
  // Default OpenGraph values
  res.locals.ogTitle = 'Taplink SIJAGO AI';
  res.locals.ogDescription = res.locals.metaDescription;
  res.locals.ogType = 'website';
  res.locals.ogUrl = res.locals.canonicalUrl;
  res.locals.ogImage = `${res.locals.baseUrl}/images/taplink-share-default.jpg`;
  
  // Default Twitter Card values
  res.locals.twitterTitle = res.locals.ogTitle;
  res.locals.twitterDescription = res.locals.ogDescription;
  res.locals.twitterImage = res.locals.ogImage;
  
  next();
};

module.exports = seoMiddleware;