import { capitalize } from "lodash";
import { STATUS_META } from "./constant";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  CreditCard,
  XCircle,
  AlertTriangle,
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
  const payments = booking?.payments || [];

  const total = Number(booking?.pricing?.total || 0);
  const downPayment = Number(booking?.terms?.requiredDeposit || 0);

  const verifiedPayments = payments.filter(
    ({ status }) => status === "verified",
  );

  const pendingPayments = payments.filter(({ status }) => status === "pending");

  const voidedPayments = payments.filter(({ status }) => status === "voided");

  const verifiedAmount = verifiedPayments.reduce(
    (total, payment) => total + Number(payment?.amount || 0),
    0,
  );

  const pendingAmount = pendingPayments.reduce(
    (total, payment) => total + Number(payment?.amount || 0),
    0,
  );

  const balance = Math.max(total - verifiedAmount, 0);

  const remainingDownPayment = Math.max(downPayment - verifiedAmount, 0);

  const pendingPayment = pendingPayments[0] || null;

  const latestPayment =
    payments.length > 0
      ? payments.reduce((latest, payment) =>
          new Date(payment.createdAt) > new Date(latest.createdAt)
            ? payment
            : latest,
        )
      : null;

  return {
    total,
    downPayment,

    verifiedAmount,
    pendingAmount,

    balance,
    remainingDownPayment,

    verifiedPayments,
    pendingPayments,
    voidedPayments,

    pendingPayment,
    latestPayment,

    hasPayments: payments.length > 0,
    hasVerifiedPayments: verifiedPayments.length > 0,
    hasPendingPayment: pendingPayments.length > 0,
    hasVoidedPayments: voidedPayments.length > 0,

    isLatestPaymentVoided: latestPayment?.status === "voided",

    isDownPaymentSatisfied: verifiedAmount >= downPayment,
    isFullyPaid: balance <= 0,
  };
};
export const getBookingAction = (booking, payment) => {
  const status = booking?.status;

  /*
   * PENDING
   *
   * Booking inquiry is waiting for admin approval.
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
   * CHANGES REQUESTED
   *
   * Customer needs to update the booking before
   * it can be approved.
   */
  if (status === "changes_requested") {
    return {
      message:
        booking?.changeRequest?.message ||
        "Changes are required before your booking can be approved. Please review and update your booking.",
      buttonLabel: "Review & Update",
      icon: AlertTriangle,
      variant: "action-required",
    };
  }

  /*
   * APPROVED
   *
   * Booking has been approved and is waiting for the
   * required down payment to be verified.
   */
  if (status === "approved") {
    /*
     * There is already a payment waiting for verification.
     *
     * Do not allow another payment until this one
     * has been verified or voided.
     */
    if (payment.hasPendingPayment) {
      return {
        message: `${Formatter.amount(
          payment.pendingAmount,
        )} payment submitted. We'll update your booking once your payment has been verified.`,
        buttonLabel: null,
        icon: Clock3,
        variant: "payment",
      };
    }

    if (payment.isLatestPaymentVoided) {
      return {
        message: `Your previous payment could not be verified. ${Formatter.amount(
          payment.remainingDownPayment,
        )} down payment is still required.`,
        buttonLabel: "Pay now",
        icon: AlertTriangle,
        variant: "action-required",
      };
    }
    /*
     * Required down payment has not been satisfied.
     *
     * This can be:
     * - no payment yet
     * - partially verified down payment
     * - previous payment was voided
     */
    if (!payment.isDownPaymentSatisfied) {
      /*
       * Some amount has already been verified, but the
       * required down payment is still incomplete.
       */
      if (payment.hasVerifiedPayments) {
        return {
          message: `${Formatter.amount(
            payment.remainingDownPayment,
          )} more is required to complete your down payment.`,
          buttonLabel: "Pay now",
          icon: CreditCard,
          variant: "payment",
        };
      }

      /*
       * A previous payment was voided and there is
       * currently no pending/verified payment.
       *
       * The full reason remains available in the
       * payment history.
       */
      if (payment.hasVoidedPayments) {
        return {
          message: `A previous payment could not be verified. ${Formatter.amount(
            payment.remainingDownPayment,
          )} down payment is still required.`,
          buttonLabel: "Pay now",
          icon: AlertTriangle,
          variant: "action-required",
        };
      }

      return {
        message: `${Formatter.amount(
          payment.remainingDownPayment,
        )} down payment required to confirm your booking.`,
        buttonLabel: "Pay now",
        icon: CreditCard,
        variant: "payment",
      };
    }

    /*
     * FALLBACK
     *
     * Normally the backend should automatically move:
     *
     * approved -> confirmed
     *
     * once the required verified down payment has
     * been satisfied.
     */
    return {
      message:
        "Your down payment has been verified. Your booking is awaiting confirmation.",
      buttonLabel: null,
      icon: CheckCircle2,
      variant: "success",
    };
  }

  /*
   * CONFIRMED
   *
   * Required down payment has already been verified
   * and the booking is confirmed.
   */
  if (status === "confirmed") {
    /*
     * Fully paid.
     */
    if (payment.isFullyPaid) {
      return {
        message:
          "Your booking is confirmed and fully paid. No further payment is required.",
        buttonLabel: null,
        icon: CheckCircle2,
        variant: "success",
      };
    }

    if (payment.isLatestPaymentVoided) {
      return {
        message: `Your previous payment could not be verified. Remaining balance: ${Formatter.amount(
          payment.balance,
        )}.`,
        buttonLabel: "Pay balance",
        icon: AlertTriangle,
        variant: "action-required",
      };
    }

    /*
     * A balance payment has been submitted and is
     * currently waiting for admin verification.
     *
     * No additional payment can be submitted yet.
     */
    if (payment.hasPendingPayment) {
      return {
        message: `${Formatter.amount(
          payment.pendingAmount,
        )} payment submitted. Awaiting verification.`,
        buttonLabel: null,
        icon: Clock3,
        variant: "payment",
      };
    }

    /*
     * No pending payment.
     * Customer may continue paying the remaining balance.
     */
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
   * SETUP / PREPARING
   *
   * Event preparation is already in progress.
   */
  if (status === "setup") {
    /*
     * Fully paid.
     */
    if (payment.isFullyPaid) {
      return {
        message: "We're preparing for your event. Your payment is complete.",
        buttonLabel: null,
        icon: Clock3,
        variant: "preparing",
      };
    }

    if (payment.isLatestPaymentVoided) {
      return {
        message: `Your previous payment could not be verified. Remaining balance: ${Formatter.amount(
          payment.balance,
        )}.`,
        buttonLabel: "Pay balance",
        icon: AlertTriangle,
        variant: "action-required",
      };
    }

    /*
     * Payment is currently under review.
     */
    if (payment.hasPendingPayment) {
      return {
        message: `We're preparing for your event. ${Formatter.amount(
          payment.pendingAmount,
        )} payment is awaiting verification.`,
        buttonLabel: null,
        icon: Clock3,
        variant: "preparing",
      };
    }

    /*
     * Customer still has an outstanding balance.
     */
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
   * COMPLETED
   *
   * Event has already been completed.
   */
  if (status === "completed") {
    /*
     * Fully paid.
     */
    if (payment.isFullyPaid) {
      return {
        message:
          "Your event has been completed. Thank you for choosing Sandy's Kitchenette.",
        buttonLabel: null,
        icon: CheckCircle2,
        variant: "success",
      };
    }

    if (payment.isLatestPaymentVoided) {
      return {
        message: `Your previous payment could not be verified. Remaining balance: ${Formatter.amount(
          payment.balance,
        )}.`,
        buttonLabel: "Pay balance",
        icon: AlertTriangle,
        variant: "action-required",
      };
    }
    /*
     * Final/balance payment is still waiting
     * for verification.
     */
    if (payment.hasPendingPayment) {
      return {
        message: `Your event has been completed. ${Formatter.amount(
          payment.pendingAmount,
        )} payment is awaiting verification.`,
        buttonLabel: null,
        icon: Clock3,
        variant: "payment",
      };
    }

    /*
     * Event is complete but an outstanding balance
     * still exists.
     */
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
   * CANCELLED
   *
   * Normal payment actions are disabled.
   * Payment/refund history can still be viewed
   * from the booking details.
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
