const express = require('express');
const router = express.Router();
const homeController = require('../controllers/frontend/homeController');
const newsletterController = require('../controllers/admin/NewsletterController');
const categoryController = require('../controllers/frontend/categoryController');
const productController = require('../controllers/frontend/productController');
// const cartController = require('../controllers/frontend/cartController'); // must exist

// Frontend routes


router.get('/', homeController.index);
router.post('/subscribe', newsletterController.subscribe);
router.get('/shop/:slug', categoryController.show);
router.get('/category/:slug', homeController.show);
router.get('/product/:slug', productController.show);
// router.get("/search", homeController.search);
// router.get('/product/:identifier', productController.show);
// router.get('/cart', cartController.index);

module.exports = router;
