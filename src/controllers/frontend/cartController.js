// src/controllers/frontend/cartController.js
const { Product, Category } = require('../../models');
const { Op } = require('sequelize');

const productAttrs = [
  'id','name','description','price','stock','image','category_id','status','createdAt','updatedAt','slug'
];

const categoryAttrs = ['id', 'name', 'slug', 'image', 'banner_image', 'updatedAt'];

// normalize product for cart (urls, slug, images)
function normalizeProductForCart(p) {
  const po = (p && typeof p.toJSON === 'function') ? p.toJSON() : p || {};

  if (!po.slug && po.name) {
    po.slug = (po.name || '').toString().toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '');
  }

  po.images = po.images || [];
  if (po.image) po.images.push({ filename: po.image });

  po.imageUrl = po.image
    ? (po.image.startsWith('/') ? po.image : (po.image.startsWith('uploads/') ? `/${po.image}` : `/uploads/${po.image}`))
    : '/images/placeholder.png';

  po.price = typeof po.price === 'string' ? parseFloat(po.price) || 0 : (po.price || 0);

  return po;
}

// session cart helpers
function ensureCart(req) {
  if (!req.session) req.session = {};
  if (!req.session.cart) {
    req.session.cart = { items: [], totalQty: 0, totalPrice: 0 };
  }
  return req.session.cart;
}

function recalcCart(cart) {
  cart.totalQty = (cart.items || []).reduce((s, it) => s + (Number(it.qty) || 0), 0);
  cart.totalPrice = (cart.items || []).reduce((s, it) => s + ((Number(it.qty) || 0) * (Number(it.price) || 0)), 0);

  // convenience fields
  cart.subtotal = Number(cart.totalPrice || 0);
  cart.vat = +((cart.subtotal * 0.05) || 0).toFixed(2); // 5% VAT (adjust if needed)
  cart.total = +(cart.subtotal + cart.vat).toFixed(2);

  return cart;
}

function getCartCountFromSession(req) {
  try {
    if (req.session && req.session.cart) {
      const cart = req.session.cart;
      if (Array.isArray(cart.items)) return cart.items.reduce((s, it) => s + (it.qty || 0), 0);
      if (typeof cart.totalQty === 'number') return cart.totalQty;
    }
  } catch (e) {}
  return 0;
}

async function fetchCategoriesPlain() {
  const categories = await Category.findAll({
    where: { status: 'active' },
    order: [['name', 'ASC']],
    attributes: categoryAttrs
  });

  return (categories || []).map(c => {
    const obj = (c && typeof c.toJSON === 'function') ? c.toJSON() : c;
    obj.imageUrl = obj.image ? (obj.image.startsWith('/') ? obj.image : `/uploads/${obj.image}`) : '/placeholder.jpg';
    obj.bannerImageUrl = obj.banner_image ? (obj.banner_image.startsWith('/') ? obj.banner_image : `/uploads/${obj.banner_image}`) : null;
    return obj;
  });
}

