const express = require('express');
const router = express.Router();
const homeController = require('../controllers/frontend/homeController');
const newsletterController = require('../controllers/admin/Newslettercontroller');

// Frontend routes
router.get('/', homeController.index);
router.post('/subscribe', newsletterController.subscribe);
module.exports = router;
