import { Clock3 } from "lucide-react";
import { FramedCard, FrameTitle } from "../components";
import { Formatter } from "@/services/utilities";

const TermsSummary = ({ terms }) => {
  return (
    <FramedCard
      header={
        <FrameTitle
          title="Booking terms"
          trailing={<Clock3 className="size-3.5 text-muted-foreground" />}
        />
      }
    >
      {terms ? (
        <div className="space-y-2 p-3">
          <Term
            label="Required down payment"
            value={Formatter.amount(terms.requiredDeposit)}
          />

          <Term
            label="Down payment due"
            value={Formatter.date(terms.depositDeadline, true)}
          />

          <Term
            label="Full payment due"
            value={Formatter.date(terms.balanceDueAt)}
          />

          <Term
            label="Cancellation deadline"
            value={Formatter.date(terms.cancellationDeadline)}
          />
        </div>
      ) : (
        <div className="px-4 py-5 text-center">
          <div className="mx-auto flex size-8 items-center justify-center rounded-full bg-muted">
            <Clock3 className="size-3.5 text-muted-foreground" />
          </div>

          <p className="mt-2 text-xs font-medium">Terms not available yet</p>

          <p className="mx-auto mt-0.5 max-w-[220px] text-[10px] leading-4 text-muted-foreground">
            Booking terms will be available after your booking has been
            approved.
          </p>
        </div>
      )}
    </FramedCard>
  );
};

export default TermsSummary;

const Term = ({ label, value }) => {
  return (
    <div className="flex items-start justify-between gap-4 text-xs">
      <span className="text-muted-foreground">{label}</span>

      <span className="max-w-[58%] text-right font-medium">{value || "-"}</span>
    </div>
  );
};
