// src/controllers/admin/authController.js
const { Admin } = require('../../models');
const bcrypt = require('bcryptjs');

const SALT_ROUNDS = 10;

const authController = {
  // Render admin login page
  showLogin: (req, res) => {
    if (req.session && req.session.adminUser) return res.redirect('/admin/dashboard');

    res.render('admin/login', {
      title: 'Admin Login - Savers Grocery',
      layout: false
    });
  },

  // Handle login (POST /admin/login)
  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        req.flash('error_msg', 'Please provide both email and password');
        return res.redirect('/admin/login');
      }

      const admin = await Admin.findOne({ where: { email: email.toLowerCase() } });
      if (!admin) {
        req.flash('error_msg', 'Invalid email or password');
        return res.redirect('/admin/login');
      }

      if (admin.status !== 'active') {
        req.flash('error_msg', 'Your account has been deactivated');
        return res.redirect('/admin/login');
      }

      const isMatch = typeof admin.comparePassword === 'function'
        ? await admin.comparePassword(password)
        : await bcrypt.compare(password, admin.password);

      if (!isMatch) {
        req.flash('error_msg', 'Invalid email or password');
        return res.redirect('/admin/login');
      }

      // IMPORTANT: Do NOT overwrite req.session or destroy it.
      // Just set a dedicated adminUser key so frontend req.session.user remains intact.
      req.session.adminUser = {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      };

      // Optionally do not touch req.session.user (preserve storefront user)
      req.flash('success_msg', 'Welcome back!');
      return res.redirect('/admin/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      req.flash('error_msg', 'An error occurred during login');
      return res.redirect('/admin/login');
    }
  },

  // Logout — clear only adminUser, preserve frontend user session
  logout: (req, res) => {
    try {
      if (req.session) {
        req.session.adminUser = null;
        // persist change
        req.session.save(err => {
          if (err) console.error('Session save error on admin logout:', err);
          return res.redirect('/admin/login');
        });
      } else {
        return res.redirect('/admin/login');
      }
    } catch (err) {
      console.error('Admin logout error:', err);
      return res.redirect('/admin/login');
    }
  },

  // Render forgot-password page (GET /admin/forgot-password)
  showForgotPassword: (req, res) => {
    res.render('admin/forgot-password', { layout: false, title: 'Admin - Forgot Password' });
  },

  // Simplified forgot-password (no OTP) — keep as before
  sendForgotPasswordOtp: async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) {
        req.flash('error_msg', 'Email is required');
        return res.redirect('/admin/forgot-password');
      }

      const emailLower = email.toLowerCase();
      const admin = await Admin.findOne({ where: { email: emailLower } });

      req.flash('success_msg', 'If an account exists, you may reset the password now.');
      if (!admin) {
        return res.redirect('/admin/forgot-password');
      }

      return res.redirect(`/admin/reset-password/${admin.id}`);
    } catch (err) {
      console.error('Admin sendForgotPassword error:', err);
      req.flash('error_msg', 'Error processing request');
      return res.redirect('/admin/forgot-password');
    }
  },

  showResetPassword: async (req, res) => {
    const { adminId } = req.params;
    const admin = await Admin.findByPk(adminId);
    if (!admin) {
      req.flash('error_msg', 'Invalid request');
      return res.redirect('/admin/forgot-password');
    }
    res.render('admin/reset-password', { layout: false, title: 'Admin - Reset Password', adminId });
  },

  verifyForgotPasswordOtpAndReset: async (req, res) => {
    try {
      const { adminId } = req.params;
      const { password, password_confirm } = req.body;

      if (!password || password !== password_confirm) {
        req.flash('error_msg', 'Passwords do not match');
        return res.redirect(`/admin/reset-password/${adminId}`);
      }

      const admin = await Admin.findByPk(adminId);
      if (!admin) {
        req.flash('error_msg', 'Invalid request');
        return res.redirect('/admin/forgot-password');
      }

      admin.password = await bcrypt.hash(password, SALT_ROUNDS);
      await admin.save();

      req.flash('success_msg', 'Password reset successful. Please login.');
      return res.redirect('/admin/login');
    } catch (err) {
      console.error('Admin reset password error:', err);
      req.flash('error_msg', 'Error resetting password');
      return res.redirect('/admin/forgot-password');
    }
  }
};

module.exports = authController;
