const express = require('express');
const { MenuItem } = require('../models');
const { authenticate, authorize } = require('../middleware/auth');
const logAction = require('../utils/audit');

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const where = req.query.includeUnavailable === 'true' ? {} : { isAvailable: true };
        const items = await MenuItem.findAll({ where, order: [['category', 'ASC'], ['name', 'ASC']] });
        res.json(items);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post('/', authenticate, authorize('admin'), async (req, res) => {
    try {
        const item = await MenuItem.create(req.body);
        await logAction(req.user.id, 'create', 'MenuItem', item.id, req.body);
        res.status(201).json(item);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.put('/:id', authenticate, authorize('admin'), async (req, res) => {
    try {
        const item = await MenuItem.findByPk(req.params.id);

        if (!item) {
            return res.status(404).json({ message: 'Menu item not found' });
        }

        await item.update(req.body);
        await logAction(req.user.id, 'update', 'MenuItem', item.id, req.body);

        res.json(item);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
    try {
        const item = await MenuItem.findByPk(req.params.id);

        if (!item) {
            return res.status(404).json({ message: 'Menu item not found' });
        }

        await item.destroy();
        await logAction(req.user.id, 'delete', 'MenuItem', Number(req.params.id));

        res.json({ message: 'Menu item deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
