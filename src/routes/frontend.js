// src/routes/frontend.js
const express = require('express');
const router = express.Router();
const path = require('path');

// FRONTEND CONTROLLERS
const homeController = require('../controllers/frontend/homeController');
const newsletterController = require('../controllers/admin/NewsletterController');
const categoryController = require('../controllers/frontend/categoryController');
const productController = require('../controllers/frontend/productController');
const cartController = require('../controllers/frontend/cartController');
const authController = require('../controllers/frontend/authController');
const orderController = require('../controllers/frontend/orderController');
const frontOrderController = require('../controllers/frontend/orderController'); // alias (same file)
const cmsController = require('../controllers/frontend/CmsController');
const wishlistController = require('../controllers/frontend/wishlistController');

// Service to create order (shared logic)
const { createOrder } = require('../services/orderService');

// Default screenshot (uploaded file path) — adjust as needed
const DEFAULT_SCREENSHOT = '/mnt/data/4030561d-5fb8-4bb9-ae2c-1bbf13623888.png';

// Simple middleware to require login for routes that must be protected.
function requireLogin(req, res, next) {
  if (req.user || (req.session && req.session.user)) {
    if (!req.user && req.session && req.session.user) req.user = req.session.user;
    return next();
  }
  return res.redirect('/login?redirect=/checkout');
}

/* ---------------------
   AUTH ROUTES
   --------------------- */
router.get('/register', authController.showRegister);
router.post('/register', authController.register);

router.get('/verify-registration/:userId', authController.showVerifyRegistration);
router.post('/verify-registration/:userId', authController.verifyRegistration);

router.get('/login', authController.showLogin);
router.post('/login', authController.login);

router.post('/logout', authController.logout);
router.get('/logout', (req, res) => res.redirect('/'));

// password reset flows
router.get('/forgot-password', authController.showForgotPassword);
router.post('/forgot-password', authController.sendForgotPasswordOtp);
router.get('/reset-password/:userId', authController.showResetPassword);
router.post('/reset-password/:userId', authController.resetPassword);

/* ---------------------
   ACCOUNT (protected)
   --------------------- */
router.get('/account', authController.isAuthenticated, authController.showMyAccount);

/* ---------------------
   BASIC FRONTEND ROUTES
   --------------------- */
router.get('/', homeController.index);
router.post('/subscribe', newsletterController.subscribe);

router.get('/shop/:slug', categoryController.show);
router.get('/category/:slug', categoryController.show); // alternative path
router.get('/product/:identifier', productController.show); // product by slug or id

/* ---------------------
   ORDER HISTORY & DETAILS
   --------------------- */
router.get('/order-history', authController.isAuthenticated, orderController.orderHistory);
router.get('/order/:id', authController.isAuthenticated, orderController.orderDetails);

/* ---------------------
   CMS PAGES
   --------------------- */
router.get('/page/:slug', cmsController.showPage);

/* ---------------------
   WISHLIST
   --------------------- */
router.get('/wishlist', wishlistController.index);
router.post('/wishlist/add', wishlistController.add);
router.post('/wishlist/remove', wishlistController.remove);

/* ---------------------
   CART ROUTES
   --------------------- */
router.get('/cart', cartController.index);
router.post('/cart/add', cartController.add);
router.post('/cart/update', cartController.update);
router.post('/cart/remove', cartController.remove);
router.post('/cart/clear', cartController.clear);

/* ---------------------
   CHECKOUT FLOW (multi-step)
   --------------------- */

router.post('/checkout/options', (req, res) => {
  req.session.checkout = req.session.checkout || {};
  req.session.checkout.type = req.body.account_type;
  return res.redirect('/checkout');
});

router.post('/checkout/billing', (req, res) => {
  req.session.checkout = req.session.checkout || {};
  req.session.checkout.billing = {
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    company: req.body.company,
    address1: req.body.address1,
    address2: req.body.address2,
    city: req.body.city,
    postcode: req.body.postcode,
    country: req.body.country,
  };

  req.session.cart = req.session.cart || {};
  req.session.cart.shippingAddress = {
    address1: req.body.address1,
    address2: req.body.address2,
    city: req.body.city,
    postcode: req.body.postcode,
    country: req.body.country,
  };

  return res.redirect('/checkout');
});

router.post('/checkout/delivery', (req, res) => {
  req.session.checkout = req.session.checkout || {};
  req.session.checkout.deliverySlot = req.body.deliverySlot;
  return res.redirect('/checkout');
});

