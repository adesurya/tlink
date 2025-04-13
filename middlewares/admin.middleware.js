// Di middlewares/admin.middleware.js (buat file baru)
const adminMiddleware = (req, res, next) => {
    if (req.session.user) {
      res.locals.currentUser = req.session.user;
    }
    next();
  };
  
  module.exports = adminMiddleware;