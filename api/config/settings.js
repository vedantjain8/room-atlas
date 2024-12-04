const settings = {
  server: {
    port: 3100,
    dailyMailLimit: 20,
    defaultCacheTimeout: 3600,
  },
  database: {
    limit: 15,
  },
  logging: {
    level: "info",
    file: "app.log",
  },
  // image_folder: {
  //   uploaded_image_folder: "public/assets/upload/images/",
  //   uploaded_profile_folder: "public/assets/upload/profile/",
  // },
};

module.exports = settings;
