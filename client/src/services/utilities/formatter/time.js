const time = (value) => {
  if (!value) return "";

  const [hours, minutes] = value.split(":");

  const date = new Date();
  date.setHours(Number(hours), Number(minutes));

  return new Intl.DateTimeFormat("en", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
};
export default time;
