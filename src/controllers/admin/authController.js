// src/controllers/admin/authController.js
const { Admin } = require('../../models');
const { validationResult } = require('express-validator'); // if you use express-validator in routes/forms
const bcrypt = require('bcryptjs');

const otpService = require('../../services/otpService');     // path may vary
const emailService = require('../../services/emailService'); // path may vary
const smsService = require('../../services/smsService');     // optional (path may vary)

const SALT_ROUNDS = 10;

const authController = {
  // Render admin login page
  showLogin: (req, res) => {
    if (req.session.user) return res.redirect('/admin/dashboard');

    res.render('admin/login', {
      title: 'Admin Login - Savers Grocery',
      layout: false
    });
  },

  // Handle login (POST /admin/login)
  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      // Basic validation
      if (!email || !password) {
        req.flash('error_msg', 'Please provide both email and password');
        return res.redirect('/admin/login');
      }

      const admin = await Admin.findOne({
        where: { email: email.toLowerCase() }
      });

      if (!admin) {
        req.flash('error_msg', 'Invalid email or password');
        return res.redirect('/admin/login');
      }

      if (admin.status !== 'active') {
        req.flash('error_msg', 'Your account has been deactivated');
        return res.redirect('/admin/login');
      }

      const isMatch = await admin.comparePassword(password);
      if (!isMatch) {
        req.flash('error_msg', 'Invalid email or password');
        return res.redirect('/admin/login');
      }

      // Set session payload (keep minimal)
      req.session.user = {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      };

      req.flash('success_msg', 'Welcome back!');
      return res.redirect('/admin/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      req.flash('error_msg', 'An error occurred during login');
      return res.redirect('/admin/login');
    }
  },

  // Destroy session (GET /admin/logout)
  logout: (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error('Logout error:', err);
        req.flash('error_msg', 'Error occurred during logout');
        return res.redirect('/admin/dashboard');
      }
      res.redirect('/admin/login');
    });
  },

  // Render forgot-password page (GET /admin/forgot-password)
  showForgotPassword: (req, res) => {
    res.render('admin/forgot-password', { layout: false, title: 'Admin - Forgot Password' });
  },

  // POST /admin/forgot-password  -> send OTP (generic response)
  sendForgotPasswordOtp: async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) {
        req.flash('error_msg', 'Email is required');
        return res.redirect('/admin/forgot-password');
      }

      const emailLower = email.toLowerCase();
      const admin = await Admin.findOne({ where: { email: emailLower } });

      // Generic response so attackers can't enumerate accounts
      if (!admin) {
        req.flash('success_msg', 'If an account exists, an OTP has been sent to the email.');
        return res.redirect('/admin/forgot-password');
      }

      // Generate and save hashed OTP (default expiry inside otpService)
      const { otp } = await otpService.generateAndSaveOtp({
        modelInstance: admin,
        purpose: 'forgot_password',
        expiryMinutes: 10
      });

      // Send via email and optional SMS
      try {
        await emailService.sendOtpEmail({ to: admin.email, otp, purpose: 'forgot_password' });
      } catch (mailErr) {
        console.error('Failed to send OTP email:', mailErr);
        // Do not reveal transport errors to user — still show generic success
      }

      if (admin.phone) {
        try {
          await smsService.sendOtpSms({ to: admin.phone, otp, purpose: 'forgot_password' });
        } catch (smsErr) {
          console.error('Failed to send OTP SMS:', smsErr);
        }
      }

      req.flash('success_msg', 'If an account exists, an OTP has been sent to the email.');
      return res.redirect(`/admin/reset-password/${admin.id}`);
    } catch (err) {
      console.error('Admin sendForgotPasswordOtp error:', err);
      req.flash('error_msg', 'Error sending OTP');
      return res.redirect('/admin/forgot-password');
    }
  },

  // Render reset password page (GET /admin/reset-password/:adminId)
  showResetPassword: async (req, res) => {
    const { adminId } = req.params;
    // Optionally validate adminId or show generic page if you prefer
    res.render('admin/reset-password', { layout: false, title: 'Admin - Reset Password', adminId });
  },

  // POST /admin/reset-password/:adminId -> verify OTP and reset password
  verifyForgotPasswordOtpAndReset: async (req, res) => {
    try {
      const { adminId } = req.params;
      const { otp, password, password_confirm } = req.body;

      if (!password || password !== password_confirm) {
        req.flash('error_msg', 'Passwords do not match');
        return res.redirect(`/admin/reset-password/${adminId}`);
      }

      const admin = await Admin.findByPk(adminId);
      if (!admin) {
        req.flash('error_msg', 'Invalid request');
        return res.redirect('/admin/forgot-password');
      }

      const result = await otpService.verifyOtp({ modelInstance: admin, otp, purpose: 'forgot_password' });
      if (!result.ok) {
        // Map internal reasons to friendly messages if you want
        const reasonMap = {
          expired: 'OTP has expired. Please request a new one.',
          mismatch: 'Incorrect OTP. Please try again.',
          wrong_purpose: 'Invalid OTP purpose.',
          no_otp: 'No OTP found. Please request a new one.'
        };
        const friendly = reasonMap[result.reason] || 'OTP verification failed.';
        req.flash('error_msg', friendly);
        return res.redirect(`/admin/reset-password/${admin.id}`);
      }

      // Save new password (hooks in model will hash it)
      // If your model hashes inside beforeUpdate, you can simply set and save.
      // Otherwise hash here:
      admin.password = await bcrypt.hash(password, SALT_ROUNDS);
      await admin.save();

      req.flash('success_msg', 'Password reset successful. Please login.');
      return res.redirect('/admin/login');
    } catch (err) {
      console.error('Admin verifyForgotPasswordOtpAndReset error:', err);
      req.flash('error_msg', 'Error resetting password');
      return res.redirect('/admin/forgot-password');
    }
  }
};

module.exports = authController;
