const express = require('express');
const { Vendor, InventoryItem } = require('../models');
const { authenticate, authorize } = require('../middleware/auth');
const logAction = require('../utils/audit');

const router = express.Router();

router.use(authenticate);

router.get('/', authorize('admin', 'staff'), async (req, res) => {
    try {
        const vendors = await Vendor.findAll({
            include: [{ model: InventoryItem, as: 'inventoryItems' }],
            order: [['companyName', 'ASC']]
        });
        res.json(vendors);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get('/me', authorize('vendor'), async (req, res) => {
    try {
        const profile = await Vendor.findOne({
            where: { userId: req.user.id },
            include: [{ model: InventoryItem, as: 'inventoryItems' }]
        });
        res.json(profile || null);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post('/', authorize('admin', 'vendor'), async (req, res) => {
    try {
        const payload = {
            ...req.body,
            userId: req.user.role === 'vendor' ? req.user.id : req.body.userId
        };
        const vendor = await Vendor.create(payload);
        await logAction(req.user.id, 'create', 'Vendor', vendor.id, payload);
        res.status(201).json(vendor);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.put('/:id', authorize('admin', 'vendor'), async (req, res) => {
    try {
        const vendor = await Vendor.findByPk(req.params.id);

        if (!vendor) {
            return res.status(404).json({ message: 'Vendor not found' });
        }

        if (req.user.role === 'vendor' && vendor.userId !== req.user.id) {
            return res.status(403).json({ message: 'You can only update your own vendor profile' });
        }

        await vendor.update(req.body);
        await logAction(req.user.id, 'update', 'Vendor', vendor.id, req.body);

        res.json(vendor);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.delete('/:id', authorize('admin'), async (req, res) => {
    try {
        const vendor = await Vendor.findByPk(req.params.id);

        if (!vendor) {
            return res.status(404).json({ message: 'Vendor not found' });
        }

        await vendor.destroy();
        await logAction(req.user.id, 'delete', 'Vendor', Number(req.params.id));

        res.json({ message: 'Vendor deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
