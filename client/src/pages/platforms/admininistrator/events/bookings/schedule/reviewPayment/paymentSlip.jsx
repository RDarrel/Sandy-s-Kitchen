import { Formatter } from "@/services/utilities";
import { Clock, MessageSquareText } from "lucide-react";
import { formatPaymentType } from "./utils";

const TORN_EDGE =
  "conic-gradient(from -45deg at bottom, #0000, #000 1deg 89deg, #0000 90deg) 50% / 14px 100%";

const PaymentSlip = ({
  payment,
  paymentAmount,
  verifiedAmount,
  totalAmount,
  balanceAfterVerification,
  willConfirmBooking,
}) => {
  return (
    <section
      className="flex min-w-0 flex-col rounded-t-lg border border-b-0 bg-background px-4 pb-6 pt-3 "
      style={{
        WebkitMask: TORN_EDGE,
        mask: TORN_EDGE,
      }}
    >
      <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
        <span>Payment slip</span>

        <span className="inline-flex items-center gap-1.5">
          <span className="size-1.5 rounded-full bg-amber-500" />
          Pending
        </span>
      </div>

      <div className="py-4 text-center">
        <p className="font-mono text-4xl font-semibold tracking-tight tabular-nums">
          {Formatter.amount(paymentAmount)}
        </p>

        <div
          className={`mt-2 flex items-center justify-center gap-1 text-xs font-medium text-emerald-700 dark:text-emerald-400`}
        >
          <Clock className="size-3.5 shrink-0" />

          <span>Awaiting payment verification</span>
        </div>
      </div>

      <SlipRows>
        <Row label="Method">
          <p className="font-semibold">{payment?.method?.name}</p>
        </Row>

        <Row label="Type">{formatPaymentType(payment?.type)}</Row>

        {payment?.reference && (
          <Row label="Transaction Reference">
            <span className="flex min-w-0 items-start justify-end gap-1">
              <span className="select-all break-all font-mono font-semibold">
                {payment?.reference || "—"}
              </span>
            </span>
          </Row>
        )}

        <Row label="Submitted">{Formatter.date(payment?.createdAt, true)}</Row>
      </SlipRows>

      <SlipRows>
        <Row label="Booking total">{Formatter.amount(totalAmount)}</Row>

        {verifiedAmount > 0 && (
          <Row label="Verified so far">{Formatter.amount(verifiedAmount)}</Row>
        )}

        <Row label="This payment">{Formatter.amount(paymentAmount)}</Row>

        <Row label="Balance after verification" strong>
          {Formatter.amount(balanceAfterVerification)}
        </Row>
      </SlipRows>

      {payment?.notes?.trim() && (
        <div className="border-t border-dashed py-3 text-xs">
          <div className="flex items-center gap-1.5 font-semibold">
            <MessageSquareText className="size-3.5 shrink-0" />
            <span>Customer note</span>
          </div>

          <p className="mt-1.5 whitespace-pre-line leading-5 text-foreground">
            {payment.notes}
          </p>
        </div>
      )}

      <p
        className={`mt-auto border-t border-dashed pt-3 text-center text-xs font-medium text-emerald-700 dark:text-emerald-400`}
      >
        {willConfirmBooking
          ? "Verifying this down payment will confirm the booking."
          : "Once verified, this payment will be applied to the booking balance."}
      </p>
    </section>
  );
};

export default PaymentSlip;

const SlipRows = ({ children }) => (
  <dl className="space-y-2 border-t border-dashed py-3 text-sm">{children}</dl>
);

const Row = ({ label, strong = false, children }) => (
  <div
    className={`flex items-start justify-between gap-3 ${
      strong ? "pt-1 font-semibold" : ""
    }`}
  >
    <dt className={strong ? "" : "text-muted-foreground"}>{label}</dt>

    <dd className="min-w-0 max-w-[60%] break-words text-right tabular-nums">
      {children}
    </dd>
  </div>
);
