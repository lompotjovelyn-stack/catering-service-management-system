USE cateringdb;

ALTER TABLE bookings
    ADD COLUMN cancellationStatus ENUM('none', 'requested', 'approved', 'rejected') DEFAULT 'none',
    ADD COLUMN cancellationReason TEXT,
    ADD COLUMN cancellationReviewedBy INT,
    ADD COLUMN cancellationReviewNotes TEXT,
    ADD COLUMN totalAmount DECIMAL(10, 2) NOT NULL DEFAULT 0,
    ADD COLUMN billingStatus ENUM('unbilled', 'billed', 'settled') DEFAULT 'unbilled',
    ADD COLUMN billingNotes TEXT;

ALTER TABLE bookings
    ADD CONSTRAINT fk_bookings_cancel_reviewer FOREIGN KEY (cancellationReviewedBy) REFERENCES users(id);
