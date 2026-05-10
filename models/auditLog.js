const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AuditLog = sequelize.define('AuditLog', {
    userId: {
        type: DataTypes.INTEGER
    },
    action: {
        type: DataTypes.STRING,
        allowNull: false
    },
    entity: {
        type: DataTypes.STRING,
        allowNull: false
    },
    entityId: {
        type: DataTypes.INTEGER
    },
    details: {
        type: DataTypes.JSON
    }
}, {
    tableName: 'audit_logs',
    updatedAt: false
});

module.exports = AuditLog;
