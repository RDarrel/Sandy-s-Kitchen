import { Check, Eye, MoreHorizontal, Pencil, Wallet, X } from "lucide-react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { STATUS_DOTS } from "../../../admininistrator/events/bookings/constant";

const Booking = ({ booking, setSelected }) => {
  const money = (value) =>
    new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      maximumFractionDigits: 0,
    }).format(value);
  const dateLabel = (value) =>
    value
      ? new Date(`${value}T00:00:00`).toLocaleDateString("en-US", {
          month: "short",
          day: "2-digit",
          year: "numeric",
        })
      : "Not scheduled";
  const scheduleDate = (schedule) =>
    schedule.endDate && schedule.endDate !== schedule.date
      ? `${dateLabel(schedule.date)} – ${dateLabel(schedule.endDate)}`
      : dateLabel(schedule.date);
  return (
    <TableRow className="border-border/60 hover:bg-muted/20">
      <TableCell>
        <button
          type="button"
          onClick={() => setSelected(booking)}
          className="cursor-pointer rounded font-semibold text-primary decoration-primary/30 underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-ring"
        >
          {booking.id}
        </button>
        <p className="mt-1 text-xs leading-4 text-muted-foreground">
          {booking.service}
        </p>
      </TableCell>
      <TableCell>
        <p title={booking.customer} className="truncate font-semibold">
          {booking.customer}
        </p>
        <p
          title={booking.event}
          className="mt-1 truncate text-xs leading-4 text-muted-foreground"
        >
          {booking.event}
        </p>
      </TableCell>
      <TableCell>
        {booking.serviceSchedules ? (
          <div>
            {booking.serviceSchedules
              .filter((schedule) => schedule.service === "Venue")
              .map((schedule) => (
                <div key={schedule.service} title="Venue schedule">
                  <p className="font-medium tabular-nums">
                    {scheduleDate(schedule)}
                  </p>
                  <p className="mt-1 text-xs leading-4 text-muted-foreground">
                    {schedule.time}
                  </p>
                </div>
              ))}
          </div>
        ) : (
          <>
            <p className="font-medium tabular-nums">
              {dateLabel(booking.date)}
            </p>
            <p className="mt-1 text-xs leading-4 text-muted-foreground">
              {booking.time}
            </p>
          </>
        )}
      </TableCell>
      <TableCell className="text-right tabular-nums">
        {booking.serviceSchedules ? (
          <div className="ml-auto grid w-max grid-cols-[auto_auto] items-baseline gap-x-3 gap-y-1">
            {booking.serviceSchedules.map((schedule) => (
              <div
                key={schedule.service}
                className="contents"
                aria-label={`${schedule.service}: ${schedule.guests} guests`}
              >
                <span
                  title={schedule.service}
                  className="text-left text-xs leading-4 text-muted-foreground"
                >
                  {schedule.service === "Catering" ? "C" : "V"}
                </span>
                <span className="text-right font-medium tabular-nums">
                  {schedule.guests}
                </span>
              </div>
            ))}
          </div>
        ) : (
          booking.guests
        )}
      </TableCell>
      <TableCell className="text-right">
        <p className="font-semibold tabular-nums">{money(booking.amount)}</p>
        <p
          className={`mt-1 text-xs leading-4 ${booking.pendingPayment ? "text-amber-700 dark:text-amber-400" : booking.paid >= booking.amount ? "text-teal-700 dark:text-teal-400" : "text-muted-foreground"}`}
        >
          {booking.pendingPayment
            ? "Pending verification"
            : booking.paid >= booking.amount
              ? "Fully paid"
              : booking.paid
                ? `${money(booking.paid)} paid`
                : "Unpaid"}
        </p>
      </TableCell>
      <TableCell>
        <span className="inline-flex items-center gap-2 rounded-md border border-border/60 bg-background/60 px-2 py-1 text-xs font-medium leading-4">
          <span
            aria-hidden="true"
            className={`size-1.5 rounded-full ${STATUS_DOTS[booking.record.status] || "bg-muted-foreground"}`}
          />
          {booking.status}
        </span>
      </TableCell>
      <TableCell className="text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="size-8 rounded-md border-border bg-card text-muted-foreground shadow-none hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
              aria-label={`Actions for booking ${booking.id}`}
            >
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            sideOffset={6}
            className="w-60 rounded-lg p-1.5"
          >
            <DropdownMenuLabel className="px-2 py-2">
              <span className="block text-sm font-semibold">
                Booking actions
              </span>
              <span className="mt-0.5 block text-xs font-normal text-muted-foreground">
                {booking.id}
              </span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={() => setSelected(booking)}
              className="cursor-pointer gap-2.5 rounded-md py-2 text-sm"
            >
              <Eye className="size-4 text-muted-foreground" />
              View booking details
            </DropdownMenuItem>
            <DropdownMenuItem
              disabled
              className="gap-2.5 rounded-md py-2 text-sm"
            >
              <Pencil className="size-4" />
              Edit booking
            </DropdownMenuItem>
            {booking.status === "Pending" && (
              <DropdownMenuItem
                disabled
                className="gap-2.5 rounded-md py-2 text-sm"
              >
                <Check className="size-4" />
                Approve booking
              </DropdownMenuItem>
            )}
            {(booking.pendingPayment > 0 || booking.paid < booking.amount) && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                  Payments
                </DropdownMenuLabel>
                {booking.pendingPayment > 0 && (
                  <DropdownMenuItem
                    onSelect={() => setPaymentReview(booking)}
                    className="cursor-pointer gap-2.5 rounded-md py-2 text-sm font-medium text-primary focus:bg-primary/5 focus:text-primary"
                  >
                    <Wallet className="size-4" />
                    Review payment
                    <span
                      aria-hidden="true"
                      className="ml-auto size-1.5 rounded-full bg-accent"
                    />
                  </DropdownMenuItem>
                )}
                {booking.paid < booking.amount && (
                  <DropdownMenuItem
                    disabled
                    className="gap-2.5 rounded-md py-2 text-sm"
                  >
                    <Wallet className="size-4" />
                    Record a payment
                  </DropdownMenuItem>
                )}
              </>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              disabled
              className="gap-2.5 rounded-md py-2 text-sm text-destructive"
            >
              <X className="size-4" />
              Cancel booking
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
};

export default Booking;
