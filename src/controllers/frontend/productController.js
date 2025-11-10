// src/controllers/frontend/productController.js
const { Product, Category } = require('../../models');
const { Op } = require('sequelize');

const productController = {
  show: async (req, res) => {
    try {
      const identifier = req.params.identifier;
      if (!identifier) {
        req.flash && req.flash('error_msg', 'Invalid product identifier');
        return res.redirect('/');
      }

      // Detect whether Product model has a slug column
      const hasSlug = !!(Product && Product.rawAttributes && Product.rawAttributes.slug);

      let where;
      const isNumeric = /^[0-9]+$/.test(String(identifier));
      if (isNumeric) {
        where = { id: Number(identifier) };
      } else if (hasSlug) {
        where = { slug: identifier };
      } else {
        // fallback (try name search) — but numeric id route preferred
        where = { name: { [Op.like]: identifier } };
      }

      // Include category using alias that matches your associations.
      // If your association uses a different alias, change 'category' to that alias.
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

      // Categories for offcanvas nav (optional)
      const categories = await Category.findAll({ where: { status: 'active' } });

      // Render - update view name if your file is at a different path
      return res.render('frontend/product', {
        layout: false,            // or true if you use a layout
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
