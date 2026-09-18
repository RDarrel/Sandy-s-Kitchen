import { CalendarCheck } from "lucide-react";
import { STATUS_DOTS, STATUS_LABELS, STATUS_ORDER } from "../../constant";
import { Formatter } from "@/services/utilities";

export const Monthly = ({ monthlySummary }) => {
  return (
    <div className="flex min-h-8 min-w-0 flex-col gap-2 border-t border-border/50 pt-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <div className="flex shrink-0 items-center gap-1.5">
        <CalendarCheck className="size-3.5 text-muted-foreground" />
        <span className="text-xs text-muted-foreground">Total bookings</span>
        <span className="rounded-sm bg-muted px-1.5 py-0.5 text-xs font-semibold leading-none tabular-nums text-foreground">
          {monthlySummary.total}
        </span>
      </div>

      <div className="flex min-w-0 flex-wrap items-center justify-start gap-x-3 gap-y-1 sm:justify-end">
        {STATUS_ORDER.filter((status) => monthlySummary.statuses[status]).map(
          (status) => (
            <div key={status} className="inline-flex items-center gap-1.5">
              <span
                aria-hidden
                className={`size-1.5 rounded-full ${STATUS_DOTS[status]}`}
              />

              <span className="text-xs capitalize text-muted-foreground">
                {STATUS_LABELS[status]}
              </span>

              <span className="text-xs font-semibold tabular-nums text-foreground">
                {monthlySummary.statuses[status]}
              </span>
            </div>
          ),
        )}
      </div>
    </div>
  );
};

export const Financial = ({ monthlySummary }) => {
  return (
    <div className="flex w-full shrink-0 items-center gap-2 rounded-md border bg-background/70 px-2 py-1.5 sm:w-auto sm:gap-3 sm:border-0 sm:bg-transparent sm:p-0">
      <div className="min-w-0 flex-1 text-center sm:min-w-20 sm:flex-none sm:text-right">
        <p className="text-[9px] font-medium uppercase tracking-wide text-muted-foreground">
          Confirmed
        </p>
        <p className="mt-0.5 text-sm font-semibold tabular-nums text-foreground">
          {Formatter.amount(monthlySummary.confirmed)}
        </p>
      </div>

      <div className="h-7 w-px shrink-0 bg-border/80" />

      <div className="min-w-0 flex-1 text-center sm:min-w-20 sm:flex-none sm:text-right">
        <p className="text-[9px] font-medium uppercase tracking-wide text-muted-foreground">
          Received
        </p>
        <p className="mt-0.5 text-sm font-semibold tabular-nums text-foreground">
          {Formatter.amount(monthlySummary.received)}
        </p>
      </div>

      <div className="h-7 w-px shrink-0 bg-border/80" />

      <div className="min-w-0 flex-1 text-center sm:min-w-20 sm:flex-none sm:text-right">
        <p className="text-[9px] font-medium uppercase tracking-wide text-muted-foreground">
          To Collect
        </p>
        <p className="mt-0.5 text-sm font-semibold tabular-nums text-foreground">
          {Formatter.amount(monthlySummary.toCollect)}
        </p>
      </div>
    </div>
  );
};
