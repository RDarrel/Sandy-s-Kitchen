import { useId, useState } from "react";
import { FileText, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import useBookingPolicy from "./useBookingPolicy";
import printPolicy from "./printPolicy";
import { splitPolicyHighlights } from "./highlights";

const getPolicyRows = (policy) => [
  ["Down payment", `A down payment of ${policy.depositPercent}% of the booking total is required to confirm your reservation.`],
  ["Reservation hold", `After approval, the required down payment is due within ${policy.reservationHoldHours} hour(s).`],
  ["Full payment", policy.balanceDueDaysBeforeEvent === 0
    ? "The remaining balance is due on the event date."
    : `The remaining balance is due ${policy.balanceDueDaysBeforeEvent} day(s) before the event.`],
  ["Cancellation", policy.cancellationDeadlineDays === 0
    ? "The cancellation deadline is on the event date. Refer to your approved booking for the exact deadline."
    : `Cancellations must be made at least ${policy.cancellationDeadlineDays} day(s) before the event.`],
  ["Down payment refund", policy.depositRefundable
    ? "The down payment is refundable, subject to the cancellation deadline."
    : "The down payment is non-refundable."],
];

const approvalNotice = "Your inquiry is subject to approval. Your exact payment amounts and deadlines will be available in your booking details after approval.";

export const PolicyAgreement = ({ state, disabled }) => {
  const id = useId();
  const [open, setOpen] = useState(false);
  return (
    <>
      <div className="mt-4 space-y-2 border-t pt-3">
        <div className="flex items-start gap-2">
          <input
            type="checkbox"
            name="bookingPolicyAgreement"
            id={id}
            ref={state.agreementRef}
            required
            aria-required="true"
            checked={state.accepted}
            onChange={(event) => {
              if (event.target.checked) setOpen(true);
              else state.setAccepted(false);
            }}
            disabled={disabled}
            className="mt-0.5 size-4 shrink-0 cursor-pointer accent-primary disabled:cursor-not-allowed disabled:opacity-50"
          />
          <label htmlFor={id} className="cursor-pointer text-xs leading-5">
            I have read and agree to the booking policy.
          </label>
        </div>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="flex max-h-[85dvh] flex-col gap-0 overflow-hidden p-0 sm:max-w-xl">
          <DialogHeader className="border-b px-4 py-3 pr-10">
            <DialogTitle className="text-base">Booking policy</DialogTitle>
            <DialogDescription className="text-xs">
              Please review the booking policy before submitting your inquiry.
            </DialogDescription>
          </DialogHeader>
          <div className="min-h-0 overflow-y-auto p-4">
            <BookingPolicyCard state={state} />
          </div>
          <DialogFooter className="border-t bg-muted/10 px-4 py-3">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Close
            </Button>
            <Button
              type="button"
              disabled={disabled || !state.ready}
              onClick={() => {
                state.setAccepted(true);
                setOpen(false);
              }}
            >
              I have read and agree
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export const BookingPolicyCard = ({ state }) => {
  const { policy, loading, error, ready, retry } = state;
  const rows = ready ? getPolicyRows(policy) : [];
  return (
    <section className="overflow-hidden rounded-lg border bg-background">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b bg-muted/20 px-3 py-2">
        <div className="flex items-center gap-2">
          <FileText className="size-3.5 text-primary" />
          <h3 className="text-xs font-semibold">Booking policy</h3>
        </div>
        {ready && (
          <Button type="button" variant="outline" size="sm" className="h-7 gap-1.5 text-xs" onClick={() => printPolicy(rows, approvalNotice)}>
            <Printer className="size-3.5" /> Print / Save PDF
          </Button>
        )}
      </div>
      {loading ? (
        <p role="status" className="p-3 text-xs text-muted-foreground">Loading booking policy...</p>
      ) : error ? (
        <div role="alert" className="space-y-2 p-3">
          <p className="text-xs text-muted-foreground">{error}</p>
          <Button type="button" variant="outline" size="sm" onClick={retry}>Try again</Button>
        </div>
      ) : (
        <>
          <dl className="divide-y">
            {rows.map(([label, text]) => (
              <div key={label} className="space-y-1 px-3 py-2.5">
                <dt className="text-xs font-medium">{label}</dt>
                <dd className="text-xs leading-5 text-muted-foreground">
                  {splitPolicyHighlights(text).map((part, index) => index % 2 === 1 ? (
                    <strong key={index} className="font-bold">
                      {part}
                    </strong>
                  ) : part)}
                </dd>
              </div>
            ))}
          </dl>
          <p className="border-t bg-muted/10 px-3 py-2.5 text-[11px] leading-5 text-muted-foreground">{approvalNotice}</p>
          <p className="px-3 py-2 text-[10px] text-muted-foreground">To save a PDF, choose Save as PDF in the print dialog.</p>
        </>
      )}
    </section>
  );
};

export default function BookingPolicy({ terms }) {
  const state = useBookingPolicy(terms);
  return <BookingPolicyCard state={state} />;
}
