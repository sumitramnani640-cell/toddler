// src/controllers/admin/productController.js
const { Product, Category } = require('../../models');
const path = require('path');
const fs = require('fs').promises;
const fsSync = require('fs');
const multer = require('multer');

// Ensure upload directory exists (sync on startup)
const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'products');
if (!fsSync.existsSync(uploadsDir)) fsSync.mkdirSync(uploadsDir, { recursive: true });

// -------------------- Multer Configuration --------------------
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'product-' + uniqueSuffix + path.extname(file.originalname).toLowerCase());
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test((file.mimetype || '').toLowerCase());
    if (mimetype && extname) cb(null, true);
    else cb(new Error('Only image files (JPG, PNG, GIF, WebP) are allowed!'));
  }
});

// promisified multer single upload
function uploadSingle(fieldName) {
  return (req, res) =>
    new Promise((resolve, reject) => {
      const middleware = upload.single(fieldName);
      middleware(req, res, (err) => {
        if (err) return reject(err);
        resolve();
      });
    });
}

// -------------------- Product Controller --------------------
const productController = {
  // List all products
  index: async (req, res) => {
    try {
      const page = parseInt(req.query.page, 10) || 1;
      const limit = 10;
      const offset = (page - 1) * limit;

      const { count, rows: products } = await Product.findAndCountAll({
        include: [{
          model: Category,
          as: 'category',
          attributes: ['name']
        }],
        order: [['createdAt', 'DESC']],
        limit,
        offset
      });

      const totalPages = Math.ceil(count / limit);

      return res.render('admin/products/index', {
        title: 'Products - Savers Grocery Admin',
        products,
        currentPage: page,
        totalPages,
        totalProducts: count
      });

    } catch (error) {
      console.error('Products index error:', error);
      req.flash('error_msg', 'Error loading products');
      return res.redirect('/admin/dashboard');
    }
  },

  // Show create product form
  create: async (req, res) => {
    try {
      const categories = await Category.findAll({
        where: { status: 'active' },
        order: [['name', 'ASC']]
      });

      return res.render('admin/products/create', {
        title: 'Add Product - Savers Grocery Admin',
        categories
      });

    } catch (error) {
      console.error('Product create form error:', error);
      req.flash('error_msg', 'Error loading create form');
      return res.redirect('/admin/products');
    }
  },

  // Store new product
  store: async (req, res) => {
    try {
      await uploadSingle('image')(req, res);

      const { name = '', description = '', price, stock, category_id, status } = req.body || {};

      const parsedPrice = parseFloat(price);
      const parsedStock = parseInt(stock, 10);
      const parsedCategoryId = parseInt(category_id, 10);

      // Basic validation
      if (!name.trim() || Number.isNaN(parsedPrice) || Number.isNaN(parsedStock) || Number.isNaN(parsedCategoryId)) {
        req.flash('error_msg', 'Please fill all required fields correctly.');
        return res.redirect('/admin/products/create');
      }

      let imagePath = null;
      if (req.file && req.file.filename) imagePath = path.posix.join('/uploads/products', req.file.filename);

      await Product.create({
        name: name.trim(),
        description: description ? description.trim() : null,
        price: parsedPrice,
        stock: parsedStock,
        image: imagePath,
        category_id: parsedCategoryId,
        status: status || 'active'
      });

      req.flash('success_msg', 'Product created successfully');
      return res.redirect('/admin/products');

    } catch (error) {
      console.error('Product store error:', error);
      // Multer file filter errors are user-facing
      req.flash('error_msg', error.message || 'Error creating product');
      return res.redirect('/admin/products/create');
    }
  },

  // Show single product
  show: async (req, res) => {
    try {
      const product = await Product.findByPk(req.params.id, {
        include: [{ model: Category, as: 'category' }]
      });

      if (!product) {
        req.flash('error_msg', 'Product not found');
        return res.redirect('/admin/products');
      }

      return res.render('admin/products/show', {
        title: `${product.name} - Savers Grocery Admin`,
        product
      });

    } catch (error) {
      console.error('Product show error:', error);
      req.flash('error_msg', 'Error loading product');
      return res.redirect('/admin/products');
    }
  },

  // Show edit product form
  edit: async (req, res) => {
    try {
      const [product, categories] = await Promise.all([
        Product.findByPk(req.params.id),
        Category.findAll({
          where: { status: 'active' },
          order: [['name', 'ASC']]
        })
      ]);

      if (!product) {
        req.flash('error_msg', 'Product not found');
        return res.redirect('/admin/products');
      }

      return res.render('admin/products/edit', {
        title: `Edit ${product.name} - Savers Grocery Admin`,
        product,
        categories
      });

    } catch (error) {
      console.error('Product edit form error:', error);
      req.flash('error_msg', 'Error loading edit form');
      return res.redirect('/admin/products');
    }
  },

  // Update product
  update: async (req, res) => {
    try {
      await uploadSingle('image')(req, res);

      const product = await Product.findByPk(req.params.id);
      if (!product) {
        req.flash('error_msg', 'Product not found');
        return res.redirect('/admin/products');
      }

      const { name = '', description = '', price, stock, category_id, status } = req.body || {};
      const parsedPrice = parseFloat(price);
      const parsedStock = parseInt(stock, 10);
      const parsedCategoryId = parseInt(category_id, 10);

      if (!name.trim() || Number.isNaN(parsedPrice) || Number.isNaN(parsedStock) || Number.isNaN(parsedCategoryId)) {
        req.flash('error_msg', 'Please fill all required fields correctly.');
        return res.redirect(`/admin/products/${req.params.id}/edit`);
      }

      let imagePath = product.image;

      // Replace image if new one uploaded
      if (req.file && req.file.filename) {
        if (product.image) {
          const oldImagePath = path.join(process.cwd(), 'public', product.image.replace(/^\//, ''));
          try {
            await fs.unlink(oldImagePath);
          } catch (unlinkError) {
            console.error('Error deleting old image:', unlinkError);
          }
        }
        imagePath = path.posix.join('/uploads/products', req.file.filename);
      }

      await product.update({
        name: name.trim(),
        description: description ? description.trim() : null,
        price: parsedPrice,
        stock: parsedStock,
        image: imagePath,
        category_id: parsedCategoryId,
        status: status || 'active'
      });

      req.flash('success_msg', 'Product updated successfully');
      return res.redirect('/admin/products');

    } catch (error) {
      console.error('Product update error:', error);
      req.flash('error_msg', error.message || 'Error updating product');
      return res.redirect(`/admin/products/${req.params.id}/edit`);
    }
  },

  // Delete product
  destroy: async (req, res) => {
    try {
      const product = await Product.findByPk(req.params.id);
      if (!product) {
        req.flash('error_msg', 'Product not found');
        return res.redirect('/admin/products');
      }

      if (product.image) {
        const imagePath = path.join(process.cwd(), 'public', product.image.replace(/^\//, ''));
        try {
          await fs.unlink(imagePath);
        } catch (unlinkError) {
          console.error('Error deleting image:', unlinkError);
        }
      }

      await product.destroy();
      req.flash('success_msg', 'Product deleted successfully');
      return res.redirect('/admin/products');
    } catch (error) {
      console.error('Product delete error:', error);
      req.flash('error_msg', 'Error deleting product');
      return res.redirect('/admin/products');
    }
  }
};

module.exports = productController;
