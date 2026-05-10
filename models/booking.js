const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Booking = sequelize.define('Booking', {
    customerId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    eventDate: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    eventTime: {
        type: DataTypes.TIME
    },
    venue: {
        type: DataTypes.STRING,
        allowNull: false
    },
    guests: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1
        }
    },
    packageName: {
        type: DataTypes.STRING
    },
    specialRequests: {
        type: DataTypes.TEXT
    },
    status: {
        type: DataTypes.ENUM('pending', 'approved', 'rejected', 'cancelled', 'completed'),
        defaultValue: 'pending'
    },
    cancellationStatus: {
        type: DataTypes.ENUM('none', 'requested', 'approved', 'rejected'),
        defaultValue: 'none'
    },
    cancellationReason: {
        type: DataTypes.TEXT
    },
    cancellationReviewedBy: {
        type: DataTypes.INTEGER
    },
    cancellationReviewNotes: {
        type: DataTypes.TEXT
    },
    totalAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
    },
    billingStatus: {
        type: DataTypes.ENUM('unbilled', 'billed', 'settled'),
        defaultValue: 'unbilled'
    },
    billingNotes: {
        type: DataTypes.TEXT
    },
    adminNotes: {
        type: DataTypes.TEXT
    },
    assignedStaffId: {
        type: DataTypes.INTEGER
    }
}, {
    tableName: 'bookings'
});

module.exports = Booking;
