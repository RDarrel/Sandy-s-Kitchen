const time = (value) => {
  if (!value) return "";

  let date;

  // Time-only string: "10:30" or "10:30:00"
  if (typeof value === "string" && /^\d{1,2}:\d{2}(:\d{2})?$/.test(value)) {
    const [hours, minutes] = value.split(":").map(Number);

    date = new Date();
    date.setHours(hours, minutes, 0, 0);
  } else {
    // Date object, ISO string, timestamp, etc.
    date = value instanceof Date ? value : new Date(value);
  }

  // Invalid date
  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
};
export default time;

// const time = (value) => {
//   if (!value) return "";

//   const [hours, minutes] = value.split(":");

//   const date = new Date();
//   date.setHours(Number(hours), Number(minutes));

//   return new Intl.DateTimeFormat("en", {
//     hour: "numeric",
//     minute: "2-digit",
//   }).format(date);
// };
// export default time;
