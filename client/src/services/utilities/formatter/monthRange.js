// Calendar ranges have an exclusive end; display the preceding calendar day.
const monthRange = (startAt, endAt) => {
  if (!startAt || !endAt) return "";

  const start = new Date(startAt);
  const end = new Date(endAt);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return "";

  end.setDate(end.getDate() - 1);
  if (end < start) return "";

  const sameYear = start.getFullYear() === end.getFullYear();
  const options = { month: "short", day: "2-digit" };
  const startLabel = start.toLocaleDateString("en-US", {
    ...options,
    ...(sameYear ? {} : { year: "numeric" }),
  });
  const endLabel = end.toLocaleDateString("en-US", {
    ...options,
    year: "numeric",
  });

  return `${startLabel} – ${endLabel}`;
};

export default monthRange;
