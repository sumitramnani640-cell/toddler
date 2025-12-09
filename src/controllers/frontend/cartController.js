// src/controllers/frontend/cartController.js
const { Product, Category, Cart } = require('../../models');
const { Op } = require('sequelize');
const { ensureGuestId, getGuestId } = require('../../services/guestCookie');

const productAttrs = [
  'id','name','description','price','stock','image','category_id','status','createdAt','updatedAt','slug'
];

const categoryAttrs = ['id', 'name', 'slug', 'image', 'banner_image', 'updatedAt'];

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

/* -----------------------
  Helper: load DB cart for given userId string
  userIdArg is string (either guest token like 'g_xyz' or numeric string '34')
------------------------*/
async function loadDbCartForUserId(userIdArg) {
  if (!userIdArg || !Cart) return { items: [], subtotal: 0, vat: 0, total: 0, totalQty: 0 };

  const rows = await Cart.findAll({
    where: { userId: userIdArg },
    include: [{ model: Product, as: 'product', attributes: productAttrs }]
  });

  const items = (rows || []).map(r => {
    const product = r.product || {};
    const np = normalizeProductForCart(product);
    return {
      productId: r.productId ?? r.product_id,
      name: np.name || '',
      price: Number(np.price || 0),
      qty: Number(r.qty || 0),
      imageUrl: np.imageUrl,
      slug: np.slug || ''
    };
  });

  const subtotal = items.reduce((s, it) => s + (Number(it.price || 0) * Number(it.qty || 0)), 0);
  const vat = +((subtotal * 0.05).toFixed(2));
  const total = +(subtotal + vat).toFixed(2);

  return { items, subtotal, vat, total, totalQty: items.reduce((s,i)=>s+(i.qty||0),0) };
}

