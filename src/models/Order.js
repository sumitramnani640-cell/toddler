// src/models/Order.js
module.exports = (sequelize, DataTypes) => {
  const Order = sequelize.define('Order', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    // recommended: use user_id as FK column (consistent, clear)
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users', // actual DB table name (lowercase plural)
        key: 'id',
      },
    },

    total_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },

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
    underscored: true // optional: maps camelCase model attrs to snake_case DB columns
  });

  // Associations — executed by models/index.js after all models are defined
  Order.associate = function(models) {
    // models.User must exist (check models/index.js loads User)
    Order.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user',
      onDelete: 'CASCADE',
    });

    // Example: Order.hasMany(models.OrderItem, { foreignKey: 'order_id', as: 'items' });
  };

  return Order;
};
