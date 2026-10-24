import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

function CalendarIllustration({ compact = false }) {
  return (
    <svg
      width={compact ? 84 : 140}
      height={compact ? 72 : 120}
      viewBox="0 0 160 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
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

      {/* Calendar header bar */}
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

      {/* Day dots - row 1 */}
      <circle cx="48" cy="68" r="4" className="fill-muted-foreground/10" />
      <circle cx="68" cy="68" r="4" className="fill-muted-foreground/10" />
      <circle cx="88" cy="68" r="4" className="fill-muted-foreground/10" />
      <circle cx="108" cy="68" r="4" className="fill-muted-foreground/10" />

      {/* Day dots - row 2 */}
      <circle cx="48" cy="86" r="4" className="fill-muted-foreground/10" />
      <circle cx="68" cy="86" r="4" className="fill-muted-foreground/10" />
      <circle cx="88" cy="86" r="4" className="fill-primary/25" />
      <circle cx="88" cy="86" r="2" className="fill-primary" />
      <circle cx="108" cy="86" r="4" className="fill-muted-foreground/10" />

      {/* Day dots - row 3 */}
      <circle cx="48" cy="104" r="4" className="fill-muted-foreground/10" />
      <circle cx="68" cy="104" r="4" className="fill-muted-foreground/10" />
      <circle cx="88" cy="104" r="4" className="fill-muted-foreground/10" />
      <circle cx="108" cy="104" r="4" className="fill-muted-foreground/10" />

      {/* Floating decoration */}
      <circle cx="14" cy="70" r="2" className="fill-muted-foreground/10" />
      <circle cx="148" cy="56" r="2.5" className="fill-primary/10" />
      <circle cx="146" cy="100" r="1.5" className="fill-muted-foreground/8" />
    </svg>
  );
}

const STATUS_EMPTY_CONTENT = {
  pending: {
    title: "No pending bookings",
    description: "Bookings awaiting approval for this day will appear here.",
  },
  approved: {
    title: "No approved bookings",
    description: "Approved bookings for this day will appear here.",
  },
  confirmed: {
    title: "No confirmed bookings",
    description: "Confirmed bookings for this day will appear here.",
  },
  setup: {
    title: "No bookings in setup",
    description: "Bookings being prepared for this day will appear here.",
  },
  completed: {
    title: "No completed bookings",
    description: "Completed bookings for this day will appear here.",
  },
  cancelled: {
    title: "No cancelled bookings",
    description: "Cancelled bookings for this day will appear here.",
  },
};

const EmptySchedule = ({ status } = {}) => {
  const compact = Boolean(status);
  const { title, description } = STATUS_EMPTY_CONTENT[status] || {
    title: "No bookings",
    description: "Select another day to review its bookings.",
  };

  return (
    <div
      className={`flex items-center justify-center rounded-md border border-dashed ${
        compact ? "p-2" : "h-full p-4"
      }`}
    >
      <Empty className={compact ? "p-3 md:p-3" : "py-12"}>
        <EmptyHeader className={compact ? "gap-1" : undefined}>
          <EmptyMedia className={compact ? "mb-1" : undefined}>
            <CalendarIllustration compact={compact} />
          </EmptyMedia>
          <EmptyTitle
            className={
              compact
                ? "text-sm font-normal text-muted-foreground"
                : "text-sm"
            }
          >
            {title}
          </EmptyTitle>
          {!compact && (
            <EmptyDescription className="text-xs text-muted-foreground">
              {description}
            </EmptyDescription>
          )}
        </EmptyHeader>
      </Empty>
    </div>
  );
};

export default EmptySchedule;
