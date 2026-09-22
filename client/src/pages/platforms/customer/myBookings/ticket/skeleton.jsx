import { Skeleton } from "@/components/ui/skeleton";

const TicketSkeleton = () => {
  return (
    <article className="overflow-hidden rounded-lg border bg-card shadow-sm">
      <div className="grid xl:grid-cols-[minmax(0,1fr)_11rem]">
        {/* --------------------------------------------------------------- */}
        {/* Mobile layout                                                   */}
        {/* --------------------------------------------------------------- */}
        <div className="p-2.5 md:hidden">
          {/* Date + booking header */}
          <div className="flex min-w-0 items-start gap-2.5">
            {/* Date */}
            <Skeleton className="h-11 w-12 shrink-0 rounded-md" />

            {/* Booking information */}
            <div className="min-w-0 flex-1">
              <div className="flex min-w-0 items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  {/* Event title */}
                  <Skeleton className="h-4 w-28 rounded" />

                  {/* Booking reference */}
                  <div className="mt-1 flex min-w-0 items-center gap-1">
                    <Skeleton className="h-2.5 w-10 rounded" />

                    <Skeleton className="size-1 shrink-0 rounded-full" />

                    <Skeleton className="h-2.5 w-20 rounded" />
                  </div>
                </div>

                {/* Status */}
                <Skeleton className="h-5 w-[4.5rem] shrink-0 rounded-md" />
              </div>

              {/* Weekday + year */}
              <div className="mt-1.5 flex items-center gap-1">
                <Skeleton className="h-2.5 w-6 rounded" />
                <Skeleton className="size-1 rounded-full" />
                <Skeleton className="h-2.5 w-8 rounded" />
              </div>
            </div>
          </div>

          {/* Services */}
          <div className="mt-2 grid gap-1.5">
            <ServiceDetailSkeleton />
            <ServiceDetailSkeleton />
          </div>

          {/* Booking action */}
          <BookingActionSkeleton />
        </div>

        {/* --------------------------------------------------------------- */}
        {/* Tablet / desktop layout                                         */}
        {/* --------------------------------------------------------------- */}
        <div className="hidden gap-3 p-3 md:grid md:grid-cols-[4.25rem_minmax(0,1fr)]">
          {/* Date */}
          <div className="block">
            <Skeleton className="mx-auto h-12 w-14 rounded-md" />

            <div className="mt-1 flex flex-col items-center gap-1">
              <Skeleton className="h-3 w-7 rounded" />
              <Skeleton className="h-2.5 w-8 rounded" />
            </div>
          </div>

          {/* Booking */}
          <div className="min-w-0">
            {/* Header */}
            <div className="grid gap-2 md:grid-cols-[minmax(0,1fr)_auto] md:items-start">
              <div className="min-w-0">
                {/* Event title */}
                <Skeleton className="h-5 w-36 rounded" />

                {/* Booking reference */}
                <div className="mt-1 flex min-w-0 items-center gap-1.5">
                  <Skeleton className="h-2.5 w-11 rounded" />

                  <Skeleton className="size-1 shrink-0 rounded-full" />

                  <Skeleton className="h-2.5 w-24 rounded" />
                </div>
              </div>

              {/* Status */}
              <Skeleton className="h-6 w-20 shrink-0 rounded-md" />
            </div>

            {/* Catering / Venue */}
            <div className="mt-2 grid gap-1.5 lg:grid-cols-2">
              <ServiceDetailSkeleton />
              <ServiceDetailSkeleton />
            </div>

            {/* Payment / booking message */}
            <BookingActionSkeleton />
          </div>
        </div>

        {/* Financial summary */}
        <FinancialSummarySkeleton />
      </div>
    </article>
  );
};
export default TicketSkeleton;
/* -------------------------------------------------------------------------- */
/*                          SERVICE DETAIL SKELETON                           */
/* -------------------------------------------------------------------------- */

const ServiceDetailSkeleton = () => {
  return (
    <div className="min-w-0 rounded-md border bg-muted/10 px-2 py-1.5">
      <div className="flex min-w-0 items-start gap-2">
        {/* Service icon */}
        <Skeleton className="size-6 shrink-0 rounded" />

        <div className="min-w-0 flex-1">
          {/* Type + service name */}
          <div className="flex min-w-0 items-center gap-1.5">
            <Skeleton className="h-2.5 w-10 shrink-0 rounded" />

            <Skeleton className="h-3 w-28 max-w-[45%] rounded" />
          </div>

          {/* Time / pax / location */}
          <div className="mt-1 flex min-w-0 items-center gap-1.5">
            <Skeleton className="h-2.5 w-[5.5rem] shrink-0 rounded" />

            <Skeleton className="size-1 shrink-0 rounded-full" />

            <Skeleton className="h-2.5 w-10 shrink-0 rounded" />

            <Skeleton className="size-1 shrink-0 rounded-full" />

            <Skeleton className="h-2.5 min-w-0 flex-1 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*                          BOOKING ACTION SKELETON                           */
/* -------------------------------------------------------------------------- */

const BookingActionSkeleton = () => {
  return (
    <div className="mt-1.5 flex min-w-0 flex-col gap-1.5 rounded-md border bg-muted/10 px-2 py-1.5 sm:flex-row sm:items-center sm:justify-between">
      {/* Message */}
      <div className="flex min-w-0 flex-1 items-center gap-1.5">
        <Skeleton className="size-3.5 shrink-0 rounded" />

        <Skeleton className="h-3 min-w-0 flex-1 rounded sm:max-w-[26rem]" />
      </div>

      {/* Action button */}
      <Skeleton className="h-6 w-full shrink-0 rounded-md sm:w-[5.5rem]" />
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*                        FINANCIAL SUMMARY SKELETON                          */
/* -------------------------------------------------------------------------- */

const FinancialSummarySkeleton = () => {
  return (
    <>
      {/* Mobile / tablet compact footer */}
      <div className="border-t bg-muted/10 px-2.5 py-2 xl:hidden">
        <div className="flex min-w-0 items-center gap-2">
          <div className="grid min-w-0 flex-1 grid-cols-2 gap-2">
            {/* Total */}
            <div className="min-w-0">
              <Skeleton className="h-2 w-7 rounded" />
              <Skeleton className="mt-1 h-3.5 w-16 rounded" />
            </div>

            {/* Balance */}
            <div className="min-w-0">
              <Skeleton className="h-2 w-10 rounded" />
              <Skeleton className="mt-1 h-3.5 w-16 rounded" />
            </div>
          </div>

          {/* View details */}
          <Skeleton className="h-8 w-16 shrink-0 rounded-md sm:w-24" />
        </div>
      </div>

      {/* Desktop financial sidebar */}
      <div className="hidden flex-col border-l bg-muted/10 p-3 xl:flex">
        {/* Total */}
        <div>
          <Skeleton className="h-2.5 w-8 rounded" />
          <Skeleton className="mt-1.5 h-4 w-20 rounded" />
        </div>

        {/* Balance */}
        <div className="mt-3">
          <Skeleton className="h-2.5 w-12 rounded" />
          <Skeleton className="mt-1.5 h-4 w-16 rounded" />
        </div>

        {/* View details */}
        <Skeleton className="mt-3 h-8 w-full rounded-md" />
      </div>
    </>
  );
};
