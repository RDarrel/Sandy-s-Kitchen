import { capitalize } from "lodash";
import { STATUS_META } from "./constant";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  CreditCard,
  XCircle,
} from "lucide-react";
import { Formatter } from "@/services/utilities";

export const getStatusMeta = (booking) => {
  return (
    STATUS_META[booking?.status] || {
      label: capitalize(booking?.status),
      icon: Clock3,
      badgeClassName: "border-border bg-muted/30 text-foreground",
    }
  );
};

const formatTimeRange = (time = {}) => {
  if (!time?.start && !time?.end) {
    return "-";
  }

  if (time?.start && !time?.end) {
    return Formatter.time(time.start);
  }

  if (!time?.start && time?.end) {
    return Formatter.time(time.end);
  }

  return `${Formatter.time(time.start)} - ${Formatter.time(time.end)}`;
};

export const getServices = (booking) => {
  if (!booking) {
    return [];
  }

  const services = [];

  if (booking.bookingType === "catering" || booking.bookingType === "both") {
    services.push({
      type: "catering",

      name: booking?.catering?.item?.name || "Catering package",

      pax: Number(booking?.catering?.pax || 0),

      time: formatTimeRange(booking?.catering?.time),

      location:
        booking?.catering?.venue?.location ||
        booking?.catering?.venue?.address ||
        (booking.bookingType === "catering"
          ? booking?.venue?.item?.address
          : null) ||
        "-",
    });
  }

  if (booking.bookingType === "venue" || booking.bookingType === "both") {
    services.push({
      type: "venue",

      name: booking?.venue?.item?.name || "Venue reservation",

      pax: Number(booking?.venue?.pax || 0),

      time: formatTimeRange(booking?.venue?.time),

      location: booking?.venue?.item?.address || "-",
    });
  }

  return services;
};

export const getPaymentSummary = (booking) => {
  const total = Number(booking?.pricing?.total || 0);

  /*
   * This assumes payment.amount represents the total amount
   * already received from the customer.
   */
  const received = Number(booking?.payment?.amount || 0);

  /*
   * Temporary based on your current preview structure.
   * Later this can come from your actual backend payment rules.
   */
  const downPayment = Number(booking?.payment?.downPayment || 0);

  return {
    total,
    received,
    downPayment,
    balance: Math.max(total - received, 0),
  };
};

export const getBookingAction = (booking, payment) => {
  const status = booking.status;

  /*
   * PENDING
   *
   * The booking has been submitted but the admin has not
   * approved it yet.
   */
  if (status === "pending") {
    return {
      message:
        "Your booking is awaiting approval. We'll notify you once it has been reviewed.",
      buttonLabel: null,
      icon: Clock3,
      variant: "default",
    };
  }

  /*
   * APPROVED
   *
   * The booking was approved, but the required down payment
   * has not been fully paid yet.
   */
  if (
    status === "approved" &&
    payment.downPayment > 0 &&
    payment.received < payment.downPayment
  ) {
    const remainingDownPayment = payment.downPayment - payment.received;

    return {
      message: `Your booking has been approved. Pay ${Formatter.amount(
        remainingDownPayment,
      )} to confirm your reservation.`,
      buttonLabel: "Pay",
      icon: CreditCard,
      variant: "payment",
    };
  }

  /*
   * APPROVED
   *
   * Required down payment is already satisfied,
   * but there is still a remaining balance.
   */
  if (status === "approved" && payment.balance > 0) {
    return {
      message: `Down payment received. Your booking is awaiting confirmation. Remaining balance: ${Formatter.amount(
        payment.balance,
      )}.`,
      buttonLabel: null,
      icon: CheckCircle2,
      variant: "success",
    };
  }

  /*
   * APPROVED
   *
   * Customer has already fully paid.
   */
  if (status === "approved") {
    return {
      message: "Payment received. Your booking is awaiting confirmation.",
      buttonLabel: null,
      icon: CheckCircle2,
      variant: "success",
    };
  }

  /*
   * CONFIRMED
   *
   * Booking is already confirmed but customer still
   * has a remaining balance.
   */
  if (status === "confirmed" && payment.balance > 0) {
    return {
      message: `Your booking is confirmed. Remaining balance: ${Formatter.amount(
        payment.balance,
      )}.`,
      buttonLabel: "Pay balance",
      icon: CreditCard,
      variant: "payment",
    };
  }

  /*
   * CONFIRMED
   *
   * Booking is confirmed and fully paid.
   */
  if (status === "confirmed") {
    return {
      message:
        "Your booking is confirmed and fully paid. No further payment is required.",
      buttonLabel: null,
      icon: CheckCircle2,
      variant: "success",
    };
  }

  /*
   * SETUP / PREPARING
   *
   * Event preparation has started but there is still
   * an outstanding balance.
   */
  if (status === "setup" && payment.balance > 0) {
    return {
      message: `We're preparing for your event. Remaining balance: ${Formatter.amount(
        payment.balance,
      )}.`,
      buttonLabel: "Pay balance",
      icon: CreditCard,
      variant: "payment",
    };
  }

  /*
   * SETUP / PREPARING
   *
   * Event preparation has started and payment is complete.
   */
  if (status === "setup") {
    return {
      message: "We're preparing for your event. Your payment is complete.",
      buttonLabel: null,
      icon: Clock3,
      variant: "preparing",
    };
  }

  /*
   * COMPLETED
   *
   * Event is completed but there is still an outstanding
   * balance.
   */
  if (status === "completed" && payment.balance > 0) {
    return {
      message: `Your event has been completed. Remaining balance: ${Formatter.amount(
        payment.balance,
      )}.`,
      buttonLabel: "Pay balance",
      icon: CreditCard,
      variant: "payment",
    };
  }

  /*
   * COMPLETED
   *
   * Event is completed and fully paid.
   */
  if (status === "completed") {
    return {
      message:
        "Your event has been completed. Thank you for choosing Sandy's Kitchenette.",
      buttonLabel: null,
      icon: CheckCircle2,
      variant: "success",
    };
  }

  /*
   * CANCELLED
   *
   * Do not show a normal "Pay balance" action for a
   * cancelled booking even if pricing - received > 0.
   *
   * Refund/payment handling should be shown in the
   * booking details separately.
   */
  if (status === "cancelled") {
    return {
      message:
        "This booking has been cancelled. View the booking details for more information.",
      buttonLabel: null,
      icon: XCircle,
      variant: "danger",
    };
  }

  return {
    message: "View your booking for the latest update.",
    buttonLabel: null,
    icon: CalendarDays,
    variant: "default",
  };
};

export const getDateParts = (date) => {
  if (!date) {
    return {
      month: "--",
      day: "--",
      weekday: "No date",
      year: "",
    };
  }

  const value = new Date(date);

  return {
    month: value.toLocaleString("en-US", {
      month: "short",
    }),

    day: value.toLocaleString("en-US", {
      day: "2-digit",
    }),

    weekday: value.toLocaleString("en-US", {
      weekday: "short",
    }),

    year: value.toLocaleString("en-US", {
      year: "numeric",
    }),
  };
};

export const getStatusKey = (booking) => {
  return String(booking?.status || "pending").toLowerCase();
};
