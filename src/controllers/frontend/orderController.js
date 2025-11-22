// ...existing code...
const { Order, OrderItem, Product, sequelize, Category } = require('../../models');

const orderController = {
  // GET /checkout
  showCheckout: async (req, res) => {
      try {
      const cart = req.session.cart || { items: [], totals: { quantity: 0, amount: 0 } };

      // load categories for the select in checkout.ejs (if needed)
      const categories = await (async () => {
        try {
          const { Category } = require('../../models');
          return await Category.findAll({ where: { status: 'active' }, order: [['name','ASC']], attributes: ['id','name','slug'] });
        } catch (e) {
          return [];
        }
      })();

      return res.render('frontend/checkout', {
        cart,
        categories,
        category: req.query.category || (req.session.checkout && req.session.checkout.category) || '',
        q: req.query.q || '',
        title: 'Checkout'
      });
    } catch (err) {
      console.error('Checkout show error', err);
      return res.status(500).send('Server error');
    }
  },

  // ...existing code...
  placeOrder: async (req, res) => {
    const t = await sequelize.transaction();
    try {
      const cart = req.session.cart;
      if (!cart || !cart.items || cart.items.length === 0) {
        await t.rollback();
        return res.status(400).json({ error: 'Cart is empty' });
      }

      const userId = (req.session.user && req.session.user.id) || req.body.userId || null;
      const delivery = parseFloat(req.body.delivery || 0);
      const screenshot = req.body.screenshotUrl || req.body.screenshot || null;

      // compute totals defensively
      const subtotal = Number(cart.totals?.amount || cart.items.reduce((s, it) => s + (it.price * it.qty), 0));
      const total = subtotal + delivery;

      // create order (adjust fields to match your Order model)
      const order = await Order.create({
        user_id: userId,
        total_amount: total,
        subtotal_amount: subtotal,
        delivery_charge: delivery,
        status: 'pending',
        screenshot_url: screenshot
      }, { transaction: t });

      // prepare items payload
      const itemsPayload = cart.items.map(i => ({
        order_id: order.id,
        product_id: i.productId || i.id,
        product_name: i.name,
        qty: i.qty,
        unit_price: Number(i.price),
        total_price: Number(i.price) * Number(i.qty)
      }));

      await OrderItem.bulkCreate(itemsPayload, { transaction: t });

      // Optionally decrement product stock
      for (const it of cart.items) {
        if (it.productId) {
          await Product.decrement({ stock: it.qty }, { where: { id: it.productId }, transaction: t });
        }
      }

      await t.commit();

      // clear cart
      req.session.cart = { items: [], totals: { quantity: 0, amount: 0 } };

      // respond or redirect
      if (req.xhr || req.headers.accept?.includes('application/json')) {
        return res.json({ success: true, orderId: order.id });
      } else {
        return res.redirect(`/order/confirmation/${order.id}`);
      }
    } catch (err) {
      await t.rollback();
      console.error('Place order error', err);
      return res.status(500).json({ error: 'Unable to place order' });
    }
  }
};
// ...existing code...
module.exports = orderController;