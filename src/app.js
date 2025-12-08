'use strict';

const express = require('express');
const session = require('express-session');
const flash = require('connect-flash');
const expressLayouts = require('express-ejs-layouts');
const methodOverride = require('method-override');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Routers
const adminRoutes = require('./routes/admin');
const frontendRoutes = require('./routes/frontend');

// Initialize DB/models
const db = require('./models'); // loads src/models/index.js
const { CmsPage } = db; // ensure CmsPage exists; used for footer pages

// -----------------------------
// Parsers + Static
// -----------------------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));

// -----------------------------
// FRONTEND SESSION (global)
// -----------------------------
const frontendSession = session({
  secret: process.env.SESSION_SECRET || 'savers-grocery-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // set true in production with HTTPS
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000
  }
});
app.use(frontendSession);

// small debug after session established
app.use((req, res, next) => {
  console.log(
    '[SESSION DEBUG] url=', req.originalUrl,
    ' cookies=', !!req.headers.cookie,
    ' sessionUser=',
    req.session && req.session.user
      ? JSON.stringify({ id: req.session.user.id, name: req.session.user.name })
      : null,
    ' cart=',
    req.session && req.session.cart
      ? `items:${(req.session.cart.items || []).length}`
      : 'none'
  );
  next();
});

// -----------------------------
// flash (must come after session)
// -----------------------------
app.use(flash());

// -----------------------------
// Expose flash/session + cart to views (DB for logged-in users, session for guests)
// Place BEFORE mounting frontend routes so every view gets correct locals
// -----------------------------
app.use(async (req, res, next) => {
  try {
    // flash messages
    res.locals.success_msg = req.flash('success_msg') || [];
    res.locals.error_msg = req.flash('error_msg') || [];

    // user (from frontend session)
    res.locals.user = req.session && req.session.user ? req.session.user : null;
    res.locals.adminUser = null;

    // default cart locals
    res.locals.cart = { items: [] };
    res.locals.cartCount = 0;
    res.locals.subtotal = 0;
    res.locals.vat = 0;
    res.locals.total = 0;

    // determine user id (session-based or passport)
    const userId = req.session?.user?.id || req.user?.id || null;

    // If logged in and db.Cart exists -> compute cart from DB
    if (userId && db && db.Cart) {
      // Each row in `cart` table is one item (userId + productId + qty)
      const rows = await db.Cart.findAll({
        where: { userId },
        include: [{ model: db.Product, as: 'product', attributes: ['price'] }]
      });

      const items = (rows || []).map(r => ({
        productId: r.productId,
        qty: Number(r.qty || 1),
        price: r.product ? Number(r.product.price || 0) : 0
      }));

      const subtotal = items.reduce((s, it) => s + (it.price * it.qty), 0);
      const vat = +((subtotal * 0.05).toFixed(2));
      const total = +(subtotal + vat).toFixed(2);

      res.locals.cart = { items, subtotal, vat, total, totalQty: items.reduce((s,i) => s + (i.qty||0), 0) };

      // Show sum of quantities in the header badge
      res.locals.cartCount = items.reduce((s,i) => s + (Number(i.qty) || 0), 0);

      res.locals.subtotal = subtotal;
      res.locals.vat = vat;
      res.locals.total = total;

      return next();
    }

    // Guest fallback (session cart)
    const sessionCart = req.session?.cart ?? { items: [] };
    sessionCart.items = Array.isArray(sessionCart.items) ? sessionCart.items : [];

    const subtotal = sessionCart.items.reduce((s, it) => s + ((Number(it.price) || 0) * (Number(it.qty) || 0)), 0);
    const vat = +((subtotal * 0.05).toFixed(2));
    const total = +(subtotal + vat).toFixed(2);

    res.locals.cart = sessionCart;
    // sum of quantities for header badge
    res.locals.cartCount = Array.isArray(sessionCart.items) ? sessionCart.items.reduce((s,i)=>s+(Number(i.qty)||0),0) : 0;
    res.locals.subtotal = subtotal;
    res.locals.vat = vat;
    res.locals.total = total;

    return next();
  } catch (err) {
    console.error('[CART-MW ERROR]', err);
    // safe defaults
    res.locals.cart = { items: [] };
    res.locals.cartCount = 0;
    res.locals.subtotal = 0;
    res.locals.vat = 0;
    res.locals.total = 0;
    return next();
  }
});

// -----------------------------
// Load CMS "Information" pages for footer (app.locals to make them available everywhere)
// -----------------------------
app.locals.cmsPages = []; // default to avoid view errors

app.use(async (req, res, next) => {
  try {
    if (CmsPage) {
      const cmsPages = await CmsPage.findAll({
        where: { status: true }, // adjust to your status type (1 / true)
        attributes: ['title', 'slug'],
        order: [['position', 'ASC']]
      });
      res.locals.cmsPages = cmsPages;
      app.locals.cmsPages = cmsPages; // also store globally if you prefer
    } else {
      res.locals.cmsPages = app.locals.cmsPages || [];
    }
  } catch (err) {
    console.error('Error loading CMS pages:', err);
    res.locals.cmsPages = [];
  }
  next();
});

// -----------------------------
// EJS + Layouts
// -----------------------------
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Default: disable global layout; routes will opt in
app.set('layout', false);

// Mount express-ejs-layouts
app.use(expressLayouts);

// Automatically choose layout per request
app.use((req, res, next) => {
  const originalRender = res.render;
  const isAdminRoute = req.originalUrl.startsWith('/admin');

  res.render = function renderWithLayout(view, options, callback) {
    let opts = options;
    let cb = callback;

    if (typeof opts === 'function') {
      cb = opts;
      opts = {};
    }

    opts = opts || {};

    if (typeof opts.layout === 'undefined') {
      opts.layout = isAdminRoute ? 'admin/layouts/admin' : false;
    }

    return originalRender.call(this, view, opts, cb);
  };

  next();
});

// -----------------------------
// Method override for form verbs
// -----------------------------
app.use(methodOverride('_method'));

// -----------------------------
// FRONTEND ROUTES (TOP)
// -----------------------------
app.use('/', frontendRoutes);

// -----------------------------
// ADMIN SESSION (isolated)
// -----------------------------
const adminSession = session({
  name: process.env.ADMIN_SESSION_NAME || 'admin.sid',
  secret: process.env.ADMIN_SESSION_SECRET || 'admin-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000
  }
});

// -----------------------------
// ADMIN ROUTES (BOTTOM) - use isolated admin session
// -----------------------------
app.use(
  '/admin',
  adminSession,
  (req, res, next) => {
    // Expose admin session user to admin views
    res.locals.adminUser = req.session && req.session.adminUser ? req.session.adminUser : null;
    next();
  },
  adminRoutes
);

// -----------------------------
// Error handlers
// -----------------------------
app.use((err, req, res, next) => {
  console.error('ERROR HANDLER:', err && (err.stack || err));
  const details = process.env.NODE_ENV === 'development' ? err : {};
  res.status(500).render('error', {
    title: 'Error',
    message: 'Something went wrong',
    error: details,
    layout: false
  });
});

// 404
app.use((req, res) => {
  res.status(404).render('error', {
    title: 'Not Found',
    message: 'Page not found',
    error: {},
    layout: false
  });
});

// -----------------------------
// Start server
// -----------------------------
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app;
