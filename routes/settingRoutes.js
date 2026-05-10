const express = require('express');
const { SystemSetting } = require('../models');
const { authenticate, authorize } = require('../middleware/auth');
const logAction = require('../utils/audit');

const router = express.Router();

router.use(authenticate, authorize('admin'));

router.get('/', async (req, res) => {
    try {
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
