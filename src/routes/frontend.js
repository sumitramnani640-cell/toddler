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
const frontOrderController = require('../controllers/frontend/orderController'); // alias, same file
const cmsController = require('../controllers/frontend/CmsController'); // ✅ NOTE: lowercase c

// Service to create order (shared logic)
const { createOrder } = require('../services/orderService');

// Default screenshot (uploaded file path) — adjust as needed
const DEFAULT_SCREENSHOT = '/mnt/data/4030561d-5fb8-4bb9-ae2c-1bbf13623888.png';

// Simple middleware to require login for routes that must be protected.
// If you already have authController.isAuthenticated and it redirects,
// you can replace requireLogin with that.
function requireLogin(req, res, next) {
  if (req.user || (req.session && req.session.user)) {
    // attach user from session if not present (optional)
    if (!req.user && req.session && req.session.user) req.user = req.session.user;
    return next();
  }
  // redirect to login with return URL so user comes back to checkout
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
router.get('/product/:slug', productController.show);

/* ---------------------
   ORDER HISTORY & DETAILS
   --------------------- */
// ORDER HISTORY (uses orders.ejs)
router.get('/order-history', authController.isAuthenticated, orderController.orderHistory);

// ORDER DETAILS
router.get('/order/:id', authController.isAuthenticated, orderController.orderDetails);

/* ---------------------
   CMS PAGES
   --------------------- */
// /page/about-us, /page/privacy-policy, etc.
router.get('/page/:slug', cmsController.showPage);

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
   - User must be logged in to view the checkout page.
   - If not logged in, redirect to /login?redirect=/checkout
   --------------------- */

// Step handlers: these just store choices in session and redirect back to GET /checkout
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

/* POST /checkout/confirm (place order)
   This route computes totals, validates min order, then uses createOrder service */
router.post('/checkout/confirm', async (req, res) => {
  console.log('[DEBUG] /checkout/confirm hit');
  const cart = req.session.cart || { items: [] };
  if (!cart.items || !cart.items.length) return res.redirect('/cart');

  const subtotal = (cart.items || []).reduce(
    (s, it) => s + Number(it.price || 0) * Number(it.qty || 0),
    0
  );
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

  try {
    const result = await createOrder(payload);
    // clear cart
    req.session.cart = { items: [] };
    // redirect to confirmation page (controller or fallback)
    return res.redirect(`/confirmation?orderId=${result.order.id}`);
  } catch (err) {
    console.error('createOrder error', err && (err.stack || err));
    req.flash('error_msg', err.message || 'Could not place order. Please try again.');
    return res.redirect('/checkout');
  }
});

/* ---------------------
   CHECKOUT PAGE (GET)
   - Protected: requireLogin middleware will redirect to /login?redirect=/checkout
   - If frontOrderController exports showCheckout we'll use it; otherwise fallback to inline renderer
   --------------------- */
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

// Optional API endpoint (if controller exports placeOrder)
if (frontOrderController && typeof frontOrderController.placeOrder === 'function') {
  router.post('/place-order', frontOrderController.placeOrder);
} else {
  router.post('/place-order', (req, res) =>
    res.status(404).json({ error: 'place-order not implemented' })
  );
}

// Confirmation page (controller or fallback)
if (frontOrderController && typeof frontOrderController.confirmation === 'function') {
  router.get('/confirmation', frontOrderController.confirmation);
} else {
  router.get('/confirmation', (req, res) => {
    // orderId used to show order details — load from DB if you want more info
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
  // copy any posted fields into session.checkout as needed
  return res.redirect('/checkout');
});

module.exports = router;
