const { Category, Product } = require('../../models');
const fs = require('fs');
const path = require('path');
const { Op } = require('sequelize');

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

    // Create page
    create: (req, res) => {
        res.render('admin/categories/create', {
            title: 'Add Category - Savers Grocery Admin'
        });
    },

    // Store category
    store: async (req, res) => {
        try {
            const { name, slug, description, status } = req.body;

            // Slug check
            const exists = await Category.findOne({
                where: { slug: slug.toLowerCase() }
            });
            if (exists) {
                req.flash('error_msg', 'Slug already exists');
                return res.redirect('/admin/categories/create');
            }

            await Category.create({
                name,
                slug: slug.toLowerCase(),
                description,
                status: status || 'active',
                image: req.file ? req.file.filename : null
            });

            req.flash('success_msg', 'Category created successfully');
            res.redirect('/admin/categories');

        } catch (error) {
            console.error('Category store error:', error);
            req.flash('error_msg', 'Error creating category');
            res.redirect('/admin/categories/create');
        }
    },

    // Show Single Category
    show: async (req, res) => {
        try {
            const category = await Category.findByPk(req.params.id, {
                include: [{
                    model: Product,
                    as: 'products',
                    order: [['createdAt', 'DESC']]
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

    // Edit
    edit: async (req, res) => {
        try {
            const category = await Category.findByPk(req.params.id);

            if (!category) {
                req.flash('error_msg', 'Category not found');
                return res.redirect('/admin/categories');
            }

            res.render('admin/categories/edit', {
                title: `Edit ${category.name}`,
                category
            });

        } catch (error) {
            console.error('Edit form error:', error);
            req.flash('error_msg', 'Error loading edit page');
            res.redirect('/admin/categories');
        }
    },

    // Update Category
    update: async (req, res) => {
        try {
            const category = await Category.findByPk(req.params.id);
            if (!category) {
                req.flash('error_msg', 'Category not found');
                return res.redirect('/admin/categories');
            }

            const { name, slug, description, status } = req.body;

            // Slug exists check
            const exists = await Category.findOne({
                where: {
                    slug: slug.toLowerCase(),
                    id: { [Op.ne]: category.id }
                }
            });
            if (exists) {
                req.flash('error_msg', 'Slug already exists');
                return res.redirect(`/admin/categories/${req.params.id}/edit`);
            }

            // Remove old image if new is uploaded
            if (req.file && category.image) {
                const oldImagePath = path.join(__dirname, '../../public/uploads/categories', category.image);
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
            }

            await category.update({
                name,
                slug: slug.toLowerCase(),
                description,
                status: status || 'active',
                image: req.file ? req.file.filename : category.image
            });

            req.flash('success_msg', 'Category updated successfully');
            res.redirect('/admin/categories');

        } catch (error) {
            console.error('Category update error:', error);
            req.flash('error_msg', 'Error updating category');
            res.redirect(`/admin/categories/${req.params.id}/edit`);
        }
    },

    // Delete Category
    destroy: async (req, res) => {
        try {
            const category = await Category.findByPk(req.params.id);
            if (!category) {
                req.flash('error_msg', 'Category not found');
                return res.redirect('/admin/categories');
            }

            const productCount = await Product.count({
                where: { category_id: category.id }
            });

            if (productCount > 0) {
                req.flash('error_msg', 'Cannot delete category having products');
                return res.redirect('/admin/categories');
            }

            // Delete image
            if (category.image) {
                const imagePath = path.join(__dirname, '../../public/uploads/categories', category.image);
                if (fs.existsSync(imagePath)) {
                    fs.unlinkSync(imagePath);
                }
            }

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
