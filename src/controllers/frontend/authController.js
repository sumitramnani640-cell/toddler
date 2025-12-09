// src/controllers/frontend/authController.js
const { User } = require('../../models');
const bcrypt = require('bcryptjs');
const otpService = require('../../services/otpService'); // for forgot-password
const emailService = require('../../services/emailService');
const smsService = require('../../services/smsService');

// helper to migrate guest cart rows into user's cart (see src/helpers/cartMigration.js)
// const { migrateGuestCartToUser } = require('../../helpers/cartMigration');

const authController = {
  // Render registration page
  showRegister: (req, res) => {
    const prefillEmail = (req.flash('prefillEmail') || [])[0] || (req.query.email || '');
    return res.render('frontend/register', { title: 'Register - Saver Grocery', prefillEmail });
  },

  // Register (password will be hashed by User model hooks)
  register: async (req, res) => {
    try {
      const { name, email, phone, password, password_confirm } = req.body;
      if (!name || !email || !password || password !== password_confirm) {
        req.flash('error_msg', 'Please fill all fields and ensure passwords match');
        req.flash('prefillEmail', email || '');
        return res.redirect('/register');
      }
      const emailLower = email.toLowerCase();
      const existing = await User.findOne({ where: { email: emailLower }});
      if (existing) {
        req.flash('error_msg', 'Email already registered. Please login or use forgot password.');
        return res.redirect('/register');
      }

      const user = await User.create({
        name,
        email: emailLower,
        phone,
        password, // model hook should hash
        is_verified: false
      });

      // send OTP for registration verification
      const { otp } = await otpService.generateAndSaveOtp({
        modelInstance: user,
        purpose: 'registration',
        expiryMinutes: 10
      });
      await emailService.sendOtpEmail({ to: user.email, otp, purpose: 'registration' });
      if (user.phone) await smsService.sendOtpSms({ to: user.phone, otp, purpose: 'registration' });

      req.flash('success_msg', 'OTP sent to your email. Enter it to complete registration.');
      return res.redirect(`/verify-registration/${user.id}`);
    } catch (err) {
      console.error('Register error:', err && (err.stack || err));
      req.flash('error_msg', 'Error during registration');
      return res.redirect('/register');
    }
  },

  // Show verification page for registration
  showVerifyRegistration: (req, res) => {
    return res.render('frontend/verify-registration', { title: 'Verify Account', userId: req.params.userId });
  },

  // Verify registration OTP
  verifyRegistration: async (req, res) => {
    try {
      const { userId } = req.params;
      const { otp } = req.body;
      const user = await User.findByPk(userId);
      if (!user) {
        req.flash('error_msg', 'Invalid request');
        return res.redirect('/register');
      }

      const result = await otpService.verifyOtp({ modelInstance: user, otp, purpose: 'registration' });
      if (!result.ok) {
        req.flash('error_msg', result.reason === 'expired' ? 'OTP expired. Please request a new one.' : 'Incorrect OTP.');
        return res.redirect(`/verify-registration/${userId}`);
      }

      user.is_verified = true;
      await user.save();

      req.flash('success_msg', 'Registration verified — you can now login.');
      return res.redirect('/login');
    } catch (err) {
      console.error('verifyRegistration error:', err && (err.stack || err));
      req.flash('error_msg', 'Error verifying OTP');
      return res.redirect('/register');
    }
  },

  // Render login page (password-only)
  showLogin: (req, res) => {
    const prefillEmail = (req.flash('prefillEmail') || [])[0] || (req.query.email || '');
    return res.render('frontend/login', { title: 'Login - Saver Grocery', prefillEmail });
  },

  // Login handler (password-based only)
  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      // basic validation
      if (!email || !password) {
        req.flash('error_msg', 'Please enter valid email and password');
        return res.redirect('/login');
      }

      const emailLower = email.toLowerCase();

      // find user
      const user = await User.findOne({ where: { email: emailLower }});
      if (!user) {
        req.flash('prefillEmail', emailLower);
        req.flash('error_msg', 'Enter a valid email and password');
        return res.redirect('/login');
      }

      // account status
      if (user.status && user.status !== 'active') {
        req.flash('error_msg', 'Account is deactivated');
        return res.redirect('/login');
      }

      // verify password (support model comparePassword or bcrypt)
      const ok = typeof user.comparePassword === 'function'
        ? await user.comparePassword(password)
        : await bcrypt.compare(password, user.password);

      if (!ok) {
        req.flash('prefillEmail', emailLower);
        req.flash('error_msg', 'Enter a valid password for this email');
        return res.redirect('/login');
      }

      // optional verification flag
      if (!user.is_verified) {
        req.flash('error_msg', 'Please verify your account first.');
        return res.redirect(`/verify-registration/${user.id}`);
      }

      // success — create session
      req.session.user = { id: user.id, name: user.name, email: user.email };
      // also expose to req.user and views
      req.user = req.session.user;
      res.locals.user = req.session.user;

      // Migrate any guest cart rows into this user's cart (best-effort).
      // This will replace rows where cart.userId === guest_cookie_string with the numeric user id.
      try {
        await migrateGuestCartToUser(req, res, user.id);
      } catch (mErr) {
        // migration is best-effort — don't block login if it fails
        console.warn('Guest cart migration failed (non-fatal):', mErr && (mErr.stack || mErr));
      }

      req.flash('success_msg', 'Logged in successfully');
      // redirect to intended page or homepage
      return res.redirect(req.session?.redirect || '/');
    } catch (err) {
      console.error('Login error:', err && (err.stack || err));
      req.flash('error_msg', 'Login error');
      return res.redirect('/login');
    }
  },

  // Logout
  logout: (req, res) => {
    req.session.destroy(err => {
      if (err) console.error('Logout error:', err && err.stack ? err.stack : err);
      return res.redirect('/');
    });
  },

  // Render forgot-password page
  showForgotPassword: (req, res) => {
    const prefillEmail = (req.flash('prefillEmail') || [])[0] || (req.query.email || '');
    return res.render('frontend/forgot-password', { title: 'Forgot Password', prefillEmail });
  },

  // Send OTP for forgot-password
  sendForgotPasswordOtp: async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) {
        req.flash('error_msg', 'Email required');
        return res.redirect('/forgot-password');
      }

      const emailLower = email.toLowerCase();
      const user = await User.findOne({ where: { email: emailLower }});
      if (!user) {
        req.flash('success_msg', 'If an account exists, an OTP has been sent.');
        req.flash('prefillEmail', emailLower);
        return res.redirect('/forgot-password');
      }

      const { otp } = await otpService.generateAndSaveOtp({
        modelInstance: user,
        purpose: 'forgot_password',
        expiryMinutes: 10
      });

      await emailService.sendOtpEmail({ to: user.email, otp, purpose: 'forgot_password' });
      if (user.phone) await smsService.sendOtpSms({ to: user.phone, otp, purpose: 'forgot_password' });

      req.flash('success_msg', 'If an account exists, an OTP has been sent.');
      return res.redirect(`/reset-password/${user.id}`);
    } catch (err) {
      console.error('sendForgotPasswordOtp error:', err && (err.stack || err));
      req.flash('error_msg', 'Error sending OTP');
      return res.redirect('/forgot-password');
    }
  },

  // Render reset password page
  showResetPassword: (req, res) => {
    return res.render('frontend/reset-password', { title: 'Reset Password', userId: req.params.userId });
  },

  // Verify OTP and set new password (for forgot-password)
  resetPassword: async (req, res) => {
    try {
      const { userId } = req.params;
      const { otp, password, password_confirm } = req.body;
      if (!password || password !== password_confirm) {
        req.flash('error_msg', 'Passwords do not match');
        return res.redirect(`/reset-password/${userId}`);
      }

      const user = await User.findByPk(userId);
      if (!user) {
        req.flash('error_msg', 'Invalid request');
        return res.redirect('/forgot-password');
      }

      const result = await otpService.verifyOtp({ modelInstance: user, otp, purpose: 'forgot_password' });
      if (!result.ok) {
        req.flash('error_msg', result.reason === 'expired' ? 'OTP expired. Request a new one.' : 'Incorrect OTP.');
        return res.redirect(`/reset-password/${userId}`);
      }

      user.password = password; // model hook hashes
      await user.save();

      req.flash('success_msg', 'Password reset — you can now login.');
      return res.redirect('/login');
    } catch (err) {
      console.error('resetPassword error:', err && (err.stack || err));
      req.flash('error_msg', 'Error resetting password');
      return res.redirect('/forgot-password');
    }
  },

  // Middleware to protect routes
  isAuthenticated: (req, res, next) => {
    if (req.session && req.session.user) {
      req.user = req.session.user;
      res.locals.user = req.session.user;
      return next();
    }
    req.flash('error_msg', 'Please login to access that page.');
    return res.redirect('/login');
  },

  // Render My Account dashboard
  showMyAccount: async (req, res) => {
    try {
      const userSession = req.session.user || null;
      return res.render('frontend/myaccount', { title: 'My Account - Saver Grocery', user: userSession });
    } catch (err) {
      console.error('showMyAccount error:', err && (err.stack || err));
      req.flash('error_msg', 'Unable to open account page');
      return res.redirect('/');
    }
  }
};

module.exports = authController;
