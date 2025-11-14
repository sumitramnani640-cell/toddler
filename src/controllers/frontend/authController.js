// src/controllers/frontend/authController.js
const { User } = require('../../models');
const bcrypt = require('bcryptjs');
const otpService = require('../../services/otpService');
const emailService = require('../../services/emailService');
const smsService = require('../../services/smsService');

const SALT_ROUNDS = 10;

const authController = {
  showRegister: (req, res) => {
    return res.render('frontend/account/register', { title: 'Register - Saver Grocery', messages: req.flash() });
  },

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

      const user = await User.create({ name, email: emailLower, phone, password, is_verified: false });

      const { otp } = await otpService.generateAndSaveOtp({ modelInstance: user, purpose: 'registration', expiryMinutes: 10 });

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

  showVerifyRegistration: (req, res) => {
    return res.render('frontend/account/verify-registration', { title: 'Verify Account', userId: req.params.userId, messages: req.flash() });
  },

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

  showLogin: (req, res) => {
    return res.render('frontend/account/login', { title: 'Login - Saver Grocery', messages: req.flash() });
  },

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

      if (user.status !== 'active') {
        req.flash('error_msg', 'Account is deactivated');
        return res.redirect('/login');
      }

      const ok = await user.comparePassword(password);
      if (!ok) {
        req.flash('error_msg', 'Invalid credentials');
        return res.redirect('/login');
      }

      if (!user.is_verified) {
        req.flash('error_msg', 'Please verify your account first.');
        return res.redirect(`/verify-registration/${user.id}`);
      }

      req.session.user = { id: user.id, name: user.name, email: user.email };
      req.flash('success_msg', 'Logged in successfully');
      return res.redirect('/');
    } catch (err) {
      console.error('Login error:', err);
      req.flash('error_msg', 'Login error');
      return res.redirect('/login');
    }
  },

  logout: (req, res) => {
    req.session.destroy(err => {
      if (err) console.error('Logout error:', err);
      return res.redirect('/');
    });
  },

  showForgotPassword: (req, res) => {
    return res.render('frontend/account/forgot-password', { title: 'Forgot Password', messages: req.flash() });
  },

  sendForgotPasswordOtp: async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) {
        req.flash('error_msg', 'Email required');
        return res.redirect('/forgot-password');
      }

      const user = await User.findOne({ where: { email: email.toLowerCase() }});
      if (!user) {
        req.flash('success_msg', 'If an account exists, an OTP has been sent.');
        return res.redirect('/forgot-password');
      }

      const { otp } = await otpService.generateAndSaveOtp({ modelInstance: user, purpose: 'forgot_password', expiryMinutes: 10 });
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

  showResetPassword: (req, res) => {
    return res.render('frontend/account/reset-password', { title: 'Reset Password', userId: req.params.userId, messages: req.flash() });
  },

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
  }
};

module.exports = authController;
