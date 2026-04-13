const { DateTime } = require("luxon");

const dateToUTC = (date, timezone = "Asia/Manila", endOfDay = false) => {
  let dt = DateTime.fromISO(date, { zone: timezone });
  if (!dt.isValid) {
    dt = DateTime.fromFormat(date, "MM/dd/yyyy", { zone: timezone });
  }
  return endOfDay ? dt.endOf("day").toJSDate() : dt.startOf("day").toJSDate();
};

module.exports = dateToUTC;
