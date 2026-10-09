export const getPaymentSummary = (booking = {}) => {
  const payments = Array.isArray(booking?.payments) ? booking.payments : [];

  const total = Number(booking?.pricing?.total || 0);

  const received = payments.reduce((sum, payment) => {
    if (payment?.status !== "verified") {
      return sum;
    }

    return sum + Number(payment?.amount || 0);
  }, 0);

  const balance = Math.max(total - received, 0);

  const requiredDepositTotal = Number(booking?.terms?.requiredDeposit ?? 0);

  const requiredDeposit = Math.min(
    Math.max(requiredDepositTotal - received, 0),
    balance,
  );

  return {
    total,
    received,
    balance,
    requiredDeposit,
  };
};

export const sortPaymentMethods = (paymentMethods = []) => {
  const order = {
    cash: 0,
    e_wallet: 1,
    bank_transfer: 2,
  };

  return [...paymentMethods]
    .filter(({ isActive }) => isActive)
    .sort((a, b) => (order[a.type] ?? 99) - (order[b.type] ?? 99));
};

export const getPaymentType = (booking, sentAmount, balance) => {
  const { payments = [] } = booking;

  const hasVerifiedPayment = payments.some(
    ({ status }) => status === "verified",
  );
  if (sentAmount >= balance) return "final";
  if (!hasVerifiedPayment) return "deposit";

  return "partial";
};
