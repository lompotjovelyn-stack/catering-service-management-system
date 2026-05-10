const sequelize = require('../config/database');
const User = require('./user');
const Booking = require('./booking');
const MenuItem = require('./menuItem');
const InventoryItem = require('./inventoryItem');
const Vendor = require('./vendor');
const AuditLog = require('./auditLog');
const SystemSetting = require('./systemSetting');

User.hasMany(Booking, { foreignKey: 'customerId', as: 'bookings' });
Booking.belongsTo(User, { foreignKey: 'customerId', as: 'customer' });

User.hasMany(Booking, { foreignKey: 'assignedStaffId', as: 'assignedBookings' });
Booking.belongsTo(User, { foreignKey: 'assignedStaffId', as: 'assignedStaff' });

MenuItem.hasMany(Booking, { foreignKey: 'menuItemId', as: 'bookings' });
Booking.belongsTo(MenuItem, { foreignKey: 'menuItemId', as: 'menuItem' });

User.hasOne(Vendor, { foreignKey: 'userId', as: 'vendorProfile' });
Vendor.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Vendor.hasMany(InventoryItem, { foreignKey: 'vendorId', as: 'inventoryItems' });
InventoryItem.belongsTo(Vendor, { foreignKey: 'vendorId', as: 'vendor' });

User.hasMany(AuditLog, { foreignKey: 'userId', as: 'auditLogs' });
AuditLog.belongsTo(User, { foreignKey: 'userId', as: 'user' });

module.exports = {
    sequelize,
    User,
    Booking,
    MenuItem,
    InventoryItem,
    Vendor,
    AuditLog,
    SystemSetting
};
