const { Admin } = require('../../models');
const { validationResult } = require('express-validator');

const authController = {
    // Show login form
    showLogin: (req, res) => {
        // If already logged in, redirect to dashboard
        if (req.session.user) {
            return res.redirect('/admin/dashboard');
        }
        
        res.render('admin/login', {
            title: 'Admin Login - Savers Grocery',
            layout: false
        });
    },

    // Handle login
    login: async (req, res) => {
        try {
            const { email, password } = req.body;

            // Basic validation
            if (!email || !password) {
                req.flash('error_msg', 'Please provide both email and password');
                return res.redirect('/admin/login');
            }

            // Find admin by email
            const admin = await Admin.findOne({
                where: { email: email.toLowerCase() }
            });

            if (!admin) {
                req.flash('error_msg', 'Invalid email or password');
                return res.redirect('/admin/login');
            }

            // Check if admin is active
            if (admin.status !== 'active') {
                req.flash('error_msg', 'Your account has been deactivated');
                return res.redirect('/admin/login');
            }

            // Compare password
            const isMatch = await admin.comparePassword(password);
            if (!isMatch) {
                req.flash('error_msg', 'Invalid email or password');
                return res.redirect('/admin/login');
            }

            // Set session
            req.session.user = {
                id: admin.id,
                name: admin.name,
                email: admin.email,
                role: admin.role
            };

            req.flash('success_msg', 'Welcome back!');
            res.redirect('/admin/dashboard');

        } catch (error) {
            console.error('Login error:', error);
            req.flash('error_msg', 'An error occurred during login');
            res.redirect('/admin/login');
        }
    },

    // Handle logout
    logout: (req, res) => {
        req.session.destroy((err) => {
            if (err) {
                console.error('Logout error:', err);
                req.flash('error_msg', 'Error occurred during logout');
                return res.redirect('/admin/dashboard');
            }
            res.redirect('/admin/login');
        });
    }
};

module.exports = authController;
