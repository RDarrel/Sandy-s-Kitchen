import { Check, ClipboardCheck, Flag } from "lucide-react";
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
    label: "Awaiting down payment",
  },
];

export const SERVICE_LABEL = {
  catering: "Catering",
  venue: "Venue",
  both: "Venue + Catering",
};

export const OPERATIONAL_STATUSES = ["pending", "confirmed", "setup"];

export const STATUS_ACTIONS = {
  pending: {
    label: "Approve booking",
    icon: Check,
    nextStatus: "approved",
  },
  confirmed: {
    label: "Start setup",
    icon: ClipboardCheck,
    nextStatus: "setup",
  },
  setup: {
    label: "Mark as completed",
    icon: Flag,
    nextStatus: "completed",
  },
};
