const express = require('express');
const { fn, col, literal } = require('sequelize');
const { Booking, InventoryItem, Vendor, User } = require('../models');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate, authorize('admin'));

router.get('/bookings', async (req, res) => {
    try {
        const statusCounts = await Booking.findAll({
            attributes: ['status', [fn('COUNT', col('id')), 'count']],
            group: ['status']
        });

        const monthlyBookings = await Booking.findAll({
            attributes: [
                [literal("DATE_FORMAT(eventDate, '%Y-%m')"), 'month'],
                [fn('COUNT', col('id')), 'count']
            ],
            group: [literal("DATE_FORMAT(eventDate, '%Y-%m')")],
            order: [[literal('month'), 'ASC']]
        });

        res.json({ statusCounts, monthlyBookings });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get('/inventory', async (req, res) => {
    try {
        const totalItems = await InventoryItem.count();
        const lowStockItems = await InventoryItem.findAll({
            where: require('sequelize').where(
                require('sequelize').col('quantity'),
                '<=',
                require('sequelize').col('reorderLevel')
            ),
            include: [{ model: Vendor, as: 'vendor' }],
            order: [['quantity', 'ASC']]
        });

        res.json({ totalItems, lowStockItems });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get('/users', async (req, res) => {
    try {
        const roleCounts = await User.findAll({
            attributes: ['role', [fn('COUNT', col('id')), 'count']],
            group: ['role']
        });
        res.json({ roleCounts });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
