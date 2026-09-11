const duration = (start, end, isNumber = false) => {
  if (!start || !end) return isNumber ? 0 : "";

  const [startHour, startMinute] = start.split(":").map(Number);
  const [endHour, endMinute] = end.split(":").map(Number);

  const startMinutes = startHour * 60 + startMinute;
  const endMinutes = endHour * 60 + endMinute;

  const durationMinutes = endMinutes - startMinutes;
  const hours = durationMinutes / 60;

  if (isNumber) {
    return hours;
  }

  return `${hours} hour${hours !== 1 ? "s" : ""}`;
};

export default duration;
