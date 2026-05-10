USE cateringdb;

ALTER TABLE bookings
    ADD COLUMN menuItemId INT AFTER packageName;

ALTER TABLE bookings
    ADD CONSTRAINT fk_bookings_menu_item FOREIGN KEY (menuItemId) REFERENCES menu_items(id);
