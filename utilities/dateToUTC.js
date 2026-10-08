const { DateTime } = require("luxon");

const dateToUTC = ({
  date,
  timezone = "Asia/Manila",
  endOfDay = false,
  dateOnly = false,
}) => {
  if (!date) return null;

  let dt;

  if (date instanceof Date) {
    dt = DateTime.fromJSDate(date, {
      zone: timezone,
    });
  } else {
    dt = DateTime.fromISO(date, {
      zone: timezone,
    });

    if (!dt.isValid) {
      dt = DateTime.fromFormat(date, "MM/dd/yyyy", {
        zone: timezone,
      });
    }
  }

  if (!dt.isValid) {
    return null;
  }

  // Only adjust the time for date-only operations
  if (dateOnly) {
    dt = endOfDay ? dt.endOf("day") : dt.startOf("day");
  }

  return dt.toUTC().toJSDate();
};

module.exports = dateToUTC;
