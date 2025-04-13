
require('dotenv').config();
const express = require('express');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');
const session = require('express-session');
const flash = require('connect-flash');
const morgan = require('morgan');
const mongoose = require('mongoose');


// Import routes
const indexRoutes = require('./routes/index.routes');
const productRoutes = require('./routes/product.routes');
const categoryRoutes = require('./routes/category.routes');
const authRoutes = require('./routes/auth.routes.js');
const adminRoutes = require('./routes/admin.routes');
const userRoutes = require('./routes/user.routes');
const seoMiddleware = require('./middlewares/seo.middleware');

// Import config
const dbConfig = require('./config/db.config');
const appConfig = require('./config/app.config');

// Import middlewares
const { setUser } = require('./middlewares/auth.middleware');

// Initialize app
const app = express();

// Connect to MongoDB
mongoose.connect(dbConfig.mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB Connected'))
.catch(err => console.log('MongoDB Connection Error: ', err));

// Middleware
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(seoMiddleware);

app.use(session({
    secret: appConfig.sessionSecret,
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 // 1 day
    }
  }));

// Flash messages
app.use(flash());
app.use((req, res, next) => {
  // Otomatis sediakan flash messages ke semua view
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
});
// Set user in locals
app.use(setUser);

// Set view engine
app.use(expressLayouts);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('layout', 'layouts/main');

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/', indexRoutes);
app.use('/products', productRoutes);
app.use('/categories', categoryRoutes);
app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);
app.use('/user', userRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).render('404', { title: '404 - Page Not Found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('500', { title: '500 - Server Error' });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;