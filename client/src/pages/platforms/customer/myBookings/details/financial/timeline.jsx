import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Timeline,
  TimelineContent,
  TimelineDate,
  TimelineHeader,
  TimelineIndicator,
  TimelineItem,
  TimelineSeparator,
  TimelineTitle,
} from "@/components/reui/timeline";
import { capitalize, Formatter } from "@/services/utilities";
import { PAYMENT_STATUS_DOT, PAYMENT_TIMELINE_STATUS } from "./constant";
import { ArrowUpRight } from "lucide-react";

const PaymentHistoryTimeline = ({ payments = [], onViewPayment }) => {
  return (
    <Timeline defaultValue={payments.length} className="gap-0">
      {payments.map((payment, index) => (
        <TimelineItem
          key={payment?._id || index}
          step={index + 1}
          className="group-data-[orientation=vertical]/timeline:ms-7 group-data-[orientation=vertical]/timeline:not-last:pb-4"
        >
          <TimelineHeader>
            <TimelineSeparator className="bg-border! group-data-[orientation=vertical]/timeline:-left-5 group-data-[orientation=vertical]/timeline:h-[calc(100%-1.25rem)] group-data-[orientation=vertical]/timeline:w-px group-data-[orientation=vertical]/timeline:translate-y-5" />

            <div className="flex min-w-0 items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="flex min-w-0 flex-wrap items-center gap-1.5">
                  <TimelineTitle className="truncate text-[13px] font-semibold">
                    {Formatter.amount(payment?.amount)}
                  </TimelineTitle>

                  <PaymentStatus status={payment?.status} />
                </div>

                <TimelineContent className="mt-0.5 text-xs">
                  <span className="truncate">
                    {capitalize(payment?.method?.name)}
                  </span>

                  <span className="px-1 text-muted-foreground/60">
                    &middot;
                  </span>

                  <span>
                    {capitalize(
                      payment?.type === "deposit"
                        ? "Down Payment"
                        : payment?.type,
                    )}
                  </span>
                </TimelineContent>
              </div>

              {onViewPayment && (
                <TooltipProvider delayDuration={150}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="size-6 shrink-0 rounded-md"
                        onClick={() => onViewPayment(payment)}
                      >
                        <ArrowUpRight className="size-3.5" />
                      </Button>
                    </TooltipTrigger>

                    <TooltipContent side="left">
                      View payment details
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>

            <PaymentTimelineIndicator status={payment?.status} />
          </TimelineHeader>

          <TimelineDate className="mb-0 mt-1 text-[11px]">
            {Formatter.date(payment?.paidAt || payment?.createdAt, true)}
          </TimelineDate>
        </TimelineItem>
      ))}
    </Timeline>
  );
};

export default PaymentHistoryTimeline;

const PaymentStatus = ({ status }) => {
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
      <span
        className={`size-1.5 rounded-full ${
          PAYMENT_STATUS_DOT[status] || PAYMENT_STATUS_DOT.refunded
        }`}
      />

      {capitalize(status === "voided" ? "rejected" : status)}
    </span>
  );
};

const PaymentTimelineIndicator = ({ status }) => {
  const meta =
    PAYMENT_TIMELINE_STATUS[status] || PAYMENT_TIMELINE_STATUS.refunded;

  const Icon = meta.icon;

  return (
    <TimelineIndicator
      className={`flex size-5 items-center justify-center group-data-[orientation=vertical]/timeline:-left-5 ${meta.className}`}
    >
      <Icon className="size-3" />
    </TimelineIndicator>
  );
};
