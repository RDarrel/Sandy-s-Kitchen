import { Formatter } from "@/services/utilities";

export const computeEstimated = ({
  basePrice,
  maxHours,
  time = {},
  addFee = {},
  pax = {},
}) => {
  const addPerPax = addFee?.pax;
  const addPerHour = addFee?.hour;
  const extraGuests = Math.max(0, pax.avail - pax.max);
  const extraGuestFee = extraGuests * addPerPax;
  const extraHours = Math.max(
    0,
    Formatter.duration(time?.start, time?.end, true) - maxHours,
  );
  const extraHourFee = Math.round(extraHours * addPerHour);
  return {
    base: basePrice,
    addPricePerGuest: addPerPax,
    addPricePerHour: addPerHour,
    duration: Math.round(Formatter.duration(time?.start, time?.end, true)),
    pax: pax?.avail,
    includedHours: maxHours,
    includedGuests: pax?.max,
    extraHours: Math.round(extraHours),
    extraHourFee,
    extraGuestFee,
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
