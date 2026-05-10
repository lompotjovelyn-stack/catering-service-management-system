const express = require('express');
const { Booking, InventoryItem, User } = require('../models');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate, authorize('staff', 'admin'));

async function getSchedule(req, res) {
    try {
        const bookings = await Booking.findAll({
            include: [
                { model: User, as: 'customer', attributes: ['id', 'name', 'email', 'phone'] },
                { model: User, as: 'assignedStaff', attributes: ['id', 'name', 'email', 'phone'] }
            ],
            order: [['eventDate', 'ASC'], ['eventTime', 'ASC']]
        });
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

router.get('/', getSchedule);
router.get('/schedule', getSchedule);

router.get('/inventory-summary', async (req, res) => {
    try {
        const items = await InventoryItem.findAll({ order: [['category', 'ASC'], ['name', 'ASC']] });
        res.json(items);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
