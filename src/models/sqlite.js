const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config();

// SQLite configuration for easier setup
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, '../../database.sqlite'),
    logging: process.env.NODE_ENV === 'development' ? console.log : false
});

// Import models
const Admin = require('./Admin');
const Product = require('./Product');
const Category = require('./Category');
const Banner = require('./Banner');
const User = require('./User');
const order = require('./Order');

// Initialize models
const models = {
    Admin: Admin(sequelize),
    Product: Product(sequelize),
    Category: Category(sequelize),
    Banner: Banner(sequelize),
    User: User(sequelize),
    order: order(sequelize)

};

// Define associations
Object.keys(models).forEach(modelName => {
    if (models[modelName].associate) {
        models[modelName].associate(models);
    }
});

// Test database connection
const testConnection = async () => {
    try {
        await sequelize.authenticate();
        console.log('SQLite database connection has been established successfully.');
        
        // Sync database (create tables if they don't exist)
        await sequelize.sync({ alter: true });
        console.log('Database synchronized successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
};

testConnection();

module.exports = {
    sequelize,
    ...models
};
