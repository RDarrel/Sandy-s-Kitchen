import {
  getBookingAction,
  getDateParts,
  getPaymentSummary,
  getServices,
  getStatusMeta,
} from "../utils";
import Action from "./action";
import ServiceDetail from "./serviceDetail";
import Summary from "./summary";

const Ticket = ({ booking }) => {
  const status = getStatusMeta(booking);
  const services = getServices(booking);
  const payment = getPaymentSummary(booking);
  const date = getDateParts(booking?.date);

  const action = getBookingAction(booking, payment);

  const StatusIcon = status.icon;

  return (
    <article className="group overflow-hidden rounded-lg border bg-card shadow-sm transition hover:border-primary/30 hover:shadow-md">
      <div className="grid xl:grid-cols-[minmax(0,1fr)_11rem]">
        {/* Mobile layout */}
        <div className="p-2.5 md:hidden">
          {/* Date + booking header */}
          <div className="flex min-w-0 items-start gap-2.5">
            <div className="flex h-11 w-12 shrink-0 flex-col items-center justify-center rounded-md border bg-muted/30">
              <span className="text-[9px] font-semibold uppercase leading-3 text-muted-foreground">
                {date.month}
              </span>
              <span className="text-sm font-semibold leading-4">
                {date.day}
              </span>
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex min-w-0 items-start justify-between gap-2">
                <div className="min-w-0">
                  <h2 className="truncate text-sm font-semibold leading-4">
                    {booking?.eventType || "Event booking"}
                  </h2>

                  <div className="mt-0.5 flex min-w-0 items-center gap-1 text-[9px] text-muted-foreground">
                    <span className="shrink-0 font-semibold uppercase tracking-wide">
                      Booking
                    </span>
                    <span>•</span>
                    <span className="truncate font-mono font-semibold text-foreground">
                      {booking?.reference || "Reference unavailable"}
                    </span>
                  </div>
                </div>

                <span
                  className={`inline-flex h-5 w-fit shrink-0 items-center gap-1 rounded-md border px-1.5 text-[9px] font-semibold ${status.badgeClassName}`}
                >
                  <StatusIcon className="size-3" />
                  {status.label}
                </span>
              </div>

              <p className="mt-1 text-[9px] leading-3 text-muted-foreground">
                <span className="font-medium text-foreground">
                  {date.weekday}
                </span>
                <span className="mx-1">•</span>
                {date.year}
              </p>
            </div>
          </div>

          {/* Services */}
          <div className="mt-2 grid gap-1.5">
            {services.map((service) => (
              <ServiceDetail key={service.type} service={service} />
            ))}
          </div>

          <Action action={action} />
        </div>

        {/* Tablet / desktop layout - preserved original design */}
        <div className="hidden gap-3 p-3 md:grid md:grid-cols-[4.25rem_minmax(0,1fr)]">
          {/* Date */}
          <div className="block">
            <div className="mx-auto flex h-12 w-14 shrink-0 flex-col items-center justify-center rounded-md border bg-muted/30">
              <span className="text-[10px] font-semibold uppercase text-muted-foreground">
                {date.month}
              </span>

              <span className="text-base font-semibold leading-none">
                {date.day}
              </span>
            </div>

            <div className="mt-1 min-w-0 text-center">
              <p className="text-xs font-semibold text-foreground">
                {date.weekday}
              </p>
              <p className="text-[11px] text-muted-foreground">{date.year}</p>
            </div>
          </div>

          {/* Booking */}
          <div className="min-w-0">
            {/* Header */}
            <div className="grid gap-2 md:grid-cols-[minmax(0,1fr)_auto] md:items-start">
              <div className="min-w-0">
                <h2 className="truncate text-base font-semibold leading-5">
                  {booking?.eventType || "Event booking"}
                </h2>

                <div className="mt-0.5 flex min-w-0 items-center gap-1.5">
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Booking
                  </span>
                  <span className="text-[10px] text-muted-foreground">•</span>
                  <span className="truncate font-mono text-[11px] font-semibold text-foreground">
                    {booking?.reference || "Reference unavailable"}
                  </span>
                </div>
              </div>

              <span
                className={`inline-flex h-6 w-fit shrink-0 items-center gap-1.5 rounded-md border px-2 text-[11px] font-semibold ${status.badgeClassName}`}
              >
                <StatusIcon className="size-3.5" />
                {status.label}
              </span>
            </div>

            {/* Catering / Venue */}
            <div
              className={`mt-2 grid gap-1.5 ${
                services.length > 1 ? "lg:grid-cols-2" : "grid-cols-1"
              }`}
            >
              {services.map((service) => (
                <ServiceDetail key={service.type} service={service} />
              ))}
            </div>

            {/* Payment / booking message */}
            <Action action={action} />
          </div>
        </div>

        <Summary payment={payment} />
      </div>
    </article>
  );
};

export default Ticket;
