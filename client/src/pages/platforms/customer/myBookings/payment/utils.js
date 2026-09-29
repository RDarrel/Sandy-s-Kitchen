export const getPaymentSummary = (booking) => {
  const payments = Array.isArray(booking?.payments) ? booking.payments : [];

  const total = Number(booking?.pricing?.total || 0);

  const received = payments.reduce((sum, payment) => {
    if (payment?.status !== "verified") {
      return sum;
    }

    return sum + Number(payment?.amount || 0);
  }, 0);

  const balance = Math.max(total - received, 0);

  const requiredDepositTotal = Number(
    booking?.terms?.requiredDeposit || balance || 0,
  );

  const requiredDeposit = Math.min(
    Math.max(requiredDepositTotal - received, 0),
    balance,
  );

  return {
    total,
    received,
    balance,
    requiredDeposit,
    depositDeadline: booking?.terms?.depositDeadline,
  };
};
