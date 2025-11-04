const { Product, Category } = require('../../models');

const categoryController = {

    // ✅ View Products Under Selected Category
    productsByCategory: async (req, res) => {
        try {
            const { slug } = req.params;

            // Find selected category
            const category = await Category.findOne({
                where: { slug, status: 'active' }
            });

            if (!category) {
                return res.redirect('/');
            }

            // Fetch all categories for sidebar
            const categories = await Category.findAll({
                where: { status: 'active' },
                order: [['name', 'ASC']]
            });

            // Fetch category products
            const products = await Product.findAll({
                where: { category_id: category.id, status: 'active' },
                include: [
                    { model: Category, as: 'category', attributes: ['name', 'slug'] }
                ],
                order: [['createdAt', 'DESC']]
            });

            res.render('frontend/category-products', {
                title: category.name + ' - Savers Grocery',
                category,
                products,
                categories,
                activeCategory: slug,
                layout: false
            });

        } catch (error) {
            console.error('Category Page Error:', error);
            res.redirect('/');
        }
    }

};

module.exports = categoryController;
