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

// routes
const adminRoutes = require('./routes/admin');
const frontendRoutes = require('./routes/frontend');

// init DB/models
require('./models/index');

// parsers + static
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));

// sessions + flash
app.use(session({
  secret: process.env.SESSION_SECRET || 'savers-grocery-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 24*60*60*1000 }
}));
app.use(flash());

// expose flash/user to views
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg') || [];
  res.locals.error_msg = req.flash('error_msg') || [];
  res.locals.user = req.session.user || null;
  next();
});

// ejs setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// IMPORTANT: disable global layout so express-ejs-layouts won't try to render "layout.ejs"
app.set('layout', false);

// choose layout per-request BEFORE expressLayouts
app.use((req, res, next) => {
  const isAdminRoute = req.path.startsWith('/admin');
  const adminPublic = ['/admin/login', '/admin/forgot-password']; // public admin pages, no layout
  const isAdminPublic = adminPublic.some(p => req.path === p || req.path.startsWith(p + '/'));

  if (isAdminRoute && !isAdminPublic) {
    res.locals.layout = 'admin/layouts/admin'; // src/views/admin/layouts/admin.ejs
  } else {
    res.locals.layout = false;
  }
  next();
});

// enable layouts
app.use(expressLayouts);

// method override
app.use(methodOverride('_method'));

// routes
app.use('/admin', adminRoutes);
app.use('/', frontendRoutes);

// error handlers
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('error', { title: 'Error', message: 'Something went wrong', error: process.env.NODE_ENV === 'development' ? err : {}, layout: false });
});
app.use((req, res) => {
  res.status(404).render('error', { title: 'Not Found', message: 'Page not found', error: {}, layout: false });
});

// start
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app;
