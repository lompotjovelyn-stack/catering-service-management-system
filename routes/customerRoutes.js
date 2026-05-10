const express = require('express');
const { Booking, MenuItem } = require('../models');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate, authorize('customer', 'admin'));

router.get('/dashboard', async (req, res) => {
    try {
        const customerId = req.user.role === 'admin' && req.query.customerId ? req.query.customerId : req.user.id;
        const [bookings, availableMenuItems] = await Promise.all([
            Booking.findAll({ where: { customerId }, order: [['createdAt', 'DESC']] }),
            MenuItem.count({ where: { isAvailable: true } })
        ]);

        res.json({
            bookings,
            availableMenuItems,
            bookingSummary: {
                total: bookings.length,
                pending: bookings.filter((booking) => booking.status === 'pending').length,
                approved: bookings.filter((booking) => booking.status === 'approved').length,
                cancelled: bookings.filter((booking) => booking.status === 'cancelled').length
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
