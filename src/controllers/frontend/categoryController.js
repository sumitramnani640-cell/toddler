const path = require('path');
const fs = require('fs');
const { Category, Product } = require('../../models');
const { Op } = require('sequelize');

const categoryController = {
  show: async (req, res) => {
    try {
      const identifier = req.params.identifier || req.params.slug;
      if (!identifier) {
        req.flash && req.flash('error_msg', 'Invalid category identifier');
        return res.redirect('/');
      }
      const isNumeric = /^[0-9]+$/.test(String(identifier));
      const where = isNumeric ? { id: Number(identifier) } : { slug: identifier };
      const category = await Category.findOne({
        where: { ...where, status: 'active' },
        include: [{
          model: Product,
          as: 'products',           
          required: false,
          where: { status: 'active' },
          attributes: ['id', 'name', 'slug', 'price', 'image', 'category_id'] 
        }]
      });

      if (!category) {
        req.flash && req.flash('error_msg', 'Category not found');
        return res.redirect('/');
      }

      const webPrefix = '/uploads/products/'; 
      const publicPath = path.join(__dirname, '..', '..', 'public', 'uploads', 'products'); 
      const productsWithUrls = (category.products || []).map(p => {
        const imgFilename = p.image && String(p.image).trim() !== '' ? p.image : null;
        const relUrl = imgFilename ? `${webPrefix}${imgFilename}` : '/images/no-image.png';
        const fullFsPath = imgFilename ? path.join(publicPath, imgFilename) : null;

        if (fullFsPath && !fs.existsSync(fullFsPath)) {
          console.warn(`Product image missing on disk for product ${p.id}: ${fullFsPath}`);
        }


        return {
          ...p.get ? p.get() : p, 
        };
      });
      const relatedProducts = await Product.findAll({
        where: {
          category_id: { [Op.ne]: category.id },
          status: 'active'
        },
        limit: 8,
        attributes: ['id', 'name', 'slug', 'price', 'image', 'category_id']
      });

      const relatedWithUrls = relatedProducts.map(p => {
        const imgFilename = p.image && String(p.image).trim() !== '' ? p.image : null;
        const relUrl = imgFilename ? `${webPrefix}${imgFilename}` : '/images/no-image.png';
        return {
          ...p.get ? p.get() : p,
          imageUrl: relUrl
        };
      });

      const categories = await Category.findAll({ where: { status: 'active' } });
      console.log('Category page products imageUrl:', productsWithUrls.map(p => ({ id: p.id, imageUrl: p.imageUrl })));

      return res.render('frontend/categories', {
        layout: false,
        title: `${category.name} - Savers Grocery`,
        category,
        products: productsWithUrls,
        relatedProducts: relatedWithUrls,
        categories
      });
    } catch (err) {
      console.error('Frontend Category Page Error:', err);
      req.flash && req.flash('error_msg', 'Error loading category page');
      return res.redirect('/');
    }
  }
};

module.exports = categoryController;
