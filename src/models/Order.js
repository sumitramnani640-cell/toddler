'use strict';

module.exports = (sequelize, DataTypes) => {
  const Order = sequelize.define('Order', {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    },

    userId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      references: { model: 'users', key: 'id' }
    },

    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0
    },

    // NEW: subtotal (before delivery)
    subtotalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0
    },

    // NEW: delivery charge
    deliveryCharge: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0
    },

    status: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: 'pending'
    },

    items: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: []
    },

    // screenshot URL or path
    screenshotUrl: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'screenshot_url'
    }

    // createdAt, updatedAt handled by Sequelize
  }, {
    tableName: 'orders',
    timestamps: true,
    underscored: false
  });

  Order.associate = (models) => {
    Order.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user',
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    });

    // If you use an OrderItem model also, add association:
    if (models.OrderItem) {
      Order.hasMany(models.OrderItem, { foreignKey: 'order_id', as: 'orderItems' });
    }
  };

  return Order;
};
