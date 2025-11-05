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

module.exports = categoryController;
