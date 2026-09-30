import { BROWSE as BROWSE_PAYMENT_METHODS } from "@/services/redux/slices/events/paymentMethods";
import { GET_BOOKING_PAYMENT } from "@/services/redux/slices/events/bookings";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { getPaymentSummary, getPaymentType, sortPaymentMethods } from "./utils";
import { toast } from "sonner";
import Details from "./details";
import PaymentSummarySkeleton from "./summary/skeleton";
import Summary from "./summary";
import { UPLOAD } from "@/services/redux/slices/persons/auth";
import Cloudinary from "@/services/utilities/cloudinary";
import { SAVE } from "@/services/redux/slices/events/payments";

const Payment = () => {
  const { collections: paymentMethods, isLoading: isLoadingMethods } =
    useSelector(({ paymentMethods }) => paymentMethods);
  const { selected, isLoadingBookingPayment } = useSelector(
    ({ bookings }) => bookings,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    amount: 0,
    reference: "",
    notes: "",
    method: "",
    proof: null,
  });
  const { reference } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(BROWSE_PAYMENT_METHODS());
    dispatch(GET_BOOKING_PAYMENT(reference));
  }, [dispatch, reference]);

  const activeMethods = useMemo(
    () => sortPaymentMethods(paymentMethods),
    [paymentMethods],
  );

  useEffect(() => {
    if (!form?.method && activeMethods.length > 0) {
      setForm((prev) => ({ ...prev, method: activeMethods[0]?._id }));
    }
  }, [activeMethods, form.method]);

  const selectedMethod = useMemo(
    () =>
      activeMethods.find(({ _id }) => _id === form?.method) ||
      activeMethods[0] ||
      null,
    [activeMethods, form?.method],
  );

  const payment = useMemo(() => getPaymentSummary(selected), [selected]);

  const suggestedPaymentAmount =
    payment.requiredDeposit > 0 ? payment.requiredDeposit : payment.balance;

  useEffect(() => {
    if (!form?.amount && suggestedPaymentAmount > 0) {
      setForm((prev) => ({ ...prev, amount: String(suggestedPaymentAmount) }));
    }
  }, [suggestedPaymentAmount]);

  const paidAmount = Number(form.amount || 0);

  const belowDeposit =
    payment.requiredDeposit > 0 &&
    paidAmount > 0 &&
    paidAmount < payment.requiredDeposit;

  const exceedsBalance = payment.balance > 0 && paidAmount > payment.balance;

  const invalidAmount = paidAmount <= 0 || belowDeposit || exceedsBalance;

  const remainingAfterPayment = Math.max(payment.balance - paidAmount, 0);

  const handleUploadProof = async (file, paymentID) => {
    const proofBase64 = await new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = ({ target }) => {
        resolve(target.result);
      };

      reader.onerror = () => {
        reject(new Error("Failed to read payment proof."));
      };

      reader.readAsDataURL(file);
    });
    console.log("paymentID", paymentID);
    const proofForm = Cloudinary.buildFileForm(
      proofBase64,
      `payments/${paymentID}`,
      form?.method,
      { paymentID },
    );

    await dispatch(UPLOAD({ data: proofForm })).unwrap();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { proof, reference, ...rest } = form;

    if (!proof && !reference?.trim()) {
      return toast.warning("Payment proof required", {
        description:
          "Please enter a transaction reference or upload proof of payment to continue.",
      });
    }

    try {
      setIsSubmitting(true);

      const { data } = await dispatch(
        SAVE({
          ...rest,
          reference: reference?.trim(),
          booking: selected?._id,
          type: getPaymentType(selected, form?.amount, payment?.balance),
        }),
      ).unwrap();

      if (proof) {
        await handleUploadProof(proof, data._id);
      }

      toast.success("Payment submitted", {
        description:
          "Your payment has been submitted successfully and is awaiting verification.",
      });
      navigate(-1);
    } catch (error) {
      console.log("error", error.message);
      toast.error("Payment submission failed", {
        description: "We couldn't submit your payment. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="mx-auto w-full max-w-6xl px-2 py-2 sm:px-3 sm:py-3 md:px-4 md:py-4">
      <form onSubmit={handleSubmit}>
        <div className="grid items-start gap-3 lg:grid-cols-[minmax(0,1fr)_320px]">
          <Details
            activeMethods={activeMethods}
            selectedMethod={selectedMethod}
            payment={payment}
            paidAmount={paidAmount}
            invalidAmount={invalidAmount}
            belowDeposit={belowDeposit}
            exceedsBalance={exceedsBalance}
            form={form}
            navigate={navigate}
            setForm={setForm}
            isSubmitting={isSubmitting}
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
                isSubmitting={isSubmitting}
              />
            )}
          </aside>
        </div>
      </form>
    </main>
  );
};

export default Payment;
