/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
exports.shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.up = (pgm) => {
  pgm.createTable("roommate_listing_metadata", {
    listing_id: { type: "INT", primaryKey: true, references: "listing" },
    listing_type: { type: "INT", notNull: true },
    roommates_needed: { type: "INT", notNull: true },
    max_roommates: { type: "INT", notNull: true }, // Maximum number of roommates allowed
    listing_type: { type: "INT", notNull: true },
    bedrooms: { type: "INT", notNull: true },
    bathrooms: { type: "INT", notNull: true },
    rent: { type: "DECIMAL(10, 2)", notNull: true },
    deposit: { type: "DECIMAL(10, 2)", notNull: true },
    furnishing: { type: "INT", notNull: true },
    lease_duration: { type: "INT", notNull: true },
    floor: { type: "INT", notNull: true },
    total_floors: { type: "INT", notNull: true },
    areasqft: { type: "INT", notNull: true },
    is_available: { type: "BOOLEAN", notNull: true, default: true },
  });

  pgm.createTable("user_listing_connection", {
    connection_id: { type: "serial", primaryKey: true },
    listing_id: { type: "INT", notNull: true, references: "listing" },
    user_id: { type: "INT", notNull: true, references: "users" },
    is_approved: { type: "BOOLEAN", notNull: true, default: false },
    connection_type: {
      type: "VARCHAR(20)",
      notNull: true,
      check: "connection_type IN ('listing', 'roommate_request')",
    },
  });

  pgm.createTable("preference_user_link", {
    id: { type: "SERIAL", primaryKey: true },
    user_id: { type: "INT", notNull: true, references: "users" },
    preference_id: { type: "INT", notNull: true, references: "preferences" },
  });

  pgm.addConstraint(
    "preference_user_link",
    "unique_preference_user",
    "UNIQUE (user_id, preference_id)"
  );

  pgm.sql(`
    INSERT INTO listing (listing_title, listing_desc, images, uploaded_by, is_available, rented_on, area, city, state, accommodation_type)
  VALUES
  ('Roommate Wanted: Cozy Apartment', 'Looking for a roommate to share a cozy 2-bedroom apartment.', '["roommate1.jpg", "roommate2.jpg"]', 1, true, NULL, 'Downtown', 'New York', 'NY', 99),
  ('Shared Villa', 'Seeking roommate for a luxurious villa with private pool.', '["roommate1.jpg", "roommate2.jpg"]', 1, true, NULL, 'Palm Beach', 'Miami', 'FL', 99),
  ('Studio Share Available', 'Sharing a modern studio in the heart of the city.', '["roommate1.jpg", "roommate2.jpg"]', 1, true, NULL, 'Midtown', 'Los Angeles', 'CA', 99),
  ('Roommate Needed: Beachside Cottage', 'Looking for a roommate for a beachside cottage.', '["roommate1.jpg", "roommate2.jpg"]', 1, true, NULL, 'Oceanfront', 'San Diego', 'CA', 99),
  ('Room for Rent: Suburban House', 'One room available in a peaceful suburban home.', '["roommate1.jpg", "roommate2.jpg"]', 1, true, NULL, 'Greenwood', 'Seattle', 'WA', 99);

  INSERT INTO roommate_listing_metadata (
    listing_id, roommates_needed, max_roommates, listing_type, bedrooms, bathrooms, 
    rent, deposit, furnishing, lease_duration, floor, total_floors, areasqft
  ) VALUES
    (29, 1, 2, 1, 2, 1, 1200.00, 600.00, 1, 12, 3, 10, 850),
    (30, 2, 4, 2, 4, 3, 3500.00, 1500.00, 2, 6, 1, 2, 2500),
    (31, 1, 1, 3, 1, 1, 950.00, 500.00, 0, 12, 5, 20, 450),
    (32, 1, 3, 2, 2, 2, 1800.00, 1000.00, 1, 12, 1, 1, 1200),
    (33, 2, 3, 2, 3, 2, 2000.00, 1000.00, 1, 12, 1, 2, 1500);

  INSERT INTO user_listing_connection (
    listing_id, user_id, is_approved, connection_type
  ) VALUES
    (29, 1, true, 'listing'), -- User 1 connected to "Roommate Wanted: Cozy Apartment"
    (30, 1, false, 'roommate_request'), -- Pending roommate request by User 1 for "Studio Share Available"
    (31, 1, true, 'listing'), -- User 1 connected to "Room for Rent: Suburban House"
    (32, 2, true, 'listing'), -- User 2 connected to "Shared Villa"
    (33, 2, false, 'roommate_request'); -- Pending roommate request by User 2 for "Roommate Needed: Beachside Cottage"

    
    INSERT INTO listing_amenities (listing_id, amenity_id)
VALUES
    (29, 1),
    (29, 2),
    (30, 3),
    (31, 1),
    (32, 2),
    (32, 3);
    `);
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
  pgm.dropTable("user_listing_connection");
  pgm.dropTable("preference_user_link");
  pgm.dropTable("roommate_listing_metadata");
};
