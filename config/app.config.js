module.exports = {
    appName: 'taplink',
    appDescription: 'Portal produk affiliate SIJAGO AI',
    sessionSecret: process.env.SESSION_SECRET || 'taplinksijagoai-secret-key',
    affiliateBaseUrl: process.env.AFFILIATE_BASE_URL || 'https://taplink.sijago.ai',
    perPage: 12
  };