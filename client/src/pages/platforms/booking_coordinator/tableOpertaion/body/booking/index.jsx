import { TableCell, TableRow } from "@/components/ui/table";
import { STATUS_DOTS } from "../../../../admininistrator/events/bookings/constant";
import { Formatter } from "@/services/utilities";
import Actions from "./actions";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
const dateLabel = (value) =>
  value
    ? new Date(`${value}T00:00:00`).toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      })
    : "Not scheduled";

const scheduleDate = (schedule) => {
  const { date, endDate } = schedule;
  if (!date || !endDate || endDate === date) return dateLabel(date);

  if (date.slice(0, 7) === endDate.slice(0, 7)) {
    const start = new Date(`${date}T00:00:00`).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    return `${start} – ${Number(endDate.slice(8, 10))}, ${date.slice(0, 4)}`;
  }

  return `${dateLabel(date)} – ${dateLabel(endDate)}`;
};

const Booking = ({ booking, setSelected, handleAction }) => {
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
          <TooltipProvider delayDuration={150}>
            <div className="ml-auto grid w-max grid-cols-[auto_auto] items-baseline gap-x-3 gap-y-1">
              {booking.serviceSchedules.map((schedule) => (
                <Tooltip key={schedule.service}>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      aria-label={`${schedule.service}: ${schedule.guests} guests`}
                      className="col-span-2 grid cursor-help grid-cols-subgrid items-baseline gap-x-3 rounded focus-visible:outline-2 focus-visible:outline-ring"
                    >
                      <span className="text-left text-xs leading-4 text-muted-foreground">
                        {schedule.service === "Catering" ? "C" : "V"}
                      </span>
                      <span className="text-right font-medium tabular-nums">
                        {schedule.guests}
                      </span>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="left">
                    {schedule.service}: {schedule.guests} guests
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </TooltipProvider>
        ) : (
          booking.guests
        )}
      </TableCell>
      <TableCell className="text-right">
        <p className="font-semibold tabular-nums">
          {Formatter.amount(booking.amount)}
        </p>
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
        <Actions booking={booking} handleAction={handleAction} />
      </TableCell>
    </TableRow>
  );
};

export default Booking;