const cartController = {
  // GET /cart
  index: async (req, res) => {
    const q = req.query.q || '';
    const category = req.query.category || '';
    try {
      const categoriesPlain = await fetchCategoriesPlain();

      const cart = ensureCart(req);
      const productIds = cart.items.map(i => i.productId).filter(Boolean);

      let productsMap = {};
      if (productIds.length) {
        const products = await Product.findAll({
          attributes: productAttrs,
          where: { id: { [Op.in]: productIds } }
        });
        productsMap = products.reduce((m, p) => {
          const np = normalizeProductForCart(p);
          m[np.id] = np;
          return m;
        }, {});
      }

      const mergedItems = (cart.items || []).map(it => {
        const fresh = productsMap[it.productId];
        if (fresh) {
          return {
            productId: fresh.id,
            name: fresh.name || it.name,
            price: fresh.price || it.price,
            qty: Number(it.qty) || 0,
            imageUrl: fresh.imageUrl || it.imageUrl || '/images/placeholder.png',
            slug: fresh.slug || it.slug,
            stock: typeof fresh.stock === 'number' ? fresh.stock : undefined
          };
        }
        return Object.assign({}, it, { qty: Number(it.qty) || 0, price: Number(it.price) || 0 });
      });

      const safeCart = { items: mergedItems };
      recalcCart(safeCart);

      if (req.xhr || (req.headers.accept && req.headers.accept.indexOf('application/json') !== -1)) {
        return res.json({ success: true, cart: safeCart });
      }

      const subtotal = safeCart.subtotal || 0;
      const vat = safeCart.vat || 0;
      const total = safeCart.total || subtotal;

      res.render('frontend/cart', {
        title: 'Your Cart - Savers Grocery',
        cart: safeCart,
        cartCount: safeCart.totalQty || 0,
        categories: categoriesPlain,
        q,
        category,
        subtotal,
        vat,
        total,
        layout: false
      });
    } catch (error) {
      console.error('Cart index error:', error);

      let categoriesPlain = [];
      try { categoriesPlain = await fetchCategoriesPlain(); } catch (e) { /* ignore */ }

      res.render('frontend/cart', {
        title: 'Your Cart - Savers Grocery',
        cart: { items: [], totalQty: 0, totalPrice: 0 },
        cartCount: 0,
        categories: categoriesPlain,
        q: '',
        category: '',
        subtotal: 0,
        vat: 0,
        total: 0,
        layout: false
      });
    }
  },

  // POST /cart/add  (expects productId, qty)
  add: async (req, res) => {
    try {
      const productId = Number(req.body.productId || req.body.id);
      let qty = parseInt(req.body.qty || req.body.quantity || 1, 10);
      if (isNaN(productId) || productId <= 0) {
        return res.status(400).json({ success: false, message: 'Invalid product' });
      }
      if (isNaN(qty) || qty < 1) qty = 1;

      const product = await Product.findOne({
        attributes: productAttrs,
        where: { id: productId, status: 'active' }
      });

      if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }

      const p = normalizeProductForCart(product);
      const cart = ensureCart(req);

      const existing = cart.items.find(i => Number(i.productId) === Number(p.id));
      if (existing) {
        existing.qty = Number(existing.qty || 0) + qty;
        if (typeof p.stock === 'number' && existing.qty > p.stock) existing.qty = p.stock;
        existing.price = p.price;
        existing.name = p.name;
        existing.imageUrl = p.imageUrl;
        existing.slug = p.slug;
      } else {
        cart.items.push({
          productId: p.id,
          name: p.name,
          price: p.price,
          qty,
          imageUrl: p.imageUrl,
          slug: p.slug
        });
      }

      recalcCart(cart);

      if (req.xhr || (req.headers.accept && req.headers.accept.indexOf('application/json') !== -1)) {
        return res.json({ success: true, cart });
      }

      req.session.lastAdded = { productId: p.id, name: p.name };
      const redirectTo = req.get('Referrer') || '/cart';
      return res.redirect(redirectTo);
    } catch (error) {
      console.error('Cart add error:', error);
      if (req.xhr || (req.headers.accept && req.headers.accept.indexOf('application/json') !== -1)) {
        return res.status(500).json({ success: false, message: 'Could not add to cart' });
      }
      return res.redirect('back');
    }
  },

  // POST /cart/update  (expects productId, qty)
  update: async (req, res) => {
    try {
      const productId = Number(req.body.productId || req.body.id);
      let qty = parseInt(req.body.qty || req.body.quantity, 10);

      if (isNaN(productId) || productId <= 0 || isNaN(qty)) {
        return res.status(400).json({ success: false, message: 'Invalid input' });
      }

      if (qty < 0) qty = 0;

      const cart = ensureCart(req);
      const itemIndex = cart.items.findIndex(i => Number(i.productId) === Number(productId));
      if (itemIndex === -1) {
        return res.status(404).json({ success: false, message: 'Item not in cart' });
      }

      if (qty === 0) {
        cart.items.splice(itemIndex, 1);
      } else {
        const product = await Product.findOne({
          attributes: ['id', 'stock', 'price'],
          where: { id: productId }
        });
        if (product && typeof product.stock === 'number' && qty > product.stock) qty = product.stock;

        cart.items[itemIndex].qty = qty;
        if (product && typeof product.price !== 'undefined') cart.items[itemIndex].price = product.price;
      }

      recalcCart(cart);

      if (req.xhr || (req.headers.accept && req.headers.accept.indexOf('application/json') !== -1)) {
        return res.json({ success: true, cart });
      }

      return res.redirect('/cart');
    } catch (error) {
      console.error('Cart update error:', error);
      if (req.xhr || (req.headers.accept && req.headers.accept.indexOf('application/json') !== -1)) {
        return res.status(500).json({ success: false, message: 'Could not update cart' });
      }
      return res.redirect('back');
    }
  },

  // POST /cart/remove  (expects productId)
  remove: async (req, res) => {
    try {
      const productId = Number(req.body.productId || req.body.id);
      if (isNaN(productId) || productId <= 0) {
        return res.status(400).json({ success: false, message: 'Invalid product' });
      }

      const cart = ensureCart(req);
      const idx = cart.items.findIndex(i => Number(i.productId) === Number(productId));
      if (idx !== -1) {
        cart.items.splice(idx, 1);
        recalcCart(cart);
      }

      if (req.xhr || (req.headers.accept && req.headers.accept.indexOf('application/json') !== -1)) {
        return res.json({ success: true, cart });
      }

      return res.redirect('/cart');
    } catch (error) {
      console.error('Cart remove error:', error);
      if (req.xhr || (req.headers.accept && req.headers.accept.indexOf('application/json') !== -1)) {
        return res.status(500).json({ success: false, message: 'Could not remove item' });
      }
      return res.redirect('back');
    }
  },

  // GET /checkout
  checkout: async (req, res) => {
    const q = req.query.q || '';
    const category = req.query.category || '';
    try {
      const categoriesPlain = await fetchCategoriesPlain();
      const cart = ensureCart(req);
      if (!cart.items || cart.items.length === 0) return res.redirect('/cart');

      const productIds = cart.items.map(i => i.productId).filter(Boolean);
      const products = productIds.length ? await Product.findAll({
        attributes: productAttrs,
        where: { id: { [Op.in]: productIds } }
      }) : [];

      const productsMap = products.reduce((m, p) => {
        const np = normalizeProductForCart(p);
        m[np.id] = np;
        return m;
      }, {});

      const mergedItems = cart.items.map(it => {
        const fresh = productsMap[it.productId];
        if (fresh) {
          const desiredQty = Number(it.qty) || 0;
          const allowedQty = (typeof fresh.stock === 'number') ? Math.min(desiredQty, fresh.stock) : desiredQty;
          return {
            productId: fresh.id,
            name: fresh.name,
            price: fresh.price,
            qty: allowedQty,
            imageUrl: fresh.imageUrl,
            slug: fresh.slug,
            stock: fresh.stock
          };
        }
        return it;
      });

      const safeCart = { items: mergedItems };
      recalcCart(safeCart);

      const subtotal = safeCart.subtotal || 0;
      const vat = safeCart.vat || 0;
      const total = safeCart.total || subtotal;

      res.render('frontend/checkout', {
        title: 'Checkout - Savers Grocery',
        cart: safeCart,
        cartCount: safeCart.totalQty || 0,
        categories: categoriesPlain,
        q,
        category,
        subtotal,
        vat,
        total,
        layout: false
      });
    } catch (error) {
      console.error('Checkout error:', error);

      let categoriesPlain = [];
      try { categoriesPlain = await fetchCategoriesPlain(); } catch (e) { /* ignore */ }

      res.render('frontend/checkout', {
        title: 'Checkout - Savers Grocery',
        cart: { items: [], totalQty: 0, totalPrice: 0 },
        cartCount: 0,
        categories: categoriesPlain,
        q,
        category,
        subtotal: 0,
        vat: 0,
        total: 0,
        layout: false
      });
    }
  },

  // POST /cart/clear
  clear: (req, res) => {
    try {
      req.session.cart = { items: [], totalQty: 0, totalPrice: 0 };
      if (req.xhr || (req.headers.accept && req.headers.accept.indexOf('application/json') !== -1)) {
        return res.json({ success: true, cart: req.session.cart });
      }
      return res.redirect('/cart');
    } catch (error) {
      console.error('Cart clear error:', error);
      if (req.xhr || (req.headers.accept && req.headers.accept.indexOf('application/json') !== -1)) {
        return res.status(500).json({ success: false });
      }
      return res.redirect('back');
    }
  }
};

module.exports = cartController;
