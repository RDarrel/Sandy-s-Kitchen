import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

function StackedCardsIllustration() {
  return (
    <div className="relative h-32 w-60" aria-hidden="true">
      {/* Back card */}
      <div className="bg-muted/60 dark:bg-muted/30 border-border/50 absolute inset-x-7 top-0 h-8 rounded-t-lg border" />
      {/* Middle card */}
      <div className="bg-muted/80 dark:bg-muted/50 border-border/60 absolute inset-x-3.5 top-4 h-8 rounded-t-lg border" />
      {/* Front card */}
      <div className="bg-background border-border absolute inset-x-0 top-8 flex h-20 items-center gap-4 rounded-lg border px-5 shadow-sm">
        <div className="bg-muted size-10 shrink-0 rounded" />
        <div className="flex flex-1 flex-col gap-2">
          <div className="bg-muted h-3 w-3/4 rounded" />
          <div className="bg-muted/60 h-2.5 w-1/2 rounded" />
        </div>
      </div>
      {/* Fade overlay */}
      <div className="from-background/0 via-background/60 to-background pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-linear-to-b" />
    </div>
  );
}

export default function EmptyVenue({ isVenue = true }) {
  return (
    <div className="flex min-h-[22rem] items-center justify-center p-4">
      <Empty className="py-12">
        <EmptyHeader>
          <EmptyMedia>
            <StackedCardsIllustration />
          </EmptyMedia>
          <EmptyTitle>
            No {isVenue ? "venues" : "catering packages"} available
          </EmptyTitle>
          <EmptyDescription className="max-w-none sm:whitespace-nowrap">
            Try adjusting your {isVenue ? "event" : "package"} details or check
            back later for available venues.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    </div>
  );
}
