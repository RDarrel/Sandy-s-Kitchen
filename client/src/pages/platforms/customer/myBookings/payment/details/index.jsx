import { useSelector } from "react-redux";
import { MethodDetailsSkeleton, MethodSkeleton } from "./skeleton/methods";
import PaymentFormSkeleton from "./skeleton/paymentForm";
import PaymentMethods from "./methods";
import PaymentForm from "./paymentForm";
import Header from "./header";
import BookingHeaderSkeleton from "./skeleton/header";
import MethodDetails from "./methods/details";

const Details = ({
  activeMethods = [],
  selectedMethod,
  form,
  payment,
  paidAmount,
  invalidAmount,
  belowDeposit,
  exceedsBalance,
  isSubmitting = false,
  navigate = () => {},
  setForm = () => {},
}) => {
  const { isLoadingBookingPayment, selected } = useSelector(
    ({ bookings }) => bookings,
  );
  const { isLoading: isLoadingMethods } = useSelector(
    ({ paymentMethods }) => paymentMethods,
  );

  return (
    <>
      <section className="min-w-0 overflow-hidden rounded-lg border bg-card shadow-sm">
        {/* Booking title */}
        {isLoadingBookingPayment ? (
          <BookingHeaderSkeleton />
        ) : (
          <Header
            booking={selected}
            fallbackReference={selected?.reference}
            onBack={() => navigate(-1)}
          />
        )}

        {/* Payment methods */}
        <div className="border-t bg-muted/5 px-3 py-3.5 sm:px-4">
          <div>
            <h2 className="text-sm font-semibold">Payment method</h2>

            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              Choose where you want to send your payment.
            </p>
          </div>

          <div className="mt-2.5">
            {isLoadingMethods ? (
              <MethodSkeleton />
            ) : activeMethods.length > 0 ? (
              <PaymentMethods
                methods={activeMethods}
                form={form}
                setForm={setForm}
              />
            ) : (
              <div className="rounded-md border border-dashed bg-muted/10 px-3 py-5 text-center text-xs text-muted-foreground">
                No active payment methods available.
              </div>
            )}
          </div>
        </div>

        {/* Selected method */}
        {(isLoadingMethods || selectedMethod) && (
          <div className="border-t px-3 py-3.5 sm:px-4">
            {isLoadingMethods ? (
              <MethodDetailsSkeleton />
            ) : (
              <MethodDetails method={selectedMethod} />
            )}
          </div>
        )}

        {/* Payment form */}
        <div className="border-t bg-muted/5 px-3 py-3.5 sm:px-4">
          {isLoadingBookingPayment ? (
            <PaymentFormSkeleton />
          ) : (
            <PaymentForm
              form={form}
              amountPaid={form.amount}
              payment={payment}
              method={selectedMethod}
              paidAmount={paidAmount}
              invalidAmount={invalidAmount}
              belowDeposit={belowDeposit}
              exceedsBalance={exceedsBalance}
              isSubmitting={isSubmitting}
              setAmountPaid={(value) =>
                setForm((prev) => ({ ...prev, amount: value }))
              }
              setForm={setForm}
            />
          )}
        </div>
      </section>
    </>
  );
};

export default Details;
