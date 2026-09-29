import { BROWSE as BROWSE_PAYMENT_METHODS } from "@/services/redux/slices/events/paymentMethods";
import { GET_BOOKING_PAYMENT } from "@/services/redux/slices/events/bookings";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { getPaymentSummary } from "./utils";
import Details from "./details";
import PaymentSummarySkeleton from "./summary/skeleton";
import Summary from "./summary";

const Payment = () => {
  const { collections: paymentMethods, isLoading: isLoadingMethods } =
    useSelector(({ paymentMethods }) => paymentMethods);

  const { selected, isLoadingBookingPayment } = useSelector(
    ({ bookings }) => bookings,
  );

  const { reference } = useParams();

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [selectedMethodId, setSelectedMethodId] = useState("");
  const [amountPaid, setAmountPaid] = useState("");

  useEffect(() => {
    dispatch(BROWSE_PAYMENT_METHODS());
    dispatch(GET_BOOKING_PAYMENT(reference));
  }, [dispatch, reference]);

  const activeMethods = useMemo(
    () => paymentMethods.filter(({ isActive }) => isActive),
    [paymentMethods],
  );

  useEffect(() => {
    if (!selectedMethodId && activeMethods.length > 0) {
      setSelectedMethodId(activeMethods[0]?._id);
    }
  }, [activeMethods, selectedMethodId]);

  const selectedMethod = useMemo(
    () =>
      activeMethods.find(({ _id }) => _id === selectedMethodId) ||
      activeMethods[0] ||
      null,
    [activeMethods, selectedMethodId],
  );

  const payment = useMemo(() => getPaymentSummary(selected), [selected]);

  const suggestedPaymentAmount =
    payment.requiredDeposit > 0 ? payment.requiredDeposit : payment.balance;

  useEffect(() => {
    if (!amountPaid && suggestedPaymentAmount > 0) {
      setAmountPaid(String(suggestedPaymentAmount));
    }
  }, [amountPaid, suggestedPaymentAmount]);

  const paidAmount = Number(amountPaid || 0);

  const belowDeposit =
    payment.requiredDeposit > 0 &&
    paidAmount > 0 &&
    paidAmount < payment.requiredDeposit;

  const exceedsBalance = payment.balance > 0 && paidAmount > payment.balance;

  const invalidAmount = paidAmount <= 0 || belowDeposit || exceedsBalance;

  const remainingAfterPayment = Math.max(payment.balance - paidAmount, 0);

  return (
    <main className="mx-auto w-full max-w-6xl px-2 py-2 sm:px-3 sm:py-3 md:px-4 md:py-4">
      <div className="grid items-start gap-3 lg:grid-cols-[minmax(0,1fr)_320px]">
        <Details
          activeMethods={activeMethods}
          selectedMethod={selectedMethod}
          payment={payment}
          paidAmount={paidAmount}
          amountPaid={amountPaid}
          invalidAmount={invalidAmount}
          belowDeposit={belowDeposit}
          exceedsBalance={exceedsBalance}
          setSelectedMethodId={setSelectedMethodId}
          navigate={navigate}
          setAmountPaid={setAmountPaid}
        />

        <aside className="lg:sticky lg:top-4">
          {isLoadingBookingPayment ? (
            <PaymentSummarySkeleton />
          ) : (
            <Summary
              payment={payment}
              method={selectedMethod}
              paidAmount={paidAmount}
              invalidAmount={invalidAmount}
              isLoadingMethod={isLoadingMethods}
              remainingAfterPayment={remainingAfterPayment}
            />
          )}
        </aside>
      </div>
    </main>
  );
};

export default Payment;
