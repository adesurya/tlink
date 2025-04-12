// Middleware to check if user is authenticated
const isAuth = (req, res, next) => {
    if (!req.session.user) {
      // Store the requested URL for redirecting after login
      req.session.returnTo = req.originalUrl;
      req.flash('error', 'Anda harus login terlebih dahulu');
      return res.redirect('/auth/login');
    }
    next();
  };
  
  // Middleware to check if user is admin
  const isAdmin = (req, res, next) => {
    if (!req.session.user) {
      req.session.returnTo = req.originalUrl;
      req.flash('error', 'Anda harus login terlebih dahulu');
      return res.redirect('/auth/login');
    }
    
    if (req.session.user.role !== 'admin') {
      req.flash('error', 'Anda tidak memiliki akses');
      return res.redirect('/');
    }
    
    next();
  };
  
  // Middleware to set user variable in views
  const setUser = (req, res, next) => {
    res.locals.user = req.session.user || null;
    next();
  };
  
  module.exports = {
    isAuth,
    isAdmin,
    setUser
  };