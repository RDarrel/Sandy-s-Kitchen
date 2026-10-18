import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { ReceiptText } from "lucide-react";

import Cloudinary from "@/services/utilities/cloudinary";
import PaymentSlip from "./slip";
import Proof from "../../../../events/bookings/schedule/approval/financialDetails/proof";

const PaymentDetails = ({ isOpen, setIsOpen, booking, payment }) => {
  const paymentAmount = toAmount(payment?.amount);

  const methodId = getPaymentMethodId(payment);
  const proofSrc = payment?.proofImgId
    ? Cloudinary.getPaymentProofImgId(payment.proofImgId, payment._id, methodId)
    : "";

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent
        overlayClassName="!bg-black/40"
        className={cn(
          "flex w-[calc(100%-1.5rem)] flex-col gap-0 p-0",
          proofSrc ? "sm:max-w-[850px]" : "sm:max-w-[440px]",
        )}
      >
        <DialogHeader className="shrink-0 space-y-0 border-b px-5 py-3.5 pr-12 text-left">
          <div className="flex items-center gap-3">
            <ReceiptText className="size-5 shrink-0 text-muted-foreground" />

            <div className="min-w-0">
              <DialogTitle className="text-base leading-tight">
                Payment details
              </DialogTitle>

              <DialogDescription className="mt-0.5 break-words text-xs">
                <span className="font-medium text-foreground">
                  {booking?.reference || "Booking"}
                </span>
                {booking?.eventType && ` - ${booking.eventType}`}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto bg-muted/50 p-4">
          <div
            className={cn(
              "grid items-stretch gap-4",
              proofSrc ? "md:grid-cols-2" : "md:grid-cols-1",
            )}
          >
            {proofSrc && <Proof proofSrc={proofSrc} />}

            <PaymentSlip
              payment={payment}
              paymentAmount={paymentAmount}
            />
          </div>
        </div>

        <DialogFooter className="shrink-0 gap-2 border-t px-5 py-3">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setIsOpen(false)}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentDetails;

const toAmount = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

const getPaymentMethodId = (payment) =>
  typeof payment?.method === "object"
    ? payment?.method?._id || ""
    : payment?.method || "";

