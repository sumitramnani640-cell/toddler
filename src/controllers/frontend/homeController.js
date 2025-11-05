const { Product, Category, Banner } = require('../../models');

const homeController = {
    // Show home page
    index: async (req, res) => {
        try {
            // Get active banners
            const banners = await Banner.findAll({
                where: { status: 'active' },
                order: [['createdAt', 'DESC']],
                limit: 5
            });

            // Get active categories
            const categories = await Category.findAll({
                where: { status: 'active' },
                order: [['name', 'ASC']]
            });

            // Get featured products
            const featuredProducts = await Product.findAll({
                where: { status: 'active' },
                include: [{
                    model: Category,
                    as: 'category',
                    attributes: ['name']
                }],
                order: [['createdAt', 'DESC']],
                limit: 8
            });

            res.render('frontend/home', {
                title: 'Savers Grocery - Fresh Products at Your Doorstep',
                banners,
                categories,
                featuredProducts,
                layout: false
            });

        } catch (error) {
            console.error('Home page error:', error);
            res.render('frontend/home', {
                title: 'Savers Grocery - Fresh Products at Your Doorstep',
                banners: [],
                categories: [],
                featuredProducts: [],
                layout: false
            });
        }
    },
    show: async (req, res) => {
        try {
            const slug = req.params.slug;

            const category = await Category.findOne({
                where: { slug, status: "active" },
                include: [{
                    model: Product,
                    as: "products",
                    where: { status: "active" },
                    required: false
                }]
            });

            if (!category) {
                return res.render("frontend/404", { 
                    title: "Category Not Found",
                    message: "No category found"
                });
            }
            
// return res.json(category);
            res.render("frontend/test", {
                title: category.name,
                category,
                products: category.products
            });

        } catch (error) {
            console.error("Frontend Category Page Error:", error);
            res.render("frontend/500", {
                title: "Error",
            });
        }
    }
};

module.exports = homeController;
