'use strict';

const { DataTypes, Op } = require('sequelize');

module.exports = (sequelize) => {

  // ------------ Helper: slugify ------------
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

  // ------------ Helper: ensure unique slug ------------
  async function generateUniqueSlug(baseName, Model, excludeId = null) {
    const base = slugify(baseName) || `category-${Date.now()}`;
    let candidate = base;
    let counter = 1;

    let existing = await Model.findOne({
      where: {
        slug: candidate,
        ...(excludeId ? { id: { [Op.ne]: excludeId } } : {})
      }
    });

    while (existing) {
      candidate = `${base}-${counter}`;
      counter++;
      existing = await Model.findOne({
        where: {
          slug: candidate,
          ...(excludeId ? { id: { [Op.ne]: excludeId } } : {})
        }
      });
    }

    return candidate;
  }

  // ------------ Define Model ------------
  const Category = sequelize.define("Category", {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    },

    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },

    slug: {
      type: DataTypes.STRING(150),
      allowNull: false,
      unique: true
    },

    image: {
      type: DataTypes.STRING,
      allowNull: true
    },

    banner_image: {
      type: DataTypes.STRING,
      allowNull: true
    },

    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },

    status: {
      type: DataTypes.ENUM("active", "inactive"),
      allowNull: false,
      defaultValue: "active"
    }
  }, {
    tableName: "categories",
    timestamps: true
  });

  // ------------ Associations ------------
  Category.associate = (models) => {
    Category.hasMany(models.Product, {
      foreignKey: "category_id",
      as: "products"
    });
  };

  // ------------ Hooks (after model is defined) ------------
  Category.beforeValidate(async (category) => {
    // Normalize slug if it exists
    if (category.slug && category.slug.trim() !== "") {
      category.slug = slugify(category.slug);
    }

    // Generate slug if empty
    if ((!category.slug || category.slug.trim() === "") && category.name) {
      const excludeId = category.id || null;
      category.slug = await generateUniqueSlug(category.name, Category, excludeId);
    }

    // Final fallback
    if (!category.slug) {
      category.slug = `category-${Date.now()}`;
    }
  });

  return Category;
};
