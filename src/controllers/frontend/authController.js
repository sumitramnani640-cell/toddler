// src/controllers/frontend/authController.js
const { User } = require('../../models');
const bcrypt = require('bcryptjs');
const otpService = require('../../services/otpService');
const emailService = require('../../services/emailService');
const smsService = require('../../services/smsService');

const SALT_ROUNDS = 10;

const authController = {
  // Render registration page (views/frontend/register.ejs)
  showRegister: (req, res) => {
    return res.render('frontend/register', {
      title: 'Register - Saver Grocery',
      messages: req.flash()
    });
  },

  // Handle registration form submit
  register: async (req, res) => {
    try {
      const { name, email, phone, password, password_confirm } = req.body;
      if (!name || !email || !password || password !== password_confirm) {
        req.flash('error_msg', 'Please fill all fields and ensure passwords match');
        return res.redirect('/register');
      }

      const emailLower = email.toLowerCase();
      const existing = await User.findOne({ where: { email: emailLower }});
      if (existing) {
        req.flash('error_msg', 'Email already registered. Please login or use forgot password.');
        return res.redirect('/register');
      }

      // If User model hashes password in a hook, leave as-is; otherwise hash here:
      const hashed = await bcrypt.hash(password, SALT_ROUNDS);

      const user = await User.create({
        name,
        email: emailLower,
        phone,
        password: hashed,
        is_verified: false
      });

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
      console.error('Register error:', err);
      req.flash('error_msg', 'Error during registration');
      return res.redirect('/register');
    }
  },

  // Show verification page (views/frontend/verify-registration.ejs)
  showVerifyRegistration: (req, res) => {
    return res.render('frontend/verify-registration', {
      title: 'Verify Account',
      userId: req.params.userId,
      messages: req.flash()
    });
  },

  // Verify OTP for registration
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
      console.error('verifyRegistration error:', err);
      req.flash('error_msg', 'Error verifying OTP');
      return res.redirect('/register');
    }
  },

  // Render login page (views/frontend/login.ejs)
  showLogin: (req, res) => {
    return res.render('frontend/login', {
      title: 'Login - Saver Grocery',
      messages: req.flash()
    });
  },

  // Login handler
  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        req.flash('error_msg', 'Please enter email and password');
        return res.redirect('/login');
      }

      const user = await User.findOne({ where: { email: email.toLowerCase() }});
      if (!user) {
        req.flash('error_msg', 'Invalid credentials');
        return res.redirect('/login');
      }

      if (user.status && user.status !== 'active') {
        req.flash('error_msg', 'Account is deactivated');
        return res.redirect('/login');
      }

      // Support instance method comparePassword or fallback to bcrypt.compare
      let ok = false;
      if (typeof user.comparePassword === 'function') {
        ok = await user.comparePassword(password);
      } else {
        ok = await bcrypt.compare(password, user.password);
      }

      if (!ok) {
        req.flash('error_msg', 'Invalid credentials');
        return res.redirect('/login');
      }

      if (!user.is_verified) {
        req.flash('error_msg', 'Please verify your account first.');
        return res.redirect(`/verify-registration/${user.id}`);
      }

      // minimal session user
      req.session.user = { id: user.id, name: user.name, email: user.email };
      req.flash('success_msg', 'Logged in successfully');

      // redirect to dashboard
      return res.redirect('/my-account');
    } catch (err) {
      console.error('Login error:', err);
      req.flash('error_msg', 'Login error');
      return res.redirect('/login');
    }
  },

  // Logout
  logout: (req, res) => {
    req.session.destroy(err => {
      if (err) console.error('Logout error:', err);
      return res.redirect('/');
    });
  },

  // Render forgot-password page (views/frontend/forgot-password.ejs)
  showForgotPassword: (req, res) => {
    return res.render('frontend/forgot-password', {
      title: 'Forgot Password',
      messages: req.flash()
    });
  },

  // Send OTP for forgot-password
  sendForgotPasswordOtp: async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) {
        req.flash('error_msg', 'Email required');
        return res.redirect('/forgot-password');
      }

      const user = await User.findOne({ where: { email: email.toLowerCase() }});
      if (!user) {
        // avoid account enumeration
        req.flash('success_msg', 'If an account exists, an OTP has been sent.');
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
      console.error('sendForgotPasswordOtp error:', err);
      req.flash('error_msg', 'Error sending OTP');
      return res.redirect('/forgot-password');
    }
  },

  // Render reset password page (views/frontend/reset-password.ejs)
  showResetPassword: (req, res) => {
    return res.render('frontend/reset-password', {
      title: 'Reset Password',
      userId: req.params.userId,
      messages: req.flash()
    });
  },

  // Verify OTP and set new password
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

      user.password = await bcrypt.hash(password, SALT_ROUNDS);
      await user.save();

      req.flash('success_msg', 'Password reset — you can now login.');
      return res.redirect('/login');
    } catch (err) {
      console.error('resetPassword error:', err);
      req.flash('error_msg', 'Error resetting password');
      return res.redirect('/forgot-password');
    }
  },

  // Middleware to protect routes
  isAuthenticated: (req, res, next) => {
    if (req.session && req.session.user) {
      return next();
    }
    req.flash('error_msg', 'Please login to access that page.');
    return res.redirect('/login');
  },

  // Render My Account dashboard (views/frontend/myaccount.ejs)
  showMyAccount: async (req, res) => {
    try {
      const userSession = req.session.user || null;

      // Optionally fetch fresh user data or related resources (orders/wishlist)
      // const user = await User.findByPk(userSession.id, { include: [...] });

      return res.render('frontend/myaccount', {
        title: 'My Account - Saver Grocery',
        user: userSession,
        messages: req.flash()
      });
    } catch (err) {
      console.error('showMyAccount error:', err);
      req.flash('error_msg', 'Unable to open account page');
      return res.redirect('/');
    }
  }
};

module.exports = authController;
