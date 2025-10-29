const { Product, Category } = require('../../models');
const path = require('path');
const fs = require('fs').promises;

// Configure multer for file uploads
const multer = require('multer');
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads/products/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'product-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'));
        }
    }
});

const productController = {
    // List all products
    index: async (req, res) => {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = 10;
            const offset = (page - 1) * limit;

            const { count, rows: products } = await Product.findAndCountAll({
                include: [{
                    model: Category,
                    as: 'category',
                    attributes: ['name']
                }],
                order: [['createdAt', 'DESC']],
                limit: limit,
                offset: offset
            });

            const totalPages = Math.ceil(count / limit);

            res.render('admin/products/index', {
                title: 'Products - Savers Grocery Admin',
                products,
                currentPage: page,
                totalPages,
                totalProducts: count
            });

        } catch (error) {
            console.error('Products index error:', error);
            req.flash('error_msg', 'Error loading products');
            res.redirect('/admin/dashboard');
        }
    },

    // Show create product form
    create: async (req, res) => {
        try {
            const categories = await Category.findAll({
                where: { status: 'active' },
                order: [['name', 'ASC']]
            });

            res.render('admin/products/create', {
                title: 'Add Product - Savers Grocery Admin',
                categories
            });

        } catch (error) {
            console.error('Product create form error:', error);
            req.flash('error_msg', 'Error loading create form');
            res.redirect('/admin/products');
        }
    },

    // Store new product
    store: async (req, res) => {
        try {
            const uploadMiddleware = upload.single('image');
            
            uploadMiddleware(req, res, async (err) => {
                if (err) {
                    req.flash('error_msg', err.message);
                    return res.redirect('/admin/products/create');
                }

                const { name, description, price, stock, category_id, status } = req.body;
                let imagePath = null;

                if (req.file) {
                    imagePath = '/uploads/products/' + req.file.filename;
                }

                const product = await Product.create({
                    name,
                    description,
                    price: parseFloat(price),
                    stock: parseInt(stock),
                    image: imagePath,
                    category_id: parseInt(category_id),
                    status: status || 'active'
                });

                req.flash('success_msg', 'Product created successfully');
                res.redirect('/admin/products');
            });

        } catch (error) {
            console.error('Product store error:', error);
            req.flash('error_msg', 'Error creating product');
            res.redirect('/admin/products/create');
        }
    },

    // Show single product
    show: async (req, res) => {
        try {
            const product = await Product.findByPk(req.params.id, {
                include: [{
                    model: Category,
                    as: 'category'
                }]
            });

            if (!product) {
                req.flash('error_msg', 'Product not found');
                return res.redirect('/admin/products');
            }

            res.render('admin/products/show', {
                title: `${product.name} - Savers Grocery Admin`,
                product
            });

        } catch (error) {
            console.error('Product show error:', error);
            req.flash('error_msg', 'Error loading product');
            res.redirect('/admin/products');
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

            res.render('admin/products/edit', {
                title: `Edit ${product.name} - Savers Grocery Admin`,
                product,
                categories
            });

        } catch (error) {
            console.error('Product edit form error:', error);
            req.flash('error_msg', 'Error loading edit form');
            res.redirect('/admin/products');
        }
    },

    // Update product
    update: async (req, res) => {
        try {
            const uploadMiddleware = upload.single('image');
            
            uploadMiddleware(req, res, async (err) => {
                if (err) {
                    req.flash('error_msg', err.message);
                    return res.redirect(`/admin/products/${req.params.id}/edit`);
                }

                const product = await Product.findByPk(req.params.id);
                if (!product) {
                    req.flash('error_msg', 'Product not found');
                    return res.redirect('/admin/products');
                }

                const { name, description, price, stock, category_id, status } = req.body;
                let imagePath = product.image;

                // If new image uploaded, delete old image and use new one
                if (req.file) {
                    // Delete old image if exists
                    if (product.image) {
                        const oldImagePath = path.join('public', product.image);
                        try {
                            await fs.unlink(oldImagePath);
                        } catch (unlinkError) {
                            console.error('Error deleting old image:', unlinkError);
                        }
                    }
                    imagePath = '/uploads/products/' + req.file.filename;
                }

                await product.update({
                    name,
                    description,
                    price: parseFloat(price),
                    stock: parseInt(stock),
                    image: imagePath,
                    category_id: parseInt(category_id),
                    status: status || 'active'
                });

                req.flash('success_msg', 'Product updated successfully');
                res.redirect('/admin/products');
            });

        } catch (error) {
            console.error('Product update error:', error);
            req.flash('error_msg', 'Error updating product');
            res.redirect(`/admin/products/${req.params.id}/edit`);
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

            // Delete image file if exists
            if (product.image) {
                const imagePath = path.join('public', product.image);
                try {
                    await fs.unlink(imagePath);
                } catch (unlinkError) {
                    console.error('Error deleting image:', unlinkError);
                }
            }

            await product.destroy();

            req.flash('success_msg', 'Product deleted successfully');
            res.redirect('/admin/products');

        } catch (error) {
            console.error('Product delete error:', error);
            req.flash('error_msg', 'Error deleting product');
            res.redirect('/admin/products');
        }
    }
};

module.exports = productController;
