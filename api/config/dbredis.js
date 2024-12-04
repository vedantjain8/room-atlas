const redis = require("redis");
require("dotenv").config();

const redisClient = redis.createClient({
  // url: `redis://:@${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
  url: `${process.env.REDIS_URL}`,
});

// redisClient.on("connect", () => {
//   console.log("Connected to Redis12345");
// });

redisClient.on("error", (err) => {
  console.log(`redis error: ${err.message}`);
});

// redisClient.on("ready", () => {
//   console.log("Redis is ready");
// });

redisClient.on("end", () => {
  console.log("Redis connection ended");
});

process.on("SIGINT", () => {
  redisClient.quit();
});

redisClient
  .connect()
  .then(() => {
    console.log("Connected to Redis");
  })
  .catch((err) => {
    console.log(`redis catch: ${err.message}`);
  });

module.exports = redisClient;
