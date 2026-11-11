import { Clock3, FileText } from "lucide-react";
import { FramedCard, FrameTitle } from "../components";
import { Formatter } from "@/services/utilities";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import BookingPolicy from "../../../events/bookingPolicy";

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
            value={Formatter.date(terms.cancellationDeadline, true)}
          />
        </div>
      ) : (
        <div className="p-3">
          <p className="text-xs leading-5 text-muted-foreground">
            Your payment amounts and deadlines will appear after approval.
            You can review the booking policy below.
          </p>
        </div>
      )}
      <div className="border-t p-3">
        <Dialog>
          <DialogTrigger asChild>
            <Button type="button" variant="outline" size="sm" className="h-8 w-full gap-2 text-xs">
              <FileText className="size-3.5" />
              View booking policy
            </Button>
          </DialogTrigger>
          <DialogContent className="flex max-h-[85dvh] flex-col gap-0 overflow-hidden p-0 sm:max-w-xl">
            <DialogHeader className="border-b px-4 py-3 pr-10">
              <DialogTitle className="text-base">Booking policy</DialogTitle>
              <DialogDescription className="text-xs">
                Review the payment and cancellation policies for your booking.
              </DialogDescription>
            </DialogHeader>
            <div className="min-h-0 overflow-y-auto p-4">
              <BookingPolicy terms={terms} />
            </div>
            <DialogFooter className="border-t bg-muted/10 px-4 py-3">
              <DialogClose asChild>
                <Button type="button" variant="outline">Close</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
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
