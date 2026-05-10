const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const { sequelize, User, Vendor } = require('../models');

dotenv.config();

async function seedUser({ name, email, password, role }) {
    const existingUser = await User.findOne({ where: { email } });

    if (existingUser) {
        console.log(`${role} already exists: ${email}`);
        return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({
        name,
        email,
        password: hashedPassword,
        role
    });

    console.log(`${role} created: ${email}`);
}

async function seedAccounts() {
    const accounts = [
        {
            name: process.env.ADMIN_NAME || 'System Admin',
            email: process.env.ADMIN_EMAIL || 'admin@catering.local',
            password: process.env.ADMIN_PASSWORD || 'Admin12345!',
            role: 'admin'
        },
        {
            name: process.env.STAFF_NAME || 'Catering Staff',
            email: process.env.STAFF_EMAIL || 'staff@catering.local',
            password: process.env.STAFF_PASSWORD || 'Staff12345!',
            role: 'staff'
        },
        {
            name: process.env.CUSTOMER_NAME || 'Sample Customer',
            email: process.env.CUSTOMER_EMAIL || 'customer@catering.local',
            password: process.env.CUSTOMER_PASSWORD || 'Customer12345!',
            role: 'customer'
        },
        {
            name: process.env.VENDOR_NAME || 'Sample Vendor',
            email: process.env.VENDOR_EMAIL || 'vendor@catering.local',
            password: process.env.VENDOR_PASSWORD || 'Vendor12345!',
            role: 'vendor'
        }
    ];

    await sequelize.authenticate();
    await sequelize.sync({ alter: process.env.DB_SYNC_ALTER === 'true' });

    for (const account of accounts) {
        await seedUser(account);
    }

    const vendorUser = await User.findOne({
        where: { email: process.env.VENDOR_EMAIL || 'vendor@catering.local' }
    });

    if (vendorUser) {
        const [vendorProfile, created] = await Vendor.findOrCreate({
            where: { userId: vendorUser.id },
            defaults: {
                companyName: process.env.VENDOR_COMPANY || 'Fresh Harvest Suppliers',
                contactPerson: vendorUser.name,
                email: vendorUser.email,
                phone: process.env.VENDOR_PHONE || '0917-000-0000',
                address: process.env.VENDOR_ADDRESS || 'Local Market District',
                suppliedItems: process.env.VENDOR_ITEMS || 'Vegetables, fruits, meat, seafood, beverages'
            }
        });

        console.log(created
            ? `vendor profile created: ${vendorProfile.companyName}`
            : `vendor profile already exists: ${vendorProfile.companyName}`);
    }

    console.log('Default accounts are ready.');
    console.log('Set ADMIN_*, STAFF_*, CUSTOMER_*, and VENDOR_* variables in .env to customize these accounts.');
    await sequelize.close();
}

seedAccounts().catch(async (error) => {
    console.error(error.message);
    await sequelize.close();
    process.exit(1);
});
