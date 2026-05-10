const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

const sslOptions = process.env.DB_SSL === 'true'
    ? { dialectOptions: { ssl: { require: true, rejectUnauthorized: false } } }
    : {};

const sequelize = process.env.DATABASE_URL
    ? new Sequelize(process.env.DATABASE_URL, {
        dialect: 'mysql',
        logging: false,
        ...sslOptions
    })
    : new Sequelize(
        process.env.DB_NAME || 'cateringdb',
        process.env.DB_USER || 'root',
        process.env.DB_PASSWORD || '',
        {
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 3306,
            dialect: 'mysql',
            logging: false,
            ...sslOptions
        }
    );

module.exports = sequelize;
