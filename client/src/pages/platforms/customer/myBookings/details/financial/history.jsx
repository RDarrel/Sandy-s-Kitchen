import { useMemo, useState } from "react";
import { FramedCard, FrameTitle } from "../components";
import { ReceiptText } from "lucide-react";
import PaymentDetails from "../paymentDetails";
import HistoryTimeline from "./timeline";

const PaymentHistory = ({ booking, payments = [] }) => {
  const paymentItems = payments;

  const [selectedPayment, setSelectedPayment] = useState(null);

  const sortedPayments = useMemo(() => {
    return [...paymentItems].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
    );
  }, [paymentItems]);

  return (
    <>
      <FramedCard
        header={
          <FrameTitle
            title="Payment history"
            afterTitle={
              paymentItems.length > 0 ? (
                <span className="rounded-full bg-muted px-1.5 py-0.5 text-[9px] font-semibold leading-none text-muted-foreground">
                  {paymentItems.length}
                </span>
              ) : null
            }
            trailing={
              <ReceiptText className="size-3.5 text-muted-foreground" />
            }
          />
        }
      >
        {paymentItems.length > 0 ? (
          <div className="p-3">
            <HistoryTimeline
              payments={sortedPayments}
              onViewPayment={setSelectedPayment}
            />
          </div>
        ) : (
          <div className="px-4 py-5 text-center">
            <div className="mx-auto flex size-8 items-center justify-center rounded-full bg-muted">
              <ReceiptText className="size-3.5 text-muted-foreground" />
            </div>

            <p className="mt-2 text-xs font-medium">No payments yet</p>

            <p className="mt-0.5 text-[10px] text-muted-foreground">
              Submitted payments will appear here.
            </p>
          </div>
        )}
      </FramedCard>

      <PaymentDetails
        isOpen={Boolean(selectedPayment)}
        booking={booking}
        payment={selectedPayment}
        setIsOpen={() => setSelectedPayment(null)}
      />
    </>
  );
};

export default PaymentHistory;
