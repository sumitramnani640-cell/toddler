const { DataTypes } = require('sequelize');
// const Order = require('../../models/Order');
// const User = require('../../models/User');

module.exports = (sequelize) => {
  const Order = sequelize.define('Order', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userid: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    // payment_method: {
    //   type: DataTypes.STRING,
    //   allowNull: false,
    //   defaultValue: 'COD', // Cash on Delivery by default
    // },
    status: {
      type: DataTypes.ENUM('pending', 'processing', 'completed', 'cancelled'),
      defaultValue: 'pending',
    },

    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  }, {
    tableName: 'orders',
    timestamps: true,
  });

  // ✅ Associations
  Order.associate = (models) => {
    Order.belongsTo(models.User, {
      foreignKey: 'userid',
      as: 'user',
      onDelete: 'CASCADE',
    });
  };

  return Order;
};
