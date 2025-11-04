const express = require('express');
const router = express.Router();
const homeController = require('../controllers/frontend/homeController');
const newsletterController = require('../controllers/admin/NewsletterController');
const categoryController = require('../controllers/frontend/categoryController');

// Frontend routes
router.get('/', homeController.index);
router.post('/subscribe', newsletterController.subscribe);
router.get('/category/:slug', categoryController.productsByCategory);
module.exports = router;
