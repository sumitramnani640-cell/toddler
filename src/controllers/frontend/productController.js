// src/controllers/frontend/productController.js
const { Product, Category } = require('../../models');
const { Op } = require('sequelize');

const productController = {
  show: async (req, res) => {
    try {
      // accept either param names (slug or identifier) so route can use either
      const identifier = req.params.identifier || req.params.slug;
      if (!identifier) {
        req.flash && req.flash('error_msg', 'Invalid product identifier');
        return res.redirect('/');
      }

      // Detect whether Product model has a slug column (safe check)
      const hasSlug = !!(Product && Product.rawAttributes && Product.rawAttributes.slug);

      // decide search condition
      let where;
      const isNumeric = /^[0-9]+$/.test(String(identifier));
      if (isNumeric) {
        where = { id: Number(identifier) };
      } else if (hasSlug) {
        // if slug exists use it
        where = { slug: identifier };
      } else {
        // fallback: search by name using LIKE (partial match) — use %..% to avoid SQL with undefined
        where = { name: { [Op.like]: `%${identifier}%` } };
      }

      // include category — keep alias 'category' if your association uses that alias
      const product = await Product.findOne({
        where,
        include: [{ model: Category, as: 'category' }],
      });

      if (!product) {
        req.flash && req.flash('error_msg', 'Product not found');
        return res.redirect('/');
      }

      // Related products: same category (exclude current)
      let relatedProducts = [];
      const categoryId = product.category_id || (product.category && product.category.id);
      if (categoryId) {
        relatedProducts = await Product.findAll({
          where: {
            category_id: categoryId,
            id: { [Op.ne]: product.id },
          },
          limit: 8,
        });
      }

      // Categories for nav (optional)
      const categories = await Category.findAll({ where: { status: 'active' } });

      return res.render('frontend/product', {
        layout: false,
        title: `${product.name} - Savers Grocery`,
        product,
        relatedProducts,
        categories,
      });
    } catch (err) {
      console.error('Frontend Product Page Error:', err);
      req.flash && req.flash('error_msg', 'Error loading product page');
      return res.redirect('/');
    }
  },
};

module.exports = productController;
