const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ProductFeature = sequelize.define('ProductFeature', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    title: {
      type: DataTypes.STRING(150),
      allowNull: false
    },
    value: {
      type: DataTypes.STRING(255), // e.g. "500 g", "Organic", "Low Fat"
      allowNull: true
    },
    image: {
      type: DataTypes.STRING, // optional small icon/image for feature
      allowNull: true
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    tableName: 'product_features',
    timestamps: true
  });

  ProductFeature.associate = (models) => {
    ProductFeature.belongsTo(models.Product, {
      foreignKey: 'product_id',
      as: 'product'
    });
  };

  return ProductFeature;
};
