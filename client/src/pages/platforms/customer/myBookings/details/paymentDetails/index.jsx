import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ReceiptText } from "lucide-react";
import { cn } from "@/lib/utils";

import PaymentSlip from "./paymentSlip";
import Proof from "./proof";
import Cloudinary from "@/services/utilities/cloudinary";

const PaymentDetails = ({ isOpen, setIsOpen, payment }) => {
  const willConfirmBooking = booking?.status === "approved";

  const totalAmount = toAmount(payment?.snapshot?.bookingTotal);
  const paymentAmount = toAmount(payment?.amount);
  const verifiedAmount = getVerifiedAmount(payment?.snapshot?.verifiedSoFar);

  const currentBalance = Math.max(totalAmount - verifiedAmount, 0);
  const balanceAfterVerification = Math.max(currentBalance - paymentAmount, 0);

  const methodId = getPaymentMethodId(payment);

  const proofSrc = payment?.proofImgId
    ? Cloudinary.getPaymentProofImgId(payment.proofImgId, payment._id, methodId)
    : "";

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent
        className={cn(
          "flex  w-[calc(100%-1.5rem)] flex-col gap-0   p-0 ",
          proofSrc ? "sm:max-w-[850px]" : "sm:max-w-[440px]",
        )}
      >
        {/* Original compact header */}
        <DialogHeader className="shrink-0  space-y-0 border-b px-5 py-3.5 pr-12 text-left">
          <div className="flex items-center gap-3">
            <ReceiptText className="size-5 shrink-0 text-muted-foreground" />

            <div className="min-w-0">
              <DialogTitle className="text-base leading-tight">
                Payment Details
              </DialogTitle>

              <DialogDescription className="mt-0.5 break-words text-xs">
                <span className="font-medium text-foreground">
                  {booking?.reference || "Booking"}
                </span>
                {booking?.eventType && ` · ${booking.eventType}`}
                {customerName && ` · ${customerName}`}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto bg-muted/50 p-4">
          {/* Both columns stretch to the same row height. */}
          <div
            className={cn(
              "grid items-stretch gap-4",
              proofSrc ? "md:grid-cols-2" : " md:grid-cols-1",
            )}
          >
            {/* Customer proof */}
            {proofSrc && <Proof proofSrc={proofSrc} />}

            {/* Original payment slip */}
            <PaymentSlip
              payment={payment}
              paymentAmount={paymentAmount}
              balanceAfterVerification={balanceAfterVerification}
              totalAmount={totalAmount}
              verifiedAmount={verifiedAmount}
              willConfirmBooking={willConfirmBooking}
            />
          </div>
        </div>

        <DialogFooter className="shrink-0 gap-2 border-t px-5 py-3"></DialogFooter>
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

const getVerifiedAmount = (booking) =>
  (booking?.payments || []).reduce(
    (total, item) =>
      item?.status === "verified" ? total + toAmount(item.amount) : total,
    0,
  );
