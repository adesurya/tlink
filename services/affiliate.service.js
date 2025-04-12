const appConfig = require('../config/app.config');
const User = require('../models/user.model');

class AffiliateService {
    // Generate affiliate link
    generateAffiliateLink(productId, userId) {
      return `${appConfig.affiliateBaseUrl}?product=${productId}&affiliate=${userId}`;
    }
    
    // Track affiliate click
    async trackAffiliateClick(productId, userId = null) {
      try {
        // In a real application, you would log this click to a database
        console.log(`Affiliate link clicked for product ${productId} by user ${userId || 'anonymous'}`);
        
        // Get user information if userId is provided
        let affiliateCode = 'DIRECT';
        
        if (userId) {
          const user = await User.findById(userId);
          if (user && user.affiliateCode) {
            affiliateCode = user.affiliateCode;
          }
        }
        
        // Here you would typically save this info to a database
        const clickData = {
          productId,
          userId,
          affiliateCode,
          timestamp: new Date(),
          ip: '127.0.0.1', // In a real app, you'd get this from request
          userAgent: 'Sample User Agent' // In a real app, you'd get this from request
        };
        
        console.log('Click data:', clickData);
        
        // For now, we'll just return success
        return {
          success: true,
          clickData
        };
      } catch (error) {
        console.error('Error tracking affiliate click:', error);
        return {
          success: false,
          error: 'Failed to track click'
        };
      }
    }
    
    // Calculate commission
    calculateCommission(productPrice, commissionRate) {
      return (productPrice * commissionRate) / 100;
    }
  }

module.exports = new AffiliateService();