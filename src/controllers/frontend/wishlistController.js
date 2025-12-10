const { Wishlist, Product } = require('../../models');
const { getGuestId, ensureGuestId } = require('../../services/guestCookie');

module.exports = {
  // Show wishlist page
  async index(req, res) {
    const userId = req.user ? req.user.id.toString() : getGuestId(req);

    const items = await Wishlist.findAll({
      where: { userId },
      include: [{ model: Product, as: 'product' }]
    });

    res.render("frontend/wishlist", {
      title: "My Wishlist",
      wishlist: { items },
      user: req.user,
      activePage: "wishlist"
    });
  },

  // Add item to wishlist
  async add(req, res) {
    ensureGuestId(req, res);

    const userId = req.user ? req.user.id.toString() : getGuestId(req);
    const { productId } = req.body;

    await Wishlist.findOrCreate({
      where: { userId, productId },
      defaults: { qty: 1 }
    });

    res.redirect("/frontend/wishlist");
  },

  // Remove item
  async remove(req, res) {
    const userId = req.user ? req.user.id.toString() : getGuestId(req);
    const { productId } = req.body;

    await Wishlist.destroy({ where: { userId, productId } });

    res.redirect("/frontend/wishlist");
  },

  // Clear all wishlist items
  async clear(req, res) {
    const userId = req.user ? req.user.id.toString() : getGuestId(req);

    await Wishlist.destroy({ where: { userId } });

    res.redirect("/frontend/wishlist");
  },

  // Add item to cart and remove from wishlist
  async addToCart(req, res) {
    const { Cart } = require('../../models');

    const userId = req.user ? req.user.id.toString() : getGuestId(req);
    const { productId } = req.body;

    // Add item to cart
    await Cart.findOrCreate({
      where: { userId, productId },
      defaults: { qty: 1 }
    });

    // remove from wishlist
    await Wishlist.destroy({ where: { userId, productId } });

    res.redirect("/cart");
  }
};
