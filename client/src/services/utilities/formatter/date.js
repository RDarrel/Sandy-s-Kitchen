const format = (date) => {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short", // "Jan", "Feb", etc.
    day: "2-digit", // "01", "02", etc.
    year: "numeric", // "2025"
  });
};

export default format;
