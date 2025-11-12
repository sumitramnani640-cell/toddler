// src/controllers/admin/categoryController.js
const path = require('path');
const fs = require('fs');
const { Category, Product } = require('../../models');
const { Op } = require('sequelize');

const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'categories');

// ensure uploads folder exists
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

/**
 * Helper to delete a stored banner file given a public path like '/uploads/categories/filename.jpg'
 */
function deleteBannerIfExists(publicPath) {
  if (!publicPath) return;
  const fname = path.basename(publicPath);
  const full = path.join(uploadsDir, fname);
  if (fs.existsSync(full)) {
    try {
      fs.unlinkSync(full);
    } catch (err) {
      console.error('Failed to delete file:', full, err);
    }
  }
}

/**
 * Build safe slug from given string (or return empty string)
 */
function buildSlug(s) {
  if (!s) return '';
  return String(s).toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')   // remove special chars
    .replace(/\s+/g, '-')           // spaces -> hyphens
    .replace(/-+/g, '-')            // collapse multiple hyphens
    .replace(/(^-|-$)/g, '');       // trim leading/trailing hyphens
}

const categoryController = {
  // List all categories
  index: async (req, res) => {
    try {
      const categories = await Category.findAll({
        include: [{
          model: Product,
          as: 'products',
          attributes: ['id']
        }],
        order: [['createdAt', 'DESC']]
      });

      res.render('admin/categories/index', {
        title: 'Categories - Savers Grocery Admin',
        categories
      });

    } catch (error) {
      console.error('Categories index error:', error);
      req.flash('error_msg', 'Error loading categories');
      res.redirect('/admin/dashboard');
    }
  },

  // Show create category form
  create: (req, res) => {
    res.render('admin/categories/create', {
      title: 'Add Category - Savers Grocery Admin'
    });
  },

  // Store new category (supports optional file upload in req.file)
  store: async (req, res) => {
    try {
      const { name } = req.body;
      // use provided slug or generate from name
      const rawSlug = (req.body.slug || name || '').toString();
      let slugValue = buildSlug(rawSlug);
      if (!slugValue) slugValue = `cat-${Date.now()}`;

      // Check if slug already exists
      const existingCategory = await Category.findOne({
        where: { slug: slugValue }
      });

      if (existingCategory) {
        // remove uploaded file (if any) to avoid orphan
        if (req.file) deleteBannerIfExists(`/uploads/categories/${req.file.filename}`);

        req.flash('error_msg', 'A category with this slug already exists');
        return res.redirect('/admin/categories/create');
      }

      const banner_image = req.file ? `/uploads/categories/${req.file.filename}` : null;
      const description = req.body.description || null;
      const status = req.body.status || 'active';

      await Category.create({
        name,
        slug: slugValue,
        description,
        status,
        banner_image
      });

      req.flash('success_msg', 'Category created successfully');
      res.redirect('/admin/categories');

    } catch (error) {
      console.error('Category store error:', error);
      if (req.file) deleteBannerIfExists(`/uploads/categories/${req.file.filename}`);
      req.flash('error_msg', 'Error creating category');
      res.redirect('/admin/categories/create');
    }
  },

  // Show single category
  show: async (req, res) => {
    try {
      const category = await Category.findByPk(req.params.id, {
        include: [{
          model: Product,
          as: 'products',
          attributes: ['id', 'name', 'slug', 'price', 'image', 'category_id', 'stock', 'status', 'createdAt']
        }]
      });

      if (!category) {
        req.flash('error_msg', 'Category not found');
        return res.redirect('/admin/categories');
      }

      res.render('admin/categories/show', {
        title: `${category.name} - Savers Grocery Admin`,
        category
      });

    } catch (error) {
      console.error('Category show error:', error);
      req.flash('error_msg', 'Error loading category');
      res.redirect('/admin/categories');
    }
  },

  // Show edit category form
  edit: async (req, res) => {
    try {
      const category = await Category.findByPk(req.params.id);

      if (!category) {
        req.flash('error_msg', 'Category not found');
        return res.redirect('/admin/categories');
      }

      res.render('admin/categories/edit', {
        title: `Edit ${category.name} - Savers Grocery Admin`,
        category
      });

    } catch (error) {
      console.error('Category edit form error:', error);
      req.flash('error_msg', 'Error loading edit form');
      res.redirect('/admin/categories');
    }
  },

  // Update category (supports optional file upload in req.file)
  update: async (req, res) => {
    try {
      const category = await Category.findByPk(req.params.id);
      if (!category) {
        // cleanup uploaded file if any
        if (req.file) deleteBannerIfExists(`/uploads/categories/${req.file.filename}`);

        req.flash('error_msg', 'Category not found');
        return res.redirect('/admin/categories');
      }

      const { name, description } = req.body;
      const rawSlug = (req.body.slug || name || '').toString();
      let slugValue = buildSlug(rawSlug);
      if (!slugValue) slugValue = `cat-${Date.now()}`;

      // Check if slug already exists (excluding current category)
      const existingCategory = await Category.findOne({
        where: {
          slug: slugValue,
          id: { [Op.ne]: category.id }
        }
      });

      if (existingCategory) {
        if (req.file) deleteBannerIfExists(`/uploads/categories/${req.file.filename}`);
        req.flash('error_msg', 'A category with this slug already exists');
        return res.redirect(`/admin/categories/${req.params.id}/edit`);
      }

      // If a new file was uploaded, remove the old banner and set new one
      if (req.file) {
        if (category.banner_image) deleteBannerIfExists(category.banner_image);
        category.banner_image = `/uploads/categories/${req.file.filename}`;
      }

      // Update fields
      category.name = name || category.name;
      category.slug = slugValue;
      category.description = typeof description !== 'undefined' ? description : category.description;
      category.status = req.body.status || 'active';

      await category.save();

      req.flash('success_msg', 'Category updated successfully');
      res.redirect('/admin/categories');

    } catch (error) {
      console.error('Category update error:', error);
      if (req.file) deleteBannerIfExists(`/uploads/categories/${req.file.filename}`);
      req.flash('error_msg', 'Error updating category');
      res.redirect(`/admin/categories/${req.params.id}/edit`);
    }
  },

  // Delete category
  destroy: async (req, res) => {
    try {
      const category = await Category.findByPk(req.params.id);
      if (!category) {
        req.flash('error_msg', 'Category not found');
        return res.redirect('/admin/categories');
      }

      // Check if category has products
      const productCount = await Product.count({
        where: { category_id: category.id }
      });

      if (productCount > 0) {
        req.flash('error_msg', 'Cannot delete category with existing products');
        return res.redirect('/admin/categories');
      }

      // delete banner file if exists
      if (category.banner_image) deleteBannerIfExists(category.banner_image);

      await category.destroy();

      req.flash('success_msg', 'Category deleted successfully');
      res.redirect('/admin/categories');

    } catch (error) {
      console.error('Category delete error:', error);
      req.flash('error_msg', 'Error deleting category');
      res.redirect('/admin/categories');
    }
  }
};

module.exports = categoryController;
