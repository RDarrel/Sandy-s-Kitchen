import { Formatter, fullName } from "@/services/utilities";
import { cn } from "cn";
import { Ban, CircleX, MessageSquareWarning } from "lucide-react";
const REASON_STYLES = {
  changes_requested: {
    title: "Changes Requested",
    actorLabel: "Requested by",
    icon: MessageSquareWarning,
    container:
      "border-amber-200 bg-amber-50/70 dark:border-amber-900/60 dark:bg-amber-950/20",
    titleColor: "text-amber-700 dark:text-amber-400",
    iconColor: "text-amber-600 dark:text-amber-400",
    divider: "border-amber-200/70 dark:border-amber-900/60",
  },
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
    container: "border-border bg-muted/30",
    titleColor: "text-foreground",
    iconColor: "text-muted-foreground",
    divider: "border-border",
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

  const cancellation = status === "cancelled" ? booking?.cancellation : null;
  const cancellationReason =
    typeof cancellation?.reason === "string" ? cancellation.reason.trim() : "";
  const historyReason =
    typeof statusHistory?.reason === "string"
      ? statusHistory.reason.trim()
      : "";

  const statusReason = cancellationReason || historyReason;
  const actorFullName =
    cancellation?.cancelledBy?.fullName || statusHistory?.changedBy?.fullName;
  const actorName = actorFullName ? fullName(actorFullName) : "";
  const noticeTitle =
    cancellation?.initiatedBy === "business"
      ? "Booking cancelled by Sandy's Kitchenette"
      : cancellation?.initiatedBy === "customer"
        ? "Booking cancelled by customer"
        : reasonConfig?.title;

  const changedAt = cancellation?.cancelledAt || statusHistory?.changedAt;
  const statusDate = changedAt ? Formatter.date(changedAt, true) : "";

  const ReasonIcon = reasonConfig?.icon;
  if (!showReason) return null;

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
          {noticeTitle}
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
