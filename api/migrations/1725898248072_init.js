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
    created_at: {
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
    email_verified: { type: "BOOLEAN", notNull: true, default: false },
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
    created_at: {
      type: "TIMESTAMP",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
  });

  pgm.createTable("listing", {
    listing_id: { type: "serial", primaryKey: true },
    accommodation_type: { type: "INT", notNull: false },
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

  pgm.createTable("preference_listing", {
    id: { type: "SERIAL", primaryKey: true },
    listing_id: { type: "INT", notNull: true, references: "listing" },
    preference_id: { type: "INT", notNull: true, references: "preferences" },
  });

  pgm.addConstraint(
    "preference_listing",
    "unique_preference_listing",
    "UNIQUE (listing_id, preference_id)"
  );

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

  pgm.createFunction(
    "create_listing_stats",
    [],
    { returns: "trigger", language: "plpgsql", replace: true },
    `
    BEGIN
      INSERT INTO listing_stats (listing_id)
      VALUES (NEW.listing_id);
      RETURN NEW;
    END;
    `
  );

  pgm.createTrigger("listing", "listing_stats_insert_trigger", {
    when: "after",
    operation: "INSERT",
    level: "ROW",
    function: "create_listing_stats",
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
  pgm.addConstraint(
    "report",
    "unique_report",
    "UNIQUE (reported_by, listing_id)"
  );

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

  pgm.addConstraint(
    "user_ratings",
    "unique_user_ratings",
    "UNIQUE (user_id, rated_by)"
  );

  pgm.createTable("listing_review", {
    id: { type: "serial", primaryKey: true },
    listing_id: { type: "INT", notNull: true, references: "listing" },
    // ratings: { type: "DECIMAL(10, 2)", notNull: true },
    review: { type: "TEXT", default: null },
    user_id: { type: "INT", notNull: true, references: "users" },
    created_at: {
      type: "TIMESTAMP",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
  });

  pgm.addConstraint(
    "listing_review",
    "unique_listing_reviews",
    "UNIQUE (user_id, listing_id)"
  );

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
    user_id: { type: "INT", notNull: true, references: "users" },
    email: { type: "VARCHAR(255)", notNull: true },
    message: { type: "TEXT", notNull: true },
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
      email_verified,
      dob
  )
  VALUES (
      'bosshu',
      'this@gmail.com',
      '$2b$10$KiX.QKmhNYy4dqI63C8equyKV5D8DUZsfK6bvrFyJZ1It6RLdaJJW',
      9,
      '$2b$10$jHy14Y/Q2eWwU5j3YnCcpufIU1p6wfNqIMh3Dyvqo1tctAPV8.7oq',
      '909090909',
      'user',
      'M',
      'student',
      'surat',
      'gujarat',
      true,
      '2002-02-02'
  );
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
      email_verified,
      dob
  )
  VALUES (
      'adityan',
      'adi@gmail.com',
      '$2b$10$KiX.QKmhNYy4dqI63C8equyKV5D8DUZsfK6bvrFyJZ1It6RLdaJJW',
      9,
      '$2b$10$jHy14Y/Q2eWwU5j3YnCcpufIU1p6wfNqIMh3Dyvqo1tctAPV8.7oq',
      '909059450',
      'user',
      'M',
      'student',
      'surat',
      'gujarat',
      true,
      '2002-02-02'
  );

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
      email_verified,
      dob
  )
  VALUES (
      'vedant',
      'vedant@gmail.com',
      '$2b$10$KiX.QKmhNYy4dqI63C8equyKV5D8DUZsfK6bvrFyJZ1It6RLdaJJW',
      9,
      '$2b$10$jHy14Y/Q2eWwU5j3YnCcpufIU1p6wfNqIMh3Dyvqo1tctAPV8.7oq',
      '909090919',
      'user',
      'M',
      'student',
      'surat',
      'gujarat',
      true,
      '2002-02-02'
  );

  INSERT INTO listing (listing_title, listing_desc, images, uploaded_by, is_available, rented_on, location, city, state)
  VALUES
  ('Cozy Apartment', 'A cozy 2-bedroom apartment with a great city view.', '["image1.jpg", "image2.jpg"]', 1, true, NULL, 'Downtown', 'New York', 'NY'),
  ('Spacious Villa', 'Luxurious villa with a private pool and garden.', '["image1.jpg", "image2.jpg"]', 1, true, NULL, 'Palm Beach', 'Miami', 'FL'),
  ('Modern Studio', 'A modern studio apartment perfect for young professionals.', '["image1.jpg", "image2.jpg"]', 1, true, NULL, 'Midtown', 'Los Angeles', 'CA'),
  ('Beachside Cottage', 'Charming beachside cottage, steps from the ocean.', '["image1.jpg", "image2.jpg"]', 1, true, NULL, 'Oceanfront', 'San Diego', 'CA'),
  ('Suburban House', '4-bedroom house in a peaceful suburban neighborhood.', '["image1.jpg", "image2.jpg"]', 1, true, NULL, 'Greenwood', 'Seattle', 'WA'),
  ('Urban Condo', 'Modern condo in the heart of the city.', '["image1.jpg", "image2.jpg"]', 1, false, '2024-09-01 10:30:00', 'Central Park', 'Chicago', 'IL'),
  ('Mountain Cabin', 'Cabin with stunning mountain views and hiking trails.', '["image1.jpg", "image2.jpg"]', 1, false, '2024-08-15 14:00:00', 'Pine Hills', 'Denver', 'CO'),
  ('Stylish Apartment', 'A stylish apartment in the city center.', '["image1.jpg", "image2.jpg"]', 1, true, NULL, 'City Center', 'New York', 'NY'),
  ('Luxury Villa', 'A luxurious villa with stunning views.', '["image1.jpg", "image2.jpg"]', 1, true, NULL, 'Uptown', 'Los Angeles', 'CA'),
  ('Modern Condo', 'A modern condo with all amenities.', '["image1.jpg", "image2.jpg"]', 1, true, NULL, 'Downtown', 'Miami', 'FL'),
  ('Charming Studio', 'A charming studio apartment.', '["image1.jpg", "image2.jpg"]', 1, true, NULL, 'Soho', 'New York', 'NY'),
  ('Beach House', 'A cozy beach house just steps from the ocean.', '["image1.jpg", "image2.jpg"]', 1, true, NULL, 'Ocean Drive', 'Miami', 'FL'),
  ('Suburban Home', 'A family-friendly home in the suburbs.', '["image1.jpg", "image2.jpg"]', 1, true, NULL, 'Greenwood', 'Seattle', 'WA'),
  ('Penthouse Suite', 'Luxurious penthouse with panoramic views.', '["image1.jpg", "image2.jpg"]', 1, true, NULL, 'Beverly Hills', 'Los Angeles', 'CA'),
  ('Cozy Cottage', 'A charming cottage in the woods.', '["image1.jpg", "image2.jpg"]', 1, true, NULL, 'Mountain View', 'Denver', 'CO'),
  ('Urban Loft', 'An urban loft with an industrial vibe.', '["image1.jpg", "image2.jpg"]', 1, true, NULL, 'Central Park', 'Chicago', 'IL'),
  ('Riverside Bungalow', 'A beautiful bungalow by the river.', '["image1.jpg", "image2.jpg"]', 1, true, NULL, 'Riverside', 'Austin', 'TX'),
  ('Country Farmhouse', 'A rustic farmhouse in the countryside.', '["image1.jpg", "image2.jpg"]', 1, true, NULL, 'Farmington', 'Nashville', 'TN'),
  ('Downtown Studio', 'A small studio in the heart of downtown.', '["image1.jpg", "image2.jpg"]', 1, true, NULL, 'Downtown', 'San Francisco', 'CA'),
  ('Loft Apartment', 'Spacious loft apartment with modern design.', '["image1.jpg", "image2.jpg"]', 1, true, NULL, 'District 9', 'Miami', 'FL'),
  ('Historic Mansion', 'A beautifully restored historic mansion.', '["image1.jpg", "image2.jpg"]', 1, true, NULL, 'Historic District', 'New Orleans', 'LA'),
  ('Garden Apartment', 'An apartment with a lovely garden.', '["image1.jpg", "image2.jpg"]', 1, true, NULL, 'Green Valley', 'Phoenix', 'AZ'),
  ('Skylight Apartment', 'An apartment with skylights and natural light.', '["image1.jpg", "image2.jpg"]', 1, true, NULL, 'Highland Park', 'Dallas', 'TX'),
  ('Contemporary House', 'A contemporary house with unique design.', '["image1.jpg", "image2.jpg"]', 1, true, NULL, 'North Shore', 'Chicago', 'IL'),
  ('Artisan Loft', 'A creative loft space for artists.', '["image1.jpg", "image2.jpg"]', 1, true, NULL, 'Arts District', 'Los Angeles', 'CA'),
  ('Luxury Condo', 'Luxury condo with modern amenities.', '["image1.jpg", "image2.jpg"]', 1, true, NULL, 'Sunny Isles', 'Miami', 'FL'),
  ('Seaside Villa', 'A beautiful villa by the sea.', '["image1.jpg", "image2.jpg"]', 1, true, NULL, 'Oceanfront', 'Santa Monica', 'CA'),
  ('Furnished Apartment', 'A fully furnished apartment ready to move in.', '["image1.jpg", "image2.jpg"]', 1, true, NULL, 'West End', 'Austin', 'TX');


  INSERT INTO listing_metadata (listing_id, listing_type, prefered_tenants, is_available, bedrooms, bathrooms, rent, deposit, furnishing, floor, total_floors, areasqft)
  VALUES 
  (1, 1, 1, true, 2, 1, 2500.00, 5000.00, 2, 4, 10, 1200.00),
  (2, 2, 3, true, 4, 3, 5000.00, 10000.00, 3, 1, 2, 3500.00),
  (3, 1, 2, true, 1, 1, 1800.00, 3000.00, 1, 10, 20, 600.00),
  (4, 2, 3, true, 3, 2, 3500.00, 7000.00, 2, 1, 1, 1800.00),
  (5, 3, 4, true, 4, 3, 4000.00, 8000.00, 2, 2, 2, 2500.00),
  (6, 1, 2, false, 2, 2, 2800.00, 6000.00, 3, 6, 10, 1500.00),
  (7, 2, 3, false, 3, 2, 3200.00, 6500.00, 2, 1, 1, 2200.00),
  (8, 1, 2, true, 2, 1, 2500.00, 500.00, 1, 2, 5, 850.00),
  (9, 1, 2, true, 4, 3, 5000.00, 1000.00, 1, 1, 2, 2000.00),
  (10, 1, 2, true, 2, 2, 3000.00, 600.00, 1, 5, 5, 1200.00),
  (11, 1, 1, true, 1, 1, 1800.00, 300.00, 1, 3, 3, 600.00),
  (12, 1, 1, true, 3, 2, 3200.00, 700.00, 1, 2, 4, 1500.00),
  (13, 1, 3, true, 3, 2, 4500.00, 800.00, 2, 2, 4, 1800.00),
  (14, 1, 1, true, 1, 1, 2200.00, 400.00, 1, 1, 3, 500.00),
  (15, 1, 2, true, 3, 2, 2900.00, 600.00, 2, 4, 4, 1300.00),
  (16, 1, 2, true, 2, 1, 2500.00, 500.00, 1, 1, 3, 900.00),
  (17, 1, 3, true, 4, 3, 6000.00, 1200.00, 1, 1, 1, 2200.00),
  (18, 1, 2, true, 1, 1, 2000.00, 350.00, 1, 1, 2, 550.00),
  (19, 1, 1, true, 1, 1, 1200.00, 200.00, 1, 2, 2, 400.00),
  (20, 1, 2, true, 2, 1, 2500.00, 500.00, 1, 3, 5, 1000.00),
  (21, 1, 1, true, 1, 1, 1600.00, 300.00, 1, 1, 3, 650.00),
  (22, 1, 2, true, 3, 2, 3500.00, 700.00, 2, 2, 4, 1400.00),
  (23, 1, 3, true, 4, 3, 5500.00, 1100.00, 1, 2, 3, 2100.00),
  (24, 1, 1, true, 2, 1, 2300.00, 450.00, 1, 2, 2, 800.00),
  (25, 1, 1, true, 3, 2, 3000.00, 600.00, 1, 1, 4, 1200.00),
  (26, 1, 2, true, 2, 1, 2700.00, 500.00, 1, 1, 5, 900.00);


  INSERT INTO listing_amenities (listing_id, amenity_id)
  VALUES
  (1, 3), (1, 4), (1, 5), (1, 6), (1, 13),
  (2, 1), (2, 10), (2, 11), (2, 8), (2, 12),
  (3, 7), (3, 4), (3, 2), (3, 14), (3, 6),
  (4, 10), (4, 8), (4, 13), (4, 12),
  (5, 3), (5, 9), (5, 10), (5, 13), (5, 12),
  (6, 2), (6, 1), (6, 7), (6, 4), (6, 8),
  (7, 15), (7, 10), (7, 13), (7, 6), (7, 12),
  (8, 1), (8, 2), (8, 3),
  (9, 1), (9, 4),
  (10, 2), (10, 3), (10, 5),
  (11, 1), (11, 3),
  (12, 2), (12, 4), (12, 6),
  (13, 1), (13, 5),
  (14, 1),
  (15, 2), (15, 3),
  (16, 1), (16, 4),
  (17, 2), (17, 6),
  (18, 1),
  (19, 3),
  (20, 2),
  (21, 1),
  (22, 4),
  (23, 1), (23, 2),
  (24, 1),
  (25, 3),
  (26, 1), (26, 2);

  INSERT INTO preference_listing (listing_id, preference_id)
VALUES
  (1, 1), (1, 6),
  (2, 3), (2, 4),
  (3, 2), (3, 7),
  (4, 5), (4, 6),
  (5, 1), (5, 3), (5, 4),
  (6, 2), (6, 7),
  (7, 5), (7, 6),
  (8, 1), (8, 6),
  (9, 3), (9, 5),
  (10, 2), (10, 4),
  (11, 1), (11, 7),
  (12, 5), (12, 6),
  (13, 1), (13, 3),
  (14, 4), (14, 7),
  (15, 5), (15, 6),
  (16, 2), (16, 7),
  (17, 5), (17, 6),
  (18, 1), (18, 5),
  (19, 2), (19, 7),
  (20, 3), (20, 4),
  (21, 6), (21, 7),
  (22, 1), (22, 5),
  (23, 2), (23, 7),
  (24, 5), (24, 6),
  (25, 1), (25, 4),
  (26, 2), (26, 3);



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
  pgm.dropTable("listing_review");
  pgm.dropTable("user_ratings");
  pgm.dropTable("messages");
  pgm.dropTable("report");
  pgm.dropTrigger("listing", "listing_stats_insert_trigger");
  pgm.dropFunction("create_listing_stats");
  pgm.dropTable("listing_stats");
  pgm.dropTable("listing_metadata");
  pgm.dropTable("listing_amenities");
  pgm.dropTable("amenities");
  pgm.dropTable("preference_listing");
  pgm.dropTable("listing");
  pgm.dropTable("refresh_token");
  pgm.dropTable("preference_user_link");
  pgm.dropTable("users");
  pgm.dropTable("security_questions");
  pgm.dropTable("preferences");
};
