const formattedDate = (month) => {
  const date = new Date(`${month}-01T00:00:00`);

  // format to "September 2025"
  return date.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
};

export default formattedDate;
