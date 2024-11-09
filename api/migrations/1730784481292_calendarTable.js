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
  pgm.createTable("calendar", {
    event_id: { type: "SERIAL", primaryKey: true },
    user1_id: { type: "integer", notNull: true, references: "users" },
    user2_id: { type: "integer", notNull: true, references: "users" },
    event_start_date: { type: "timestamp", notNull: true },
  });

  pgm.addConstraint(
    "calendar",
    "unique_event_user_pair",
    "UNIQUE(user1_id, user2_id, event_start_date)"
  );

  pgm.renameColumn("listing", "location", "area");
  pgm.alterColumn("listing", "area", { type: "varchar(200)" });
  pgm.addColumn("listing", {
    latitude: { type: "DECIMAL(8,5)", notNull: false }, // TODO: add notNull: true
    longitude: { type: "DECIMAL(8,5)", notNull: false }, // TODO: add notNull: true
  });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
  pgm.dropTable("calendar");
  pgm.renameColumn("listing", "area", "location");
  pgm.alterColumn("listing", "location", { type: "text" });
  pgm.dropColumns("listing", ["latitude", "longitude"]);
};