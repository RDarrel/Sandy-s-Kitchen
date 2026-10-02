export const formatPaymentType = (value = "") => {
  const labels = {
    deposit: "Down payment",
    partial: "Partial payment",
    final: "Final payment",
    gcash: "GCash",
    maya: "Maya",
    bank_transfer: "Bank transfer",
    e_wallet: "E-wallet",
    cash: "Cash",
  };

  return (
    labels[value] ||
    String(value || "Payment")
      .replace(/_/g, " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase())
  );
};
