const { Category, Product } = require('../../models');

const categoryController = {

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
                return res.render("error", { 
                    title: "Category Not Found",
                    message: "No category found",
                    layout: false
                });
            }
            
            res.render("frontend/categories", {
                title: `${category.name} - Savers Grocery`,
                category,
                products: category.products || [],
                layout: false
            });

        } catch (error) {
            console.error("Frontend Category Page Error:", error);
            res.render("error", {
                title: "Error",
                message: "An error occurred while loading the category",
                layout: false
            });
        }
    }
};

module.exports = categoryController;
