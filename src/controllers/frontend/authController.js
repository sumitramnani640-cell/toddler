// src/controllers/frontend/authController.js
const { User } = require('../../models');
const bcrypt = require('bcryptjs');
const otpService = require('../../services/otpService'); // still used for forgot-password flow
const emailService = require('../../services/emailService');
const smsService = require('../../services/smsService');

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
        password, // plain -> hashed by model hook
        is_verified: false
      });

      // send OTP for registration verification (keep registration verification)
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
      console.error('verifyRegistration error:', err);
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

    // 1) basic validation
    if (!email || !password) {
      req.flash('error_msg', 'Please enter valid email and password');
      return res.redirect('/login');
    }

    const emailLower = email.toLowerCase();

    // 2) try to find user by email
    const user = await User.findOne({ where: { email: emailLower }});

    // 2a) if user not found -> show message asking to enter valid email+pass
    if (!user) {
      // preserve entered email for convenience (optional)
      req.flash('prefillEmail', emailLower);
      req.flash('error_msg', 'Enter a valid email and password');
      return res.redirect('/login');
    }

    // 3) account status check
    if (user.status && user.status !== 'active') {
      req.flash('error_msg', 'Account is deactivated');
      return res.redirect('/login');
    }

    // 4) verify password (user.password is hashed in DB)
    const ok = typeof user.comparePassword === 'function'
      ? await user.comparePassword(password)
      : await bcrypt.compare(password, user.password);

    // 4a) if password mismatch -> explicit message to enter valid password
    if (!ok) {
      req.flash('prefillEmail', emailLower);
      req.flash('error_msg', 'Enter a valid password for this email');
      return res.redirect('/login');
    }

    // 5) verified flag check (if you require account verification)
    if (!user.is_verified) {
      req.flash('error_msg', 'Please verify your account first.');
      return res.redirect(`/verify-registration/${user.id}`);
    }

    // 6) success — set minimal session and redirect
    req.session.user = { id: user.id, name: user.name, email: user.email };
    req.flash('success_msg', 'Logged in successfully');
    return res.redirect('/'); // or '/' if you want homepage

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

  // Render forgot-password page
  showForgotPassword: (req, res) => {
    const prefillEmail = (req.flash('prefillEmail') || [])[0] || (req.query.email || '');
    return res.render('frontend/forgot-password', { title: 'Forgot Password', prefillEmail });
  },

  // Send OTP for forgot-password (retain this flow)
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
      console.error('sendForgotPasswordOtp error:', err);
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

      user.password = password; // model hook will hash
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
    if (req.session && req.session.user) return next();
    req.flash('error_msg', 'Please login to access that page.');
    return res.redirect('/login');
  },

  // authController.isAuthenticated — replace existing implementation with this
isAuthenticated: (req, res, next) => {
  if (req.session && req.session.user) {
    // expose user both on req and res.locals (useful for views)
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
      console.error('showMyAccount error:', err);
      req.flash('error_msg', 'Unable to open account page');
      return res.redirect('/');
    }
  }
};

module.exports = authController;
