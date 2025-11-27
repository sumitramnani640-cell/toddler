// src/app.js
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
const db = require('./models');         // loads models/index.js
const { CmsPage } = db;                 // make sure CmsPage is defined in models/index.js

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
// Expose flash/session to views (frontend defaults)
// Adds global cart + totals for all frontend views
// -----------------------------
app.use((req, res, next) => {
  // flash messages
  res.locals.success_msg = req.flash('success_msg') || [];
  res.locals.error_msg = req.flash('error_msg') || [];

  // frontend user info stored in frontend session (connect.sid)
  res.locals.user = req.session && req.session.user ? req.session.user : null;

  // adminUser will be set when admin session is active (handled later)
  res.locals.adminUser = null;

  // --- cart defaults (always available in views) ---
  const cart = (req.session && req.session.cart) ? req.session.cart : { items: [] };

  // ensure items is an array
  cart.items = Array.isArray(cart.items) ? cart.items : [];

  // compute subtotal, vat, total
  const subtotal = cart.items.reduce((sum, it) => {
    const price = Number(it.price) || 0;
    const qty = Number(it.qty) || 0;
    return sum + price * qty;
  }, 0);

  const vat = +((subtotal * 0.05).toFixed(2));
  const total = +((subtotal + vat).toFixed(2));

  // expose to templates
  res.locals.cart = cart;
  res.locals.cartCount = cart.items.length;
  res.locals.subtotal = subtotal;
  res.locals.vat = vat;
  res.locals.total = total;

  next();
});

/// -----------------------------
// Load CMS pages for footer (cmsPages)
// -----------------------------
app.locals.cmsPages = []; // default so views never break

app.use(async (req, res, next) => {
  try {
    const cmsPages = await CmsPage.findAll({
      where: { status: 1 },          // if status is INT (1 = active)
      attributes: ['title', 'slug'], // only what footer needs
      order: [['title', 'ASC']]
    });
    res.locals.cmsPages = cmsPages;
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

// Method override for form verbs
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
    secure: false, // set to true in production with HTTPS
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
    // Expose admin session user to views only for admin routes
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
