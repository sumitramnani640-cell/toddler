// src/controllers/frontend/homeController.js
const { Product, Category, Banner, Cart } = require('../../models');
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
  'slug'
];

const categoryAttrs = ['id', 'name', 'slug', 'image', 'banner_image', 'updatedAt'];

async function getCartCount(req) {
  try {
    const userId = req.session?.user?.id ?? req.user?.id ?? null;
    if (userId && typeof Cart !== 'undefined' && Cart) {
      try {
        // Sum qty values for rows belonging to user
        const rows = await Cart.findAll({ where: { userId }, attributes: ['qty'] });
        if (rows && rows.length) {
          return rows.reduce((s, r) => s + (Number(r.qty || 0)), 0);
        }
        return 0;
      } catch (e) {
        console.warn('[getCartCount] DB read failed, falling back to session:', e && e.message ? e.message : e);
      }
    }

    // Session fallback
    if (req.session && req.session.cart) {
      const cart = req.session.cart;
      if (Array.isArray(cart.items)) {
        return cart.items.reduce((sum, it) => sum + (Number(it.qty || 0)), 0);
      }
      if (typeof cart.totalQty === 'number') return cart.totalQty;
      if (typeof cart.totalQty === 'string' && cart.totalQty.match(/^\d+$/)) return Number(cart.totalQty);
    }
  } catch (err) {
    console.error('[getCartCount] unexpected', err);
  }
  return 0;
}

const homeController = {
  // Show home page
  index: async (req, res) => {
    const q = req.query.q || '';
    const category = req.query.category || '';

    // get cart count (DB first)
    let cartCount = 0;
    try { cartCount = await getCartCount(req); } catch (e) { cartCount = 0; }

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

      // Optionally fetch featured products
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

      res.render('frontend/home', {
        title: 'Savers Grocery - Fresh Products at Your Doorstep',
        banners,
        categories: categoriesPlain,
        featuredProducts,
        categoriesWithPreview,
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
    let cartCount = 0;
    try { cartCount = await getCartCount(req); } catch (e) { cartCount = 0; }

    try {
      const slug = req.params.slug;

      const category = await Category.findOne({
        where: { slug, status: "active" },
        attributes: categoryAttrs,
        include: [{
          model: Product,
          as: "products",
          attributes: productAttrs,
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
