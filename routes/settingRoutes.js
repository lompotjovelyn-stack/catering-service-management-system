const express = require('express');
const { SystemSetting } = require('../models');
const { authenticate, authorize } = require('../middleware/auth');
const logAction = require('../utils/audit');

const router = express.Router();

router.use(authenticate, authorize('admin'));

<<<<<<< HEAD
const defaultSettings = [
    { key: 'business_name', value: 'Catering Service Management System' },
    { key: 'contact_email', value: 'admin@catering.local' },
    { key: 'max_bookings_per_day', value: process.env.MAX_BOOKINGS_PER_DAY || '3' },
    { key: 'cancellation_policy', value: 'Customer cancellation requests must be approved by staff or admin.' },
    { key: 'payment_terms', value: 'Billing may be marked unbilled, billed, or settled by staff/admin.' }
];

async function ensureDefaultSettings() {
    for (const setting of defaultSettings) {
        await SystemSetting.findOrCreate({
            where: { key: setting.key },
            defaults: { value: setting.value }
        });
    }
}

router.get('/', async (req, res) => {
    try {
        await ensureDefaultSettings();
=======
router.get('/', async (req, res) => {
    try {
>>>>>>> 60187203880473657c5c68fd6f3b891b6218e809
        const settings = await SystemSetting.findAll({ order: [['key', 'ASC']] });
        res.json(settings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.put('/:key', async (req, res) => {
    try {
        const { value } = req.body;

        if (value === undefined) {
            return res.status(400).json({ message: 'Setting value is required' });
        }

        const [setting] = await SystemSetting.findOrCreate({
            where: { key: req.params.key },
            defaults: { value: String(value) }
        });

        if (setting.value !== String(value)) {
            setting.value = String(value);
            await setting.save();
        }

        await logAction(req.user.id, 'upsert', 'SystemSetting', setting.id, { key: req.params.key });

        res.json(setting);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
