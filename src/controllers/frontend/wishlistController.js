const { Wishlist, Product, Cart } = require('../../models');

/**
 * Require frontend login (session-based)
 */
function requireLogin(req) {
  if (!req.session || !req.session.user || !req.session.user.id) {
    return null;
  }
  return String(req.session.user.id);
}

module.exports = {

  // =========================
  // Show wishlist page
  // =========================
  async index(req, res) {
    const userId = requireLogin(req);
    if (!userId) return res.redirect('/login');

    const items = await Wishlist.findAll({
      where: { userId },
      include: [{ model: Product, as: 'product' }],
      order: [['createdAt', 'DESC']]
    });

    return res.render('frontend/wishlist', {
      title: 'My Wishlist',
      wishlist: { items },
      user: req.session.user,
      activePage: 'wishlist'
    });
  },

  // =========================
  // Add item to wishlist
  // =========================
  async add(req, res) {
    const userId = requireLogin(req);
    if (!userId) return res.redirect('/login');

    const productId = Number(req.body.productId);
    if (!productId) return res.redirect('back');

    const [row, created] = await Wishlist.findOrCreate({
      where: { userId, productId }
    });

    const referer = req.get('referer') || '/';

    // pass flag for SweetAlert popup
    return res.redirect(
      `${referer}${referer.includes('?') ? '&' : '?'}wishlist=${created ? 'added' : 'exists'}`
    );
  },

  // =========================
  // Remove item from wishlist
  // =========================
  async remove(req, res) {
    const userId = requireLogin(req);
    if (!userId) return res.redirect('/login');

    const productId = Number(req.body.productId);
    if (!productId) return res.redirect('/wishlist');

    await Wishlist.destroy({
      where: { userId, productId }
    });

    return res.redirect('/wishlist');
  },

  // =========================
  // Clear wishlist
  // =========================
  async clear(req, res) {
    const userId = requireLogin(req);
    if (!userId) return res.redirect('/login');

    await Wishlist.destroy({
      where: { userId }
    });

    return res.redirect('/wishlist');
  },

  // =========================
  // Add to cart & remove from wishlist
  // =========================
  async addToCart(req, res) {
    const userId = requireLogin(req);
    if (!userId) return res.redirect('/login');

    const productId = Number(req.body.productId);
    if (!productId) return res.redirect('/wishlist');

    await Cart.findOrCreate({
      where: { userId, productId },
      defaults: { qty: 1 }
    });

    await Wishlist.destroy({
      where: { userId, productId }
    });

    return res.redirect('/cart');
  }
};
