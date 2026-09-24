export const BOOKING_STREAMS = [
  {
    id: "catering",
    title: "Catering",
    color: "var(--color-rose-500)",
  },
  {
    id: "venue",
    title: "Venue",
    color: "var(--color-amber-500)",
  },
  {
    id: "full-service",
    title: "Catering + Venue",
    color: "var(--color-emerald-500)",
  },
];

export const STATUS_STYLES = {
  approved: "border-emerald-200 bg-emerald-50 text-emerald-700",
  pending: "border-amber-200 bg-amber-50 text-amber-700",
  setup: "border-sky-200 bg-sky-50 text-sky-700",
  completed: "border-violet-200 bg-violet-50 text-violet-700",
  cancelled: "border-rose-200 bg-rose-50 text-rose-700",
};

export const STATUS_LABELS = {
  approved: "approved",
  pending: "pending",
  setup: "setup",
  completed: "completed",
  cancelled: "cancelled",
};

export const STATUS_DOTS = {
  approved: "bg-emerald-500",
  pending: "bg-amber-500",
  setup: "bg-sky-500",
  completed: "bg-violet-500",
  cancelled: "bg-rose-500",
};

export const STATUS_TEXT = {
  approved: "text-emerald-700",
  pending: "text-amber-700",
  setup: "text-sky-700",
  completed: "text-violet-700",
  cancelled: "text-rose-700",
};

export const STATUS_BORDERS = {
  approved: "border-l-emerald-500",
  pending: "border-l-amber-500",
  setup: "border-l-sky-500",
  completed: "border-l-violet-500",
  cancelled: "border-l-rose-500",
};

export const STATUS_ORDER = [
  "pending",
  "approved",
  "setup",
  "completed",
  "cancelled",
];

export const CONFIRMED_STATUSES = ["approved", "setup", "completed"];

export const STATUS_COLORS = {
  approved: "var(--color-emerald-500)",
  pending: "var(--color-amber-500)",
  setup: "var(--color-sky-500)",
  completed: "var(--color-violet-500)",
  cancelled: "var(--color-rose-500)",
};

export const PAYMENT_STYLES = {
  paid: "border-emerald-200 bg-emerald-50 text-emerald-700",
  partial: "border-blue-200 bg-blue-50 text-blue-700",
  unpaid: "border-rose-200 bg-rose-50 text-rose-700",
  refunded: "border-slate-200 bg-slate-50 text-slate-700",
};

export const SERVICE_BADGES = {
  both: {
    label: "Catering + Venue",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  venue: {
    label: "Venue",
    className: "border-amber-200 bg-amber-50 text-amber-700",
  },

  catering: {
    label: "Catering",
    className: "border-rose-200 bg-rose-50 text-rose-700",
  },
};

export const PAYMENT_TEXT_STYLES = {
  pending: "text-amber-700",
  paid: "text-emerald-700",
  partial: "text-blue-700",
  unpaid: "text-rose-700",
  refunded: "text-slate-700",
};

export const PAYMENT_SUMMARY_STYLES = {
  pending: "border-amber-200 bg-amber-50/70",
  paid: "border-emerald-200 bg-emerald-50/70",
  partial: "border-blue-200 bg-blue-50/70",
  unpaid: "border-rose-200 bg-rose-50/70",
  refunded: "border-slate-200 bg-slate-50/70",
};
