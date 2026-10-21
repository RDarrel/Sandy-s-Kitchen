export const getPaymentBreakdownRows = (pricing = {}) => {
  return [
    getServicePricingBreakdown("Catering Package", pricing?.catering),
    getServicePricingBreakdown("Venue", pricing?.venue),
  ].filter(Boolean);
};

export const getServicePricingBreakdown = (label, pricing = {}) => {
  const total = Number(pricing?.total || 0);

  if (total <= 0) {
    return null;
  }

  const guests = getPricingMetric(pricing?.guests);
  const duration = getPricingMetric(pricing?.duration);

  const guestCharge =
    guests.extra > 0 ? Number(pricing?.guests?.charge || 0) : 0;

  const durationCharge =
    duration.extra > 0 ? Number(pricing?.duration?.charge || 0) : 0;

  const baseAmount = Number(pricing?.basePrice || 0);

  return {
    label,

    total:
      baseAmount > 0
        ? baseAmount
        : Math.max(total - guestCharge - durationCharge, 0),

    guests,
    duration,
    guestCharge,
    durationCharge,
  };
};

const getPricingMetric = (breakdown = {}) => {
  const included = Number(breakdown?.included || 0);
  const booked = Number(breakdown?.booked || 0);
  const extra = Number(breakdown?.extra || 0);

  const computedExtra = Math.max(booked - included, 0);

  return {
    extra: extra > 0 ? extra : computedExtra,
  };
};

export const formatHours = (hours) => {
  return `${hours} hr${hours === 1 ? "" : "s"}`;
};
