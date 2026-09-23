import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Formatter, fullName } from "@/services/utilities";
import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  Mail,
  Phone,
  UsersRound,
  Wallet,
} from "lucide-react";
import { SERVICE_BADGES, STATUS_STYLES } from "../../constant";
import {
  formatDate,
  getPaymentSummary,
  getServiceRows,
  getTotalPax,
} from "./utils";
import { CompactPanel, InfoRow, Metric } from "./components";
import Service from "./service";
import { DIALOG_CONTENT_CLASSNAME } from "./constant";

const STATIC_CONFLICTS = {
  catering: [
    {
      _id: "conflict-catering-1",
      reference: "BK-2026-00128",
      eventType: "Corporate Event",
      customer: "Maria Santos",
      status: "approved",
      time: {
        start: "16:00",
        end: "20:00",
      },
      overlap: {
        start: "16:00",
        end: "19:00",
      },
    },
    {
      _id: "conflict-catering-2",
      reference: "BK-2026-00129",
      eventType: "Birthday Celebration",
      customer: "Andrea Reyes",
      status: "confirmed",
      time: {
        start: "18:00",
        end: "21:00",
      },
      overlap: {
        start: "18:00",
        end: "19:00",
      },
    },
  ],

  venue: [
    {
      _id: "conflict-venue-1",
      reference: "BK-2026-00131",
      eventType: "Wedding Reception",
      customer: "John Reyes",
      status: "confirmed",
      time: {
        start: "17:00",
        end: "22:00",
      },
      overlap: {
        start: "17:00",
        end: "20:00",
      },
    },
    {
      _id: "conflict-venue-2",
      reference: "BK-2026-00134",
      eventType: "Birthday Celebration",
      customer: "Angela Cruz",
      status: "approved",
      time: {
        start: "19:30",
        end: "23:00",
      },
      overlap: {
        start: "19:30",
        end: "20:00",
      },
    },
    {
      _id: "conflict-venue-3",
      reference: "BK-2026-00138",
      eventType: "Debut Celebration",
      customer: "Sophia Mendoza",
      status: "confirmed",
      time: {
        start: "14:00",
        end: "18:00",
      },
      overlap: {
        start: "14:00",
        end: "18:00",
      },
    },
    {
      _id: "conflict-venue-4",
      reference: "BK-2026-00141",
      eventType: "Company Anniversary",
      customer: "Daniel Garcia",
      status: "approved",
      time: {
        start: "15:30",
        end: "19:30",
      },
      overlap: {
        start: "15:30",
        end: "19:30",
      },
    },
    {
      _id: "conflict-venue-5",
      reference: "BK-2026-00146",
      eventType: "Family Reunion",
      customer: "Patricia Ramos",
      status: "confirmed",
      time: {
        start: "18:30",
        end: "22:30",
      },
      overlap: {
        start: "18:30",
        end: "20:00",
      },
    },
  ],
};

