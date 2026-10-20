import { Formatter, fullName } from "@/services/utilities";
import { cn } from "cn";
import { Ban, CircleX } from "lucide-react";
const REASON_STYLES = {
  rejected: {
    title: "Booking request declined",
    actorLabel: "Rejected by",
    icon: CircleX,
    container:
      "border-red-200 bg-red-50/70 dark:border-red-900/60 dark:bg-red-950/20",
    titleColor: "text-red-700 dark:text-red-400",
    iconColor: "text-red-600 dark:text-red-400",
    divider: "border-red-200/70 dark:border-red-900/60",
  },
  cancelled: {
    title: "Booking cancelled",
    actorLabel: "Cancelled by",
    icon: Ban,
    container:
      "border-slate-200 bg-slate-50/70 dark:border-slate-700 dark:bg-slate-900/20",
    titleColor: "text-slate-700 dark:text-slate-300",
    iconColor: "text-slate-600 dark:text-slate-400",
    divider: "border-slate-200/70 dark:border-slate-700",
  },
};
const Notice = ({ booking }) => {
  const status = booking?.status?.toLowerCase();

  const reasonConfig = REASON_STYLES[status];
  const showReason = Boolean(reasonConfig);

  // Find the latest history entry matching the current status.
  const statusHistory = showReason
    ? [...(booking?.statusHistory || [])]
        .reverse()
        .find((history) => history?.status?.toLowerCase() === status)
    : null;

  const statusReason =
    typeof statusHistory?.reason === "string"
      ? statusHistory.reason.trim()
      : "";

  // Assumes changedBy is populated with user information.
  const actorName = fullName(statusHistory?.changedBy);

  const statusDate = Formatter.date(statusHistory?.changedAt, true);

  const ReasonIcon = reasonConfig?.icon;
  return (
    <div
      className={cn(
        "mt-3 flex items-start gap-2.5 rounded-md border px-3 py-2.5",
        reasonConfig.container,
      )}
    >
      <ReasonIcon
        aria-hidden="true"
        className={cn("mt-0.5 size-4 shrink-0", reasonConfig.iconColor)}
      />

      <div className="min-w-0 flex-1 space-y-1">
        <p className={cn("text-xs font-semibold", reasonConfig.titleColor)}>
          {reasonConfig.title}
        </p>

        <p className="whitespace-pre-wrap break-words text-xs leading-relaxed text-foreground/80 [overflow-wrap:anywhere]">
          {statusReason || "No reason provided."}
        </p>

        {/* Actor and timestamp */}
        {(actorName || statusDate) && (
          <div
            className={cn(
              "mt-2 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 border-t pt-2 text-[11px] text-muted-foreground",
              reasonConfig.divider,
            )}
          >
            {actorName && (
              <span>
                {reasonConfig.actorLabel}:{" "}
                <span className="font-medium text-foreground/80">
                  {actorName}
                </span>
              </span>
            )}

            {statusDate && <span className="tabular-nums">{statusDate}</span>}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notice;
