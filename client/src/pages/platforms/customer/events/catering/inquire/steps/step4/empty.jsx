import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Pencil } from "lucide-react";

function CalendarIllustration() {
  return (
    <svg
      width="96"
      height="76"
      viewBox="0 0 160 140"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="shrink-0"
    >
      {/* Calendar body */}
      <rect
        x="24"
        y="28"
        width="112"
        height="96"
        rx="10"
        className="fill-background stroke-border"
        strokeWidth="1.5"
      />

      {/* Calendar header */}
      <rect
        x="24"
        y="28"
        width="112"
        height="24"
        rx="10"
        className="fill-muted dark:fill-muted/60"
      />
      <rect
        x="24"
        y="42"
        width="112"
        height="10"
        className="fill-muted dark:fill-muted/60"
      />

      {/* Calendar hooks */}
      <line
        x1="56"
        y1="20"
        x2="56"
        y2="36"
        className="stroke-muted-foreground/30"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <line
        x1="104"
        y1="20"
        x2="104"
        y2="36"
        className="stroke-muted-foreground/30"
        strokeWidth="3"
        strokeLinecap="round"
      />

      {/* Row 1 */}
      <circle cx="48" cy="68" r="4" className="fill-muted-foreground/10" />
      <circle cx="68" cy="68" r="4" className="fill-muted-foreground/10" />
      <circle cx="88" cy="68" r="4" className="fill-muted-foreground/10" />
      <circle cx="108" cy="68" r="4" className="fill-muted-foreground/10" />

      {/* Row 2 */}
      <circle cx="48" cy="86" r="4" className="fill-muted-foreground/10" />
      <circle cx="68" cy="86" r="4" className="fill-muted-foreground/10" />
      <circle cx="88" cy="86" r="4" className="fill-primary/20" />
      <circle cx="88" cy="86" r="2" className="fill-primary" />
      <circle cx="108" cy="86" r="4" className="fill-muted-foreground/10" />

      {/* Row 3 */}
      <circle cx="48" cy="104" r="4" className="fill-muted-foreground/10" />
      <circle cx="68" cy="104" r="4" className="fill-muted-foreground/10" />
      <circle cx="88" cy="104" r="4" className="fill-muted-foreground/10" />
      <circle cx="108" cy="104" r="4" className="fill-muted-foreground/10" />
    </svg>
  );
}

export function EmptyVenues({ handleEdit }) {
  return (
    <div className="rounded-lg border border-dashed border-border">
      <Empty className="gap-2 px-4 py-5">
        <EmptyHeader className="gap-1.5">
          <EmptyMedia className="mb-0">
            <CalendarIllustration />
          </EmptyMedia>

          <EmptyTitle className="text-sm font-semibold">
            No venues available
          </EmptyTitle>

          <EmptyDescription className="max-w-sm text-xs leading-4">
            Try changing your guest count or schedule to see other options.
          </EmptyDescription>
        </EmptyHeader>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleEdit}
          className="mt-1 h-7 gap-1.5 px-2.5 text-xs font-medium"
        >
          <Pencil className="size-3" />
          Edit reservation details
        </Button>
      </Empty>
    </div>
  );
}

export default EmptyVenues;
