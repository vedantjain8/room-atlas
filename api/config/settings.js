const settings = {
  server: {
    port: 3100,
    dailyMailLimit: 20,
    defaultCacheTimeout: 3600
  },
  database: {
    limit: 15,
  },
  logging: {
    level: "info",
    file: "app.log",
  },
};

module.exports = settings;
