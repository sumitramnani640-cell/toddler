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
require('./models/index');

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
app.use(flash());

// -----------------------------
// Expose flash/session to views (frontend defaults)
// -----------------------------
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg') || [];
  res.locals.error_msg = req.flash('error_msg') || [];

  // frontend user info stored in frontend session (connect.sid)
  res.locals.user = req.session && req.session.user ? req.session.user : null;

  // adminUser will be set when admin session is active (handled later)
  res.locals.adminUser = null;
  next();
});

// -----------------------------
// EJS + Layouts
// -----------------------------
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Default: disable global layout; routes will opt in
app.set('layout', false);

// Optional debug to print chosen layout for each request
// Uncomment while debugging layout issues
// app.use((req, res, next) => {
//   console.log(`[LAYOUT] ${req.method} ${req.path} -> layout:`, res.locals.layout);
//   next();
// });

// Mount express-ejs-layouts before custom layout wrapper
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
