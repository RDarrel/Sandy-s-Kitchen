const { DateTime } = require("luxon");

const dateToUTC = ({
  date,
  timezone = "Asia/Manila",
  endOfDay = false,
  dateOnly = false,
}) => {
  let dt;

  if (dateOnly) {
    dt = DateTime.fromISO(date, { zone: "UTC" });
  } else {
    dt = DateTime.fromISO(date, { zone: timezone });
  }

  if (!dt.isValid) {
    dt = DateTime.fromFormat(date, "MM/dd/yyyy", {
      zone: dateOnly ? "UTC" : timezone,
    });
  }

  return endOfDay ? dt.endOf("day").toJSDate() : dt.startOf("day").toJSDate();
};

module.exports = dateToUTC;
