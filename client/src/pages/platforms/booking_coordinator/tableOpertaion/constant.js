export const STATUSES = [
  { value: "all", label: "All bookings" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "confirmed", label: "Confirmed" },
  { value: "setup", label: "Setup" },
  { value: "completed", label: "Completed" },
];

export const PAYMENT_OPTIONS = [
  { value: "all", label: "All payments" },
  {
    value: "with_balance",
    label: "With balance",
  },
  {
    value: "pending_verification",
    label: "Pending verification",
  },
  {
    value: "fully_paid",
    label: "Fully paid",
  },
  {
    value: "unpaid",
    label: "Unpaid",
  },
];

export const SERVICE_LABEL = {
  catering: "Catering",
  venue: "Venue",
  both: "Venue + Catering",
};