router.post('/checkout/shipping', (req, res) => {
  req.session.checkout = req.session.checkout || {};
  req.session.checkout.shipping_method = req.body.shipping_method;
  return res.redirect('/checkout');
});

router.post('/checkout/payment', (req, res) => {
  req.session.checkout = req.session.checkout || {};
  req.session.checkout.payment_method = req.body.payment_method;
  return res.redirect('/checkout');
});

/* ---------------------
   POST /checkout/confirm -> delegate to controller that handles DB-first carts
   --------------------- */
// NOTE: remove `requireLogin` here if you want guests to be able to place orders.
router.post('/checkout/confirm', requireLogin, async (req, res, next) => {
  try {
    if (frontOrderController && typeof frontOrderController.placeOrder === 'function') {
      // delegate to controller (DB-first logic inside)
      return frontOrderController.placeOrder(req, res, next);
    }

    // fallback if controller missing
    console.warn('[routes] placeOrder controller missing, falling back to basic handler');
    const cart = req.session.cart || { items: [] };
    if (!cart.items || !cart.items.length) return res.redirect('/cart');

    const subtotal = (cart.items || []).reduce((s, it) => s + Number(it.price || 0) * Number(it.qty || 0), 0);
    const MIN_ORDER = 150;
    if (subtotal < MIN_ORDER) {
      req.flash('error_msg', `A minimum order of AED${MIN_ORDER} is required for groceries.`);
      return res.redirect('/checkout');
    }

    const payload = {
      userId:
        (req.session.user && req.session.user.id) ||
        (req.user && req.user.id) ||
        null,
      items: cart.items,
      subtotal,
      delivery: Number(req.body.shipping || 0),
      total: Number(
        req.body.total ||
          (subtotal + subtotal * 0.05 + Number(req.body.shipping || 0))
      ),
      screenshotUrl: req.body.screenshotUrl || DEFAULT_SCREENSHOT,
      payment_method:
        (req.session.checkout &&
          req.session.checkout.payment_method) ||
        req.body.payment_method ||
        'cod',
    };

    const result = await createOrder(payload);
    req.session.cart = { items: [] };
    return res.redirect(`/confirmation?orderId=${result.order.id}`);
  } catch (err) {
    console.error('[routes /checkout/confirm] fallback handler error', err && err.stack ? err.stack : err);
    req.flash('error_msg', err.message || 'Could not place order; please try again.');
    return res.redirect('/checkout');
  }
});

/* ---------------------
   CHECKOUT PAGE (GET)
   --------------------- */
// Protect checkout page by login (if you want guests, remove requireLogin)
if (frontOrderController && typeof frontOrderController.showCheckout === 'function') {
  router.get('/checkout', requireLogin, frontOrderController.showCheckout);
} else {
  router.get('/checkout', requireLogin, (req, res) => {
    const cart = req.session.cart || { items: [], totals: { quantity: 0, amount: 0 } };
    const cartCount = Array.isArray(cart.items)
      ? cart.items.reduce((a, b) => a + (b.qty || 0), 0)
      : 0;
    return res.render('frontend/checkout', {
      cart,
      title: 'Checkout',
      user: req.user || (req.session && req.session.user),
      categories: res.locals.categories || [],
      cartCount,
    });
  });
}

/* ---------------------
   PLACE ORDER API + CONFIRMATION
   --------------------- */
if (frontOrderController && typeof frontOrderController.placeOrder === 'function') {
  router.post('/place-order', frontOrderController.placeOrder);
} else {
  router.post('/place-order', (req, res) =>
    res.status(404).json({ error: 'place-order not implemented' })
  );
}

// friendly confirmation URL
if (frontOrderController && typeof frontOrderController.confirmation === 'function') {
  router.get('/order/confirmation/:id', frontOrderController.confirmation);
  // legacy/alternative
  router.get('/confirmation', frontOrderController.confirmation);
} else {
  router.get('/confirmation', (req, res) => {
    return res.render('frontend/order-confirmation', {
      orderId: req.query.orderId,
      title: 'Order Confirmation',
      user: req.user || (req.session && req.session.user),
    });
  });
}

/* ---------------------
   Generic POST /checkout (if a form posts directly to /checkout)
   --------------------- */
router.post('/checkout', (req, res) => {
  req.session.checkout = req.session.checkout || {};
  return res.redirect('/checkout');
});

module.exports = router;
