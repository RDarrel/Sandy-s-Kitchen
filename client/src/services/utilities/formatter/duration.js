import { differenceInMinutes } from "date-fns";

const duration = (startAt, endAt, isNumber = false) => {
  if (!startAt || !endAt) return isNumber ? 0 : "";

  const start = new Date(startAt);
  const end = new Date(endAt);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return isNumber ? 0 : "";
  }

  const durationMinutes = differenceInMinutes(end, start);

  const hours = Math.max(0, durationMinutes / 60);

  if (isNumber) {
    return hours;
  }

  return `${hours} hour${hours !== 1 ? "s" : ""}`;
};

export default duration;
