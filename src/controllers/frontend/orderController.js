// src/controllers/frontend/orderController.js
const {
  Order,
  OrderItem,
  Product,
  Category,
  Cart,       // optional - if exported by your models
  CartItem,   // optional - if you have a CartItem table
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

function normalizeCartItemRow(r) {
  const qty = Number(r.qty ?? r.quantity ?? r.amount ?? 0);
  const product = r.Product || r.product || {};
  const price = Number(r.unit_price ?? r.price ?? product.price ?? 0);
  return {
    productId: r.product_id ?? r.productId ?? product.id ?? null,
    id: r.product_id ?? r.productId ?? product.id ?? null,
    name: r.product_name ?? r.name ?? product.name ?? 'Product',
    price,
    qty,
    image: product.image ?? r.image ?? null,
    meta: r.meta ?? null
  };
}

/**
 * DB-first cart loader:
 * - prefer DB rows for logged-in users (Cart table per-item), else session cart
 * Returns: { items: [...], totals: { quantity, amount }, dbCartInstance }
 */
async function getCartForRequest(req) {
  try {
    const userId = req.session?.user?.id ?? req.user?.id ?? req.session?.user?.userId ?? null;

    // DB cart (per-item rows)
    if (userId && typeof Cart !== 'undefined' && Cart) {
      try {
        const rows = await Cart.findAll({
          where: { userId },
          include: (typeof Product !== 'undefined') ? [{ model: Product, as: 'product' }] : []
        });

        if (rows && rows.length) {
          const items = rows.map(r => {
            const product = r.product || r.Product || {};
            const np = (typeof product.toJSON === 'function') ? product.toJSON() : product || {};
            const name = np.name || r.product_name || '';
            const price = Number(np.price ?? r.unit_price ?? r.price ?? 0);
            const qty = Number(r.qty ?? r.quantity ?? 0);
            const image = np.image ? (np.image.startsWith('/') ? np.image : `/uploads/${np.image}`) : r.image ?? null;
            const productId = r.productId ?? r.product_id ?? (np.id ?? null);
            const slug = np.slug ?? (np.name ? (np.name.toString().toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '')) : '');
            return {
              productId,
              id: productId,
              name,
              price,
              qty,
              imageUrl: image,
              slug,
              rawRow: r
            };
          });

          const totals = items.reduce((acc, it) => {
            acc.quantity += Number(it.qty || 0);
            acc.amount += (Number(it.price || 0) * Number(it.qty || 0));
            return acc;
          }, { quantity: 0, amount: 0 });

          return { items, totals, dbCartInstance: null };
        }
        // else: fallthrough to session
      } catch (e) {
        console.warn('[getCart] DB Cart read failed:', e && e.message ? e.message : e);
      }
    }

    // Session fallback
    if (req.session?.cart && Array.isArray(req.session.cart.items)) {
      const sess = req.session.cart;
      const items = (sess.items || []).map(i => ({
        productId: i.productId ?? i.id,
        id: i.productId ?? i.id,
        name: i.name,
        price: Number(i.price || 0),
        qty: Number(i.qty || 0),
        imageUrl: i.imageUrl ?? i.image ?? null,
        slug: i.slug ?? null
      }));
      const totals = sess.totals || {
        quantity: items.reduce((s, it) => s + (Number(it.qty) || 0), 0),
        amount: items.reduce((s, it) => s + ((Number(it.qty) || 0) * (Number(it.price) || 0)), 0)
      };
      return { items, totals, dbCartInstance: null };
    }

    return { items: [], totals: { quantity: 0, amount: 0 }, dbCartInstance: null };
  } catch (err) {
    console.error('[getCart] unexpected err', err);
    return { items: [], totals: { quantity: 0, amount: 0 }, dbCartInstance: null };
  }
}

