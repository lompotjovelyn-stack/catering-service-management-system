const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    customerName: String,
    eventDate: Date,
    venue: String,
    guests: Number,
    status: {
        type: String,
        default: 'Pending'
    }
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);