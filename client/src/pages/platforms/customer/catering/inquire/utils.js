import { Formatter } from "@/services/utilities";

export const computeEstimated = ({
  basePrice,
  maxHours,
  time = {},
  addFee = {},
  pax = {},
}) => {
  const paxRate = addFee?.pax;
  const hourRate = addFee?.hour;
  const extraGuests = Math.max(0, pax.avail - pax.max);
  const extraGuestFee = extraGuests * paxRate;
  const extraHours = Math.max(
    0,
    Formatter.duration(time?.start, time?.end, true) - maxHours,
  );
  const extraHourFee = Math.round(extraHours * hourRate);

  return {
    basePrice,
    guests: {
      included: pax?.max,
      booked: pax?.avail,
      extra: Math.max(0, pax?.avail - pax?.max),
      rate: paxRate,
      charge: extraGuestFee,
    },
    duration: {
      included: maxHours,
      booked: Math.round(Formatter.duration(time?.start, time?.end, true)),
      extra: Math.round(extraHours),
      rate: hourRate,
      charge: extraHourFee,
    },
    total: Math.round(basePrice + extraGuestFee + extraHourFee),
  };
};

export const buildPackageInfo = (item = {}) => {
  const sideMenuLimit = (item?.sideMenuCategories || []).reduce(
    (acc, category) => acc + (Number(category?.limit) || 0),
    0,
  );

  return {
    _id: item?._id,
    imgId: item?.imgId,
    name: item?.name || "Selected Package",
    level: item?.level,
    description: item?.description,
    includedGuests: Number(item?.includedGuests) || 1,
    basePrice: Number(item?.basePrice) || 0,
    addPricePerGuest: Number(item?.addPricePerGuest) || 0,
    addPricePerHour: Number(item?.addPricePerHour) || 0,
    includedHours: Number(item?.includedHours) || 0,
    mainCourseLimit: Number(item?.mainCourseLimit) || 0,
    sideMenuLimit,
    inclusions: item?.inclusions || [],
    mainCourseCategories: item?.mainCourseCategories || [],
    sideMenuCategories: item?.sideMenuCategories || [],
  };
};
