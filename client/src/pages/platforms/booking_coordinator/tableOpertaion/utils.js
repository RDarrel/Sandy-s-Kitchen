import { PAYMENT_OPTIONS, STATUSES } from "./constant";

export const getPaymentLabel = (payment) =>
  PAYMENT_OPTIONS.find(({ value }) => payment === value)?.label ||
  "No payment label";
export const getStatusLabel = (status) =>
  STATUSES.find(({ value }) => value === status)?.label || "";
