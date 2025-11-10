const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Product = sequelize.define(
    'Product',
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true
      },

      name: {
        type: DataTypes.STRING(200),
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [2, 200]
        }
      },

      // ✅ For frontend URLs like /product/fresh-apples
      slug: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true
      },

      description: {
        type: DataTypes.TEXT,
        allowNull: true
      },

      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.0,
        validate: {
          min: 0
        }
      },

      stock: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
          min: 0
        }
      },

      image: {
        type: DataTypes.STRING(255),
        allowNull: true
      },

      category_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'categories',
          key: 'id'
        }
      },

      status: {
        type: DataTypes.ENUM('active', 'inactive'),
        defaultValue: 'active',
        allowNull: false
      }
    },
    {
      tableName: 'products',
      timestamps: true
    }
  );

  // ✅ Associations
  Product.associate = (models) => {
    Product.belongsTo(models.Category, {
      foreignKey: 'category_id',
      as: 'category'
    });
  };

  // ✅ Auto-generate slug from name before create or update
  Product.beforeCreate(async (product) => {
    await generateUniqueSlug(Product, product);
  });

  Product.beforeUpdate(async (product) => {
    if (product.changed('name')) {
      await generateUniqueSlug(Product, product);
    }
  });

  return Product;
};

// ✅ Helper: generate unique slug
async function generateUniqueSlug(Product, product) {
  const baseSlug = product.name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');

  let slug = baseSlug;
  let count = 1;

  // check if slug exists already
  const existing = await Product.findOne({ where: { slug } });
  while (existing && existing.id !== product.id) {
    slug = `${baseSlug}-${count++}`;
    existing = await Product.findOne({ where: { slug } });
  }

  product.slug = slug;
}
