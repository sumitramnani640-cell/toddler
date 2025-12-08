// src/controllers/frontend/wishlistController.js
const path = require('path');
const fs = require('fs');
const { Product } = require('../../models');

const webPrefix = '/uploads/products/';
const publicPath = path.join(__dirname, '..', '..', 'public', 'uploads', 'products');
const noImage = '/images/no-image.png';

// Build safe image URL
function makeImageUrl(prod) {
  const img = prod && prod.image && String(prod.image).trim() ? String(prod.image).trim() : null;
  const rel = img ? `${webPrefix}${img}` : noImage;
  const fullFs = img ? path.join(publicPath, img) : null;

  if (fullFs && !fs.existsSync(fullFs)) {
    console.warn(`Wishlist image missing for product ${prod.id}: ${fullFs}`);
  }

  return rel;
}

const wishlistController = {
  // GET /wishlist
  index: async (req, res) => {
    try {
      const wishlist = req.session.wishlist || [];
      const ids = wishlist.map(i => Number(i.productId));

      let products = [];

      if (ids.length > 0) {
        const found = await Product.findAll({ where: { id: ids } });
        products = found.map(p => {
          const plain = p.get ? p.get() : p;
          plain.imageUrl = makeImageUrl(plain);
          return plain;
        });
      }

      return res.render('frontend/wishlist', {
        layout: false,
        title: 'My Wishlist - Saver Grocery',
        products,
        wishlist,
        wishlistCount: wishlist.length
      });
    } catch (err) {
      console.error('Wishlist Index Error:', err);
      req.flash && req.flash('error_msg', 'Could not load wishlist');
      return res.redirect('/');
    }
  },

  // POST /wishlist/add
  add: (req, res) => {
    try {
      const productId = Number(req.body.productId);

      if (!productId) {
        return res.json({ success: false, message: 'Invalid product' });
      }

      req.session.wishlist = req.session.wishlist || [];

      const exists = req.session.wishlist.some(
        (item) => Number(item.productId) === productId
      );

      if (!exists) {
        req.session.wishlist.push({ productId });
      }

      return res.json({
        success: true,
        message: 'Added to wishlist',
        count: req.session.wishlist.length
      });
    } catch (err) {
      console.error('Wishlist Add Error:', err);
      return res.json({ success: false, message: 'Could not add to wishlist' });
    }
  },

  // POST /wishlist/remove
  remove: (req, res) => {
    try {
      const productId = Number(req.body.productId);
      req.session.wishlist = req.session.wishlist || [];

      req.session.wishlist = req.session.wishlist.filter(
        (item) => Number(item.productId) !== productId
      );

      return res.json({
        success: true,
        message: 'Removed from wishlist',
        count: req.session.wishlist.length
      });
    } catch (err) {
      console.error('Wishlist Remove Error:', err);
      return res.json({ success: false, message: 'Could not remove from wishlist' });
    }
  }
};

module.exports = wishlistController;
