import { AlertTriangle, CheckCircle2, Clock3, XCircle } from "lucide-react";
export const UPCOMING_STATUSES = ["approved", "confirmed", "setup"];

export const STATUS_META = {
  pending: {
    label: "Pending",
    icon: Clock3,
    badgeClassName: "border-amber-200 bg-amber-50 text-amber-700",
  },
  changes_requested: {
    label: "Action Required",
    icon: AlertTriangle,
    badgeClassName: "border-orange-200 bg-orange-50 text-orange-700",
  },

  approved: {
    label: "Approved",
    icon: CheckCircle2,
    badgeClassName: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },

  confirmed: {
    label: "Confirmed",
    icon: CheckCircle2,
    badgeClassName: "border-teal-200 bg-teal-50 text-teal-700",
  },

  setup: {
    label: "Preparing",
    icon: Clock3,
    badgeClassName: "border-violet-200 bg-violet-50 text-violet-700",
  },

  completed: {
    label: "Completed",
    icon: CheckCircle2,
    badgeClassName: "border-sky-200 bg-sky-50 text-sky-700",
  },

  cancelled: {
    label: "Cancelled",
    icon: XCircle,
    badgeClassName: "border-red-200 bg-red-50 text-red-700",
  },
};
