const { Order, User } = require('../../models');

const orderController = {
  // 📦 List all orders
  index: async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = 10;
      const offset = (page - 1) * limit;

      const { count, rows: orders } = await Order.findAndCountAll({
        order: [['createdAt', 'DESC']],
        limit,
        offset,
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'name', 'email']
          }
        ],
        attributes: [
          'id',
          'userId',
          'totalAmount',
          'status',
          'createdAt',
          'updatedAt'
        ]
      });

      const totalPages = Math.ceil(count / limit);

      res.render('admin/Orders/index', {
        title: 'Orders - Savers Grocery Admin',
        orders,
        currentPage: page,
        totalPages,
        totalOrders: count
      });

    } catch (error) {
      console.error('Orders index error:', error);
      req.flash('error_msg', 'Error loading orders');
      res.redirect('/admin/dashboard');
    }
  },

  // 👁️ View single order
  show: async (req, res) => {
    try {
      const order = await Order.findByPk(req.params.id, {
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'name', 'email', 'phone']
          }
        ]
      });

      if (!order) {
        req.flash('error_msg', 'Order not found');
        return res.redirect('/admin/Orders');
      }

      res.render('admin/Orders/view', {
        title: `Order #${order.id} - Savers Grocery Admin`,
        order
      });
    } catch (error) {
      console.error('Order show error:', error);
      req.flash('error_msg', 'Error loading order');
      res.redirect('/admin/Orders');
    }
  },

  // ✏️ Edit order
  edit: async (req, res) => {
    try {
      const order = await Order.findByPk(req.params.id, {
        attributes: ['id', 'userId', 'totalAmount', 'status']
      });

      if (!order) {
        req.flash('error_msg', 'Order not found');
        return res.redirect('/admin/Orders');
      }

      res.render('admin/Orders/edit', {
        title: `Edit Order #${order.id} - Savers Grocery Admin`,
        order
      });
    } catch (error) {
      console.error('Order edit form error:', error);
      req.flash('error_msg', 'Error loading edit form');
      res.redirect('/admin/Orders');
    }
  },

  // 🔄 Update order
  update: async (req, res) => {
    try {
      const order = await Order.findByPk(req.params.id);
      if (!order) {
        req.flash('error_msg', 'Order not found');
        return res.redirect('/admin/Orders');
      }

      const { status } = req.body;

      await order.update({
        status: status || order.status
      });

      req.flash('success_msg', 'Order updated successfully');
      res.redirect('/admin/Orders');
    } catch (error) {
      console.error('Order update error:', error);
      req.flash('error_msg', 'Error updating order');
      res.redirect(`/admin/Orders/${req.params.id}/edit`);
    }
  },
// ❌ Permanently delete order
destroy: async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id);

    if (!order) {
      req.flash('error_msg', 'Order not found');
      return res.redirect('/admin/Orders');
    }

    await order.destroy(); // 🚀 Permanently delete the order from DB

    req.flash('success_msg', 'Order deleted successfully');
    res.redirect('/admin/Orders');
  } catch (error) {
    console.error('Order delete error:', error);
    req.flash('error_msg', 'Error deleting order');
    res.redirect('/admin/Orders');
  }
}
};

module.exports = orderController;
