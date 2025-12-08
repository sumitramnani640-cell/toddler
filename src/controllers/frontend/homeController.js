// src/controllers/frontend/homeController.js
const { Product, Category, Banner } = require('../../models');
const { Op } = require('sequelize');

const productAttrs = [
  'id',
  'name',
  'description',
  'price',    
  'stock',
  'image',
  'category_id',
  'status',
  'createdAt',
  'updatedAt',
  'slug' // include slug if present in DB
];

// include banner_image here so homepage can use it
const categoryAttrs = ['id', 'name', 'slug', 'image', 'banner_image', 'updatedAt'];

// helper to compute cartCount from session (supports common shapes)
function getCartCountFromSession(req) {
  try {
    if (req.session && req.session.cart) {
      const cart = req.session.cart;
      if (Array.isArray(cart.items)) {
        return cart.items.reduce((sum, it) => sum + (it.qty || 0), 0);
      }
      if (typeof cart.totalQty === 'number') {
        return cart.totalQty;
      }
    }
  } catch (e) {
    // ignore and return 0 below
  }
  return 0;
}

const homeController = {
  // Show home page
  index: async (req, res) => {
    // keep q and category from query so form stays prefilled
    const q = req.query.q || '';
    const category = req.query.category || '';
    const cartCount = getCartCountFromSession(req);

    try {
      // Get active banners
      const banners = await Banner.findAll({
        where: { status: 'active' },
        order: [['createdAt', 'DESC']],
        limit: 5
      });

      // Get active categories (for header / nav)
      const categories = await Category.findAll({
        where: { status: 'active' },
        order: [['name', 'ASC']],
        attributes: categoryAttrs
      });

      // Optionally fetch featured products (if you still want them on home)
      const featuredProducts = await Product.findAll({
        attributes: productAttrs,
        where: { status: 'active' },
        include: [{
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'slug']
        }],
        order: [['createdAt', 'DESC']],
        limit: 8
      });

      // Convert categories to plain objects and add useful URLs
      const categoriesPlain = categories.map(c => {
        const obj = (c && typeof c.toJSON === 'function') ? c.toJSON() : c;
        obj.imageUrl = obj.image
          ? (obj.image.startsWith('/') ? obj.image : `/uploads/${obj.image}`)
          : '/placeholder.jpg';

        obj.bannerImageUrl = obj.banner_image
          ? (obj.banner_image.startsWith('/') ? obj.banner_image : `/uploads/${obj.banner_image}`)
          : null;

        return obj;
      });

      // For each category, fetch a small preview of products (limit 4)
      const categoriesWithPreview = await Promise.all(categoriesPlain.map(async (cat) => {
        const previewProducts = await Product.findAll({
          attributes: productAttrs,
          where: { status: 'active', category_id: cat.id },
          include: [{
            model: Category,
            as: 'category',
            attributes: ['id', 'name', 'slug']
          }],
          order: [['createdAt', 'DESC']],
          limit: 4
        });

        const normalized = previewProducts.map(p => {
          const po = (p && typeof p.toJSON === 'function') ? p.toJSON() : p;

          if (!po.slug && po.name) {
            po.slug = (po.name || '')
              .toString()
              .toLowerCase()
              .trim()
              .replace(/\s+/g, '-')
              .replace(/[^\w\-]+/g, '');
          }

          if (!po.images) {
            po.images = [];
            if (po.image) po.images.push({ filename: po.image });
          }

          if (po.image) {
            po.imageUrl = po.image.startsWith('/') ? po.image : (po.image.startsWith('uploads/') ? `/${po.image}` : `/uploads/${po.image}`);
          } else {
            po.imageUrl = '/images/placeholder.png';
          }

          return po;
        });

        return { category: cat, previewProducts: normalized };
      }));

      // render and pass the exact variable name your view expects
      res.render('frontend/home', {
        title: 'Savers Grocery - Fresh Products at Your Doorstep',
        banners,
        categories: categoriesPlain,          // pass plain categories (with imageUrl/bannerImageUrl)
        featuredProducts,
        categoriesWithPreview, // categoriesWithPreview uses the plain category objects
        q,
        category,
        cartCount,
        layout: false
      });

    } catch (error) {
      console.error('Home page error:', error);
      res.render('frontend/home', {
        title: 'Savers Grocery - Fresh Products at Your Doorstep',
        banners: [],
        categories: [],
        featuredProducts: [],
        categoriesWithPreview: [],
        q,
        category,
        cartCount,
        layout: false
      });
    }
  },

  // Category page (by slug)
  show: async (req, res) => {
    const cartCount = getCartCountFromSession(req);
    try {
      const slug = req.params.slug;

      const category = await Category.findOne({
        where: { slug, status: "active" },
        attributes: categoryAttrs,
        include: [{
          model: Product,
          as: "products",
          attributes: productAttrs,      // explicitly ask only existing product columns
          where: { status: "active" },
          required: false
        }]
      });

      if (!category) {
        return res.render("error", {
          title: "Category Not Found",
          message: "No category found",
          layout: false,
          cartCount
        });
      }

      // convert to plain object and normalize image urls for category page
      const catObj = (category && typeof category.toJSON === 'function') ? category.toJSON() : category;
      catObj.imageUrl = catObj.image ? (catObj.image.startsWith('/') ? catObj.image : `/uploads/${catObj.image}`) : '/placeholder.jpg';
      catObj.bannerImageUrl = catObj.banner_image ? (catObj.banner_image.startsWith('/') ? catObj.banner_image : `/uploads/${catObj.banner_image}`) : null;

      res.render("frontend/categories", {
        title: `${catObj.name} - Savers Grocery`,
        category: catObj,
        products: category.products || [],
        cartCount,
        layout: false
      });

    } catch (error) {
      console.error("Frontend Category Page Error:", error);
      res.render("error", {
        title: "Error",
        message: "An error occurred while loading the category",
        layout: false,
        cartCount
      });
    }
  }
};

module.exports = homeController;
