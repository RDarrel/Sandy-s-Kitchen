import { Portal } from "@radix-ui/react-hover-card";
import { Info } from "lucide-react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Formatter } from "@/services/utilities";
import { Button } from "@/components/ui/button";

const NetCollected = ({ financial = {} }) => (
  <HoverCard openDelay={200} closeDelay={100}>
    <HoverCardTrigger asChild>
      <button type="button" className="min-w-0 flex-1 rounded-sm text-center outline-none focus-visible:ring-2 focus-visible:ring-ring sm:min-w-20 sm:flex-none sm:text-right" aria-label="Net Collected breakdown">
        <span className="inline-flex items-center gap-1 text-[9px] font-medium uppercase leading-[11px] tracking-wide text-muted-foreground">
          Net Collected
          <Info aria-hidden="true" className="size-2.5" />
        </span>
        <span className="mt-0.5 block text-sm font-semibold leading-5 text-foreground tabular-nums">
          {Formatter.amount(financial.received || 0)}
        </span>
      </button>
    </HoverCardTrigger>
    <Portal>
      <HoverCardContent side="bottom" align="end" sideOffset={8} collisionPadding={12} className="z-[90] w-72 max-w-[calc(100vw-1.5rem)] p-0">
        <div className="space-y-1 border-b px-3 py-2.5">
          <p className="text-sm font-semibold">Net Collected</p>
          <p className="text-xs leading-5 text-muted-foreground">Verified payments minus completed refunds.</p>
        </div>
        <dl className="space-y-2.5 px-3 py-3">
          <Amount label="Verified Payments" value={financial.verifiedPayments} symbol="+" />
          <Amount label="Completed Refunds" value={financial.completedRefunds} symbol="−" deduction />
          <div className="-mx-3 border-y border-primary/10 bg-primary/5 px-3 py-2.5">
            <Amount label="Net Collected" value={financial.received} symbol="=" strong />
          </div>
        </dl>
        <dl className="grid grid-cols-2 gap-3 px-3 pb-3">
          <div className="min-w-0 space-y-1">
            <dt className="text-[11px] text-muted-foreground">Retained Deposits</dt>
            <dd className="break-words text-xs font-semibold tabular-nums">{Formatter.amount(financial.retainedDeposits || 0)}</dd>
            <p className="text-[10px] leading-4 text-muted-foreground">Already included</p>
          </div>
          <div className="min-w-0 space-y-1 border-l pl-3">
            <dt className="text-[11px] text-muted-foreground">Pending Refunds</dt>
            <dd className="break-words text-xs font-semibold text-amber-700 tabular-nums dark:text-amber-400">{Formatter.amount(financial.pendingRefunds || 0)}</dd>
            <p className="text-[10px] leading-4 text-muted-foreground">Not yet deducted</p>
          </div>
        </dl>
        <div className="border-t p-3">
          <Button type="button" variant="outline" size="sm" className="w-full text-xs shadow-none">
            View Cancelled Bookings
          </Button>
        </div>
      </HoverCardContent>
    </Portal>
  </HoverCard>
);

const Amount = ({ label, value = 0, symbol, deduction = false, strong = false }) => (
  <div className="flex items-start justify-between gap-3 text-xs leading-5">
    <dt className={`flex items-center gap-2 ${strong ? "font-semibold" : "text-muted-foreground"}`}>
      <span aria-hidden="true" className={`flex size-4 shrink-0 items-center justify-center rounded text-[11px] font-medium ${strong ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>{symbol}</span>
      {label}
    </dt>
    <dd className={`shrink-0 text-right tabular-nums ${strong ? "text-sm font-semibold text-primary" : "font-medium"}`}>
      {deduction && Number(value) > 0 ? "−" : ""}{Formatter.amount(value || 0)}
    </dd>
  </div>
);

export default NetCollected;
