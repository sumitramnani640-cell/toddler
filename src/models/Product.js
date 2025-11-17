'use strict';

const { Op } = require('sequelize'); // for queries
const SequelizePkg = require('sequelize'); // if you need constructor elsewhere

module.exports = (sequelize, DataTypes) => {
  // slugify helper (safe)
  function slugify(value) {
    if (!value && value !== 0) return '';
    const s = String(value).trim().toLowerCase();
    return s
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  // generate unique slug (uses 'let' for reassignable vars)
  async function generateUniqueSlug(baseName, Model, excludeId = null) {
    const base = slugify(baseName) || `product-${Date.now()}`;
    let candidate = base;
    let counter = 1;

    let existing = await Model.findOne({
      where: {
        slug: candidate,
        ...(excludeId ? { id: { [Op.ne]: excludeId } } : {})
      },
      attributes: ['id']
    });

    while (existing) {
      candidate = `${base}-${counter}`;
      counter += 1;
      existing = await Model.findOne({
        where: {
          slug: candidate,
          ...(excludeId ? { id: { [Op.ne]: excludeId } } : {})
        },
        attributes: ['id']
      });
    }

    return candidate;
  }

  // define model
  const Product = sequelize.define('Product', {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    price: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: false,
      defaultValue: 0
    },
    stock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    image: {
      type: DataTypes.STRING,
      allowNull: true
    },
    category_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'inactive'
    }
  }, {
    tableName: 'products',
    timestamps: true,
    underscored: false
  });

  // associations
  Product.associate = function(models) {
    Product.belongsTo(models.Category, { foreignKey: 'category_id', as: 'category' });
  };

  // Register hooks AFTER Product is defined so `Product` is available inside the hook
  Product.beforeValidate(async (product, options) => {
    // normalize provided slug
    if (product.slug && String(product.slug).trim() !== '') {
      product.slug = slugify(product.slug);
    }

    // if slug missing or empty, generate
    if ((!product.slug || String(product.slug).trim() === '') && product.name) {
      const excludeId = product.id || null;
      // pass Product (the model) to generator so uniqueness checks work
      product.slug = await generateUniqueSlug(product.name, Product, excludeId);
    }

    // final fallback
    if (!product.slug || String(product.slug).trim() === '') {
      product.slug = `product-${Date.now()}`;
    }
  });

  return Product;
};
