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
  pgm.createTable("preferences", {
    preference_id: { type: "serial", primaryKey: true },
    preference: { type: "VARCHAR(255)", notNull: true },
  });

  pgm.createTable("security_questions", {
    question_id: { type: "serial", primaryKey: true },
    question: { type: "VARCHAR(255)", notNull: true },
  });

  pgm.createTable("users", {
    user_id: { type: "serial", primaryKey: true },
    username: { type: "VARCHAR(255)", notNull: true, unique: true },
    email: { type: "VARCHAR(255)", notNull: true, unique: true },
    pass_hash: { type: "VARCHAR(255)", notNull: true },
    question: { type: "INT", notNull: true, references: "security_questions" },
    answer_hash: { type: "VARCHAR(255)", notNull: true },
    bio: { type: "TEXT" },
    phone: { type: "VARCHAR(10)", notNull: true, unique: true },
    avatar: {
      type: "VARCHAR(255)",
      notNull: true,
      default: "/assets/profile/default_user_profile.png",
    },
    create_at: {
      type: "TIMESTAMP",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
    active: { type: "BOOLEAN", notNull: true, default: true },
    user_role: { type: "VARCHAR(7)", notNull: true, default: "user" },
    dob: { type: "DATE", notNull: true },
    gender: {
      type: "CHAR(1)",
      notNull: true,
      check: "gender IN ('M', 'F', 'O')",
    },
    occupation: { type: "VARCHAR(255)", notNull: true },
    city: { type: "VARCHAR(255)", notNull: true },
    state: { type: "VARCHAR(255)", notNull: true },
    verified_email: { type: "BOOLEAN", notNull: true, default: false },
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

  pgm.createTable("refresh_token", {
    user_id: { type: "INT", notNull: true, references: "users" },
    token: { type: "TEXT", notNull: true },
    create_at: {
      type: "TIMESTAMP",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
  });

  pgm.createTable("listing", {
    listing_id: { type: "serial", primaryKey: true },
    listing_title: { type: "VARCHAR(255)", notNull: true },
    listing_desc: { type: "TEXT" },
    images: { type: "JSON" },
    uploaded_by: { type: "INT", notNull: true, references: "users" },
    uploaded_on: {
      type: "TIMESTAMP",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
    is_available: { type: "BOOLEAN", notNull: true, default: true },
    rented_on: { type: "TIMESTAMP", default: null },
    location: { type: "TEXT", notNull: true },
    city: { type: "VARCHAR(255)", notNull: true },
    state: { type: "VARCHAR(255)", notNull: true },
  });

  pgm.createTable("amenities", {
    amenity_id: { type: "serial", primaryKey: true },
    amenity_name: { type: "VARCHAR(255)", notNull: true },
  });

  pgm.createTable("listing_amenities", {
    id: { type: "SERIAL", primaryKey: true },
    listing_id: { type: "INT", notNull: true, references: "listing" },
    amenity_id: { type: "INT", notNull: true, references: "amenities" },
  });

  pgm.addConstraint(
    "listing_amenities",
    "unique_listing_amenity",
    "UNIQUE (listing_id, amenity_id)"
  );

  pgm.createTable("listing_metadata", {
    listing_id: { type: "INT", notNull: true, references: "listing" },
    listing_type: { type: "INT", notNull: true },
    prefered_tenants: { type: "INT", notNull: true },
    is_available: { type: "BOOLEAN", notNull: true, default: true },
    bedrooms: { type: "INT", notNull: true },
    bathrooms: { type: "INT", notNull: true },
    rent: { type: "DECIMAL(10, 2)", notNull: true },
    deposit: { type: "DECIMAL(10, 2)", notNull: true },
    furnishing: { type: "INT", notNull: true },
    floor: { type: "INT", notNull: true },
    total_floors: { type: "INT", notNull: true },
    areasqft: { type: "DECIMAL(10, 2)", notNull: true },
  });

  pgm.createTable("listing_stats", {
    listing_id: { type: "INT", notNull: true, references: "listing" },
    views: { type: "INT", notNull: true, default: 0 },
    likes: { type: "INT", notNull: true, default: 0 },
    shares: { type: "INT", notNull: true, default: 0 },
  });

  pgm.createTable("report", {
    report_id: { type: "serial", primaryKey: true },
    reported_by: { type: "INT", notNull: true, references: "users" },
    reported_for: { type: "TEXT", notNull: true },
    listing_id: { type: "INT", notNull: true, references: "listing" },
    reported_on: {
      type: "TIMESTAMP",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
  });

  pgm.createTable("messages", {
    message_id: { type: "serial", primaryKey: true },
    sender_id: { type: "INT", notNull: true, references: "users" },
    receiver_id: { type: "INT", notNull: true, references: "users" },
    message: { type: "TEXT", notNull: true },
    created_at: {
      type: "TIMESTAMP",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
  });

  pgm.createTable("user_ratings", {
    id: { type: "serial", primaryKey: true },
    user_id: { type: "INT", notNull: true, references: "users" },
    ratings: { type: "DECIMAL(10, 2)", notNull: true },
    comments: { type: "TEXT", default: null },
    rated_by: { type: "INT", notNull: true, references: "users" },
    created_at: {
      type: "TIMESTAMP",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
  });

  pgm.createTable("listing_ratings", {
    id: { type: "serial", primaryKey: true },
    listing_id: { type: "INT", notNull: true, references: "listing" },
    ratings: { type: "DECIMAL(10, 2)", notNull: true },
    comments: { type: "TEXT", default: null },
    rated_by: { type: "INT", notNull: true, references: "users" },
    created_at: {
      type: "TIMESTAMP",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
  });

  pgm.createTable("image_upload_log", {
    id: { type: "serial", primaryKey: true },
    user_id: { type: "INT", notNull: true, references: "users" },
    image_path: { type: "VARCHAR(255)", notNull: true },
    uploaded_on: {
      type: "TIMESTAMP",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
  });

  pgm.createTable("feedback", {
    id: { type: "serial", primaryKey: true },
    name: { type: "INT", notNull: true, references: "users" },
    email: { type: "VARCHAR(255)", notNull: true },
    feedback: { type: "TEXT", notNull: true },
    created_at: {
      type: "TIMESTAMP",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
  });

  pgm.sql(`INSERT INTO preferences(preference) VALUES 
  ('Vegetarian'),
  ('Non-vegetarian'),
  ('Drinker'),
  ('Smoker'),
  ('Sports-person'),
  ('Morning-person'),
  ('Night-owl');

  INSERT INTO security_questions(question) VALUES
  ('What is your mothers maiden name?'),
  ('What is the name of your first pet?'),
  ('What is the name of the city where you were born?'),
  ('What is the name of your favorite teacher?'),
  ('What is the name of your favorite movie?'),
  ('What is the name of your favorite book?'),
  ('What is the name of your favorite song?'),
  ('What is the name of your favorite food?'),
  ('What is your favorite color?'),
  ('What is the name of your favorite vacation spot?');

  INSERT INTO amenities (amenity_name)
  VALUES 
  ('Pool'),
  ('Gym'),
  ('Parking'),
  ('Lift'),
  ('24x7 Security'),
  ('Power Backup'),
  ('Wi-Fi'),
  ('CCTV Surveillance'),
  ('Children Play Area'),
  ('Garden'),
  ('Club House'),
  ('Fire Safety'),
  ('Water Supply'),
  ('Intercom Facility'),
  ('Sports Complex');

  INSERT INTO users (
    username,
    email,
    pass_hash,
    question,
    answer_hash,
    phone,
    user_role,
    gender,
    occupation,
    city,
    state,
    verified_email,
    dob
  )
  VALUES (
    'bosshu',
    'this@gmail.com',
    'thisisverystrongpassword',
    9,
    'blue',
    909090909,
    'user',
    'M',
    'Student',
    'Surat',
    'Gujarat',
    true,
    '2002/02/02'
  );

  INSERT INTO listing (listing_title, listing_desc, images, uploaded_by, is_available, location, city, state)
  VALUES
  ('Cozy Apartment', 'A cozy 2-bedroom apartment with a great city view.', '["image1.jpg", "image2.jpg"]', 1, true, 'Downtown', 'New York', 'NY'),
  ('Spacious Villa', 'Luxurious villa with a private pool and garden.', '["image1.jpg", "image2.jpg"]', 1, true, 'Palm Beach', 'Miami', 'FL'),
  ('Modern Studio', 'A modern studio apartment perfect for young professionals.', '["image1.jpg", "image2.jpg"]', 1, true, 'Midtown', 'Los Angeles', 'CA'),
  ('Beachside Cottage', 'Charming beachside cottage, steps from the ocean.', '["image1.jpg", "image2.jpg"]', 1, true, 'Oceanfront', 'San Diego', 'CA'),
  ('Suburban House', '4-bedroom house in a peaceful suburban neighborhood.', '["image1.jpg", "image2.jpg"]', 1, true, 'Greenwood', 'Seattle', 'WA');

  INSERT INTO listing (listing_title, listing_desc, images, uploaded_by, is_available, rented_on, location, city, state)
  VALUES
  ('Urban Condo', 'Modern condo in the heart of the city.', '["image1.jpg", "image2.jpg"]', 1, false, '2024-09-01 10:30:00', 'Central Park', 'Chicago', 'IL'),
  ('Mountain Cabin', 'Cabin with stunning mountain views and hiking trails.', '["image1.jpg", "image2.jpg"]', 1, false, '2024-08-15 14:00:00', 'Pine Hills', 'Denver', 'CO');

  INSERT INTO listing_metadata (listing_id, listing_type, prefered_tenants, is_available, bedrooms, bathrooms, rent, deposit, furnishing, floor, total_floors, areasqft)
  VALUES 
  ((SELECT listing_id FROM listing WHERE listing_title = 'Cozy Apartment'), 1, 1, true, 2, 1, 2500.00, 5000.00, 2, 4, 10, 1200.00);

  INSERT INTO listing_metadata (listing_id, listing_type, prefered_tenants, is_available, bedrooms, bathrooms, rent, deposit, furnishing, floor, total_floors, areasqft)
  VALUES 
  ((SELECT listing_id FROM listing WHERE listing_title = 'Spacious Villa'), 2, 3, true, 4, 3, 5000.00, 10000.00, 3, 1, 2, 3500.00);

  INSERT INTO listing_metadata (listing_id, listing_type, prefered_tenants, is_available, bedrooms, bathrooms, rent, deposit, furnishing, floor, total_floors, areasqft)
  VALUES 
  ((SELECT listing_id FROM listing WHERE listing_title = 'Modern Studio'), 1, 2, true, 1, 1, 1800.00, 3000.00, 1, 10, 20, 600.00);

  INSERT INTO listing_metadata (listing_id, listing_type, prefered_tenants, is_available, bedrooms, bathrooms, rent, deposit, furnishing, floor, total_floors, areasqft)
  VALUES 
  ((SELECT listing_id FROM listing WHERE listing_title = 'Beachside Cottage'), 2, 3, true, 3, 2, 3500.00, 7000.00, 2, 1, 1, 1800.00);

  INSERT INTO listing_metadata (listing_id, listing_type, prefered_tenants, is_available, bedrooms, bathrooms, rent, deposit, furnishing, floor, total_floors, areasqft)
  VALUES 
  ((SELECT listing_id FROM listing WHERE listing_title = 'Suburban House'), 3, 4, true, 4, 3, 4000.00, 8000.00, 2, 2, 2, 2500.00);

  INSERT INTO listing_metadata (listing_id, listing_type, prefered_tenants, is_available, bedrooms, bathrooms, rent, deposit, furnishing, floor, total_floors, areasqft)
  VALUES 
  ((SELECT listing_id FROM listing WHERE listing_title = 'Urban Condo'), 1, 2, false, 2, 2, 2800.00, 6000.00, 3, 6, 10, 1500.00);

  INSERT INTO listing_metadata (listing_id, listing_type, prefered_tenants, is_available, bedrooms, bathrooms, rent, deposit, furnishing, floor, total_floors, areasqft)
  VALUES 
  ((SELECT listing_id FROM listing WHERE listing_title = 'Mountain Cabin'), 2, 3, false, 3, 2, 3200.00, 6500.00, 2, 1, 1, 2200.00);
    



  -- Cozy Apartment (has amenities like Parking, Lift, 24x7 Security, Power Backup, Water Supply)
  INSERT INTO listing_amenities (listing_id, amenity_id)
  VALUES
  ((SELECT listing_id FROM listing WHERE listing_title = 'Cozy Apartment'), 3),  -- Parking
  ((SELECT listing_id FROM listing WHERE listing_title = 'Cozy Apartment'), 4),  -- Lift
  ((SELECT listing_id FROM listing WHERE listing_title = 'Cozy Apartment'), 5),  -- 24x7 Security
  ((SELECT listing_id FROM listing WHERE listing_title = 'Cozy Apartment'), 6),  -- Power Backup
  ((SELECT listing_id FROM listing WHERE listing_title = 'Cozy Apartment'), 13); -- Water Supply

  -- Spacious Villa (has amenities like Pool, Garden, Club House, CCTV Surveillance, Fire Safety)
  INSERT INTO listing_amenities (listing_id, amenity_id)
  VALUES
  ((SELECT listing_id FROM listing WHERE listing_title = 'Spacious Villa'), 1),  -- Pool
  ((SELECT listing_id FROM listing WHERE listing_title = 'Spacious Villa'), 10), -- Garden
  ((SELECT listing_id FROM listing WHERE listing_title = 'Spacious Villa'), 11), -- Club House
  ((SELECT listing_id FROM listing WHERE listing_title = 'Spacious Villa'), 8),  -- CCTV Surveillance
  ((SELECT listing_id FROM listing WHERE listing_title = 'Spacious Villa'), 12); -- Fire Safety

  -- Modern Studio (has amenities like Wi-Fi, Lift, Gym, Intercom Facility, Power Backup)
  INSERT INTO listing_amenities (listing_id, amenity_id)
  VALUES
  ((SELECT listing_id FROM listing WHERE listing_title = 'Modern Studio'), 7),  -- Wi-Fi
  ((SELECT listing_id FROM listing WHERE listing_title = 'Modern Studio'), 4),  -- Lift
  ((SELECT listing_id FROM listing WHERE listing_title = 'Modern Studio'), 2),  -- Gym
  ((SELECT listing_id FROM listing WHERE listing_title = 'Modern Studio'), 14), -- Intercom Facility
  ((SELECT listing_id FROM listing WHERE listing_title = 'Modern Studio'), 6);  -- Power Backup

  -- Beachside Cottage (has amenities like Garden, CCTV Surveillance, Water Supply, Fire Safety)
  INSERT INTO listing_amenities (listing_id, amenity_id)
  VALUES
  ((SELECT listing_id FROM listing WHERE listing_title = 'Beachside Cottage'), 10), -- Garden
  ((SELECT listing_id FROM listing WHERE listing_title = 'Beachside Cottage'), 8),  -- CCTV Surveillance
  ((SELECT listing_id FROM listing WHERE listing_title = 'Beachside Cottage'), 13), -- Water Supply
  ((SELECT listing_id FROM listing WHERE listing_title = 'Beachside Cottage'), 12); 

  -- Suburban House (has amenities like Parking, Children Play Area, Garden, Water Supply, Fire Safety)
  INSERT INTO listing_amenities (listing_id, amenity_id)
  VALUES
  ((SELECT listing_id FROM listing WHERE listing_title = 'Suburban House'), 3),  
  ((SELECT listing_id FROM listing WHERE listing_title = 'Suburban House'), 9),  
  ((SELECT listing_id FROM listing WHERE listing_title = 'Suburban House'), 10), 
  ((SELECT listing_id FROM listing WHERE listing_title = 'Suburban House'), 13), 
  ((SELECT listing_id FROM listing WHERE listing_title = 'Suburban House'), 12); 

  -- Urban Condo (already rented, has amenities like Gym, Pool, Wi-Fi, Lift, CCTV Surveillance)
  INSERT INTO listing_amenities (listing_id, amenity_id)
  VALUES
  ((SELECT listing_id FROM listing WHERE listing_title = 'Urban Condo'), 2),  
  ((SELECT listing_id FROM listing WHERE listing_title = 'Urban Condo'), 1),  
  ((SELECT listing_id FROM listing WHERE listing_title = 'Urban Condo'), 7),  
  ((SELECT listing_id FROM listing WHERE listing_title = 'Urban Condo'), 4),  
  ((SELECT listing_id FROM listing WHERE listing_title = 'Urban Condo'), 8);  


  INSERT INTO listing_amenities (listing_id, amenity_id)
  VALUES
  ((SELECT listing_id FROM listing WHERE listing_title = 'Mountain Cabin'), 15), 
  ((SELECT listing_id FROM listing WHERE listing_title = 'Mountain Cabin'), 10), 
  ((SELECT listing_id FROM listing WHERE listing_title = 'Mountain Cabin'), 13), 
  ((SELECT listing_id FROM listing WHERE listing_title = 'Mountain Cabin'), 6),  
  ((SELECT listing_id FROM listing WHERE listing_title = 'Mountain Cabin'), 12); 


  `);
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
  pgm.dropTable("feedback");
  pgm.dropTable("image_upload_log");
  pgm.dropTable("listing_ratings");
  pgm.dropTable("user_ratings");
  pgm.dropTable("messages");
  pgm.dropTable("report");
  pgm.dropTable("listing_stats");
  pgm.dropTable("listing_metadata");
  pgm.dropTable("listing_amenities");
  pgm.dropTable("amenities");
  pgm.dropTable("listing");
  pgm.dropTable("refresh_token");
  pgm.dropTable("preference_user_link");
  pgm.dropTable("preferences");
  pgm.dropTable("users");
  pgm.dropTable("security_questions");
};
