// controllers/frontend/homeController.js
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
  'updatedAt'
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

      // Get featured products (explicit attributes to avoid requesting slug)
      const featuredProducts = await Product.findAll({
        attributes: productAttrs,
        where: { status: 'active' },
        include: [{
          model: Category,
          as: 'category',
          attributes: ['id', 'name'] // minimal category fields for product cards
        }],
        order: [['createdAt', 'DESC']],
        limit: 8
      });

      res.render('frontend/home', {
        title: 'Savers Grocery - Fresh Products at Your Doorstep',
        banners,
        categories,
        featuredProducts,
        layout: false
      });

    } catch (error) {
      console.error('Home page error:', error);
      res.render('frontend/home', {
        title: 'Savers Grocery - Fresh Products at Your Doorstep',
        banners: [],
        categories: [],
        featuredProducts: [],
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
