// src/models/Product.js
'use strict';

module.exports = (sequelize, DataTypes) => {
  const { Sequelize } = sequelize;

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

    // use let for existing so we can update it in the loop
    let existing = await Model.findOne({
      where: {
        slug: candidate,
        ...(excludeId ? { id: { [Sequelize.Op.ne]: excludeId } } : {})
      },
      attributes: ['id']
    });

    while (existing) {
      candidate = `${base}-${counter}`;
      counter += 1;
      existing = await Model.findOne({
        where: {
          slug: candidate,
          ...(excludeId ? { id: { [Sequelize.Op.ne]: excludeId } } : {})
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
    underscored: false,
    hooks: {
      beforeValidate: async (product) => {
        // if slug present and non-empty -> normalize it
        if (product.slug && String(product.slug).trim() !== '') {
          product.slug = slugify(product.slug);
        }

        // if slug missing or empty, generate
        if ((!product.slug || String(product.slug).trim() === '') && product.name) {
          const excludeId = product.id || null;
          product.slug = await generateUniqueSlug(product.name, Product, excludeId);
        }

        // final fallback
        if (!product.slug || String(product.slug).trim() === '') {
          product.slug = `product-${Date.now()}`;
        }
      }
    }
  });

  // associations (if your index.js wires them differently, keep that)
  Product.associate = function(models) {
    Product.belongsTo(models.Category, { foreignKey: 'category_id', as: 'category' });
  };

  return Product;
};
