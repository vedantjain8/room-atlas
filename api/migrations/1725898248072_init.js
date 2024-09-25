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
    preferenceid: { type: "serial", primaryKey: true },
    preference: { type: "VARCHAR(255)", notNull: true },
  });

  pgm.createTable("security_questions", {
    questionid: { type: "serial", primaryKey: true },
    question: { type: "VARCHAR(255)", notNull: true },
  });

  pgm.createTable("users", {
    userid: { type: "serial", primaryKey: true },
    username: { type: "VARCHAR(255)", notNull: true, unique: true },
    email: { type: "VARCHAR(255)", notNull: true, unique: true },
    pass_hash: { type: "VARCHAR(255)", notNull: true },
    question: { type: "INT", notNull: true, references: "security_questions" },
    answer_hash: { type: "VARCHAR(255)", notNull: true },
    bio: { type: "TEXT" },
    phone: { type: "VARCHAR(255)", notNull: true },
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
    user_role: { type: "VARCHAR(255)", notNull: true, default: "user" },
    dob: { type: "DATE", notNull: true },
    gender: { type: "CHAR(1)", notNull: true },
    occupation: { type: "VARCHAR(255)", notNull: true },
    city: { type: "VARCHAR(255)", notNull: true },
    state: { type: "VARCHAR(255)", notNull: true },
    preference: { type: "INT", references: "preferences" },
    verified_email: { type: "BOOLEAN", notNull: true, default: false },
  });

  pgm.createTable("refresh_token", {
    userid: { type: "INT", notNull: true, references: "users" },
    token: { type: "TEXT", notNull: true },
    create_at: {
      type: "TIMESTAMP",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
  });

  pgm.createTable("listing", {
    propertyid: { type: "serial", primaryKey: true },
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
    preferenceid: { type: "INT", notNull: true, references: "preferences" },
  });

  pgm.createTable("listing_stats", {
    propertyid: { type: "INT", notNull: true, references: "listing" },
    views: { type: "INT", notNull: true, default: 0 },
    likes: { type: "INT", notNull: true, default: 0 },
    shares: { type: "INT", notNull: true, default: 0 },
  });

  pgm.createTable("report", {
    reportid: { type: "serial", primaryKey: true },
    reported_by: { type: "INT", notNull: true, references: "users" },
    property_id: { type: "INT", notNull: true, references: "listing" },
    reported_for: { type: "TEXT", notNull: true },
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
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
  pgm.dropTable("messages");
  pgm.dropTable("report");
  pgm.dropTable("listing_stats");
  pgm.dropTable("listing");
  pgm.dropTable("refresh_token");
  pgm.dropTable("users");
  pgm.dropTable("security_questions");
  pgm.dropTable("preferences");
};
