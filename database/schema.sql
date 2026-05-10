CREATE DATABASE IF NOT EXISTS cateringdb;
USE cateringdb;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('customer', 'admin', 'staff', 'vendor') DEFAULT 'customer',
    phone VARCHAR(255),
    isActive BOOLEAN DEFAULT TRUE,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customerId INT NOT NULL,
    eventDate DATE NOT NULL,
    eventTime TIME,
    venue VARCHAR(255) NOT NULL,
    guests INT NOT NULL,
    packageName VARCHAR(255),
<<<<<<< HEAD
    menuItemId INT,
=======
>>>>>>> 60187203880473657c5c68fd6f3b891b6218e809
    specialRequests TEXT,
    status ENUM('pending', 'approved', 'rejected', 'cancelled', 'completed') DEFAULT 'pending',
    cancellationStatus ENUM('none', 'requested', 'approved', 'rejected') DEFAULT 'none',
    cancellationReason TEXT,
    cancellationReviewedBy INT,
    cancellationReviewNotes TEXT,
    totalAmount DECIMAL(10, 2) NOT NULL DEFAULT 0,
    billingStatus ENUM('unbilled', 'billed', 'settled') DEFAULT 'unbilled',
    billingNotes TEXT,
    adminNotes TEXT,
    assignedStaffId INT,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_bookings_customer FOREIGN KEY (customerId) REFERENCES users(id),
    CONSTRAINT fk_bookings_staff FOREIGN KEY (assignedStaffId) REFERENCES users(id),
<<<<<<< HEAD
    CONSTRAINT fk_bookings_menu_item FOREIGN KEY (menuItemId) REFERENCES menu_items(id),
=======
>>>>>>> 60187203880473657c5c68fd6f3b891b6218e809
    CONSTRAINT fk_bookings_cancel_reviewer FOREIGN KEY (cancellationReviewedBy) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS vendors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT,
    companyName VARCHAR(255) NOT NULL,
    contactPerson VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(255),
    address TEXT,
    suppliedItems TEXT,
    status ENUM('active', 'inactive') DEFAULT 'active',
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_vendors_user FOREIGN KEY (userId) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS inventory_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(255) NOT NULL,
    quantity DECIMAL(10, 2) NOT NULL DEFAULT 0,
    unit VARCHAR(255) NOT NULL DEFAULT 'pcs',
    reorderLevel DECIMAL(10, 2) NOT NULL DEFAULT 0,
    vendorId INT,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_inventory_vendor FOREIGN KEY (vendorId) REFERENCES vendors(id)
);

CREATE TABLE IF NOT EXISTS menu_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(255) NOT NULL,
    description TEXT,
    pricePerGuest DECIMAL(10, 2) NOT NULL DEFAULT 0,
    isAvailable BOOLEAN DEFAULT TRUE,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT,
    action VARCHAR(255) NOT NULL,
    entity VARCHAR(255) NOT NULL,
    entityId INT,
    details JSON,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_audit_user FOREIGN KEY (userId) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS system_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    `key` VARCHAR(255) NOT NULL UNIQUE,
    value TEXT NOT NULL,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
