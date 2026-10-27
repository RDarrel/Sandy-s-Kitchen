import { addDays, format, isValid } from "date-fns";

export const paymentGroupLabel = (value, frequency, weekNumber) => {
  const parsed = value ? new Date(value) : null;
  if (!isValid(parsed)) return "Unknown date";
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Manila",
    year: "numeric",
    month: "numeric",
    day: "numeric",
  }).formatToParts(parsed);
  const part = (type) => Number(parts.find((item) => item.type === type).value);
  const date = new Date(part("year"), part("month") - 1, part("day"));
  if (frequency === "weekly") {
    return `Week ${weekNumber} (${format(date, "MMMM d, yyyy")} to ${format(addDays(date, 6), "MMMM d, yyyy")})`;
  }
  if (frequency === "monthly") return format(date, "MMMM yyyy");
  if (frequency === "yearly") return format(date, "yyyy");
  return format(date, "MMMM d, yyyy");
};

export const groupPaymentRows = (rows) =>
  rows.reduce((groups, payment) => {
    const last = groups[groups.length - 1];
    if (last && last.date === payment.periodDate) {
      last.items.push(payment);
    } else {
      groups.push({
        date: payment.periodDate,
        weekNumber: payment.weekNumber,
        items: [payment],
      });
    }
    return groups;
  }, []);

export const paymentGroupTotals = (rows) =>
  rows.reduce((totals, payment) => {
    // Match the signed amounts displayed in the transaction rows.
    const amount = Number(payment.amount ?? 0);
    const signedAmount =
      payment.transactionType === "refund" && payment.status === "completed"
        ? -amount
        : amount;
    totals.set(
      payment.periodDate,
      (totals.get(payment.periodDate) || 0) + signedAmount,
    );
    return totals;
  }, new Map());
