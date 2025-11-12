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

const categoryAttrs = ['id', 'name', 'slug', 'image'];

const homeController = {
  // Show home page
  index: async (req, res) => {
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

      // For each category, fetch a small preview of products (limit 4)
      const categoriesWithPreview = await Promise.all(categories.map(async (cat) => {
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

        // normalize products for templates that expect `images` or `imageUrl`
        const normalized = previewProducts.map(p => {
          // convert to plain object if sequelize instance
          const po = (p && typeof p.toJSON === 'function') ? p.toJSON() : p;

          // ensure slug exists (if your Product model has slug field in DB this is redundant)
          if (!po.slug && po.name) {
            po.slug = (po.name || '')
              .toString()
              .toLowerCase()
              .trim()
              .replace(/\s+/g, '-')
              .replace(/[^\w\-]+/g, '');
          }

          // if your templates expect images array, create it from single `image` column
          if (!po.images) {
            po.images = [];
            if (po.image) po.images.push({ filename: po.image });
          }

          // provide a convenience imageUrl
          po.imageUrl = (po.image) ? `/uploads/${po.image}` : '/images/placeholder.png';

          return po;
        });

        return { category: cat, previewProducts: normalized };
      }));

      // render and pass the exact variable name your view expects
      res.render('frontend/home', {
        title: 'Savers Grocery - Fresh Products at Your Doorstep',
        banners,
        categories,
        featuredProducts,
        categoriesWithPreview, // <--- important
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
        layout: false
      });
    }
  },

  // Category page (by slug)
  show: async (req, res) => {
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
          layout: false
        });
      }

      res.render("frontend/categories", {
        title: `${category.name} - Savers Grocery`,
        category,
        products: category.products || [],
        layout: false
      });

    } catch (error) {
      console.error("Frontend Category Page Error:", error);
      res.render("error", {
        title: "Error",
        message: "An error occurred while loading the category",
        layout: false
      });
    }
  }
};

module.exports = homeController;
