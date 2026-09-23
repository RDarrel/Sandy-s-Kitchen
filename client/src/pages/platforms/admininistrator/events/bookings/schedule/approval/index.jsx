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
import { Formatter, fullName } from "@/services/utilities";
import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  Mail,
  MessageSquareText,
  Phone,
  ReceiptText,
  StickyNote,
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
import { Metric } from "./components";
import Service from "./service";
import { DIALOG_CONTENT_CLASSNAME } from "./constant";
import { useCallback, useEffect, useMemo, useState } from "react";

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
  const [booking, setBooking] = useState({});

  useEffect(() => {
    if (isOpen) {
      setBooking(selected);
    }
  }, [isOpen, selected]);

  const service = SERVICE_BADGES[booking?.bookingType] || {
    label: "Booking",
    className: "border-border bg-muted/40 text-foreground",
  };

  const services = useMemo(() => {
    return getServiceRows(booking);
  }, [booking]);

  const payment = getPaymentSummary(booking);

  const customerName =
    fullName(booking?.customer?.fullName) || booking?.contact?.name || "Guest";

  const isCombinedBooking = booking?.bookingType === "both";

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

  const handleInclusionAmountChange = useCallback(
    (serviceType, itemID, amount) => {
      setBooking((prev) => {
        const inclusions = [...(prev[serviceType]?.inclusions || [])];

        const index = inclusions.findIndex(({ item }) => item?._id === itemID);

        if (index === -1) {
          return prev;
        }

        inclusions[index] = {
          ...inclusions[index],
          amount,
        };

        return {
          ...prev,

          [serviceType]: {
            ...prev[serviceType],
            inclusions,
          },
        };
      });
    },
    [],
  );

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
                    {booking?.eventType || "Event booking"}
                  </p>

                  <p className="truncate text-xs text-muted-foreground">
                    {customerName}
                  </p>
                </div>

                <Badge
                  variant="outline"
                  className={`capitalize ${
                    STATUS_STYLES[booking?.status] || ""
                  }`}
                >
                  {booking?.status || "pending"}
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

            {/* Customer Details */}
            <CustomerDetails booking={booking} customerName={customerName} />

            {/* Services */}
            <section className="grid gap-3">
              {services.map((item) => (
                <Service
                  key={item.type}
                  item={item}
                  conflicts={STATIC_CONFLICTS[item.type] || []}
                  isBoth={isCombinedBooking}
                  handleInclusionAmountChange={handleInclusionAmountChange}
                />
              ))}
            </section>

            {/* Booking Estimate */}
            <BookingEstimate booking={booking} />
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

const CustomerDetails = ({ booking, customerName }) => {
  const preferredContact = Formatter.preferredContact(
    booking?.contact?.preferredContact,
  );

  const hasSpecialRequest = Boolean(booking?.contact?.specialRequests?.trim());

  const hasNotes = Boolean(booking?.notes?.trim());

  return (
    <section className="overflow-hidden rounded-md border bg-background">
      {/* Contact */}
      <div className="p-3">
        <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Contact details
          </h3>

          {preferredContact && (
            <span className="rounded-md bg-muted/50 px-2 py-1 text-[10px] text-muted-foreground">
              Preferred:{" "}
              <span className="font-medium text-foreground">
                {preferredContact}
              </span>
            </span>
          )}
        </div>

        <div className="grid gap-1.5 sm:grid-cols-3">
          <ContactDetail
            icon={<UsersRound className="size-3.5" />}
            label="Name"
            value={customerName}
          />

          <ContactDetail
            icon={<Phone className="size-3.5" />}
            label="Phone"
            value={booking?.contact?.phone}
          />

          <ContactDetail
            icon={<Mail className="size-3.5" />}
            label="Email"
            value={booking?.contact?.email}
          />
        </div>
      </div>

      {/* Request Details */}
      {(hasSpecialRequest || hasNotes) && (
        <div className="border-t bg-muted/5 p-3">
          <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            Request details
          </h3>

          <div
            className={`grid gap-2 ${
              hasSpecialRequest && hasNotes ? "md:grid-cols-2" : "grid-cols-1"
            }`}
          >
            {hasSpecialRequest && (
              <RequestDetail
                icon={<MessageSquareText className="size-3.5" />}
                label="Special request"
                value={booking?.contact?.specialRequests}
              />
            )}

            {hasNotes && (
              <RequestDetail
                icon={<StickyNote className="size-3.5" />}
                label="Notes"
                value={booking?.notes}
              />
            )}
          </div>
        </div>
      )}
    </section>
  );
};

const BookingEstimate = ({ booking }) => {
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

const EstimateServiceCard = ({ label, value }) => (
  <div className="flex items-center justify-between gap-3 rounded-md border bg-muted/10 px-3 py-2">
    <span className="text-xs font-medium text-muted-foreground">{label}</span>

    <span className="text-sm font-semibold tabular-nums text-foreground">
      {Formatter.amount(value)}
    </span>
  </div>
);

const ContactDetail = ({ icon, label, value }) => (
  <div className="flex min-w-0 items-center gap-2 rounded-md border px-2.5 py-2">
    <span className="shrink-0 text-muted-foreground">{icon}</span>

    <div className="min-w-0">
      <p className="text-[10px] leading-3 text-muted-foreground">{label}</p>

      <p className="mt-0.5 truncate text-xs font-medium text-foreground">
        {value || "-"}
      </p>
    </div>
  </div>
);
const RequestDetail = ({ icon, label, value }) => (
  <div className="min-w-0 rounded-md border bg-background p-2.5">
    <div className="mb-1.5 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
      {icon}
      <span>{label}</span>
    </div>

    <p className="line-clamp-3 text-xs leading-5 text-foreground">{value}</p>
  </div>
);

export default Approval;
