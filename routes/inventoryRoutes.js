const express = require('express');
const { Op } = require('sequelize');
const { InventoryItem, Vendor } = require('../models');
const { authenticate, authorize } = require('../middleware/auth');
const logAction = require('../utils/audit');

const router = express.Router();

router.use(authenticate);

router.get('/', authorize('admin', 'staff'), async (req, res) => {
    try {
        const items = await InventoryItem.findAll({
            include: [{ model: Vendor, as: 'vendor' }],
            order: [['name', 'ASC']]
        });
        res.json(items);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get('/low-stock', authorize('admin', 'staff'), async (req, res) => {
    try {
        const items = await InventoryItem.findAll({
            where: {
                quantity: { [Op.lte]: sequelizeCol('reorderLevel') }
            },
            include: [{ model: Vendor, as: 'vendor' }],
            order: [['quantity', 'ASC']]
        });
        res.json(items);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post('/', authorize('admin', 'staff'), async (req, res) => {
    try {
        const item = await InventoryItem.create(req.body);
        await logAction(req.user.id, 'create', 'InventoryItem', item.id, req.body);
        res.status(201).json(item);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.put('/:id', authorize('admin', 'staff'), async (req, res) => {
    try {
        const item = await InventoryItem.findByPk(req.params.id);

        if (!item) {
            return res.status(404).json({ message: 'Inventory item not found' });
        }

        await item.update(req.body);
        await logAction(req.user.id, 'update', 'InventoryItem', item.id, req.body);

        res.json(item);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.delete('/:id', authorize('admin'), async (req, res) => {
    try {
        const item = await InventoryItem.findByPk(req.params.id);

        if (!item) {
            return res.status(404).json({ message: 'Inventory item not found' });
        }

        await item.destroy();
        await logAction(req.user.id, 'delete', 'InventoryItem', Number(req.params.id));

        res.json({ message: 'Inventory item deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

function sequelizeCol(field) {
    return require('sequelize').col(field);
}

module.exports = router;
