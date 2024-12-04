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
    "UNIQUE (listing_id, preference_id)",
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
    "UNIQUE (listing_id, amenity_id)",
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
    `,
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
    "UNIQUE (reported_by, listing_id)",
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
    "UNIQUE (user_id, rated_by)",
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
    "UNIQUE (user_id, listing_id)",
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



INSERT INTO listing (accommodation_type, listing_title, listing_desc, images, uploaded_by, is_available, rented_on, location, city, state)
VALUES 
(0, 'Cozy Apartment in Connaught Place', 'A fully furnished 2-bedroom apartment in the heart of New Delhi.', '["/assets/upload/images/image1.jpg","/assets/upload/images/image2.jpg"]', 1, TRUE, NULL, 'Connaught Place', 'New Delhi', 'Delhi'),
(1, 'Luxury Villa in Juhu', 'A sprawling villa with a private pool near Juhu Beach.', '["/assets/upload/images/image3.jpg","/assets/upload/images/image4.jpg"]', 2, TRUE, NULL, 'Juhu', 'Mumbai', 'Maharashtra'),
(2, 'Studio Apartment in MG Road', 'A modern studio perfect for working professionals.', '["/assets/upload/images/image5.jpg","/assets/upload/images/image6.jpg"]', 1, FALSE, '2024-11-15', 'MG Road', 'Bengaluru', 'Karnataka'),
(0, 'Beachfront Condo in Calangute', 'A luxurious beachfront condo with stunning ocean views.', '["/assets/upload/images/image7.jpg","/assets/upload/images/image2.jpg"]', 2, TRUE, NULL, 'Calangute', 'Goa', 'Goa'),
(1, 'Family Home in Gachibowli', 'A spacious family home with a large garden.', '["/assets/upload/images/image4.jpg","/assets/upload/images/image2.jpg"]', 1, TRUE, NULL, 'Gachibowli', 'Hyderabad', 'Telangana'),
(2, 'Studio in Koregaon Park', 'A compact studio ideal for singles or couples.', '["/assets/upload/images/image2.jpg","/assets/upload/images/image2.jpg"]', 2, TRUE, NULL, 'Koregaon Park', 'Pune', 'Maharashtra'),
(0, 'Luxury Penthouse in Banjara Hills', 'A stunning penthouse with a panoramic city view.', '["/assets/upload/images/image1.jpg","/assets/upload/images/image2.jpg"]', 1, TRUE, NULL, 'Banjara Hills', 'Hyderabad', 'Telangana'),
(1, 'Hilltop Bungalow in Nainital', 'A peaceful bungalow with breathtaking mountain views.', '["/assets/upload/images/image1.jpg","/assets/upload/images/image2.jpg"]', 2, TRUE, NULL, 'Tallital', 'Nainital', 'Uttarakhand'),
(2, 'Modern Flat in Salt Lake City', 'A 3-bedroom flat in a prime Kolkata locality.', '["/assets/upload/images/image1.jpg","/assets/upload/images/image2.jpg"]', 1, TRUE, NULL, 'Salt Lake City', 'Kolkata', 'West Bengal'),
(0, 'Compact Studio in Anna Nagar', 'A cozy studio near major attractions.', '["/assets/upload/images/image1.jpg","/assets/upload/images/image2.jpg"]', 2, FALSE, '2024-11-15', 'Anna Nagar', 'Chennai', 'Tamil Nadu'),
(1, 'Lakefront Villa in Udaipur', 'A serene villa by the lakeside.', '["/assets/upload/images/image1.jpg","/assets/upload/images/image2.jpg"]', 1, TRUE, NULL, 'Pichola Lake', 'Udaipur', 'Rajasthan'),
(0, 'Furnished Apartment in Indiranagar', 'A vibrant 2-bedroom apartment in a bustling locality.', '["/assets/upload/images/image1.jpg","/assets/upload/images/image2.jpg"]', 2, TRUE, NULL, 'Indiranagar', 'Bengaluru', 'Karnataka'),
(1, 'Heritage Haveli in Jaipur', 'A beautifully restored haveli with traditional Rajasthani architecture.', '["/assets/upload/images/image1.jpg","/assets/upload/images/image2.jpg"]', 1, TRUE, NULL, 'Pink City', 'Jaipur', 'Rajasthan'),
(2, 'Apartment in Marine Drive', 'A luxurious apartment with a stunning view of the sea.', '["/assets/upload/images/image1.jpg","/assets/upload/images/image2.jpg"]', 2, TRUE, NULL, 'Marine Drive', 'Mumbai', 'Maharashtra'),
(0, 'Compact Studio in Sector 62', 'A fully-furnished studio close to IT hubs.', '["/assets/upload/images/image1.jpg","/assets/upload/images/image2.jpg"]', 1, TRUE, NULL, 'Sector 62', 'Noida', 'Uttar Pradesh'),
(1, 'Luxury Farmhouse in Chattarpur', 'A stunning farmhouse with a private garden and swimming pool.', '["/assets/upload/images/image1.jpg","/assets/upload/images/image2.jpg"]', 2, FALSE, '2024-11-14', 'Chattarpur', 'New Delhi', 'Delhi'),
(2, 'Modern Apartment in Whitefield', 'A 2-bedroom apartment near IT hubs and malls.', '["/assets/upload/images/image1.jpg","/assets/upload/images/image2.jpg"]', 1, TRUE, NULL, 'Whitefield', 'Bengaluru', 'Karnataka'),
(0, 'Studio Apartment in Kalyani Nagar', 'A cozy studio located in a vibrant area with amenities.', '["/assets/upload/images/image1.jpg","/assets/upload/images/image2.jpg"]', 2, TRUE, NULL, 'Kalyani Nagar', 'Pune', 'Maharashtra'),
(1, 'Hill View Bungalow in Darjeeling', 'A charming bungalow with a breathtaking view of the hills.', '["/assets/upload/images/image2.jpg","/assets/upload/images/image2.jpg"]', 1, TRUE, NULL, 'Mall Road', 'Darjeeling', 'West Bengal'),
(2, 'Riverside Flat in Varanasi', 'A spacious flat overlooking the Ganges River.', '["/assets/upload/images/image1.jpg","/assets/upload/images/image2.jpg"]', 2, TRUE, NULL, 'Dashashwamedh Ghat', 'Varanasi', 'Uttar Pradesh'),
(0, 'Cozy Cottage in Ooty', 'A quaint cottage with a picturesque view of the hills.', '["/assets/upload/images/image1.jpg","/assets/upload/images/image2.jpg"]', 1, TRUE, NULL, 'Ooty', 'Tamil Nadu', 'Tamil Nadu'),
(1, 'Penthouse in Andheri West', 'A lavish penthouse with a city skyline view.', '["/assets/upload/images/image1.jpg","/assets/upload/images/image2.jpg"]', 2, TRUE, NULL, 'Andheri West', 'Mumbai', 'Maharashtra'),
(2, 'Spacious Flat in Koramangala', 'A 2-bedroom flat with a balcony and parking space.', '["/assets/upload/images/image1.jpg","/assets/upload/images/image2.jpg"]', 1, TRUE, NULL, 'Koramangala', 'Bengaluru', 'Karnataka'),
(0, 'Sea View Villa in Alibaug', 'A stunning villa overlooking the Arabian Sea.', '["/assets/upload/images/image5.jpg","/assets/upload/images/image2.jpg"]', 2, TRUE, NULL, 'Alibaug', 'Maharashtra', 'Maharashtra'),
(1, 'Luxury Apartment in Bandra', 'A beautiful apartment with a stunning sea view.', '["/assets/upload/images/image1.jpg","/assets/upload/images/image2.jpg"]', 1, TRUE, NULL, 'Bandra', 'Mumbai', 'Maharashtra'),
(2, 'City Center Studio in Ahmedabad', 'A modern studio apartment in the heart of the city.', '["/assets/upload/images/image4.jpg","/assets/upload/images/image2.jpg"]', 2, TRUE, NULL, 'City Center', 'Ahmedabad', 'Gujarat'),
(0, 'Hillside Bungalow in Shimla', 'A peaceful bungalow located in the hills.', '["/assets/upload/images/image1.jpg","/assets/upload/images/image2.jpg"]', 1, TRUE, NULL, 'Shimla', 'Himachal Pradesh', 'Himachal Pradesh'),
(1, 'Charming Cottage in Kodaikanal', 'A charming cottage surrounded by nature.', '["/assets/upload/images/image1.jpg","/assets/upload/images/image2.jpg"]', 2, TRUE, NULL, 'Kodaikanal', 'Tamil Nadu', 'Tamil Nadu');


  
  INSERT INTO listing_metadata 
(listing_id, listing_type, prefered_tenants, is_available, bedrooms, bathrooms, rent, deposit, furnishing, floor, total_floors, areasqft)
VALUES
(1, 1, 2, TRUE, 2, 2, 20000.00, 50000.00, 2, 3, 10, 1200.00),
(2, 2, 1, TRUE, 3, 3, 35000.00, 100000.00, 3, 7, 15, 1800.00),
(3, 3, 3, FALSE, 1, 1, 15000.00, 30000.00, 1, 2, 5, 600.00),
(4, 1, 2, TRUE, 4, 3, 45000.00, 120000.00, 3, 1, 2, 2500.00),
(5, 1, 1, TRUE, 2, 2, 22000.00, 60000.00, 2, 5, 8, 1400.00),
(6, 2, 3, FALSE, 3, 3, 30000.00, 90000.00, 2, 6, 12, 1600.00),
(7, 3, 2, TRUE, 1, 1, 12000.00, 25000.00, 1, 1, 4, 500.00),
(8, 1, 1, TRUE, 2, 2, 25000.00, 70000.00, 3, 8, 20, 1500.00),
(9, 2, 2, TRUE, 3, 3, 40000.00, 100000.00, 3, 10, 15, 2000.00),
(10, 1, 3, FALSE, 1, 1, 10000.00, 20000.00, 1, 3, 6, 550.00),
(11, 3, 1, TRUE, 1, 1, 18000.00, 35000.00, 2, 2, 8, 700.00),
(12, 2, 2, TRUE, 3, 2, 32000.00, 85000.00, 3, 9, 15, 1700.00),
(13, 1, 3, TRUE, 4, 3, 50000.00, 120000.00, 3, 2, 3, 3000.00),
(14, 1, 2, FALSE, 2, 2, 20000.00, 50000.00, 2, 4, 10, 1200.00),
(15, 3, 1, TRUE, 1, 1, 15000.00, 30000.00, 1, 1, 5, 600.00),
(16, 2, 3, TRUE, 3, 2, 36000.00, 95000.00, 3, 12, 20, 1850.00),
(17, 2, 1, FALSE, 2, 2, 23000.00, 60000.00, 2, 6, 12, 1400.00),
(18, 1, 3, TRUE, 4, 4, 55000.00, 150000.00, 3, 1, 3, 3200.00),
(19, 3, 2, TRUE, 1, 1, 13000.00, 25000.00, 1, 2, 6, 500.00),
(20, 1, 2, TRUE, 2, 3, 28000.00, 70000.00, 2, 9, 15, 1500.00),
(21, 2, 2, TRUE, 2, 2, 25000.00, 70000.00, 3, 8, 18, 1600.00),
(22, 1, 1, TRUE, 1, 1, 12000.00, 30000.00, 1, 4, 7, 700.00),
(23, 2, 3, FALSE, 4, 3, 40000.00, 100000.00, 3, 6, 10, 1800.00),
(24, 3, 1, TRUE, 1, 1, 16000.00, 35000.00, 1, 2, 4, 550.00),
(25, 1, 2, TRUE, 3, 3, 33000.00, 90000.00, 2, 5, 12, 1700.00),
(26, 3, 1, TRUE, 1, 1, 11000.00, 25000.00, 1, 3, 6, 600.00),
(27, 2, 3, TRUE, 3, 2, 35000.00, 95000.00, 3, 9, 16, 1900.00),
(28, 1, 2, TRUE, 2, 2, 24000.00, 70000.00, 2, 7, 15, 1300.00);


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
  pgm.dropTable("users");
  pgm.dropTable("security_questions");
  pgm.dropTable("preferences");
};
