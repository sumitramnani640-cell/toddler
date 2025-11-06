const express = require('express');
const router = express.Router();
const homeController = require('../controllers/frontend/homeController');
const newsletterController = require('../controllers/admin/NewsletterController');
const categoryController = require('../controllers/frontend/categoryController');
const productController = require('../controllers/frontend/productController');


// Frontend routes
router.get('/', homeController.index);
router.post('/subscribe', newsletterController.subscribe);
router.get('/shop/:slug', categoryController.show);
router.get('/category/:slug', homeController.show);
router.get('/:slug', productController.show);

module.exports = router;
