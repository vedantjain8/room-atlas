const convertToUTC = (date) => {
  const localDate = new Date(
    date.year,
    date.month - 1, // Adjust month to be zero-based
    date.day,
    date.hour,
    date.minute,
    0
  );
  const utcDate = new Date(localDate.toUTCString());
  return `${utcDate.getUTCFullYear()}${String(
    utcDate.getUTCMonth() + 1 // Adjust month to be 1-based
  ).padStart(2, "0")}${String(utcDate.getUTCDate()).padStart(2, "0")}T${String(
    utcDate.getUTCHours()
  ).padStart(2, "0")}${String(utcDate.getUTCMinutes()).padStart(2, "0")}00Z`;
};

module.exports = {
  convertToUTC,
};