/* -----------------------
  Controller methods
------------------------*/
const cartController = {
  // view cart (reads DB rows if guest cookie or logged user present, else session)
  index: async (req, res) => {
    const q = req.query.q || '';
    const category = req.query.category || '';
    try {
      const categoriesPlain = await fetchCategoriesPlain();

      // determine effective "userId" token we search by:
      // prefer logged-in user numeric id (stringified), else guest cookie token
      const loggedUserId = req.session?.user?.id || req.user?.id || null;
      const effectiveUserId = loggedUserId ? String(loggedUserId) : getGuestId(req);

      if (effectiveUserId) {
        // use DB rows stored under this userId value
        const dbCart = await loadDbCartForUserId(effectiveUserId);
        const safeCart = { items: dbCart.items };

        // also keep session view quick-access consistent
        req.session.cart = req.session.cart || {};
        req.session.cart.items = safeCart.items;

        if (req.xhr || (req.headers.accept && req.headers.accept.indexOf('application/json') !== -1)) {
          return res.json({ success: true, cart: Object.assign({}, safeCart, { subtotal: dbCart.subtotal, vat: dbCart.vat, total: dbCart.total }) });
        }
        return res.render('frontend/cart', {
          title: 'Your Cart - Savers Grocery',
          cart: safeCart,
          cartCount: dbCart.items.length,
          categories: categoriesPlain,
          q, category,
          subtotal: dbCart.subtotal, vat: dbCart.vat, total: dbCart.total,
          layout: false
        });
      }

      // fallback to session cart if nothing else
      const cart = req.session?.cart ?? { items: [] };
      cart.items = Array.isArray(cart.items) ? cart.items : [];

      // optionally enrich with product data for prices and images
      const productIds = cart.items.map(i => i.productId).filter(Boolean);
      let productsMap = {};
      if (productIds.length) {
        const products = await Product.findAll({ attributes: productAttrs, where: { id: { [Op.in]: productIds } } });
        productsMap = products.reduce((m, p) => { const np = normalizeProductForCart(p); m[np.id] = np; return m; }, {});
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
      const subtotal = safeCart.items.reduce((s, it) => s + ((Number(it.price) || 0) * (Number(it.qty) || 0)), 0);
      const vat = +((subtotal * 0.05).toFixed(2));
      const total = +(subtotal + vat).toFixed(2);

      req.session.cart = req.session.cart || {};
      req.session.cart.items = safeCart.items;

      if (req.xhr || (req.headers.accept && req.headers.accept.indexOf('application/json') !== -1)) {
        return res.json({ success: true, cart: Object.assign({}, safeCart, { subtotal, vat, total }) });
      }

      res.render('frontend/cart', {
        title: 'Your Cart - Savers Grocery',
        cart: safeCart,
        cartCount: safeCart.items.length,
        categories: categoriesPlain,
        q, category,
        subtotal, vat, total,
        layout: false
      });
    } catch (error) {
      console.error('Cart index error:', error && (error.stack || error));
      let categoriesPlain = [];
      try { categoriesPlain = await fetchCategoriesPlain(); } catch (e) {}
      res.render('frontend/cart', {
        title: 'Your Cart - Savers Grocery',
        cart: { items: [], totalQty: 0, totalPrice: 0 },
        cartCount: 0, categories: categoriesPlain,
        q:'', category:'', subtotal:0, vat:0, total:0, layout:false
      });
    }
  },

  // add item to cart (stores under userId column: numeric user id as string if logged in, otherwise guest token)
  add: async (req, res) => {
    try {
      const productId = Number(req.body.productId || req.body.id);
      let qty = parseInt(req.body.qty || req.body.quantity || 1, 10);
      if (isNaN(productId) || productId <= 0) return res.status(400).json({ success:false, message:'Invalid product' });
      if (isNaN(qty) || qty < 1) qty = 1;

      const product = await Product.findOne({ attributes: productAttrs, where: { id: productId, status: 'active' } });
      if (!product) return res.status(404).json({ success:false, message:'Product not found' });

      const p = normalizeProductForCart(product);
      // if user logged in, store user id string; else ensure guest cookie and store its value in userId column
      let targetUserId = null;
      if (req.session?.user?.id || req.user?.id) {
        targetUserId = String(req.session?.user?.id || req.user?.id);
      } else {
        targetUserId = ensureGuestId(req, res); // returns guest token and sets cookie
      }

      // find existing row for same userId (guest token or numeric string) + product
      const existing = await Cart.findOne({ where: { userId: targetUserId, productId } });
      if (existing) {
        existing.qty = Number(existing.qty || 0) + qty;
        // optional: enforce stock if present on product (not mandatory)
        if (typeof p.stock === 'number' && existing.qty > p.stock) existing.qty = p.stock;
        await existing.save();
      } else {
        await Cart.create({ userId: targetUserId, productId, qty });
      }

      // Update session copy for UI
      req.session.cart = req.session.cart || { items: [] };
      const sExisting = req.session.cart.items.find(i => Number(i.productId) === productId);
      if (sExisting) sExisting.qty = Number(sExisting.qty || 0) + qty;
      else req.session.cart.items.push({ productId: p.id, name: p.name, price: p.price, qty, imageUrl: p.imageUrl, slug: p.slug });

      // respond
      if (req.xhr || (req.headers.accept && req.headers.accept.indexOf('application/json') !== -1)) {
        const dbCart = await loadDbCartForUserId(targetUserId);
        return res.json({ success:true, cart:{ items: dbCart.items, subtotal: dbCart.subtotal, vat: dbCart.vat, total: dbCart.total }, count: dbCart.items.length });
      }
      return res.redirect(req.get('Referrer') || '/cart');
    } catch (error) {
      console.error('Cart add error:', error && (error.stack || error));
      if (req.xhr || (req.headers.accept && req.headers.accept.indexOf('application/json') !== -1)) {
        return res.status(500).json({ success:false, message:'Could not add to cart' });
      }
      return res.redirect('back');
    }
  },

  // update item qty (works against userId column token)
  update: async (req, res) => {
    try {
      const productId = Number(req.body.productId || req.body.id);
      let qty = parseInt(req.body.qty || req.body.quantity, 10);
      if (isNaN(productId) || productId <= 0 || isNaN(qty)) return res.status(400).json({ success:false, message:'Invalid input' });
      if (qty < 0) qty = 0;

      const targetUserId = (req.session?.user?.id || req.user?.id) ? String(req.session?.user?.id || req.user?.id) : getGuestId(req);

      if (targetUserId) {
        const row = await Cart.findOne({ where: { userId: targetUserId, productId } });
        if (!row) return res.status(404).json({ success:false, message:'Item not in cart' });
        if (qty === 0) await row.destroy();
        else {
          const product = await Product.findOne({ attributes: ['id','stock','price'], where: { id: productId } });
          if (product && typeof product.stock === 'number' && qty > product.stock) qty = product.stock;
          row.qty = qty;
          await row.save();
        }

        const dbCart = await loadDbCartForUserId(targetUserId);
        if (req.xhr || (req.headers.accept && req.headers.accept.indexOf('application/json') !== -1)) return res.json({ success:true, cart: dbCart, count: dbCart.items.length });
        return res.redirect('/cart');
      }

      // session fallback
      const cart = req.session.cart = req.session.cart || { items: [] };
      const itemIndex = cart.items.findIndex(i => Number(i.productId) === Number(productId));
      if (itemIndex === -1) return res.status(404).json({ success:false, message:'Item not in cart' });

      if (qty === 0) cart.items.splice(itemIndex, 1);
      else {
        const product = await Product.findOne({ attributes: ['id','stock','price'], where: { id: productId } });
        if (product && typeof product.stock === 'number' && qty > product.stock) qty = product.stock;
        cart.items[itemIndex].qty = qty;
        if (product && typeof product.price !== 'undefined') cart.items[itemIndex].price = product.price;
      }

      return res.redirect('/cart');
    } catch (error) {
      console.error('Cart update error:', error && (error.stack || error));
      if (req.xhr || (req.headers.accept && req.headers.accept.indexOf('application/json') !== -1)) return res.status(500).json({ success:false, message:'Could not update cart' });
      return res.redirect('back');
    }
  },

  // remove item
  remove: async (req, res) => {
    try {
      const productId = Number(req.body.productId || req.body.id);
      if (isNaN(productId) || productId <= 0) return res.status(400).json({ success:false, message:'Invalid product' });

      const targetUserId = (req.session?.user?.id || req.user?.id) ? String(req.session?.user?.id || req.user?.id) : getGuestId(req);

      if (targetUserId) {
        await Cart.destroy({ where: { userId: targetUserId, productId } });
        const dbCart = await loadDbCartForUserId(targetUserId);
        if (req.xhr || (req.headers.accept && req.headers.accept.indexOf('application/json') !== -1)) return res.json({ success:true, cart: dbCart, count: dbCart.items.length });
        return res.redirect('/cart');
      }

      const cart = req.session.cart = req.session.cart || { items: [] };
      const idx = cart.items.findIndex(i => Number(i.productId) === Number(productId));
      if (idx !== -1) cart.items.splice(idx, 1);

      return res.redirect('/cart');
    } catch (error) {
      console.error('Cart remove error:', error && (error.stack || error));
      if (req.xhr || (req.headers.accept && req.headers.accept.indexOf('application/json') !== -1)) return res.status(500).json({ success:false, message:'Could not remove item' });
      return res.redirect('back');
    }
  },

  // checkout page - uses effective userId or session fallback
  checkout: async (req, res) => {
    try {
      const categoriesPlain = await fetchCategoriesPlain();
      const q = req.query.q || '';
      const category = req.query.category || '';

      const loggedUserId = req.session?.user?.id || req.user?.id || null;
      const effectiveUserId = loggedUserId ? String(loggedUserId) : getGuestId(req);

      if (effectiveUserId) {
        const dbCart = await loadDbCartForUserId(effectiveUserId);
        if (!dbCart.items || dbCart.items.length === 0) return res.redirect('/cart');
        const safeCart = { items: dbCart.items };
        return res.render('frontend/checkout', {
          title: 'Checkout - Savers Grocery',
          cart: safeCart, cartCount: dbCart.items.length,
          categories: categoriesPlain, q, category,
          subtotal: dbCart.subtotal, vat: dbCart.vat, total: dbCart.total,
          layout: false
        });
      }

      // session path
      const cart = req.session.cart = req.session.cart || { items: [] };
      if (!cart.items || cart.items.length === 0) return res.redirect('/cart');

      // enrich product info
      const productIds = cart.items.map(i => i.productId).filter(Boolean);
      const products = productIds.length ? await Product.findAll({ attributes: productAttrs, where: { id: { [Op.in]: productIds } } }) : [];
      const productsMap = products.reduce((m,p)=>{ const np = normalizeProductForCart(p); m[np.id] = np; return m; }, {});

      const mergedItems = cart.items.map(it => {
        const fresh = productsMap[it.productId];
        if (fresh) {
          const desiredQty = Number(it.qty) || 0;
          const allowedQty = (typeof fresh.stock === 'number') ? Math.min(desiredQty, fresh.stock) : desiredQty;
          return { productId: fresh.id, name: fresh.name, price: fresh.price, qty: allowedQty, imageUrl: fresh.imageUrl, slug: fresh.slug, stock: fresh.stock };
        }
        return it;
      });

      const safeCart = { items: mergedItems };
      const subtotal = safeCart.items.reduce((s, it) => s + ((Number(it.price) || 0) * (Number(it.qty) || 0)), 0);
      const vat = +((subtotal * 0.05).toFixed(2));
      const total = +(subtotal + vat).toFixed(2);

      return res.render('frontend/checkout', {
        title: 'Checkout - Savers Grocery',
        cart: safeCart, cartCount: safeCart.items.length,
        categories: categoriesPlain, q, category,
        subtotal, vat, total, layout: false
      });
    } catch (error) {
      console.error('Checkout error:', error && (error.stack || error));
      let categoriesPlain = [];
      try { categoriesPlain = await fetchCategoriesPlain(); } catch (e) {}
      res.render('frontend/checkout', { title:'Checkout - Savers Grocery', cart:{ items:[] }, cartCount:0, categories:categoriesPlain, q:'', category:'', subtotal:0, vat:0, total:0, layout:false });
    }
  },

  // clear cart rows for current userId token or session
  clear: async (req, res) => {
    try {
      const targetUserId = (req.session?.user?.id || req.user?.id) ? String(req.session?.user?.id || req.user?.id) : getGuestId(req);
      if (targetUserId) {
        await Cart.destroy({ where: { userId: targetUserId } });
        return res.redirect('/cart');
      }
      req.session.cart = { items: [], totalQty:0, totalPrice:0 };
      return res.redirect('/cart');
    } catch (error) {
      console.error('Cart clear error:', error && (error.stack || error));
      return res.redirect('back');
    }
  }
};

module.exports = cartController;
