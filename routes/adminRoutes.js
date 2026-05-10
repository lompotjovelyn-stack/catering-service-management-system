const express = require('express');
const { Booking, User, InventoryItem, Vendor, AuditLog } = require('../models');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate, authorize('admin'));

router.get('/dashboard', async (req, res) => {
    try {
        const [
            totalUsers,
            totalBookings,
            pendingBookings,
            approvedBookings,
            lowStockItems,
            activeVendors
        ] = await Promise.all([
            User.count(),
            Booking.count(),
            Booking.count({ where: { status: 'pending' } }),
            Booking.count({ where: { status: 'approved' } }),
            InventoryItem.count({
                where: require('sequelize').where(
                    require('sequelize').col('quantity'),
                    '<=',
                    require('sequelize').col('reorderLevel')
                )
            }),
            Vendor.count({ where: { status: 'active' } })
        ]);

        res.json({
            totalUsers,
            totalBookings,
            pendingBookings,
            approvedBookings,
            lowStockItems,
            activeVendors
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get('/users', async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: { exclude: ['password'] },
            order: [['createdAt', 'DESC']]
        });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.patch('/users/:id/role', async (req, res) => {
    try {
        const { role, isActive } = req.body;
        const user = await User.findByPk(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (role) user.role = role;
        if (isActive !== undefined) user.isActive = isActive;
        await user.save();

        const safeUser = user.toJSON();
        delete safeUser.password;

        res.json(safeUser);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get('/audit-logs', async (req, res) => {
    try {
        const logs = await AuditLog.findAll({
            include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email', 'role'] }],
            order: [['createdAt', 'DESC']],
            limit: Number(req.query.limit || 100)
        });
        res.json(logs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
