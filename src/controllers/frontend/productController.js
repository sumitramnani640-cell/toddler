// src/controllers/frontend/productController.js
const path = require('path');
const fs = require('fs');
const { Product, Category } = require('../../models');
const { Op } = require('sequelize');

const webPrefix = '/uploads/products/';
const publicPath = path.join(__dirname, '..', '..', 'public', 'uploads', 'products');
const noImage = '/images/no-image.png';

// Build safe image URL
function makeImageUrl(prod) {
  const img = prod && prod.image && String(prod.image).trim() ? String(prod.image).trim() : null;
  const rel = img ? `${webPrefix}${img}` : noImage;
  const fullFs = img ? path.join(publicPath, img) : null;

  if (fullFs && !fs.existsSync(fullFs)) {
    console.warn(`Product image missing on disk for product ${prod.id}: ${fullFs}`);
  }
  return rel;
}

const productController = {
  show: async (req, res) => {
    try {
      // support /product/:slug and /product/:identifier
      const identifier = req.params.identifier || req.params.slug;
      if (!identifier) {
        req.flash && req.flash('error_msg', 'Invalid product identifier');
        return res.redirect('/');
      }

      // Check if slug column exists
      const hasSlug = !!(Product && Product.rawAttributes && Product.rawAttributes.slug);

      // determine condition
      let where;
      const isNumeric = /^[0-9]+$/.test(String(identifier));

      if (isNumeric) {
        where = { id: Number(identifier) };
      } else if (hasSlug) {
        where = { slug: identifier };
      } else {
        where = { name: { [Op.like]: `%${identifier}%` } };
      }

      // Fetch product + category
      const product = await Product.findOne({
        where,
        include: [
          { model: Category, as: 'category', attributes: ['id', 'name'] }
        ],
      });

      if (!product) {
        req.flash && req.flash('error_msg', 'Product not found');
        return res.redirect('/');
      }

      // Convert to plain object
      const productPlain = product.get ? product.get() : product;
      productPlain.imageUrl = makeImageUrl(productPlain);

      // RELATED PRODUCTS
      let relatedProducts = [];
      const categoryId = productPlain.category_id || (productPlain.category && productPlain.category.id);

      if (categoryId) {
        const excludeCondition = (hasSlug && productPlain.slug)
          ? { slug: { [Op.ne]: productPlain.slug } }
          : { id: { [Op.ne]: productPlain.id } };

        const related = await Product.findAll({
          where: {
            category_id: categoryId,
            status: 'active',
            ...excludeCondition
          },
          limit: 8,
          attributes: ['id', 'name', 'slug', 'price', 'image', 'category_id']
        });

        relatedProducts = related.map(p => {
          const plain = p.get ? p.get() : p;
          plain.imageUrl = makeImageUrl(plain);
          return plain;
        });
      }

      // CATEGORY LIST (navigation)
      const categoriesDb = await Category.findAll({ where: { status: 'active' } });
      const categories = categoriesDb.map(c => (c.get ? c.get() : c));

      // -----------------------------------------
      // CART + DYNAMIC BUTTON LOGIC (ADDED)
      // -----------------------------------------
      const cart = (req.session && req.session.cart) ? req.session.cart : { items: [] };

      const cartCount = Array.isArray(cart.items)
        ? cart.items.reduce((s, it) => s + (Number(it.qty) || 0), 0)
        : 0;

      const inCart = Array.isArray(cart.items)
        && cart.items.some(it => Number(it.productId) === Number(productPlain.id));

      const outOfStock = !productPlain.stock || Number(productPlain.stock) <= 0;
      // -----------------------------------------

      return res.render('frontend/product', {
        layout: false,
        title: `${productPlain.name} - Savers Grocery`,
        product: productPlain,
        relatedProducts,
        categories,

        // Dynamic cart/wishlist UI helpers
        cart,
        cartCount,
        inCart,
        outOfStock,
      });

    } catch (err) {
      console.error('Frontend Product Page Error:', err);
      req.flash && req.flash('error_msg', 'Error loading product page');
      return res.redirect('/');
    }
  },
};

module.exports = productController;
