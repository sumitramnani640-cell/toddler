const { CategoryFeature, ProductFeature } = require('../../models');
const fs = require('fs');
const path = require('path');

const uploadPath = path.join(__dirname, '../../../public/uploads');

// Ensure uploads dir exists
if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });

const categoryFeatureController = {
  // List all category features
  index: async (req, res) => {
    try {
      const categories = await CategoryFeature.findAll({
        include: [{ model: ProductFeature, as: 'products' }],
        order: [['id', 'DESC']],
      });
      res.render('admin/categoryFeature/index', {
        layout: 'admin/layouts/admin',
        title: 'Category Features',
        categories,
      });
    } catch (err) {
      console.error('CategoryFeature.index error:', err);
      req.flash('error_msg', 'Error fetching category features');
      res.redirect('/admin/dashboard');
    }
  },

  // Show create form
  create: (req, res) => {
    res.render('admin/categoryFeature/form', {
      layout: 'admin/layouts/admin',
      title: 'Add Category Feature',
      category: {},
      action: 'create',
    });
  },

  // Store new category feature
  store: async (req, res) => {
    try {
      const { name, description, status } = req.body;
      const image = req.file ? req.file.filename : null;

      await CategoryFeature.create({ name, description, image, status });

      req.flash('success_msg', 'Category Feature added successfully!');
      res.redirect('/admin/category-features');
    } catch (err) {
      console.error('CategoryFeature.store error:', err);
      req.flash('error_msg', 'Error creating category feature');
      res.redirect('/admin/category-features');
    }
  },

  // Show single category feature (detail)
  show: async (req, res) => {
    try {
      const category = await CategoryFeature.findByPk(req.params.id, {
        include: [{ model: ProductFeature, as: 'products' }],
      });
      if (!category) {
        req.flash('error_msg', 'Category Feature not found');
        return res.redirect('/admin/category-features');
      }
      res.render('admin/categoryFeature/show', {
        layout: 'admin/layouts/admin',
        title: `Category Feature - ${category.name}`,
        category,
      });
    } catch (err) {
      console.error('CategoryFeature.show error:', err);
      req.flash('error_msg', 'Error fetching category feature');
      res.redirect('/admin/category-features');
    }
  },

  // Show edit form
  edit: async (req, res) => {
    try {
      const category = await CategoryFeature.findByPk(req.params.id);
      if (!category) {
        req.flash('error_msg', 'Category Feature not found');
        return res.redirect('/admin/category-features');
      }
      res.render('admin/categoryFeature/form', {
        layout: 'admin/layouts/admin',
        title: 'Edit Category Feature',
        category,
        action: 'edit',
      });
    } catch (err) {
      console.error('CategoryFeature.edit error:', err);
      req.flash('error_msg', 'Error loading edit form');
      res.redirect('/admin/category-features');
    }
  },

  // Update category feature
  update: async (req, res) => {
    try {
      const { name, description, status } = req.body;
      const category = await CategoryFeature.findByPk(req.params.id);

      if (!category) {
        req.flash('error_msg', 'Category Feature not found');
        return res.redirect('/admin/category-features');
      }

      // If new file uploaded, remove old image
      if (req.file && category.image) {
        const oldPath = path.join(uploadPath, category.image);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
        category.image = req.file.filename;
      } else if (req.file) {
        category.image = req.file.filename;
      }

      category.name = name;
      category.description = description;
      category.status = status;
      await category.save();

      req.flash('success_msg', 'Category Feature updated successfully!');
      res.redirect('/admin/category-features');
    } catch (err) {
      console.error('CategoryFeature.update error:', err);
      req.flash('error_msg', 'Error updating category feature');
      res.redirect('/admin/category-features');
    }
  },

  // Delete category feature
  destroy: async (req, res) => {
    try {
      const category = await CategoryFeature.findByPk(req.params.id);
      if (!category) {
        req.flash('error_msg', 'Category Feature not found');
        return res.redirect('/admin/category-features');
      }

      if (category.image) {
        const imgPath = path.join(uploadPath, category.image);
        if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
      }

      await category.destroy();
      req.flash('success_msg', 'Category Feature deleted successfully!');
      res.redirect('/admin/category-features');
    } catch (err) {
      console.error('CategoryFeature.destroy error:', err);
      req.flash('error_msg', 'Error deleting category feature');
      res.redirect('/admin/category-features');
    }
  },
};

module.exports = categoryFeatureController;
