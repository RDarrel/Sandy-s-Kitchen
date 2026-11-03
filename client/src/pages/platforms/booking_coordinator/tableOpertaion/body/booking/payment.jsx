import { Formatter } from "@/services/utilities";

const Payment = ({ booking }) => {
  return (
    <>
      <p className="font-semibold tabular-nums">
        {Formatter.amount(booking.amount)}
      </p>
      <Description booking={booking} />
    </>
  );
};

export default Payment;

const Description = ({ booking }) => {
  const { record = {} } = booking;
  const status = record?.status;
  const closed = ["rejected", "cancelled"];

  if (closed.includes(status)) {
    const { cancellation = {} } = record || {};
    const { refund = {} } = cancellation || {};

    if (refund?.amount > 0) {
      const isPending = refund.status === "pending";

      return (
        <p
          className={`mt-1 text-xs leading-4 ${
            isPending
              ? "text-amber-700 dark:text-amber-400"
              : "text-teal-700 dark:text-teal-400"
          }`}
        >
          {`${Formatter.amount(refund.amount)} ${
            isPending ? "refund pending" : "refunded"
          }`}
        </p>
      );
    }

    if (cancellation?.nonRefundableAmount > 0) {
      return (
        <p className="mt-1 text-xs leading-4 text-muted-foreground">
          {`${Formatter.amount(cancellation.nonRefundableAmount)} non-refundable`}
        </p>
      );
    }

    return (
      <p className="mt-1 text-xs leading-4 text-muted-foreground">
        {`${Formatter.amount(booking.paid || 0)} paid`}
      </p>
    );
  }

  return (
    <p
      className={`mt-1 text-xs leading-4 ${booking.pendingPayment ? "text-amber-700 dark:text-amber-400" : booking.paid >= booking.amount ? "text-teal-700 dark:text-teal-400" : "text-muted-foreground"}`}
    >
      {booking.pendingPayment
        ? "Payment awaiting verification"
        : booking.paid >= booking.amount
          ? "Fully paid"
          : booking.paid
            ? `${Formatter.amount(booking.balance)} balance`
            : `${Formatter.amount(booking.downpaymentDue)} down payment due`}
    </p>
  );
};
