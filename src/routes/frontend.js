// src/routes/index.js (your existing file — updated)
const express = require('express');
const router = express.Router();

const homeController = require('../controllers/frontend/homeController');
const newsletterController = require('../controllers/admin/NewsletterController');
const categoryController = require('../controllers/frontend/categoryController');
const productController = require('../controllers/frontend/productController');

// auth controller (frontend)
const authController = require('../controllers/frontend/authController');

// --- FRONTEND AUTH ROUTES ---
router.get('/register', authController.showRegister);
router.post('/register', authController.register);

router.get('/verify-registration/:userId', authController.showVerifyRegistration);
router.post('/verify-registration/:userId', authController.verifyRegistration);

router.get('/login', authController.showLogin);
router.post('/login', authController.login);
router.get('/logout', authController.logout);

router.get('/forgot-password', authController.showForgotPassword);
router.post('/forgot-password', authController.sendForgotPasswordOtp);
router.get('/reset-password/:userId', authController.showResetPassword);
router.post('/reset-password/:userId', authController.resetPassword);
// --- end auth routes ---


// Frontend other routes
router.get('/', homeController.index);
router.post('/subscribe', newsletterController.subscribe);
router.get('/shop/:slug', categoryController.show);
router.get('/category/:slug', homeController.show);
router.get('/product/:slug', productController.show);
// router.get("/search", homeController.search);
// router.get('/product/:identifier', productController.show);
// router.get('/cart', cartController.index);

module.exports = router;
