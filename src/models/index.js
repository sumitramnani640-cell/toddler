const { Sequelize } = require('sequelize');
require('dotenv').config();

// ✅ Initialize Sequelize connection
const sequelize = new Sequelize(
  process.env.DB_NAME || 'savers_grocery',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  }
);

// ✅ Import model files (ensure filenames match exactly)
const AdminModel = require('./Admin');
const ProductModel = require('./Product');
const CategoryModel = require('./Category');
const BannerModel = require('./Banner');
const UserModel = require('./User');
const OrderModel = require('./Order');
const NewsletterModel = require('./Newsletter');

// ✅ Initialize models
const Admin = AdminModel(sequelize);
const Product = ProductModel(sequelize);
const Category = CategoryModel(sequelize);
const Banner = BannerModel(sequelize);
const User = UserModel(sequelize);
const Order = OrderModel(sequelize);
const Newsletter = NewsletterModel(sequelize);

// ✅ Define associations (if any)
const models = { Admin, Product, Category, Banner, User, Order };

Object.keys(models).forEach((modelName) => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

// ✅ Test database connection
(async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
    await sequelize.sync();
    console.log('Database synchronized successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
})();

module.exports = {
  sequelize,
  ...models,
  Newsletter

};
