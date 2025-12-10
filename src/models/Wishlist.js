// src/models/wishlist.js
module.exports = (sequelize, DataTypes) => {
  const Wishlist = sequelize.define('Wishlist', {
    userId: {
      type: DataTypes.STRING,
      allowNull: false
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },

  }, {
    tableName: 'wishlists',
    indexes: [
      { unique: true, fields: ['userId', 'productId'] }
    ]
  });

  Wishlist.associate = (models) => {
    Wishlist.belongsTo(models.Product, {
      as: 'product',
      foreignKey: 'productId'
    });
  };

  return Wishlist;
};
