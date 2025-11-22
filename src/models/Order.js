// src/models/Order.js
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

    status: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: 'pending'
    },

    // store the ordered items as JSON
    items: {
      type: DataTypes.JSON,     // MySQL 5.7+ supports JSON; if you use older MySQL use TEXT instead
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

    // No OrderItem association — items stored in JSON column
  };

  return Order;
};
