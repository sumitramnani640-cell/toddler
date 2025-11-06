// src/controllers/admin/productFeatureController.js
const { ProductFeature, CategoryFeature } = require('../../models');
const fs = require('fs');
const path = require('path');

const uploadPath = path.join(__dirname, '../../../public/uploads');
if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });

const productFeatureController = {
  // List all product features -> render as `products`
  index: async (req, res) => {
    try {
      const products = await ProductFeature.findAll({
        // adjust 'as' to whichever alias you defined in your models (commonly 'category')
        include: [{ model: CategoryFeature, as: 'category' }],
        order: [['id', 'DESC']],
      });

      res.render('admin/productFeature/index', {
        layout: 'admin/layouts/admin',
        title: 'Product Features',
        products,               // <--- NOTE: view expects `products`
      });
    } catch (err) {
      console.error('ProductFeature.index error:', err);
      req.flash('error_msg', 'Error fetching product features');
      res.redirect('/admin/dashboard');
    }
  },

  // Create form (needs categories to pick parent category feature)
  create: async (req, res) => {
    try {
      const categories = await CategoryFeature.findAll({ where: { status: 'active' } });
      res.render('admin/productFeature/form', {
        layout: 'admin/layouts/admin',
        title: 'Add Product Feature',
        product: {},           // empty product for the form
        categories,
        action: 'create',
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
        status: status || 'active',
        category_feature_id: categoryFeatureId || null, // DB column (or use camel if your model maps differently)
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
      const product = await ProductFeature.findByPk(req.params.id, {
        include: [{ model: CategoryFeature, as: 'category' }],
      });
      if (!product) {
        req.flash('error_msg', 'Product Feature not found');
        return res.redirect('/admin/product-features');
      }
      res.render('admin/productFeature/show', {
        layout: 'admin/layouts/admin',
        title: `Product Feature - ${product.name}`,
        product,
      });
    } catch (err) {
      console.error('ProductFeature.show error:', err);
      req.flash('error_msg', 'Error fetching product feature');
      res.redirect('/admin/product-features');
    }
  },

  // Edit form
  edit: async (req, res) => {
    try {
      const product = await ProductFeature.findByPk(req.params.id);
      if (!product) {
        req.flash('error_msg', 'Product Feature not found');
        return res.redirect('/admin/product-features');
      }
      const categories = await CategoryFeature.findAll({ where: { status: 'active' } });
      res.render('admin/productFeature/form', {
        layout: 'admin/layouts/admin',
        title: 'Edit Product Feature',
        product,
        categories,
        action: 'edit',
      });
    } catch (err) {
      console.error('ProductFeature.edit error:', err);
      req.flash('error_msg', 'Error loading edit form');
      res.redirect('/admin/product-features');
    }
  },

  // Update
  update: async (req, res) => {
    try {
      const { name, description, status, categoryFeatureId } = req.body;
      const product = await ProductFeature.findByPk(req.params.id);

      if (!product) {
        req.flash('error_msg', 'Product Feature not found');
        return res.redirect('/admin/product-features');
      }

      // replace image if new uploaded
      if (req.file && product.image) {
        const oldPath = path.join(uploadPath, product.image);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
        product.image = req.file.filename;
      } else if (req.file) {
        product.image = req.file.filename;
      }

      product.name = name;
      product.description = description;
      product.status = status;
      product.category_feature_id = categoryFeatureId || null; // DB column
      await product.save();

      req.flash('success_msg', 'Product Feature updated successfully!');
      res.redirect('/admin/product-features');
    } catch (err) {
      console.error('ProductFeature.update error:', err);
      req.flash('error_msg', 'Error updating product feature');
      res.redirect('/admin/product-features');
    }
  },

  // Delete
  destroy: async (req, res) => {
    try {
      const product = await ProductFeature.findByPk(req.params.id);
      if (!product) {
        req.flash('error_msg', 'Product Feature not found');
        return res.redirect('/admin/product-features');
      }

      if (product.image) {
        const imgPath = path.join(uploadPath, product.image);
        if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
      }

      await product.destroy();
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
