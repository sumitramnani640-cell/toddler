// src/controllers/admin/productFeatureController.js
const { ProductFeature, CategoryFeature } = require('../../models');
const fs = require('fs');
const path = require('path');

const uploadPath = path.join(__dirname, '../../../public/uploads');
// ensure upload folder exists
if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });

const productFeatureController = {
  // List all product features (renders admin/productFeature/index.ejs expecting `products`)
  index: async (req, res) => {
    try {
      const products = await ProductFeature.findAll({
        include: [{ model: CategoryFeature, as: 'category' }], // use alias 'category' (see your association)
        order: [['id', 'DESC']],
      });

      res.render('admin/productFeature/index', {
        layout: 'admin/layouts/admin',
        title: 'Product Features',
        products, // EJS expects `products`
      });
    } catch (err) {
      console.error('ProductFeature.index error:', err);
      req.flash('error_msg', 'Error fetching product features');
      res.redirect('/admin/dashboard');
    }
  },

  // Show create form
  create: async (req, res) => {
    try {
      // load active category features for dropdown
      const categories = await CategoryFeature.findAll({ where: { status: 'active' } });

      res.render('admin/productFeature/form', {
        layout: 'admin/layouts/admin',
        title: 'Add Product Feature',
        action: 'create',
        feature: {}, // empty feature for form
        categories,
      });
    } catch (err) {
      console.error('ProductFeature.create error:', err);
      req.flash('error_msg', 'Error loading form');
      res.redirect('/admin/product-features');
    }
  },

  // Store new product feature
  store: async (req, res) => {
    try {
      const { name, description, status, categoryFeatureId } = req.body;
      const image = req.file ? req.file.filename : null;

      await ProductFeature.create({
        name,
        description,
        image,
        status: status || 'inactive',
        category_feature_id: categoryFeatureId || null, // if your DB field is snake_case
        categoryFeatureId: categoryFeatureId || null,   // and if it's camelCase depending on model
      });

      req.flash('success_msg', 'Product Feature added successfully!');
      res.redirect('/admin/product-features');
    } catch (err) {
      console.error('ProductFeature.store error:', err);
      req.flash('error_msg', 'Error creating product feature');
      res.redirect('/admin/product-features');
    }
  },

  // Show single product feature
  show: async (req, res) => {
    try {
      const feature = await ProductFeature.findByPk(req.params.id, {
        include: [{ model: CategoryFeature, as: 'category' }],
      });

      if (!feature) {
        req.flash('error_msg', 'Product Feature not found');
        return res.redirect('/admin/product-features');
      }

      res.render('admin/productFeature/show', {
        layout: 'admin/layouts/admin',
        title: `Product Feature - ${feature.name}`,
        feature,
      });
    } catch (err) {
      console.error('ProductFeature.show error:', err);
      req.flash('error_msg', 'Error fetching product feature');
      res.redirect('/admin/product-features');
    }
  },

  // Show edit form
  edit: async (req, res) => {
    try {
      const feature = await ProductFeature.findByPk(req.params.id);
      if (!feature) {
        req.flash('error_msg', 'Product Feature not found');
        return res.redirect('/admin/product-features');
      }
      const categories = await CategoryFeature.findAll({ where: { status: 'active' } });

      res.render('admin/productFeature/form', {
        layout: 'admin/layouts/admin',
        title: 'Edit Product Feature',
        action: 'edit',
        feature,
        categories,
      });
    } catch (err) {
      console.error('ProductFeature.edit error:', err);
      req.flash('error_msg', 'Error loading edit form');
      res.redirect('/admin/product-features');
    }
  },

  // Update product feature
  update: async (req, res) => {
    try {
      const { name, description, status, categoryFeatureId } = req.body;
      const feature = await ProductFeature.findByPk(req.params.id);

      if (!feature) {
        req.flash('error_msg', 'Product Feature not found');
        return res.redirect('/admin/product-features');
      }

      // handle image replacement
      if (req.file) {
        if (feature.image) {
          const oldPath = path.join(uploadPath, feature.image);
          if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
        }
        feature.image = req.file.filename;
      }

      feature.name = name;
      feature.description = description;
      feature.status = status || 'inactive';
      // set both possible field names - adjust to your model field name if necessary
      feature.category_feature_id = categoryFeatureId || null;
      feature.categoryFeatureId = categoryFeatureId || null;

      await feature.save();

      req.flash('success_msg', 'Product Feature updated successfully!');
      res.redirect('/admin/product-features');
    } catch (err) {
      console.error('ProductFeature.update error:', err);
      req.flash('error_msg', 'Error updating product feature');
      res.redirect('/admin/product-features');
    }
  },

  // Delete product feature (POST to /admin/product-features/:id/delete)
  destroy: async (req, res) => {
    try {
      const feature = await ProductFeature.findByPk(req.params.id);
      if (!feature) {
        req.flash('error_msg', 'Product Feature not found');
        return res.redirect('/admin/product-features');
      }

      if (feature.image) {
        const imgPath = path.join(uploadPath, feature.image);
        if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
      }

      await feature.destroy();
      req.flash('success_msg', 'Product Feature deleted successfully!');
      res.redirect('/admin/product-features');
    } catch (err) {
      console.error('ProductFeature.destroy error:', err);
      req.flash('error_msg', 'Error deleting product feature');
      res.redirect('/admin/product-features');
    }
  },
};

module.exports = productFeatureController;
