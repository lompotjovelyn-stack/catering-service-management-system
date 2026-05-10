const express = require('express');
<<<<<<< HEAD
const { Booking, InventoryItem, User, MenuItem } = require('../models');
=======
const { Booking, InventoryItem, User } = require('../models');
>>>>>>> 60187203880473657c5c68fd6f3b891b6218e809
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate, authorize('staff', 'admin'));

async function getSchedule(req, res) {
    try {
        const bookings = await Booking.findAll({
            include: [
                { model: User, as: 'customer', attributes: ['id', 'name', 'email', 'phone'] },
<<<<<<< HEAD
                { model: User, as: 'assignedStaff', attributes: ['id', 'name', 'email', 'phone'] },
                { model: MenuItem, as: 'menuItem' }
=======
                { model: User, as: 'assignedStaff', attributes: ['id', 'name', 'email', 'phone'] }
>>>>>>> 60187203880473657c5c68fd6f3b891b6218e809
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