const orderController = {

  /** CHECKOUT PAGE */
  showCheckout: async (req, res) => {
    try {
      const cartObj = await getCartForRequest(req);
      const cart = { items: cartObj.items, totals: cartObj.totals };

      const categories = await Category.findAll({
        where: { status: 'active' },
        order: [['name', 'ASC']],
        attributes: ['id', 'name', 'slug']
      }).catch((e) => {
        console.warn('[showCheckout] categories fetch failed', e && e.message ? e.message : e);
        return [];
      });

      return res.render('frontend/checkout', {
        cart,
        categories,
        category: req.query.category || '',
        q: req.query.q || '',
        title: 'Checkout'
      });
    } catch (err) {
      console.error('[showCheckout] error', err);
      return res.status(500).send('Server error');
    }
  },

  /** PLACE ORDER */
  placeOrder: async (req, res) => {
    const t = await sequelize.transaction();
    try {
      const cartObj = await getCartForRequest(req);
      const cart = { items: cartObj.items, totals: cartObj.totals };

      if (!cart || !Array.isArray(cart.items) || cart.items.length === 0) {
        await t.rollback();
        return res.status(400).json({ error: 'Cart is empty' });
      }

      const userId = req.session?.user?.id || req.session?.user?.userId || req.user?.id || req.body.userId || null;
      const delivery = Number(req.body.delivery || 0);
      const screenshot = req.body.screenshotUrl || req.body.screenshot || null;

      const subtotal = Number(cart.totals?.amount) ||
        cart.items.reduce((sum, item) => sum + (Number(item.price || 0) * Number(item.qty || 0)), 0);

      const total = subtotal + (Number(delivery) || 0);

      const order = await Order.create({
        userId,
        totalAmount: total,
        subtotalAmount: subtotal,
        deliveryCharge: delivery,
        status: 'pending',
        items: { products: cart.items, meta: { subtotal, delivery, total } },
        screenshotUrl: screenshot || null
      }, { transaction: t });

      // create OrderItem rows if model exists
      if (OrderItem && Array.isArray(cart.items) && cart.items.length) {
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
          console.warn('[placeOrder] OrderItem.bulkCreate failed', e && e.message ? e.message : e);
        }
      }

      // decrement stock (best-effort)
      for (const it of cart.items) {
        const pid = it.productId || it.id || it.product_id;
        if (pid && Number(it.qty)) {
          try {
            await Product.decrement({ stock: Number(it.qty) }, { where: { id: pid }, transaction: t });
          } catch (e) {
            console.warn('[placeOrder] could not decrement stock for', pid, e && e.message ? e.message : e);
          }
        }
      }

      await t.commit();

      // clear session cart
      req.session.cart = { items: [], totals: { quantity: 0, amount: 0 } };

      // best-effort: clear DB cart rows for user
      try {
        if (Cart) {
          const uid = userId;
          if (uid) await Cart.destroy({ where: { userId: uid } }).catch(() => {});
        }
      } catch (e) {
        console.warn('[placeOrder] clearing DB cart failed', e && e.message ? e.message : e);
      }

      return res.redirect(`/order/confirmation/${order.id}`);
    } catch (err) {
      await t.rollback();
      console.error('[placeOrder] fatal error', err && err.stack ? err.stack : err);
      return res.status(500).json({ error: 'Unable to place order' });
    }
  },

  /** CONFIRMATION - friendly URL: /order/confirmation/:id or /confirmation?orderId= */
  confirmation: async (req, res) => {
    try {
      const orderId = req.params.id || req.query.orderId;
      if (!orderId) {
        req.flash && req.flash('error_msg') && req.flash('error_msg', 'Order not specified');
        return res.redirect('/');
      }

      // Try to fetch order. If user logged in, enforce ownership; otherwise try fallback.
      let order = null;
      try {
        const where = { id: orderId };
        if (req.session?.user?.id) where.userId = req.session.user.id;
        order = await Order.findOne({ where }).catch(() => null);

        // If not found with ownership constraint, try without (useful for admins/dev)
        if (!order) {
          order = await Order.findOne({ where: { id: orderId } }).catch(() => null);
        }
      } catch (e) {
        console.warn('[confirmation] DB lookup failed', e && e.message ? e.message : e);
      }

      if (!order) {
        // render view without order data (404 like)
        return res.status(404).render('frontend/order-confirmation', {
          title: 'Order Confirmation',
          order: null,
          user: req.session?.user || null
        });
      }

      const orderObj = {
        id: order.id,
        totalAmount: order.totalAmount ?? order.total ?? null,
        createdAt: order.createdAt,
        screenshotUrl: order.screenshotUrl || debugScreenshotUrl,
        items: (order.items && Array.isArray(order.items.products)) ? order.items.products : (order.items?.products || [])
      };

      return res.render('frontend/order-confirmation', {
        title: `Order #${orderObj.id}`,
        order: orderObj,
        user: req.session?.user || null
      });
    } catch (err) {
      console.error('[confirmation] error', err && (err.stack || err));
      req.flash && req.flash('error_msg') && req.flash('error_msg', 'Cannot show confirmation');
      return res.redirect('/');
    }
  },

  /** ORDER HISTORY */
  orderHistory: async (req, res) => {
    try {
      if (!req.session.user?.id) {
        req.flash('error_msg', 'Please login to view orders');
        return res.redirect('/login');
      }
      const userId = req.session.user.id;

      const orders = await Order.findAll({
        where: { userId },
        order: [['createdAt', 'DESC']]
      });

      let itemsByOrder = {};
      try {
        const orderIds = orders.map(o => o.id);
        if (orderIds.length && OrderItem) {
          const rawItems = await OrderItem.findAll({ where: { order_id: orderIds } }).catch(() => []);
          rawItems.forEach(it => {
            const oid = it.order_id ?? it.orderId;
            if (!itemsByOrder[oid]) itemsByOrder[oid] = [];
            itemsByOrder[oid].push(it);
          });
        }
      } catch (e) {
        console.warn('[orderHistory] item grouping failed', e && e.message ? e.message : e);
        itemsByOrder = {};
      }

      const formattedOrders = orders.map(o => {
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

      const cartObj = await getCartForRequest(req);
      const cartCount = Array.isArray(cartObj.items) ? cartObj.items.length : (req.session.cart?.items?.length || 0);

      return res.render('frontend/orders', {
        title: 'My Orders',
        user: req.session.user,
        cartCount,
        orders: formattedOrders,
        categories
      });
    } catch (err) {
      console.error('[orderHistory] error', err);
      req.flash('error_msg', 'Unable to load order history');
      return res.redirect('/account');
    }
  },

  /** ORDER DETAILS / VIEW */
  orderDetails: async (req, res) => {
    try {
      if (!req.session.user?.id) {
        req.flash('error_msg', 'Please login to view this order');
        return res.redirect('/login');
      }
      const userId = req.session.user.id;
      const orderId = req.params.id;

      const order = await Order.findOne({ where: { id: orderId, userId } });

      if (!order) {
        req.flash('error_msg', 'Order not found');
        return res.redirect('/order-history');
      }

      let products = [];
      try {
        const itemsRows = OrderItem ? await OrderItem.findAll({ where: { order_id: order.id }, include: Product ? [{ model: Product }] : [] }).catch(() => []) : [];
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
        console.warn('[orderDetails] reading items failed', e && e.message ? e.message : e);
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

      const cartObj = await getCartForRequest(req);
      const cartCount = Array.isArray(cartObj.items) ? cartObj.items.length : (req.session.cart?.items?.length || 0);

      return res.render('frontend/order-view', {
        title: `Order #${order.id}`,
        user: req.session.user,
        cartCount,
        order: orderInfo,
        items: products,
        categories
      });
    } catch (err) {
      console.error('[orderDetails] error', err);
      req.flash('error_msg', 'Cannot open order');
      return res.redirect('/order-history');
    }
  }

};

module.exports = orderController;
