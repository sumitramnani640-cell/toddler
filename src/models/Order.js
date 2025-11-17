'use strict';

module.exports = (sequelize, DataTypes) => {
  const Order = sequelize.define('Order', {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    },

    // matches your DB column "userId"
    userId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      references: {
        model: 'users', // table name in DB
        key: 'id'
      }
    },

    // matches your DB column "totalAmount"
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0
    },

    status: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: 'pending'
    }

    // createdAt and updatedAt will be handled automatically by Sequelize
  }, {
    tableName: 'orders',
    timestamps: true,
    underscored: false // IMPORTANT: your DB uses camelCase columns
  });

  // Associations (models/index.js will call this after all models are loaded)
  Order.associate = (models) => {
    // userId column is used as FK
    Order.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user',
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    });

    // add other associations here if needed (order items, payments, etc.)
    // e.g. Order.hasMany(models.OrderItem, { foreignKey: 'orderId', as: 'items' });
  };

  return Order;
};
