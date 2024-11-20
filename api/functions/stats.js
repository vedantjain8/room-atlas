const redisClient = require("../config/dbredis");

// Helper to ensure keys are strings
function ensureString(key) {
  return String(key);
}

// Generalized function to increment a counter
async function incrementCount(hash, key) {
  try {
    key = ensureString(key);
    const currentValue = Number(await redisClient.hGet(hash, key)) || 0;
    const newValue = currentValue + 1;
    await redisClient.hSet(hash, key, newValue);
    return newValue;
  } catch (err) {
    console.error(`Error incrementing ${hash} for key ${key}:`, err);
  }
}

// Generalized function to get a count
async function getCount(hash, key) {
  try {
    key = ensureString(key);
    const value = await redisClient.hGet(hash, key);
    return value ? Number(value) : null; // Return 0 if value is null
  } catch (err) {
    console.error(`Error getting ${hash} for key ${key}:`, err);
  }
}

// Generalized function to set a count
async function setCount(hash, key, value) {
  try {
    key = ensureString(key);
    await redisClient.hSet(hash, key, value);
  } catch (err) {
    console.error(`Error setting ${hash} for key ${key}:`, err);
  }
}

// View Count Functions
async function incrementViewCount(listingID) {
  return incrementCount("viewCount", listingID);
}

async function getViewCount(listingID) {
  return getCount("viewCount", listingID);
}

async function setViewCount(listingID, count) {
  return setCount("viewCount", listingID, count);
}

// Like Count Functions
async function incrementLikeCount(listingID) {
  return incrementCount("likeCount", listingID);
}

async function getLikeCount(listingID) {
  return getCount("likeCount", listingID);
}

async function setLikeCount(listingID, count) {
  return setCount("likeCount", listingID, count);
}

// Share Count Functions
async function incrementShareCount(listingID) {
  return incrementCount("shareCount", listingID);
}

async function getShareCount(listingID) {
  return getCount("shareCount", listingID);
}

async function setShareCount(listingID, count) {
  return setCount("shareCount", listingID, count);
}

module.exports = {
  incrementViewCount,
  incrementLikeCount,
  incrementShareCount,
  getViewCount,
  getLikeCount,
  getShareCount,
  setViewCount,
  setLikeCount,
  setShareCount,
};
