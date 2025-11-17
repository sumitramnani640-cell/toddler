// src/controllers/admin/dashboardController.js
const { Product, Category, Banner, User, Order, Newsletter, CategoryFeature, ProductFeature } = require('../../models');

const dashboardController = {
  index: async (req, res) => {
    try {
      // Accept either admin or adminUser (backwards compatible)
      const hasAdmin = req.session && ((req.session.admin && req.session.admin.id) || (req.session.adminUser && req.session.adminUser.id));
      console.log('dashboardController.index: session keys=', Object.keys(req.session || {}));
      console.log('dashboardController.index: hasAdmin=', !!hasAdmin);

      if (!hasAdmin) {
        req.flash('error_msg', 'Please log in to access the admin panel');
        return res.redirect('/admin/login');
      }

      const [
        totalProducts,
        totalCategories,
        totalCustomers,
        totalBanners,
        totalOrder,
        totalNewsletter,
        totalCategoryFeatures,
        totalProductFeatures
      ] = await Promise.all([
        Product.count(),
        Category.count(),
        User.count(),
        Banner.count(),
        Order.count(),
        Newsletter.count(),
        CategoryFeature.count(),
        ProductFeature.count()
      ]);

      const recentProducts = await Product.findAll({
        include: [{
          model: Category,
          as: 'category',
          attributes: ['name']
        }],
        order: [['createdAt', 'DESC']],
        limit: 5
      });

      const recentCustomers = await User.findAll({
        order: [['createdAt', 'DESC']],
        limit: 5,
        attributes: ['id', 'name', 'email', 'phone', 'createdAt']
      });

      return res.render('admin/dashboard', {
        title: 'Dashboard - Savers Grocery Admin',
        totalProducts,
        totalCategories,
        totalCustomers,
        totalBanners,
        totalOrder,
        totalNewsletter,
        recentProducts,
        recentCustomers,
        totalCategoryFeatures,
        totalProductFeatures,
        layout: 'admin/layouts/admin'
      });

    } catch (error) {
      console.error('Dashboard error:', error);

      // Render an error page inside admin area instead of redirecting to login.
      // This prevents potential redirect loops and gives the admin useful feedback.
      res.status(500).render('admin/error', {
        title: 'Admin - Error',
        message: 'Failed to load dashboard. Please try again later.',
        error: process.env.NODE_ENV === 'development' ? error : {},
        layout: 'admin/layouts/admin'
      });
    }
  }
};

module.exports = dashboardController;
