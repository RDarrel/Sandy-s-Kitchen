import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { fullName } from "@/services/utilities";
import { ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDispatch, useSelector } from "react-redux";
import { UPDATE } from "@/services/redux/slices/events/payments";
import { toast } from "sonner";
import RejectAlert from "./rejectAlert";
import PaymentSlip from "./paymentSlip";
import Proof from "./proof";
import Cloudinary from "@/services/utilities/cloudinary";
import {
  CONFIRM_BOOKING,
  UPDATE_PAYMENT,
} from "@/services/redux/slices/events/bookings";
import Spinner from "@/components/shared/spinner";

const ReviewPayment = ({ isOpen, setIsOpen, selected: booking = {} }) => {
  const { auth } = useSelector(({ auth }) => auth);
  const { formSubmitted } = useSelector(({ payments }) => payments);
  const [showRejectAlert, setShowRejectAlert] = useState(false);
  const [reason, setReason] = useState("");
  const dispatch = useDispatch();

  const payment = booking?.payments?.find(({ status }) => status === "pending");

  const willConfirmBooking = booking?.status === "approved";

  const customerName = fullName(booking?.customer?.fullName);
  const totalAmount = toAmount(booking?.pricing?.total);
  const paymentAmount = toAmount(payment?.amount);
  const verifiedAmount = getVerifiedAmount(booking);

  const currentBalance = Math.max(totalAmount - verifiedAmount, 0);
  const balanceAfterVerification = Math.max(currentBalance - paymentAmount, 0);

  const methodId = getPaymentMethodId(payment);

  const proofSrc = payment?.proofImgId
    ? Cloudinary.getPaymentProofImgId(payment.proofImgId, payment._id, methodId)
    : "";

  useEffect(() => {
    setShowRejectAlert(false);
    setReason("");
  }, [isOpen, booking?._id, payment?._id, proofSrc]);

  const handleVerify = () => {
    dispatch(
      UPDATE({
        _id: payment?._id,
        reviewedBy: auth?._id,
        reviewedAt: new Date(),
        status: "verified",
        willConfirmBooking,
        bookingId: booking?._id,
      }),
    )
      .unwrap()
      .then(({ data }) => {
        if (willConfirmBooking) {
          dispatch(
            CONFIRM_BOOKING({
              data,
              bookingStatus: booking?.status,
            }),
          );
          toast.success("Payment verified and booking confirmed.");
        } else {
          dispatch(UPDATE_PAYMENT({ data, bookingStatus: booking?.status }));
          toast.success("Payment verified successfully.");
        }
        setIsOpen(false);
      })
      .catch((error) => {
        console.log("error", error);
        toast.error("Failed to verify payment. Please try again.");
      });
  };
  const handleReject = () => {
    dispatch(
      UPDATE({
        _id: payment?._id,
        rejectionReason: reason,
        reviewedBy: auth?._id,
        reviewedAt: new Date(),
        status: "voided",
      }),
    )
      .unwrap()
      .then(({ data }) => {
        dispatch(UPDATE_PAYMENT({ data, bookingStatus: booking?.status }));
        setReason("");
        setIsOpen(false);
        toast.success("Payment rejected successfully.");
      })
      .catch((error) => {
        console.log("error", error);
        toast.error("Failed to reject payment. Please try again.");
      });
  };
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
            <ShieldCheck className="size-5 shrink-0 text-muted-foreground" />

            <div className="min-w-0">
              <DialogTitle className="text-base leading-tight">
                Verify payment
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

        <DialogFooter className="shrink-0 gap-2 border-t px-5 py-3">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setIsOpen(false)}
            className="sm:mr-auto"
          >
            Close
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setShowRejectAlert(true);
            }}
            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            Reject
          </Button>

          <Button type="button" onClick={handleVerify} disabled={formSubmitted}>
            Verify <Spinner formSubmitted={formSubmitted} />
          </Button>
        </DialogFooter>
      </DialogContent>

      <RejectAlert
        showRejectAlert={showRejectAlert}
        reason={reason}
        setReason={setReason}
        setShowRejectAlert={setShowRejectAlert}
        handleReject={handleReject}
      />
    </Dialog>
  );
};

export default ReviewPayment;

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
