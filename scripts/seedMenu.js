const dotenv = require('dotenv');
const { sequelize, MenuItem } = require('../models');

dotenv.config();

const menuItems = [
    {
        name: 'Classic Filipino Buffet',
        category: 'Buffet Package',
        description: 'Pork adobo, chicken afritada, pancit canton, steamed rice, and iced tea.',
        pricePerGuest: 450
    },
    {
        name: 'Premium Wedding Buffet',
        category: 'Buffet Package',
        description: 'Roast beef, chicken cordon bleu, seafood pasta, mixed vegetables, rice, dessert, and drinks.',
        pricePerGuest: 850
    },
    {
        name: 'Corporate Lunch Set',
        category: 'Packed Meal',
        description: 'Main dish, rice, side dish, dessert, and bottled water for office events.',
        pricePerGuest: 280
    },
    {
        name: 'Kids Party Package',
        category: 'Party Package',
        description: 'Spaghetti, fried chicken, hotdog skewers, mini burgers, cupcakes, and juice.',
        pricePerGuest: 320
    },
    {
        name: 'Vegetarian Buffet',
        category: 'Buffet Package',
        description: 'Vegetable curry, tofu sisig, mushroom pasta, garden salad, rice, fruit platter, and drinks.',
        pricePerGuest: 520
    },
    {
        name: 'Seafood Feast',
        category: 'Specialty Package',
        description: 'Garlic butter shrimp, grilled fish, seafood paella, calamari, vegetables, and drinks.',
        pricePerGuest: 950
    },
    {
        name: 'Dessert Table',
        category: 'Add-on',
        description: 'Assorted pastries, cupcakes, leche flan, fruit cups, and chocolate fountain setup.',
        pricePerGuest: 220
    },
    {
        name: 'Coffee and Beverage Station',
        category: 'Add-on',
        description: 'Brewed coffee, iced tea, lemonade, bottled water, cups, stirrers, and condiments.',
        pricePerGuest: 120
    },
    {
        name: 'Breakfast Meeting Package',
        category: 'Packed Meal',
        description: 'Sandwiches, pastries, fruit cup, brewed coffee, and bottled water.',
        pricePerGuest: 240
    },
    {
        name: 'Grazing Table',
        category: 'Add-on',
        description: 'Cheese, cold cuts, crackers, fruits, nuts, dips, and decorative table setup.',
        pricePerGuest: 380
    }
];

async function seedMenu() {
    await sequelize.authenticate();
    await sequelize.sync({ alter: process.env.DB_SYNC_ALTER === 'true' });

    let created = 0;
    let skipped = 0;

    for (const item of menuItems) {
        const [record, wasCreated] = await MenuItem.findOrCreate({
            where: { name: item.name },
            defaults: item
        });

        if (wasCreated) {
            created += 1;
            console.log(`Created menu item: ${record.name}`);
        } else {
            skipped += 1;
            console.log(`Skipped existing menu item: ${record.name}`);
        }
    }

    console.log(`Menu seed complete. Created: ${created}. Skipped: ${skipped}.`);
    await sequelize.close();
}

seedMenu().catch(async (error) => {
    console.error(error.message);
    await sequelize.close();
    process.exit(1);
});
