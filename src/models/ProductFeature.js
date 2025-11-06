const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ProductFeature = sequelize.define(
    'ProductFeature',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      category_feature_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'categoryfeatures',
          key: 'id',
        },
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: { notEmpty: true, len: [2, 100] },
      },
      image: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      link: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM('active', 'inactive'),
        defaultValue: 'active',
        allowNull: false,
      },
    },
    {
      tableName: 'productfeatures',
      timestamps: true,
    }
  );

  ProductFeature.associate = (models) => {
    ProductFeature.belongsTo(models.CategoryFeature, {
      foreignKey: 'category_feature_id',
      as: 'category',
    });
  };

  return ProductFeature;
};
