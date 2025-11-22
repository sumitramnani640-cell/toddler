// src/controllers/frontend/orderController.js

const {
  Order,
  OrderItem,
  Product,
  Category,
  sequelize
} = require('../../models');

// LOCAL UPLOADED SCREENSHOT PATH (fallback)
const debugScreenshotUrl = '/mnt/data/32c7a041-e1a1-47a3-a8b8-f756913068be.png';

// Helpers
const formatCurrency = (value) => {
  try {
    return new Intl.NumberFormat('en-AE', { style: 'currency', currency: 'AED' }).format(Number(value || 0));
  } catch {
    return `AED ${Number(value || 0).toFixed(2)}`;
  }
};

const formatDate = (d) => {
  try {
    const dt = new Date(d);
    return dt.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return d;
  }
};

const orderController = {

  /** ====================================================
   *  CHECKOUT PAGE
   * ==================================================== */
  showCheckout: async (req, res) => {
    try {
      const cart = req.session.cart || { items: [], totals: { quantity: 0, amount: 0 } };

      const categories = await Category.findAll({
        where: { status: 'active' },
        order: [['name', 'ASC']],
        attributes: ['id', 'name', 'slug']
      }).catch(() => []);

      return res.render('frontend/checkout', {
        cart,
        categories,
        category: req.query.category || '',
        q: req.query.q || '',
        title: 'Checkout'
      });
    } catch (err) {
      console.error('Checkout show error', err);
      return res.status(500).send('Server error');
    }
  },

  /** ====================================================
   *  PLACE ORDER
   *  - Uses model attribute names: userId, totalAmount, subtotalAmount, deliveryCharge, items, screenshotUrl
   * ==================================================== */
  placeOrder: async (req, res) => {
    const t = await sequelize.transaction();
    try {
      const cart = req.session.cart;
      if (!cart || !Array.isArray(cart.items) || cart.items.length === 0) {
        await t.rollback();
        return res.status(400).json({ error: 'Cart is empty' });
      }

      const userId = req.session?.user?.id || req.body.userId || null;
      const delivery = Number(req.body.delivery || 0);
      const screenshot = req.body.screenshotUrl || req.body.screenshot || null;

      // compute totals defensively
      const subtotal = Number(cart.totals?.amount) ||
        cart.items.reduce((sum, item) => sum + (Number(item.price || 0) * Number(item.qty || 0)), 0);

      const total = subtotal + (Number(delivery) || 0);

      // Create order using camelCase attributes (match your Sequelize model)
      const order = await Order.create({
        userId,
        totalAmount: total,
        subtotalAmount: subtotal,
        deliveryCharge: delivery,
        status: 'pending',
        // store items as JSON (keep product details + meta)
        items: {
          products: cart.items,
          meta: { subtotal, delivery, total }
        },
        screenshotUrl: screenshot || null
      }, { transaction: t });

      // If you maintain a separate OrderItem table, create items there too (best-effort)
      if (Array.isArray(cart.items) && cart.items.length && typeof OrderItem !== 'undefined') {
        try {
          const itemsPayload = cart.items.map(i => ({
            order_id: order.id,
            product_id: i.productId || i.id,
            product_name: i.name,
            qty: i.qty,
            unit_price: Number(i.price || 0),
            total_price: Number(i.price || 0) * Number(i.qty || 0)
          }));
          await OrderItem.bulkCreate(itemsPayload, { transaction: t });
        } catch (e) {
          // not fatal — Order already created, log and continue
          console.warn('Warning: could not create OrderItem rows:', e.message || e);
        }
      }

      // Optionally decrement stock for products
      for (const it of cart.items) {
        if (it.productId) {
          try {
            await Product.decrement({ stock: it.qty }, { where: { id: it.productId }, transaction: t });
          } catch (e) {
            // continue even if stock update fails
            console.warn('Warning: could not decrement stock for product', it.productId, e.message || e);
          }
        }
      }

      await t.commit();

      // clear cart
      req.session.cart = { items: [], totals: { quantity: 0, amount: 0 } };

      // redirect to confirmation page (web)
      return res.redirect(`/order/confirmation/${order.id}`);
    } catch (err) {
      await t.rollback();
      console.error('Place order error', err);
      return res.status(500).json({ error: 'Unable to place order' });
    }
  },

  /** ====================================================
   *  ORDER HISTORY (renders src/views/frontend/orders.ejs)
   * ==================================================== */
  orderHistory: async (req, res) => {
    try {
      if (!req.session.user?.id) {
        req.flash('error_msg', 'Please login to view orders');
        return res.redirect('/login');
      }
      const userId = req.session.user.id;

      // Fetch orders (use camelCase userId attribute)
      const orders = await Order.findAll({
        where: { userId },
        order: [['createdAt', 'DESC']]
      });

      // If you have an OrderItem table and want item counts, fetch them; else use JSON items
      let itemsByOrder = {};
      try {
        const orderIds = orders.map(o => o.id);
        if (orderIds.length && typeof OrderItem !== 'undefined') {
          // try to get order items grouped by order_id
          const rawItems = await OrderItem.findAll({ where: { order_id: orderIds } });
          rawItems.forEach(it => {
            const oid = it.order_id ?? it.orderId;
            if (!itemsByOrder[oid]) itemsByOrder[oid] = [];
            itemsByOrder[oid].push(it);
          });
        }
      } catch (e) {
        // ignore if OrderItem doesn't exist or query fails
        itemsByOrder = {};
      }

      const formattedOrders = orders.map(o => {
        // prefer JSON items (o.items.products) if present
        let itemsCount = 0;
        if (o.items && Array.isArray(o.items.products)) {
          itemsCount = o.items.products.reduce((s, p) => s + (Number(p.qty || 0)), 0);
        } else {
          const its = itemsByOrder[o.id] || [];
          itemsCount = its.reduce((s, i) => s + (Number(i.qty || 0)), 0);
        }

        return {
          id: o.id,
          customerName: req.session.user.name,
          itemsCount,
          status: o.status,
          totalFormatted: formatCurrency(o.totalAmount),
          dateFormatted: formatDate(o.createdAt),
          screenshotUrl: o.screenshotUrl || debugScreenshotUrl
        };
      });

      const categories = await Category.findAll({
        where: { status: 'active' },
        order: [['name', 'ASC']],
        attributes: ['id', 'name', 'slug']
      }).catch(() => []);

      return res.render('frontend/orders', {
        title: 'My Orders',
        user: req.session.user,
        cartCount: req.session.cart?.items?.length || 0,
        orders: formattedOrders,
        categories
      });
    } catch (err) {
      console.error('Order history error', err);
      req.flash('error_msg', 'Unable to load order history');
      return res.redirect('/account');
    }
  },

  /** ====================================================
   *  ORDER DETAILS / VIEW
   * ==================================================== */
  orderDetails: async (req, res) => {
    try {
      if (!req.session.user?.id) {
        req.flash('error_msg', 'Please login to view this order');
        return res.redirect('/login');
      }
      const userId = req.session.user.id;
      const orderId = req.params.id;

      const order = await Order.findOne({
        where: { id: orderId, userId }
      });

      if (!order) {
        req.flash('error_msg', 'Order not found');
        return res.redirect('/order-history');
      }

      // If you have OrderItem rows, prefer those; else use JSON items
      let products = [];
      try {
        const itemsRows = await OrderItem.findAll({ where: { order_id: order.id }, include: [{ model: Product }] });
        if (itemsRows && itemsRows.length) {
          products = itemsRows.map(it => ({
            qty: it.qty,
            name: it.product_name || it.Product?.name || 'Product',
            unitPrice: formatCurrency(it.unit_price),
            totalPrice: formatCurrency(it.total_price),
            product: it.Product || null
          }));
        } else if (order.items && Array.isArray(order.items.products)) {
          products = order.items.products.map(p => ({
            qty: p.qty,
            name: p.name || p.product_name || 'Product',
            unitPrice: formatCurrency(p.price || p.unit_price || 0),
            totalPrice: formatCurrency((p.price || p.unit_price || 0) * (p.qty || 1)),
            product: null
          }));
        }
      } catch (e) {
        // fallback to JSON items if any error
        if (order.items && Array.isArray(order.items.products)) {
          products = order.items.products.map(p => ({
            qty: p.qty,
            name: p.name || p.product_name || 'Product',
            unitPrice: formatCurrency(p.price || p.unit_price || 0),
            totalPrice: formatCurrency((p.price || p.unit_price || 0) * (p.qty || 1)),
            product: null
          }));
        } else {
          products = [];
        }
      }

      const orderInfo = {
        id: order.id,
        status: order.status,
        subtotal: formatCurrency(order.subtotalAmount ?? (order.items?.meta?.subtotal ?? 0)),
        delivery: formatCurrency(order.deliveryCharge ?? (order.items?.meta?.delivery ?? 0)),
        total: formatCurrency(order.totalAmount ?? 0),
        date: formatDate(order.createdAt),
        screenshotUrl: order.screenshotUrl || debugScreenshotUrl
      };

      const categories = await Category.findAll({
        where: { status: 'active' },
        order: [['name', 'ASC']],
        attributes: ['id', 'name', 'slug']
      }).catch(() => []);

      return res.render('frontend/order-view', {
        title: `Order #${order.id}`,
        user: req.session.user,
        cartCount: req.session.cart?.items?.length || 0,
        order: orderInfo,
        items: products,
        categories
      });
    } catch (err) {
      console.error('Order details error', err);
      req.flash('error_msg', 'Cannot open order');
      return res.redirect('/order-history');
    }
  }

};

module.exports = orderController;
