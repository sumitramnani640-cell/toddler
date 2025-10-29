const express = require('express');
const router = express.Router();
const homeController = require('../controllers/frontend/homeController');

// Frontend routes
router.get('/', homeController.index);

module.exports = router;
