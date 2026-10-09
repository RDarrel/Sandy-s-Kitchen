import { Badge } from "@/components/ui/badge";
import { CalendarDays, CheckCircle2, UsersRound, Wallet } from "lucide-react";
import { Metric } from "./components";
import { STATUS_STYLES } from "../../constant";
import { Formatter } from "@/services/utilities";
import { formatDate, getTotalPax } from "./utils";
const BookingSummary = ({
  booking,
  customerName,
  isCombinedBooking,
  payment,
  service,
}) => {
  return (
    <section className="rounded-md border bg-muted/15 p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">
            {booking?.eventType || "Event booking"}
          </p>

          <p className="truncate text-xs text-muted-foreground">
            {customerName}
          </p>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-1">
          <span className="max-w-[140px] truncate text-xs font-semibold text-muted-foreground">
            {booking?.reference || "-"}
          </span>

          <Badge
            variant="outline"
            className={`capitalize ${STATUS_STYLES[booking?.status] || ""}`}
          >
            {booking?.status || "pending"}
          </Badge>
        </div>
      </div>

      <div
        className={`mt-3 grid grid-cols-2 gap-1.5 ${
          isCombinedBooking ? "md:grid-cols-5" : "md:grid-cols-4"
        }`}
      >
        <Metric
          icon={<CalendarDays className="size-3.5" />}
          label="Starts"
          value={formatDate(booking?.date)}
        />

        {isCombinedBooking ? (
          <>
            <Metric
              icon={<UsersRound className="size-3.5" />}
              label="Catering Pax"
              value={booking?.catering?.pax || 0}
            />

            <Metric
              icon={<UsersRound className="size-3.5" />}
              label="Venue Pax"
              value={booking?.venue?.pax || 0}
            />
          </>
        ) : (
          <Metric
            icon={<UsersRound className="size-3.5" />}
            label="Pax"
            value={getTotalPax(booking)}
          />
        )}

        <Metric
          icon={<Wallet className="size-3.5" />}
          label="Estimate"
          value={Formatter.amount(payment.total)}
        />

        <Metric
          icon={<CheckCircle2 className="size-3.5" />}
          label="Type"
          value={service.label}
        />
      </div>
    </section>
  );
};
export default BookingSummary;
