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

// Middleware to check if admin is logged in
const requireAuth = (req, res, next) => {
    if (req.session.user && req.session.user.role) {
        return next();
    }
    req.flash('error_msg', 'Please log in to access this page');
    res.redirect('/admin/login');
};
router.get('testing', (req, res) => {
    res.send('Admin route is working');
});
// Public routes (no authentication required)
router.get('/login', authController.showLogin);
router.post('/login', authController.login);
router.post('/logout', authController.logout);

// Protected routes (authentication required)
router.use(requireAuth);

// Dashboard
router.get('/', dashboardController.index);
router.get('/dashboard', dashboardController.index);

// Product routes
router.get('/products', productController.index);
router.get('/products/create', productController.create);
router.post('/products', productController.store);
router.get('/products/:id', productController.show);
router.get('/products/:id/edit', productController.edit);
router.post('/products/:id', productController.update);
router.post('/products/:id', productController.destroy);

// Category routes
router.get('/categories', categoryController.index);
router.get('/categories/create', categoryController.create);
router.post('/categories', categoryController.store);
router.get('/categories/:id', categoryController.show);
router.get('/categories/:id/edit', categoryController.edit);
router.post('/categories/:id', categoryController.update);
router.post('/categories/:id', categoryController.destroy);

// Banner routes
router.get('/banners', bannerController.index);
router.get('/banners/create', bannerController.create);
router.post('/banners', bannerController.store);
router.get('/banners/:id', bannerController.show);
router.get('/banners/:id/edit', bannerController.edit);
router.post('/banners/:id', bannerController.update);
router.post('/banners/:id', bannerController.destroy);

// Customer routes
router.get('/customers', customerController.index);
router.get('/customers/:id', customerController.show);
router.get('/customers/:id/edit', customerController.edit);
router.post('/customers/:id', customerController.update);
router.post('/customers/:id', customerController.destroy);

// order routes

router.get('/orders', orderController.index);
router.get('/orders/:id', orderController.show);
router.get('/orders/:id/edit', orderController.edit);
router.post('/orders/:id', orderController.update);
router.post('/orders/:id/', orderController.destroy);

// Newsletter routes
router.get('/newsletter', NewsletterController.index);
router.post('/newsletter/:id', NewsletterController.destroy);



module.exports = router;
