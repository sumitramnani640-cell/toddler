// src/controllers/frontend/categoryController.js
const path = require('path');
const fs = require('fs');
const { Category, Product } = require('../../models');
const { Op } = require('sequelize');

const categoryController = {
  show: async (req, res) => {
    try {
      // Accept either param names so route can use either /category/:slug or /category/:identifier
      const identifier = req.params.identifier || req.params.slug;
      if (!identifier) {
        req.flash && req.flash('error_msg', 'Invalid category identifier');
        return res.redirect('/');
      }

      // Decide whether identifier is numeric id or slug
      const isNumeric = /^[0-9]+$/.test(String(identifier));
      const where = isNumeric ? { id: Number(identifier) } : { slug: identifier };

      // Ensure we include product.image in results
      const category = await Category.findOne({
        where: { ...where, status: 'active' },
        include: [{
          model: Product,
          as: 'products',            // ensure this matches your association alias
          required: false,
          where: { status: 'active' },
          attributes: ['id', 'name', 'slug', 'price', 'image', 'category_id'] // include image
        }]
      });

      if (!category) {
        req.flash && req.flash('error_msg', 'Category not found');
        return res.redirect('/');
      }

      // build imageUrl for products
      // adjust webPrefix/publicPath to where your images are actually stored / served from
      const webPrefix = '/uploads/products/'; // web URL prefix used by express.static
      const publicPath = path.join(__dirname, '..', '..', 'public', 'uploads', 'products'); // filesystem path to check

      const productsWithUrls = (category.products || []).map(p => {
        const imgFilename = p.image && String(p.image).trim() !== '' ? p.image : null;
        const relUrl = imgFilename ? `${webPrefix}${imgFilename}` : '/images/no-image.png';
        const fullFsPath = imgFilename ? path.join(publicPath, imgFilename) : null;

        if (fullFsPath && !fs.existsSync(fullFsPath)) {
          // Helpful during development — remove or lower to debug level in production
          console.warn(`Product image missing on disk for product ${p.id}: ${fullFsPath}`);
        }

        // convert to plain object and attach imageUrl
        return {
          ...p.get ? p.get() : p, // p may be a model instance; p.get() returns plain object
          imageUrl: relUrl
        };
      });

      // Optional: related products from other categories (simple example)
      // Here we pick a few products from other active categories (exclude current category)
      const relatedProducts = await Product.findAll({
        where: {
          category_id: { [Op.ne]: category.id },
          status: 'active'
        },
        limit: 8,
        attributes: ['id', 'name', 'slug', 'price', 'image', 'category_id']
      });

      // map relatedProducts to include imageUrl too
      const relatedWithUrls = relatedProducts.map(p => {
        const imgFilename = p.image && String(p.image).trim() !== '' ? p.image : null;
        const relUrl = imgFilename ? `${webPrefix}${imgFilename}` : '/images/no-image.png';
        return {
          ...p.get ? p.get() : p,
          imageUrl: relUrl
        };
      });

      // Categories for nav (optional)
      const categories = await Category.findAll({ where: { status: 'active' } });

      // Debug log (useful while you're fixing images)
      console.log('Category page products imageUrl:', productsWithUrls.map(p => ({ id: p.id, imageUrl: p.imageUrl })));

      return res.render('frontend/categories', {
        layout: false,
        title: `${category.name} - Savers Grocery`,
        category,
        products: productsWithUrls,
        relatedProducts: relatedWithUrls,
        categories
      });
    } catch (err) {
      console.error('Frontend Category Page Error:', err);
      req.flash && req.flash('error_msg', 'Error loading category page');
      return res.redirect('/');
    }
  }
};

module.exports = categoryController;
