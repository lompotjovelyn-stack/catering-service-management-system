const express = require('express');
const { Op } = require('sequelize');
<<<<<<< HEAD
const { Booking, User, MenuItem } = require('../models');
=======
const { Booking, User } = require('../models');
>>>>>>> 60187203880473657c5c68fd6f3b891b6218e809
const { authenticate, authorize } = require('../middleware/auth');
const logAction = require('../utils/audit');

const router = express.Router();

router.get('/availability', async (req, res) => {
    try {
        const { date } = req.query;

        if (!date) {
            return res.status(400).json({ message: 'Date query parameter is required' });
        }

        const maxBookingsPerDay = Number(process.env.MAX_BOOKINGS_PER_DAY || 3);
        const bookingCount = await Booking.count({
            where: {
                eventDate: date,
                status: { [Op.notIn]: ['cancelled', 'rejected'] }
            }
        });

        res.json({
            date,
            available: bookingCount < maxBookingsPerDay,
            bookingsTaken: bookingCount,
            capacity: maxBookingsPerDay
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get('/', authenticate, async (req, res) => {
    try {
        const where = {};

        if (req.user.role === 'customer') {
            where.customerId = req.user.id;
        }

        const bookings = await Booking.findAll({
            where,
            include: [
                { model: User, as: 'customer', attributes: ['id', 'name', 'email', 'phone'] },
<<<<<<< HEAD
                { model: User, as: 'assignedStaff', attributes: ['id', 'name', 'email', 'phone'] },
                { model: MenuItem, as: 'menuItem' }
=======
                { model: User, as: 'assignedStaff', attributes: ['id', 'name', 'email', 'phone'] }
>>>>>>> 60187203880473657c5c68fd6f3b891b6218e809
            ],
            order: [['eventDate', 'ASC']]
        });

        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post('/', authenticate, authorize('customer', 'staff', 'admin'), async (req, res) => {
    try {
        if (req.user.role !== 'customer' && !req.body.customerId) {
            return res.status(400).json({ message: 'customerId is required when staff or admin creates a booking' });
        }

<<<<<<< HEAD
        const selectedMenu = req.body.menuItemId
            ? await MenuItem.findByPk(req.body.menuItemId)
            : null;

        if (req.body.menuItemId && !selectedMenu) {
            return res.status(400).json({ message: 'Selected menu item was not found' });
        }

        const guests = Number(req.body.guests || 0);
        const estimatedTotal = selectedMenu && guests > 0
            ? Number(selectedMenu.pricePerGuest) * guests
            : Number(req.body.totalAmount || 0);

        const payload = {
            ...req.body,
            packageName: selectedMenu ? selectedMenu.name : req.body.packageName,
            totalAmount: estimatedTotal,
=======
        const payload = {
            ...req.body,
>>>>>>> 60187203880473657c5c68fd6f3b891b6218e809
            customerId: req.user.role === 'customer' ? req.user.id : req.body.customerId
        };

        const booking = await Booking.create(payload);
        await logAction(req.user.id, 'create', 'Booking', booking.id, payload);

        res.status(201).json(booking);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get('/:id', authenticate, async (req, res) => {
    try {
        const booking = await Booking.findByPk(req.params.id, {
            include: [
                { model: User, as: 'customer', attributes: ['id', 'name', 'email', 'phone'] },
<<<<<<< HEAD
                { model: User, as: 'assignedStaff', attributes: ['id', 'name', 'email', 'phone'] },
                { model: MenuItem, as: 'menuItem' }
=======
                { model: User, as: 'assignedStaff', attributes: ['id', 'name', 'email', 'phone'] }
>>>>>>> 60187203880473657c5c68fd6f3b891b6218e809
            ]
        });

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        if (req.user.role === 'customer' && booking.customerId !== req.user.id) {
            return res.status(403).json({ message: 'You can only view your own bookings' });
        }

        res.json(booking);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.put('/:id', authenticate, async (req, res) => {
    try {
        const booking = await Booking.findByPk(req.params.id);

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        const isAdmin = req.user.role === 'admin';
        const isStaff = req.user.role === 'staff';

        if (!isAdmin && !isStaff) {
            return res.status(403).json({ message: 'You cannot update this booking' });
        }

<<<<<<< HEAD
        const orderFields = ['eventDate', 'eventTime', 'venue', 'guests', 'packageName', 'menuItemId', 'specialRequests'];
=======
        const orderFields = ['eventDate', 'eventTime', 'venue', 'guests', 'packageName', 'specialRequests'];
>>>>>>> 60187203880473657c5c68fd6f3b891b6218e809
        const staffFields = [...orderFields, 'status', 'adminNotes', 'assignedStaffId', 'totalAmount', 'billingStatus', 'billingNotes'];
        const adminFields = [...staffFields, 'customerId'];
        const allowedFields = isAdmin ? adminFields : staffFields;

        allowedFields.forEach((field) => {
            if (Object.prototype.hasOwnProperty.call(req.body, field)) {
                booking[field] = req.body[field];
            }
        });

        await booking.save();
        await logAction(req.user.id, 'update', 'Booking', booking.id, req.body);

        res.json(booking);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.patch('/:id/status', authenticate, authorize('staff', 'admin'), async (req, res) => {
    try {
        const { status, adminNotes, assignedStaffId } = req.body;
        const allowedStatuses = ['pending', 'approved', 'rejected', 'cancelled', 'completed'];

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({ message: 'Invalid booking status' });
        }

        const booking = await Booking.findByPk(req.params.id);
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        booking.status = status;
        if (adminNotes !== undefined) booking.adminNotes = adminNotes;
        if (assignedStaffId !== undefined) booking.assignedStaffId = assignedStaffId;

        await booking.save();
        await logAction(req.user.id, 'status_change', 'Booking', booking.id, { status, assignedStaffId });

        res.json(booking);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.delete('/:id', authenticate, async (req, res) => {
    try {
        const booking = await Booking.findByPk(req.params.id);

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        const canCancelImmediately = req.user.role === 'admin' || req.user.role === 'staff';
        const canRequestCancel = req.user.role === 'customer' && booking.customerId === req.user.id;

        if (!canCancelImmediately && !canRequestCancel) {
            return res.status(403).json({ message: 'You cannot cancel this booking' });
        }

        if (canRequestCancel) {
            const { reason } = req.body || {};

            if (!reason) {
                return res.status(400).json({ message: 'Cancellation reason is required' });
            }

            booking.cancellationStatus = 'requested';
            booking.cancellationReason = reason;
            await booking.save();
            await logAction(req.user.id, 'request_cancel', 'Booking', booking.id, { reason });

            return res.json({ message: 'Cancellation request submitted for approval', booking });
        }

        booking.status = 'cancelled';
        booking.cancellationStatus = 'approved';
        booking.cancellationReviewedBy = req.user.id;
        await booking.save();
        await logAction(req.user.id, 'cancel', 'Booking', booking.id);

        res.json({ message: 'Booking cancelled', booking });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post('/:id/cancel-request', authenticate, authorize('customer'), async (req, res) => {
    try {
        const { reason } = req.body;
        const booking = await Booking.findByPk(req.params.id);

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        if (booking.customerId !== req.user.id) {
            return res.status(403).json({ message: 'You can only request cancellation for your own booking' });
        }

        if (!reason) {
            return res.status(400).json({ message: 'Cancellation reason is required' });
        }

        if (booking.status === 'cancelled') {
            return res.status(400).json({ message: 'Booking is already cancelled' });
        }

        booking.cancellationStatus = 'requested';
        booking.cancellationReason = reason;
        booking.cancellationReviewNotes = null;
        booking.cancellationReviewedBy = null;
        await booking.save();
        await logAction(req.user.id, 'request_cancel', 'Booking', booking.id, { reason });

        res.json({ message: 'Cancellation request submitted for staff or admin approval', booking });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.patch('/:id/cancel-request', authenticate, authorize('staff', 'admin'), async (req, res) => {
    try {
        const { decision, notes } = req.body;
        const booking = await Booking.findByPk(req.params.id);

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        if (!['approved', 'rejected'].includes(decision)) {
            return res.status(400).json({ message: 'Decision must be approved or rejected' });
        }

        if (booking.cancellationStatus !== 'requested') {
            return res.status(400).json({ message: 'No pending cancellation request for this booking' });
        }

        booking.cancellationStatus = decision;
        booking.cancellationReviewedBy = req.user.id;
        booking.cancellationReviewNotes = notes || null;

        if (decision === 'approved') {
            booking.status = 'cancelled';
        }

        await booking.save();
        await logAction(req.user.id, `${decision}_cancel_request`, 'Booking', booking.id, { notes });

        res.json({ message: `Cancellation request ${decision}`, booking });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.patch('/:id/billing', authenticate, authorize('staff', 'admin'), async (req, res) => {
    try {
        const { totalAmount, billingStatus, billingNotes } = req.body;
        const allowedBillingStatuses = ['unbilled', 'billed', 'settled'];

        if (billingStatus && !allowedBillingStatuses.includes(billingStatus)) {
            return res.status(400).json({ message: 'Invalid billing status' });
        }

        const booking = await Booking.findByPk(req.params.id);

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        if (totalAmount !== undefined) booking.totalAmount = totalAmount;
        if (billingStatus !== undefined) booking.billingStatus = billingStatus;
        if (billingNotes !== undefined) booking.billingNotes = billingNotes;

        await booking.save();
        await logAction(req.user.id, 'update_billing', 'Booking', booking.id, { totalAmount, billingStatus });

        res.json({ message: 'Billing updated', booking });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
