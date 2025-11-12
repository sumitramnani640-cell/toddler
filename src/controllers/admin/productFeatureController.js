// src/controllers/admin/productFeatureController.js
const { ProductFeature, Product, Category } = require('../../models');
const fs = require('fs');
const path = require('path');

const uploadPath = path.join(__dirname, '../../../public/uploads');
if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });

const productFeatureController = {
  // List all product features
  index: async (req, res) => {
    try {
      const features = await ProductFeature.findAll({
        include: [
          {
            model: Product,
            as: 'product',
            attributes: ['id', 'name', 'slug'],
            include: [
              {
                model: Category,
                as: 'category',
                attributes: ['id', 'name', 'slug'],
              },
            ],
          },
        ],
        order: [['id', 'DESC']],
      });

      res.render('admin/productFeature/index', {
        layout: 'admin/layouts/admin',
        title: 'Product Features',
        features,
      });
    } catch (err) {
      console.error('ProductFeature.index error:', err);
      req.flash('error_msg', 'Error fetching product features');
      res.redirect('/admin/dashboard');
    }
  },

  // Create form
  create: async (req, res) => {
    try {
      const products = await Product.findAll({
        where: { status: 'active' },
        attributes: ['id', 'name'],
        order: [['name', 'ASC']],
      });

      res.render('admin/productFeature/form', {
        layout: 'admin/layouts/admin',
        title: 'Add Product Feature',
        feature: {},
        products,
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
      const { productId, title, value, status } = req.body;
      const image = req.file ? req.file.filename : null;

      await ProductFeature.create({
        product_id: productId,
        title,
        value,
        image,
        status: status || 'active',
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
        include: [{ model: Product, as: 'product', include: [{ model: Category, as: 'category' }] }],
      });
      if (!feature) {
        req.flash('error_msg', 'Product Feature not found');
        return res.redirect('/admin/product-features');
      }
      res.render('admin/productFeature/show', {
        layout: 'admin/layouts/admin',
        title: `Product Feature - ${feature.title}`,
        feature,
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
      const feature = await ProductFeature.findByPk(req.params.id);
      if (!feature) {
        req.flash('error_msg', 'Product Feature not found');
        return res.redirect('/admin/product-features');
      }

      const products = await Product.findAll({
        where: { status: 'active' },
        attributes: ['id', 'name'],
      });

      res.render('admin/productFeature/form', {
        layout: 'admin/layouts/admin',
        title: 'Edit Product Feature',
        feature,
        products,
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
      const { productId, title, value, status } = req.body;
      const feature = await ProductFeature.findByPk(req.params.id);
      if (!feature) {
        req.flash('error_msg', 'Product Feature not found');
        return res.redirect('/admin/product-features');
      }

      if (req.file && feature.image) {
        const oldPath = path.join(uploadPath, feature.image);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
        feature.image = req.file.filename;
      } else if (req.file) {
        feature.image = req.file.filename;
      }

      feature.product_id = productId;
      feature.title = title;
      feature.value = value;
      feature.status = status;
      await feature.save();

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
