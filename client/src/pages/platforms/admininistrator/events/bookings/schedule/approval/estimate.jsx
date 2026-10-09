import { Formatter } from "@/services/utilities";
import { ReceiptText } from "lucide-react";

const Estimate = ({ booking }) => {
  const isCombinedBooking = booking?.bookingType === "both";

  const cateringTotal = Number(booking?.pricing?.catering?.total || 0);

  const venueTotal = Number(booking?.pricing?.venue?.total || 0);

  const estimatedTotal = Number(booking?.pricing?.total || 0);

  return (
    <section className="overflow-hidden rounded-md border bg-background">
      <div className="flex items-center gap-2 border-b bg-muted/10 px-3 py-2.5">
        <div className="flex size-7 shrink-0 items-center justify-center rounded-md border bg-background text-muted-foreground">
          <ReceiptText className="size-3.5" />
        </div>

        <div className="min-w-0">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-foreground">
            Booking estimate
          </h3>

          <p className="text-[10px] leading-4 text-muted-foreground">
            Based on the submitted inquiry.
          </p>
        </div>
      </div>

      <div className="p-3">
        {isCombinedBooking && (
          <div className="mb-3 grid gap-2 sm:grid-cols-2">
            <EstimateServiceCard label="Catering" value={cateringTotal} />

            <EstimateServiceCard label="Venue" value={venueTotal} />
          </div>
        )}

        <div
          className={`flex items-center justify-between gap-4 ${
            isCombinedBooking ? "border-t pt-3" : ""
          }`}
        >
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground">
              Estimated total
            </p>

            <p className="mt-0.5 text-[10px] text-muted-foreground">
              Subject to approval
            </p>
          </div>

          <span className="shrink-0 text-lg font-semibold tabular-nums text-foreground">
            {Formatter.amount(estimatedTotal)}
          </span>
        </div>
      </div>
    </section>
  );
};

export default Estimate;

const EstimateServiceCard = ({ label, value }) => (
  <div className="flex items-center justify-between gap-3 rounded-md border bg-muted/10 px-3 py-2">
    <span className="text-xs font-medium text-muted-foreground">{label}</span>

    <span className="text-sm font-semibold tabular-nums text-foreground">
      {Formatter.amount(value)}
    </span>
  </div>
);
