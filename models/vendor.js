const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Vendor = sequelize.define('Vendor', {
    userId: {
        type: DataTypes.INTEGER
    },
    companyName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    contactPerson: {
        type: DataTypes.STRING
    },
    email: {
        type: DataTypes.STRING,
        validate: {
            isEmail: true
        }
    },
    phone: {
        type: DataTypes.STRING
    },
    address: {
        type: DataTypes.TEXT
    },
    suppliedItems: {
        type: DataTypes.TEXT
    },
    status: {
        type: DataTypes.ENUM('active', 'inactive'),
        defaultValue: 'active'
    }
}, {
    tableName: 'vendors'
});

module.exports = Vendor;
