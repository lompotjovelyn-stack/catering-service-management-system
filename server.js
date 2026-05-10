const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

const { sequelize } = require('./models');
const authRoutes = require('./routes/authRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const menuRoutes = require('./routes/menuRoutes');
const vendorRoutes = require('./routes/vendorRoutes');
const adminRoutes = require('./routes/adminRoutes');
const staffRoutes = require('./routes/staffRoutes');
const customerRoutes = require('./routes/customerRoutes');
const reportRoutes = require('./routes/reportRoutes');
const settingRoutes = require('./routes/settingRoutes');

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());
app.use(express.static('public'));

app.get('/api/health', (req, res) => {
    res.json({
        message: 'Catering Service Management System API Running',
        modules: [
            'Authentication',
            'Customer',
            'Admin',
            'Catering Staff',
            'Vendor',
            'Booking Management',
            'Inventory Management',
            'Reports'
        ]
    });
});

app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/customer', customerRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/settings', settingRoutes);
app.use('/api/setting', settingRoutes);
app.use('/api/schedule', staffRoutes);

app.get(/^\/(?!api).*/, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

app.use((err, req, res, next) => {
    console.error(err);
    res.status(err.status || 500).json({
        message: err.message || 'Internal server error'
    });
});

const PORT = process.env.PORT || 5000;

async function startServer() {
    try {
        await sequelize.authenticate();
        await sequelize.sync({ alter: process.env.DB_SYNC_ALTER === 'true' });
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Unable to start server.');

        if (error.name === 'SequelizeConnectionRefusedError') {
            console.error(`MySQL refused the connection at ${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 3306}.`);
            console.error('Start MySQL in XAMPP/WAMP/MySQL Workbench, then run npm start again.');
        } else if (error.name === 'SequelizeConnectionError') {
            console.error('Check DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, and DB_NAME in .env.');
            console.error(error.message);
        } else if (error.name === 'SequelizeAccessDeniedError') {
            console.error('MySQL rejected the username or password in .env.');
        } else if (error.name === 'SequelizeUnknownDatabaseError') {
            console.error(`Database "${process.env.DB_NAME}" does not exist. Create it in phpMyAdmin first.`);
        } else {
            console.error(error.stack || error.message);
        }

        process.exit(1);
    }
}

startServer();
