const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const CategoryFeature = sequelize.define(
    'CategoryFeature',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
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
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM('active', 'inactive'),
        defaultValue: 'active',
        allowNull: false,
      },
    },
    {
      tableName: 'categoryfeatures',
      timestamps: true,
    }
  );

  CategoryFeature.associate = (models) => {
    CategoryFeature.hasMany(models.ProductFeature, {
      foreignKey: 'category_feature_id',
      as: 'products',
      onDelete: 'CASCADE',
    });
  };

  return CategoryFeature;
};
