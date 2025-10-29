const { Category, Product } = require('../../models');

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

    // Store new category
    store: async (req, res) => {
        try {
            const { name, slug, description, status } = req.body;

            // Check if slug already exists
            const existingCategory = await Category.findOne({
                where: { slug: slug.toLowerCase() }
            });

            if (existingCategory) {
                req.flash('error_msg', 'A category with this slug already exists');
                return res.redirect('/admin/categories/create');
            }

            const category = await Category.create({
                name,
                slug: slug.toLowerCase(),
                description,
                status: status || 'active'
            });

            req.flash('success_msg', 'Category created successfully');
            res.redirect('/admin/categories');

        } catch (error) {
            console.error('Category store error:', error);
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

    // Update category
    update: async (req, res) => {
        try {
            const category = await Category.findByPk(req.params.id);
            if (!category) {
                req.flash('error_msg', 'Category not found');
                return res.redirect('/admin/categories');
            }

            const { name, slug, description, status } = req.body;

            // Check if slug already exists (excluding current category)
            const existingCategory = await Category.findOne({
                where: { 
                    slug: slug.toLowerCase(),
                    id: { [require('sequelize').Op.ne]: category.id }
                }
            });

            if (existingCategory) {
                req.flash('error_msg', 'A category with this slug already exists');
                return res.redirect(`/admin/categories/${req.params.id}/edit`);
            }

            await category.update({
                name,
                slug: slug.toLowerCase(),
                description,
                status: status || 'active'
            });

            req.flash('success_msg', 'Category updated successfully');
            res.redirect('/admin/categories');

        } catch (error) {
            console.error('Category update error:', error);
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
