// small helper service — re-use the migration/load logic
const { Cart, Product } = require('../models');
const { Op } = require('sequelize');

function normalizeProductForCart(p) {
  if (!p) return { id: null, name:'', price:0, imageUrl: '/images/placeholder.png', slug: '' };
  const po = (p.get ? p.get() : p);
  po.imageUrl = po.image ? (po.image.startsWith('/') ? po.image : `/uploads/${po.image}`) : '/images/placeholder.png';
  po.price = Number(po.price || 0);
  return po;
}

async function migrateSessionCartToDbIfNeeded(req) {
  try {
    const userId = req.session?.user?.id || req.user?.id || null;
    if (!userId) return;

    const sessionCart = req.session?.cart;
    if (!sessionCart || !Array.isArray(sessionCart.items) || sessionCart.items.length === 0) return;

    for (const it of sessionCart.items) {
      const productId = Number(it.productId);
      if (!productId) continue;
      const qty = Math.max(1, Number(it.qty || 1));

      const existing = await Cart.findOne({ where: { userId, productId } });
      if (existing) {
        existing.qty = Number(existing.qty || 0) + qty;
        await existing.save();
      } else {
        await Cart.create({ userId, productId, qty });
      }
    }

    req.session.cart = { items: [] };
  } catch (err) {
    console.error('cartService.migrateSessionCartToDbIfNeeded err', err);
  }
}

async function loadDbCartForUser(userId) {
  const rows = await Cart.findAll({
    where: { userId },
    include: [{ model: Product, as: 'product', attributes: ['id','name','price','image','slug'] }]
  });

  const items = (rows || []).map(r => {
    const p = r.product || {};
    const np = normalizeProductForCart(p);
    return {
      productId: r.productId,
      name: np.name || '',
      price: Number(np.price || 0),
      qty: Number(r.qty || 0),
      imageUrl: np.imageUrl,
      slug: np.slug || ''
    };
  });

  const subtotal = items.reduce((s, it) => s + (it.price * it.qty), 0);
  const vat = +((subtotal * 0.05).toFixed(2));
  const total = +(subtotal + vat).toFixed(2);

  return { items, subtotal, vat, total, totalQty: items.reduce((s,i)=>s+(i.qty||0),0) };
}

module.exports = { migrateSessionCartToDbIfNeeded, loadDbCartForUser };
