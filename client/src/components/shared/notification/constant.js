import {
  AlertCircle,
  CalendarCheck,
  CheckCircle2,
  XCircle,
} from "lucide-react";

export const NOTIFICATION_TEMPLATES = {
  booking_approved: {
    title: "Booking Approved",
    message:
      "Your booking has been approved! Please review your booking details and pay the required down payment to secure your reservation.",
    variant: "success",
  },

  booking_rejected: {
    title: "Booking Rejected",
    message:
      "Your booking request could not be approved. Please review your booking details for the reason.",
    variant: "error",
  },

  booking_cancelled: {
    title: "Booking Cancelled",
    message:
      "Your booking has been cancelled. Please review your booking details for more information.",
    variant: "error",
  },

  booking_confirmed: {
    title: "Booking Confirmed",
    message: "Your booking has been confirmed. We look forward to serving you!",
    variant: "success",
  },

  booking_setup: {
    title: "Event Setup Started",
    message: "Our team has started preparing for your event.",
    variant: "info",
  },

  booking_changes_requested: {
    title: "Changes Requested",
    message:
      "Your booking requires some changes. Please review and update your booking details.",
    variant: "warning",
  },

  booking_completed: {
    title: "Booking Completed",
    message:
      "Your event has been completed. Thank you for choosing Sandy's Kitchenette!",
    variant: "success",
  },

  payment_verified: {
    title: "Payment Verified",
    message: "Your booking payment has been successfully verified.",
    variant: "success",
  },

  payment_voided: {
    title: "Payment Voided",
    message:
      "Your payment has been voided. Please review the reason in your payment details.",
    variant: "error",
  },

  refund_completed: {
    title: "Refund Completed",
    message:
      "Your refund has been successfully processed. Please check your booking for more details.",
    variant: "success",
  },

  refund_account_correction_required: {
    title: "Refund Details Need Correction",
    message:
      "There is an issue with your refund account details. Please review the reason and update your information to proceed with your refund.",
    variant: "warning",
  },
};

export const NOTIFICATION_TYPES = {
  success: {
    icon: CheckCircle2,
    className: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  },
  warning: {
    icon: AlertCircle,
    className: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  },
  info: {
    icon: CalendarCheck,
    className: "bg-primary/10 text-primary",
  },
  error: {
    icon: XCircle,
    className: "bg-destructive/10 text-destructive",
  },
};
