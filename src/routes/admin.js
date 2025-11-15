// src/routes/admin.js
const express = require('express');
const router = express.Router();

// Import controllers
const authController = require('../controllers/admin/authController');
const dashboardController = require('../controllers/admin/dashboardController');
const productController = require('../controllers/admin/productController');
const categoryController = require('../controllers/admin/categoryController');
const bannerController = require('../controllers/admin/bannerController');
const customerController = require('../controllers/admin/customerController');
const orderController = require('../controllers/admin/orderController');
const NewsletterController = require('../controllers/admin/NewsletterController');
const categoryFeatureController = require('../controllers/admin/categoryFeatureController');
const productFeatureController = require('../controllers/admin/productFeatureController');


// -------------------------------
// DEBUG LOGGER (optional - remove in production)
// -------------------------------
router.use((req, res, next) => {
  // runs for all /admin/* requests
  // console.log(`[ADMIN ROUTES] ${req.method} ${req.originalUrl} session.admin=${!!(req.session && req.session.admin)}`);
  next();
});


// ===============================
//  ADMIN AUTH MIDDLEWARE (whitelist-safe)
// ===============================
const requireAdmin = (req, res, next) => {
  // mounted at /admin so req.path will be like '/login', '/logout', '/'
  const publicPaths = ['/login', '/logout']; // add other public admin paths here if needed
  if (publicPaths.includes(req.path)) return next();

  if (req.session && req.session.admin && req.session.admin.id) {
    return next();
  }

  req.flash('error_msg', 'Please log in to access the admin panel');
  return res.redirect('/admin/login');
};


// ===============================
//  PUBLIC ROUTES (no admin auth required)
// ===============================
router.get('/login', authController.showLogin);
router.post('/login', authController.login);

// Optionally a GET logout and POST logout - depends on your implementation
router.get('/logout', authController.logout);
router.post('/logout', authController.logout);


// ===============================
//  PROTECT ALL ROUTES BELOW
// ===============================
router.use(requireAdmin);


// Dashboard
router.get('/', dashboardController.index);
router.get('/dashboard', dashboardController.index);


// -------------------------------
// PRODUCTS
// -------------------------------
router.get('/products', productController.index);
router.get('/products/create', productController.create);
router.post('/products', productController.store);
router.get('/products/:id', productController.show);
router.get('/products/:id/edit', productController.edit);
router.post('/products/:id', productController.update);
router.post('/products/:id/delete', productController.destroy);

// -------------------------------
// CATEGORIES
// -------------------------------
router.get('/categories', categoryController.index);
router.get('/categories/create', categoryController.create);
router.post('/categories', categoryController.store);
router.get('/categories/:id', categoryController.show);
router.get('/categories/:id/edit', categoryController.edit);
router.post('/categories/:id', categoryController.update);
router.post('/categories/:id/delete', categoryController.destroy);

// -------------------------------
// BANNERS
// -------------------------------
router.get('/banners', bannerController.index);
router.get('/banners/create', bannerController.create);
router.post('/banners', bannerController.store);
router.get('/banners/:id', bannerController.show);
router.get('/banners/:id/edit', bannerController.edit);
router.post('/banners/:id', bannerController.update);
router.post('/banners/:id/delete', bannerController.destroy);

// -------------------------------
// CUSTOMERS
// -------------------------------
router.get('/customers', customerController.index);
router.get('/customers/:id', customerController.show);
router.get('/customers/:id/edit', customerController.edit);
router.post('/customers/:id', customerController.update);
router.post('/customers/:id/delete', customerController.destroy);

// -------------------------------
// ORDERS
// -------------------------------
router.get('/orders', orderController.index);
router.get('/orders/:id', orderController.show);
router.get('/orders/:id/edit', orderController.edit);
router.post('/orders/:id', orderController.update);
router.post('/orders/:id/delete', orderController.destroy);

// -------------------------------
// NEWSLETTER
// -------------------------------
router.get('/newsletter', NewsletterController.index);
router.post('/newsletter/:id/delete', NewsletterController.destroy);

// -------------------------------
// CATEGORY FEATURES
// -------------------------------
router.get('/category-features', categoryFeatureController.index);
router.get('/category-features/create', categoryFeatureController.create);
router.post('/category-features', categoryFeatureController.store);
router.get('/category-features/:id', categoryFeatureController.show);
router.get('/category-features/:id/edit', categoryFeatureController.edit);
router.post('/category-features/:id', categoryFeatureController.update);
router.post('/category-features/:id/delete', categoryFeatureController.destroy);

// -------------------------------
// PRODUCT FEATURES
// -------------------------------
router.get('/product-features', productFeatureController.index);
router.get('/product-features/create', productFeatureController.create);
router.post('/product-features', productFeatureController.store);
router.get('/product-features/:id', productFeatureController.show);
router.get('/product-features/:id/edit', productFeatureController.edit);
router.post('/product-features/:id', productFeatureController.update);
router.post('/product-features/:id/delete', productFeatureController.destroy);


module.exports = router;