const Approval = ({ isOpen, setIsOpen, selected = {} }) => {
  const booking = selected || {};

  const service = SERVICE_BADGES[booking.bookingType] || {
    label: "Booking",
    className: "border-border bg-muted/40 text-foreground",
  };

  const services = getServiceRows(booking);
  const payment = getPaymentSummary(booking);

  const customerName =
    fullName(booking?.customer?.fullName) || booking?.contact?.name || "Guest";

  const isCombinedBooking = booking.bookingType === "both";

  const hasConflicts = services.some(
    (item) => (STATIC_CONFLICTS[item.type] || []).length > 0,
  );

  const totalConflicts = services.reduce(
    (total, item) => total + (STATIC_CONFLICTS[item.type] || []).length,
    0,
  );

  const handleSubmit = (e) => {
    e.preventDefault();

    if (hasConflicts) return;

    // Approval logic here.
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent
        className={`${DIALOG_CONTENT_CLASSNAME}
    ${
      hasConflicts
        ? "xl:grid xl:w-fit xl:max-w-none xl:grid-cols-[790px_310px] xl:gap-6 [&>button]:xl:right-[320px]"
        : "xl:w-[820px] xl:max-w-[820px]"
    }
  `}
      >
        <div className="w-full overflow-visible rounded-lg border bg-background shadow-lg xl:w-[820px]">
          <DialogHeader className="border-b px-4 py-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <DialogTitle className="truncate text-base">
                    Approve Booking
                  </DialogTitle>

                  {hasConflicts && (
                    <Badge
                      variant="outline"
                      className="gap-1 border-destructive/30 bg-destructive/5 text-destructive"
                    >
                      <AlertTriangle className="size-3" />
                      {totalConflicts}{" "}
                      {totalConflicts === 1 ? "conflict" : "conflicts"}
                    </Badge>
                  )}
                </div>

                <DialogDescription>
                  {hasConflicts
                    ? "Review the detected schedule conflicts before approval."
                    : "Review request details and allocations before approval."}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form
            id="approval-form"
            onSubmit={handleSubmit}
            className="space-y-3 p-4"
          >
            {/* Booking Summary */}
            <section className="rounded-md border bg-muted/15 p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">
                    {booking.eventType || "Event booking"}
                  </p>

                  <p className="truncate text-xs text-muted-foreground">
                    {customerName}
                  </p>
                </div>

                <Badge
                  variant="outline"
                  className={`capitalize ${STATUS_STYLES[booking.status]}`}
                >
                  {booking.status || "pending"}
                </Badge>
              </div>

              <div
                className={`mt-3 grid grid-cols-2 gap-1.5 ${
                  isCombinedBooking ? "md:grid-cols-5" : "md:grid-cols-4"
                }`}
              >
                <Metric
                  icon={<CalendarDays className="size-3.5" />}
                  label="Date"
                  value={formatDate(booking.date)}
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
                  label="Total"
                  value={Formatter.amount(payment.total)}
                />

                <Metric
                  icon={<CheckCircle2 className="size-3.5" />}
                  label="Type"
                  value={service.label}
                />
              </div>
            </section>

            {/* Customer + Payment */}
            <section className="grid gap-2 md:grid-cols-2">
              <CompactPanel title="Customer">
                <InfoRow
                  icon={<UsersRound className="size-3.5" />}
                  label="Name"
                  value={booking?.contact?.name}
                />

                <InfoRow
                  icon={<Phone className="size-3.5" />}
                  label="Phone"
                  value={booking?.contact?.phone}
                />

                <InfoRow
                  icon={<Mail className="size-3.5" />}
                  label="Email"
                  value={booking?.contact?.email}
                />
              </CompactPanel>

              <CompactPanel title="Payment">
                <InfoRow
                  label="Received"
                  value={Formatter.amount(payment.received)}
                />

                <InfoRow
                  label="Balance"
                  value={Formatter.amount(payment.balance)}
                />

                <InfoRow
                  label="Status"
                  value={payment.status}
                  className="capitalize"
                />
              </CompactPanel>
            </section>

            {/* Services */}
            <section className="grid gap-3">
              {services.map((item) => (
                <Service
                  key={item.type}
                  item={item}
                  conflicts={STATIC_CONFLICTS[item.type] || []}
                />
              ))}
            </section>

            {/* Approval Note + Total */}
            <section className="grid gap-2 md:grid-cols-[minmax(0,1fr)_15rem]">
              <Textarea
                className="min-h-16 resize-none text-xs"
                placeholder="Approval note or allocation instruction..."
              />

              <div className="rounded-md border bg-muted/10 p-3">
                <div className="flex items-center justify-between text-sm font-semibold">
                  <span>Total</span>
                  <span>{Formatter.amount(payment.total)}</span>
                </div>

                <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
                  <span>Balance</span>
                  <span>{Formatter.amount(payment.balance)}</span>
                </div>
              </div>
            </section>
          </form>

          {/* Footer */}
          <DialogFooter className="border-t bg-muted/10 px-4 py-3">
            {hasConflicts && (
              <div className="mr-auto flex items-center gap-1.5 text-xs text-destructive">
                <AlertTriangle className="size-3.5 shrink-0" />

                <span>Resolve schedule conflicts before approval.</span>
              </div>
            )}

            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>

            <Button type="submit" form="approval-form" disabled={hasConflicts}>
              <CheckCircle2 className="size-4" />
              Approve Booking
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default Approval;
