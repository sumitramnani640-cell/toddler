const { Product, Category, Banner, User, Order, Newsletter } = require('../../models');

const dashboardController = {
  index: async (req, res) => {
    try {
      const [
        totalProducts,
        totalCategories,
        totalCustomers,
        totalBanners,
        totalOrder,
        totalNewsletter
      ] = await Promise.all([
        Product.count(),
        Category.count(),
        User.count(),
        Banner.count(),
        Order.count(),
        Newsletter.count()
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

      res.render('admin/dashboard', {
        title: 'Dashboard - Savers Grocery Admin',
        totalProducts,
        totalCategories,
        totalCustomers,
        totalBanners,
        totalOrder,
        totalNewsletter, // ✅ added this
        recentProducts,
        recentCustomers
      });

    } catch (error) {
      console.error('Dashboard error:', error);
      req.flash('error_msg', 'Error loading dashboard');
      res.redirect('/admin/login');
    }
  }
};

module.exports = dashboardController;
