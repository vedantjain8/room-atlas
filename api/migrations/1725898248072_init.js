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
    unique: ["user_id", "preference_id"],
  });

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
    property_id: { type: "serial", primaryKey: true },
    property_title: { type: "VARCHAR(255)", notNull: true },
    property_desc: { type: "TEXT", notNull: true },
    images: { type: "JSON" },
    uploaded_by: { type: "INT", notNull: true, references: "users" },
    uploaded_on: {
      type: "TIMESTAMP",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
    isAvailable: { type: "BOOLEAN", notNull: true, default: true },
    rentedOn: { type: "TIMESTAMP", default: null },
    location: { type: "VARCHAR(255)", notNull: true },
    city: { type: "VARCHAR(255)", notNull: true },
    state: { type: "VARCHAR(255)", notNull: true },
    listing_type: { type: "INT", notNull: true },
  });

  pgm.createTable("listing_stats", {
    property_id: { type: "INT", notNull: true, references: "listing" },
    views: { type: "INT", notNull: true, default: 0 },
    likes: { type: "INT", notNull: true, default: 0 },
    shares: { type: "INT", notNull: true, default: 0 },
  });

  pgm.createTable("report", {
    report_id: { type: "serial", primaryKey: true },
    reported_by: { type: "INT", notNull: true, references: "users" },
    reported_for: { type: "TEXT", notNull: true },
    property_id: { type: "INT", notNull: true, references: "listing" },
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

  pgm.createTable("property_ratings", {
    id: { type: "serial", primaryKey: true },
    property_id: { type: "INT", notNull: true, references: "listing" },
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
    image_path: { type: "TEXT", notNull: true },
    uploaded_on: {
      type: "timestamp",
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
  `);
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
  pgm.dropTable("image_upload_log");
  pgm.dropTable("property_ratings");
  pgm.dropTable("user_ratings");
  pgm.dropTable("messages");
  pgm.dropTable("report");
  pgm.dropTable("listing_stats");
  pgm.dropTable("listing");
  pgm.dropTable("refresh_token");
  pgm.dropTable("preference_user_link")
  pgm.dropTable("users");
  pgm.dropTable("security_questions");
  pgm.dropTable("preferences");
};
