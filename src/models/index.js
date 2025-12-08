// src/models/index.js
'use strict';

const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME || 'ecommerce',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: { max: 5, min: 0, acquire: 30000, idle: 10000 },
  }
);

// import model factories
const AdminModel = require('./Admin');
const ProductModel = require('./Product');
const CategoryModel = require('./Category');
const BannerModel = require('./Banner');
const UserModel = require('./User');
const OrderModel = require('./Order');
const NewsletterModel = require('./Newsletter');
const CmsPageModel = require('./CmsPage');

// ⭐ ADD THIS — CART MODEL ⭐
const CartModel = require('./cart');   // filename must be cart.js

// initialize models
const Admin = AdminModel(sequelize, DataTypes);
const Product = ProductModel(sequelize, DataTypes);
const Category = CategoryModel(sequelize, DataTypes);
const Banner = BannerModel(sequelize, DataTypes);
const User = UserModel(sequelize, DataTypes);
const Order = OrderModel(sequelize, DataTypes);
const Newsletter = NewsletterModel(sequelize, DataTypes);
const CmsPage = CmsPageModel(sequelize, DataTypes);

// ⭐ INITIALIZE CART MODEL ⭐
const Cart = CartModel(sequelize, DataTypes);

// Gather models
const models = {
  Admin,
  Product,
  Category,
  Banner,
  User,
  Order,
  Newsletter,
  CmsPage,
  Cart  // ⭐ ADD HERE
};

// Debug log
if (process.env.NODE_ENV !== 'production') {
  console.log('Loaded models:', Object.keys(models));
}

// run associations
Object.keys(models).forEach((name) => {
  if (typeof models[name].associate === 'function') {
    models[name].associate(models);
  }
});

// test & sync DB
(async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');

    // auto-create table if missing
    await sequelize.sync();
    console.log('Database synchronized successfully.');

  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
})();

module.exports = {
  sequelize,
  Sequelize,
  ...models
};
