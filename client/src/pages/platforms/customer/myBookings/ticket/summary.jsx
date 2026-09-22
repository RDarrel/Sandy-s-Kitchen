import { Button } from "@/components/ui/button";
import { Formatter } from "@/services/utilities";
import { ChevronRight } from "lucide-react";

const Summary = ({ payment }) => {
  const isFullyPaid = payment.balance <= 0;

  return (
    <>
      {/* Mobile compact footer */}
      <div className="border-t bg-muted/10 px-2.5 py-2 xl:hidden">
        <div className="flex min-w-0 items-center gap-2">
          <div className="grid min-w-0 flex-1 grid-cols-2 gap-2">
            <CompactAmountBlock
              label="Total"
              value={Formatter.amount(payment.total)}
            />

            <CompactAmountBlock
              label="Balance"
              value={isFullyPaid ? "Paid" : Formatter.amount(payment.balance)}
              valueClassName={
                isFullyPaid ? "text-emerald-700" : "text-amber-700"
              }
            />
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 shrink-0 gap-1 px-2.5 text-[10px] sm:text-xs"
          >
            <span className="hidden sm:inline">View details</span>
            <span className="sm:hidden">Details</span>
            <ChevronRight className="size-3.5" />
          </Button>
        </div>
      </div>

      {/* Desktop financial sidebar */}
      <div className="hidden flex-col border-l bg-muted/10 p-3 xl:flex">
        <div className="grid grid-cols-1 gap-3">
          <AmountBlock label="Total" value={Formatter.amount(payment.total)} />

          <AmountBlock
            label="Balance"
            value={isFullyPaid ? "Paid" : Formatter.amount(payment.balance)}
            valueClassName={isFullyPaid ? "text-emerald-700" : "text-amber-700"}
          />
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-3 h-8 w-full justify-between text-xs"
        >
          View details
          <ChevronRight className="size-3.5" />
        </Button>
      </div>
    </>
  );
};

export default Summary;

const CompactAmountBlock = ({ label, value, valueClassName = "" }) => {
  return (
    <div className="min-w-0">
      <p className="text-[8px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>

      <p
        className={`mt-0.5 truncate text-xs font-semibold leading-4 ${valueClassName}`}
      >
        {value}
      </p>
    </div>
  );
};

const AmountBlock = ({ label, value, valueClassName = "" }) => {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>

      <p className={`mt-0.5 text-sm font-semibold ${valueClassName}`}>
        {value}
      </p>
    </div>
  );
};
