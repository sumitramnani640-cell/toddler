// src/models/cart.js
module.exports = (sequelize, DataTypes) => {
  const Cart = sequelize.define('Cart', {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    qty: {
      type: DataTypes.INTEGER,
      defaultValue: 1
    }
  }, {
    tableName: 'carts',
    indexes: [
      { unique: true, fields: ['userId', 'productId'] }
    ]
  });

  Cart.associate = (models) => {
    Cart.belongsTo(models.Product, {
      as: 'product',
      foreignKey: 'productId'
    });
  };

  return Cart;
};
