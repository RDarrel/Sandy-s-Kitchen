import { Check, Clock3, CreditCard, X } from "lucide-react";

export const PAYMENT_STATUS_DOT = {
  verified: "bg-emerald-600",
  pending: "bg-amber-600",
  voided: "bg-red-600",
  refunded: "bg-slate-400",
};

export const PAYMENT_TIMELINE_STATUS = {
  verified: {
    icon: Check,
    className: "border-none bg-emerald-600 text-white",
  },

  pending: {
    icon: Clock3,
    className: "border-none bg-amber-500 text-white",
  },

  voided: {
    icon: X,
    className: "border-none bg-red-600 text-white",
  },

  refunded: {
    icon: CreditCard,
    className: "border-none bg-slate-400 text-white",
  },
};
