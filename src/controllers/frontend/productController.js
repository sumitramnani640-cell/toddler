const { Product, Category } = require('../../models');

const productController = {
  show: async (req, res) => {
    try {
      const id = req.params.id;

      // Find product by ID (no slug)
      const product = await Product.findOne({
        where: { id, status: 'active' },
        include: [
          {
            model: Category,
            as: 'category',
            where: { status: 'active' },
            required: false
          }
        ]
      });

      if (!product) {
        return res.render('error', {
          title: 'Product Not Found',
          message: 'No product found',
          layout: false
        });
      }

      // Fetch related products (same category)
      let relatedProducts = [];
      if (product.category && product.category.id) {
        relatedProducts = await Product.findAll({
          where: {
            category_id: product.category.id,
            status: 'active',
            id: { [require('sequelize').Op.ne]: product.id }
          },
          limit: 8,
          order: [['createdAt', 'DESC']]
        });
      }

      res.render('frontend/product', {
        title: `${product.name} - Savers Grocery`,
        product,
        relatedProducts,
        layout: false
      });
    } catch (error) {
      console.error('Frontend Product Page Error:', error);
      res.render('error', {
        title: 'Error',
        message: 'An error occurred while loading the product',
        layout: false
      });
    }
  }
};

module.exports = productController;
